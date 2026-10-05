import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import { SEED_OPPORTUNITIES } from "./seed-data";
import {
  calculateDgsAuthorityScore,
  calculatePriority,
  evaluateSpamRisk,
} from "./scoring";
import {
  checkSemanticDuplicate,
  matchTargetPages,
  indexTurboVecBatch,
  recordVectorDocumentInDb,
  generateVectorId,
  calculateContentHash,
} from "@/lib/intelligence/turbovec-client";
import type {
  FreeStatus,
  LinkTypeStatus,
  OffPageOpportunity,
  OpportunityCategory,
  PriorityTier,
  RegionCode,
  SpamStatus,
} from "./types";
import { normalizeLinkType } from "./types";

/**
 * Normalizes a URL for exact dedupe: lowercase host without www, no hash, no tracking params,
 * no trailing slash.
 */
export function normalizeOpportunityUrl(input: string): string {
  try {
    const u = new URL(String(input || "").trim());
    u.hash = "";
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
    for (const k of Array.from(u.searchParams.keys())) {
      if (/^(utm_|gclid|fbclid|ref$|mc_)/i.test(k)) u.searchParams.delete(k);
    }
    let s = `${u.hostname}${u.pathname}${u.search}`;
    if (s.endsWith("/")) s = s.slice(0, -1);
    return s;
  } catch {
    return String(input || "").trim().toLowerCase();
  }
}

/**
 * Initializes the opportunities table with verified seed opportunities if empty.
 */
export async function seedOpportunitiesIfEmpty(): Promise<{ seeded: number; existing: number }> {
  await ensureOffPageTablesExist();

  const { rows: countRows } = await cmsQuery<{ total: number }>(
    `SELECT COUNT(*) as total FROM off_page_opportunities`
  );
  const existing = Number(countRows[0]?.total || 0);

  if (existing > 0) {
    return { seeded: 0, existing };
  }

  let seeded = 0;
  for (const opp of SEED_OPPORTUNITIES) {
    const id = `opp_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    await cmsExecute(
      `INSERT INTO off_page_opportunities (
        id, site_name, domain, exact_submission_url, region, country, category,
        free_status, free_tier_details, requires_account, requires_editorial_review,
        submission_type, recommended_dgs_target_page, recommended_service,
        recommended_content, recommended_anchor_strategy, link_type, dofollow_status,
        estimated_quality, topical_relevance, geo_relevance, traffic_potential,
        editorial_quality, spam_risk, acceptance_probability, value_score,
        difficulty_score, priority_score, priority_tier, authority_score,
        spam_status, verification_date, last_verified, source, status,
        assigned_to, notes, evidence, discovered_at, next_check_at, check_priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [
        id,
        opp.site_name,
        opp.domain,
        opp.exact_submission_url,
        opp.region,
        opp.country,
        opp.category,
        opp.free_status,
        opp.free_tier_details,
        opp.requires_account ? 1 : 0,
        opp.requires_editorial_review ? 1 : 0,
        opp.submission_type,
        opp.recommended_dgs_target_page,
        opp.recommended_service,
        opp.recommended_content,
        opp.recommended_anchor_strategy,
        opp.link_type,
        opp.dofollow_status,
        opp.estimated_quality,
        opp.topical_relevance,
        opp.geo_relevance,
        opp.traffic_potential,
        opp.editorial_quality,
        opp.spam_risk,
        opp.acceptance_probability,
        opp.value_score,
        opp.difficulty_score,
        opp.priority_score,
        opp.priority_tier,
        opp.authority_score,
        opp.spam_status,
        opp.verification_date,
        opp.last_verified,
        opp.source,
        opp.status,
        opp.assigned_to,
        opp.notes,
        opp.evidence,
        opp.priority_tier || "P1",
      ]
    );
    seeded++;
  }

  return { seeded, existing: seeded };
}

/**
 * Discovers and validates net-new opportunities.
 * Performs strict deduplication, free validation, spam filtering, and quality scoring.
 */
export async function ingestDiscoveredOpportunity(raw: {
  site_name: string;
  domain: string;
  exact_submission_url: string;
  region: RegionCode;
  country?: string;
  category: OpportunityCategory;
  free_status?: FreeStatus;
  free_tier_details?: string;
  requires_account?: boolean;
  requires_editorial_review?: boolean;
  submission_type?: string;
  recommended_dgs_target_page?: string;
  recommended_service?: string;
  recommended_content?: string;
  link_type?: string;
  dofollow_status?: LinkTypeStatus | string;
  topical_relevance?: number;
  geo_relevance?: number;
  traffic_potential?: number;
  editorial_quality?: number;
  notes?: string;
  evidence?: string;
  discovery_provider?: string;
  discovery_query?: string;
  http_status?: number | null;
  verification_status?: string;
  /** Machine source type, e.g. 'brave_search', 'google_news_rss', 'reddit', 'gdelt'. */
  source_type?: string;
  /** Explicit pipeline status chosen by the qualification gate (e.g. QUALIFIED / DISCOVERED / REJECTED). */
  status?: string;
  /** Lane identifier that produced the candidate (V8.12.6). */
  discovery_lane?: string;
  /** Live page title observed during validation. */
  page_title?: string;
  /** Qualification gate reasons + observed signals. */
  qualification_reason?: string;
}): Promise<{ success: boolean; id?: string; error?: string; opportunity?: any }> {
  await ensureOffPageTablesExist();

  const domain = raw.domain.toLowerCase().trim().replace(/^www\./, "");
  const url = raw.exact_submission_url.trim();
  const normalizedUrl = normalizeOpportunityUrl(url);

  // 1. Exact Deduplication check: same URL (normalized) already tracked
  const { rows: existingRows } = await cmsQuery<{ id: string; exact_submission_url: string }>(
    `SELECT id, exact_submission_url FROM off_page_opportunities WHERE domain = ? OR exact_submission_url = ?`,
    [domain, url]
  );
  if (existingRows.some((r) => normalizeOpportunityUrl(r.exact_submission_url) === normalizedUrl)) {
    return { success: false, error: "DUPLICATE: Opportunity with this URL already exists" };
  }

  // 2. Semantic Deduplication via TurboVec
  const opportunityText = `${raw.site_name} ${domain} ${url} ${raw.category} ${raw.notes || ""} ${raw.evidence || ""}`.trim();
  let semanticNotes = raw.notes || "";
  let semanticStatus = "UNCHECKED" as "UNIQUE" | "POSSIBLE_DUPLICATE" | "LIKELY_DUPLICATE" | "UNCHECKED";
  try {
    const dedupeResult = await checkSemanticDuplicate({
      text: opportunityText,
      domain,
      url,
    });
    if (dedupeResult.ok) semanticStatus = dedupeResult.status as typeof semanticStatus;
    if (dedupeResult.ok && dedupeResult.status === "LIKELY_DUPLICATE") {
      semanticNotes = `[SEMANTIC_REVIEW: ${(dedupeResult.similarity * 100).toFixed(1)}% match with '${dedupeResult.nearest[0]?.title || dedupeResult.nearest[0]?.key}'] ${semanticNotes}`.trim();
    } else if (dedupeResult.ok && dedupeResult.status === "POSSIBLE_DUPLICATE") {
      semanticNotes = `[SEMANTIC_SIMILARITY: ${(dedupeResult.similarity * 100).toFixed(1)}% overlap] ${semanticNotes}`.trim();
    }
  } catch (err) {
    console.warn("TurboVec deduplication check warning:", err);
  }

  // 3. Spam evaluation
  const spamResult = evaluateSpamRisk(domain, url, semanticNotes);
  if (spamResult.spamStatus === "REJECT") {
    return {
      success: false,
      error: `SPAM_FILTER_REJECT: ${spamResult.reasons.join(", ")}`,
    };
  }

  // 4. Smart Target Page Matching via TurboVec Content Index
  let targetPage = raw.recommended_dgs_target_page;
  let service = raw.recommended_service || "Digital Marketing & AI";
  let topicalScore = raw.topical_relevance || 80;
  let targetPageMatchScore = 70;

  try {
    const pageMatches = await matchTargetPages({
      query: opportunityText,
      region: raw.region,
      limit: 1,
    });
    if (pageMatches.ok && pageMatches.target_pages.length > 0) {
      const topPage = pageMatches.target_pages[0];
      if (!targetPage || targetPage === "https://www.dgeniussolutions.com/") {
        targetPage = `https://www.dgeniussolutions.com${topPage.page}`;
        service = topPage.service_match;
      }
      targetPageMatchScore = Math.round(topPage.semantic_relevance * 100);
      topicalScore = Math.max(topicalScore, Math.round(topPage.semantic_relevance * 100));
    }
  } catch (err) {
    console.warn("TurboVec target page matching warning:", err);
  }

  // Free status: never assume FREE. Unverified -> UNKNOWN.
  const freeStatus: FreeStatus = raw.free_status || "UNKNOWN";

  // Scores
  const topical = topicalScore;
  const geo = raw.geo_relevance || 85;
  const editorial = raw.editorial_quality || 80;
  const traffic = raw.traffic_potential || 70;
  const spamRisk = spamResult.spamRiskScore;

  const authorityScore = calculateDgsAuthorityScore({
    topicalRelevance: topical,
    editorialQuality: editorial,
    geoRelevance: geo,
    referralPotential: traffic,
    spamRisk,
  });

  const priorityResult = calculatePriority({
    authorityScore,
    trafficPotential: traffic,
    acceptanceProbability: 75,
    geoRelevance: geo,
    isFree: freeStatus !== "NOT_FREE",
    spamStatus: spamResult.spamStatus,
    topicalMatchScore: topical,
    targetPageMatchScore: targetPageMatchScore,
    contentAssetMatchScore: 70,
  });

  const id = `opp_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  let status = raw.status || (freeStatus === "NOT_FREE" ? "NOT_FREE" : "DISCOVERED");
  if (status === "QUALIFIED" && semanticStatus === "LIKELY_DUPLICATE") {
    status = "DISCOVERED"; // quarantined for human dedupe review, not the manager queue
  }
  const discoveryProvider = raw.discovery_provider || "AUTOMATED_DISCOVERY";
  const discoveryQuery = raw.discovery_query || null;
  const httpStatus = typeof raw.http_status === "number" ? raw.http_status : null;
  const verificationStatus = raw.verification_status || "UNVERIFIED";
  const linkType = normalizeLinkType(raw.dofollow_status, raw.category);
  const sourceType = raw.source_type || discoveryProvider.toLowerCase();

  await cmsExecute(
    `INSERT INTO off_page_opportunities (
      id, site_name, domain, exact_submission_url, region, country, category,
      free_status, free_tier_details, requires_account, requires_editorial_review,
      submission_type, recommended_dgs_target_page, recommended_service,
      recommended_content, recommended_anchor_strategy, link_type, dofollow_status,
      estimated_quality, topical_relevance, geo_relevance, traffic_potential,
      editorial_quality, spam_risk, acceptance_probability, value_score,
      difficulty_score, priority_score, priority_tier, authority_score,
      spam_status, verification_date, last_verified, source, status,
      notes, evidence, discovered_at, next_check_at, check_priority, created_at, updated_at,
      discovery_provider, discovery_query, http_status, verification_status, last_verified_at,
      source_type, discovery_lane, semantic_status, page_title, qualification_reason, last_checked_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, 'BRANDED', ?, ?,
      ?, ?, ?, ?,
      ?, ?, 75, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, NOW(), NOW(), ?, NOW(), NOW(),
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )`,
    [
      id,
      raw.site_name,
      domain,
      url,
      raw.region,
      raw.country || null,
      raw.category,
      freeStatus,
      raw.free_tier_details || null,
      raw.requires_account ? 1 : 0,
      raw.requires_editorial_review ?? 1,
      raw.submission_type || "FORM",
      targetPage || "https://www.dgeniussolutions.com/",
      service,
      raw.recommended_content || null,
      raw.link_type || "DIRECTORY",
      linkType,
      authorityScore >= 90 ? "VERY_HIGH" : authorityScore >= 75 ? "HIGH" : "MEDIUM",
      topical,
      geo,
      traffic,
      editorial,
      spamRisk,
      priorityResult.valueScore,
      priorityResult.difficultyScore,
      priorityResult.priorityScore,
      priorityResult.priorityTier,
      authorityScore,
      spamResult.spamStatus,
      httpStatus !== null ? new Date() : null,
      httpStatus !== null ? new Date() : null,
      discoveryProvider,
      status,
      semanticNotes || null,
      raw.evidence || null,
      priorityResult.priorityTier,
      discoveryProvider,
      discoveryQuery,
      httpStatus,
      verificationStatus,
      httpStatus !== null ? new Date() : null,
      sourceType,
      raw.discovery_lane || null,
      semanticStatus,
      raw.page_title ? raw.page_title.slice(0, 500) : null,
      raw.qualification_reason || null,
      httpStatus !== null ? new Date() : null,
    ]
  );

  // Vectorize into TurboVec off-page index and MySQL registry
  try {
    const vectorId = generateVectorId(`opp:${id}`);
    const contentHash = calculateContentHash(opportunityText);

    await indexTurboVecBatch({
      indexName: "off-page",
      documents: [
        {
          key: `opp:${id}`,
          id,
          numeric_id: vectorId.toString(),
          text: opportunityText,
          title: raw.site_name,
          site_name: raw.site_name,
          domain,
          exact_submission_url: url,
          region: raw.region,
          category: raw.category,
          target_page: targetPage,
          status,
          kind: "opportunity",
          entity_type: "OFF_PAGE_OPPORTUNITY",
          entity_id: id,
        },
      ],
    });

    await recordVectorDocumentInDb({
      vector_id: vectorId,
      entity_type: "OFF_PAGE_OPPORTUNITY",
      entity_id: id,
      content_hash: contentHash,
      index_name: "off-page",
      region: raw.region,
      category: raw.category,
      target_page: targetPage,
    });
  } catch (err) {
    console.warn("Failed vectorizing opportunity:", err);
  }

  return { success: true, id };
}

/**
 * Executes the real discovery engine.
 * Real multi-provider query execution, live URL verification, duplicate checking,
 * TurboVec deduplication, and database + vector indexing.
 */
export async function runOpportunityDiscoverySuite(options?: {
  providerId?: string;
  queries?: string[];
  limit?: number;
}): Promise<{
  run_id: string;
  provider: string;
  provider_status: "ACTIVE" | "DISCOVERY_PROVIDER_NOT_CONFIGURED" | "DEGRADED" | "ERROR";
  queries_queued: number;
  queries_completed: number;
  results_returned: number;
  urls_validated: number;
  duplicates_rejected: number;
  paid_disallowed_rejected: number;
  spam_rejected: number;
  new_records_added: number;
  errors: string[];
  message: string;
}> {
  await ensureOffPageTablesExist();

  const runId = `run_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const errors: string[] = [];

  // Inspect settings to see if an external discovery provider is configured
  const { rows: settingsRows } = await cmsQuery<{
    key_name: string;
    key_value: string;
  }>(`SELECT key_name, key_value FROM off_page_settings`);

  const settingsMap: Record<string, string> = {};
  for (const r of settingsRows) {
    settingsMap[r.key_name] = r.key_value;
  }

  const requestedProviderId = options?.providerId || settingsMap.discovery_provider || "GOOGLE_NEWS_RSS";
  const isEnabled = settingsMap.daily_discovery_enabled !== "false";

  // Map to concrete provider
  const { getProvider } = await import("./providers/registry");
  const provider = requestedProviderId === "BRAVE_SEARCH"
    ? getProvider("brave-search")
    : requestedProviderId === "GOOGLE_SEARCH"
    ? getProvider("google-search")
    : requestedProviderId === "GDELT"
    ? getProvider("gdelt-doc")
    : getProvider("google-news-rss");

  const health = await provider.health();

  if (!isEnabled) {
    return {
      run_id: runId,
      provider: provider.name,
      provider_status: "DISCOVERY_PROVIDER_NOT_CONFIGURED",
      queries_queued: 0,
      queries_completed: 0,
      results_returned: 0,
      urls_validated: 0,
      duplicates_rejected: 0,
      paid_disallowed_rejected: 0,
      spam_rejected: 0,
      new_records_added: 0,
      errors: ["Daily discovery is disabled in Off-Page Settings"],
      message: "Discovery disabled in CMS settings.",
    };
  }

  if (health.status === "NOT_CONFIGURED") {
    // Record run as NOT_CONFIGURED
    try {
      await cmsExecute(
        `INSERT INTO off_page_discovery_runs (run_id, provider, started_at, completed_at, status, errors)
         VALUES (?, ?, NOW(), NOW(), 'NOT_CONFIGURED', ?)`,
        [runId, provider.name, health.reason || "Provider credentials not configured"]
      );
    } catch (e) {
      console.warn("Notice: Error logging unconfigured run:", e);
    }

    return {
      run_id: runId,
      provider: provider.name,
      provider_status: "DISCOVERY_PROVIDER_NOT_CONFIGURED",
      queries_queued: 0,
      queries_completed: 0,
      results_returned: 0,
      urls_validated: 0,
      duplicates_rejected: 0,
      paid_disallowed_rejected: 0,
      spam_rejected: 0,
      new_records_added: 0,
      errors: [health.reason || "Provider credentials not configured"],
      message: `${provider.name} is NOT CONFIGURED. ${health.reason || "Configure required credentials in environment."}`,
    };
  }

  // Record run start in DB
  try {
    await cmsExecute(
      `INSERT INTO off_page_discovery_runs (run_id, provider, started_at, status)
       VALUES (?, ?, NOW(), 'RUNNING')`,
      [runId, provider.name]
    );
  } catch (logErr) {
    console.warn("Notice: Run logging started with warning:", logErr);
  }

  let queriesQueued = options?.queries?.length || 0;
  let queriesCompleted = 0;
  let resultsReturned = 0;
  let urlsValidated = 0;
  let duplicatesRejected = 0;
  let paidDisallowedRejected = 0;
  let spamRejected = 0;
  let newRecordsAdded = 0;

  try {
    const { analyzePage } = await import("./lanes/page-analyzer");
    const { validateForLane } = await import("./lanes/validator");
    const { LANES, getLane } = await import("./lanes/config");

    // 1. Fetch raw external candidate opportunities
    const candidates = await provider.discover({
      queries: options?.queries,
      limit: options?.limit || 10,
    });
    // Measured: distinct queries that actually produced results
    queriesCompleted = new Set(candidates.map((c) => c.discovery_query)).size;
    if (!queriesQueued) queriesQueued = queriesCompleted;
    resultsReturned = candidates.length;

    // 2. Live fetch -> lane validator -> qualification gate -> ingest
    for (const cand of candidates) {
      const candUrl = cand.url.trim();
      const domain = cand.domain.toLowerCase().trim().replace(/^www\./, "");

      // 2.1 Exact duplicate (normalized URL) before spending a fetch
      const { rows: dupRows } = await cmsQuery<{ exact_submission_url: string }>(
        `SELECT exact_submission_url FROM off_page_opportunities WHERE domain = ?`,
        [domain]
      );
      const norm = normalizeOpportunityUrl(candUrl);
      if (dupRows.some((r) => normalizeOpportunityUrl(r.exact_submission_url) === norm)) {
        duplicatesRejected++;
        continue;
      }

      // 2.2 Live page fetch (GET) + lane validation
      const lane = LANES.find((l) => l.category === cand.category) || getLane("DIGITAL_PR")!;
      const analysis = await analyzePage(candUrl, 12000);
      urlsValidated++;
      const verdict = await validateForLane(analysis, lane, { queryRegion: cand.region });

      if (verdict.decision === "REJECTED") {
        if (verdict.reasons.includes("PAID_ONLY")) paidDisallowedRejected++;
        else if (verdict.reasons.some((r) => r.startsWith("SPAM") || r.startsWith("BLOCKED"))) spamRejected++;
        else errors.push(`Rejected ${candUrl}: ${verdict.reasons.join(", ")}`);
        continue;
      }

      // 2.3 Ingest with measured evidence only
      const ingestRes = await ingestDiscoveredOpportunity({
        site_name: analysis.title || cand.site_name,
        domain: cand.domain,
        exact_submission_url: analysis.finalUrl || candUrl,
        region: verdict.region,
        country: cand.country,
        category: cand.category,
        free_status: verdict.freeStatus,
        dofollow_status: verdict.linkType,
        discovery_provider: cand.discovery_provider,
        discovery_query: cand.discovery_query,
        evidence: `${cand.evidence || ""} Live check: HTTP ${analysis.httpStatus}. Signals: ${verdict.signals.slice(0, 10).join(", ")}`.trim(),
        notes: cand.notes,
        http_status: analysis.httpStatus,
        verification_status: verdict.decision === "QUALIFIED" ? "VERIFIED_ACTIVE" : "REACHABLE_UNQUALIFIED",
        source_type: cand.source_type || cand.discovery_provider.toLowerCase(),
        status: verdict.decision,
        discovery_lane: lane.id,
        page_title: analysis.title,
        qualification_reason: verdict.reasons.join("; "),
      });

      if (ingestRes.success) {
        newRecordsAdded++;
      } else {
        if (ingestRes.error?.includes("DUPLICATE")) {
          duplicatesRejected++;
        } else if (ingestRes.error?.includes("SPAM")) {
          spamRejected++;
        } else {
          errors.push(ingestRes.error || "Unknown ingestion error");
        }
      }
    }

    // 3. Update discovery run in DB
    const runStatus = newRecordsAdded > 0 ? "SUCCESS" : candidates.length === 0 ? "PARTIAL" : "SUCCESS";
    try {
      await cmsExecute(
        `UPDATE off_page_discovery_runs SET
          completed_at = NOW(),
          queries_run = ?,
          results_returned = ?,
          valid_candidates = ?,
          duplicates_rejected = ?,
          spam_rejected = ?,
          inserted_count = ?,
          errors = ?,
          status = ?
         WHERE run_id = ?`,
        [
          queriesCompleted,
          resultsReturned,
          urlsValidated,
          duplicatesRejected,
          spamRejected,
          newRecordsAdded,
          errors.length > 0 ? errors.slice(0, 5).join("; ") : null,
          runStatus,
          runId,
        ]
      );
    } catch (upErr) {
      console.warn("Notice: Error updating discovery run:", upErr);
    }

    const message = newRecordsAdded > 0
      ? `Discovery completed: ${newRecordsAdded} new record(s) from ${provider.name} after live validation (${duplicatesRejected} duplicates, ${paidDisallowedRejected} paid-only, ${spamRejected} spam/geo rejected).`
      : `Discovery sweep completed: ${resultsReturned} candidate(s) from ${provider.name}; ${urlsValidated} fetched live; none qualified for insertion (${duplicatesRejected} duplicates).`;

    return {
      run_id: runId,
      provider: provider.name,
      provider_status: "ACTIVE",
      queries_queued: queriesQueued,
      queries_completed: queriesCompleted,
      results_returned: resultsReturned,
      urls_validated: urlsValidated,
      duplicates_rejected: duplicatesRejected,
      paid_disallowed_rejected: paidDisallowedRejected,
      spam_rejected: spamRejected,
      new_records_added: newRecordsAdded,
      errors,
      message,
    };
  } catch (err: any) {
    const errorMsg = err?.message || "Discovery run failure";
    errors.push(errorMsg);
    try {
      await cmsExecute(
        `UPDATE off_page_discovery_runs SET completed_at = NOW(), errors = ?, status = 'FAILED' WHERE run_id = ?`,
        [errorMsg, runId]
      );
    } catch {}

    return {
      run_id: runId,
      provider: provider.name,
      provider_status: "ERROR",
      queries_queued: queriesQueued,
      queries_completed: queriesCompleted,
      results_returned: resultsReturned,
      urls_validated: urlsValidated,
      duplicates_rejected: duplicatesRejected,
      paid_disallowed_rejected: paidDisallowedRejected,
      spam_rejected: spamRejected,
      new_records_added: newRecordsAdded,
      errors,
      message: `Discovery error: ${errorMsg}`,
    };
  }
}

/**
 * Returns discovery run history (Section 13)
 */
export async function getDiscoveryRunHistory(limit: number = 20): Promise<any[]> {
  await ensureOffPageTablesExist();
  try {
    const { rows } = await cmsQuery(
      `SELECT * FROM off_page_discovery_runs ORDER BY started_at DESC LIMIT ${Number(limit)}`
    );
    return rows;
  } catch (err) {
    console.warn("Failed fetching discovery run history:", err);
    return [];
  }
}

/**
 * Revalidates submission URLs for active opportunities using rotating priority queues.
 * P0 = every 3 days
 * P1 = every 7 days
 * P2 = every 14 days
 * P3 = every 30 days
 */
export async function revalidateOpportunityUrls(limit: number = 30): Promise<{
  checked: number;
  healthy: number;
  dead: number;
  archived: string[];
}> {
  await ensureOffPageTablesExist();

  const { rows } = await cmsQuery<{
    id: string;
    exact_submission_url: string;
    status: string;
    check_priority: PriorityTier | null;
  }>(
    `SELECT id, exact_submission_url, status, check_priority 
     FROM off_page_opportunities 
     WHERE status NOT IN ('ARCHIVED', 'EXPIRED', 'SPAM', 'NOT_FREE')
       AND (next_check_at IS NULL OR next_check_at <= NOW())
     ORDER BY CASE WHEN next_check_at IS NULL THEN 0 ELSE 1 END, next_check_at ASC 
     LIMIT ${Number(limit)}`
  );

  let healthy = 0;
  let dead = 0;
  const archived: string[] = [];

  const { checkUrlStatus } = await import("./lanes/page-analyzer");
  // Only unassigned pipeline records may be auto-expired; in-flight team work is never auto-closed.
  const AUTO_EXPIRABLE = new Set(["NEW", "DISCOVERED", "QUALIFIED", "MANAGER_REVIEW", "APPROVED", "VERIFYING"]);

  for (const row of rows) {
    const tier = row.check_priority || "P1";
    const nextIntervalDays = tier === "P0" ? 3 : tier === "P1" ? 7 : tier === "P2" ? 14 : 30;

    const status = await checkUrlStatus(row.exact_submission_url, 8000);
    const ok = status >= 200 && status < 400;
    const blocked = status === 401 || status === 403 || status === 429; // bot-protected: unknown, not dead
    const isDead = status === 0 || status === 404 || status === 410 || status >= 500;

    if (ok || blocked) {
      if (ok) healthy++;
      await cmsExecute(
        `UPDATE off_page_opportunities
         SET http_status = ?, last_checked_at = NOW(),
             last_verified = IF(?, NOW(), last_verified),
             next_check_at = DATE_ADD(NOW(), INTERVAL ? DAY)
         WHERE id = ?`,
        [status, ok ? 1 : 0, nextIntervalDays, row.id]
      );
      continue;
    }

    dead++;
    if (isDead && AUTO_EXPIRABLE.has(String(row.status || "").toUpperCase())) {
      archived.push(row.id);
      await cmsExecute(
        `UPDATE off_page_opportunities
         SET status = 'EXPIRED', http_status = ?, verification_status = 'DEAD', last_checked_at = NOW(),
             qualification_reason = CONCAT('AUTO-EXPIRED: HTTP ', ?, ' at ', NOW()),
             next_check_at = DATE_ADD(NOW(), INTERVAL ? DAY)
         WHERE id = ?`,
        [status, String(status || "unreachable"), nextIntervalDays, row.id]
      );
    } else {
      await cmsExecute(
        `UPDATE off_page_opportunities SET http_status = ?, last_checked_at = NOW(), next_check_at = DATE_ADD(NOW(), INTERVAL 3 DAY) WHERE id = ?`,
        [status, row.id]
      );
    }
  }

  return { checked: rows.length, healthy, dead, archived };
}
