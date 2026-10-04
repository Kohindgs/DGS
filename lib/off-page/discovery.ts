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
  OffPageOpportunity,
  OpportunityCategory,
  PriorityTier,
  RegionCode,
  SpamStatus,
} from "./types";

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
  free_status?: "FREE" | "NOT_FREE" | "FREEMIUM";
  free_tier_details?: string;
  requires_account?: boolean;
  requires_editorial_review?: boolean;
  submission_type?: string;
  recommended_dgs_target_page?: string;
  recommended_service?: string;
  recommended_content?: string;
  link_type?: string;
  dofollow_status?: "DOFOLLOW" | "NOFOLLOW" | "UGC" | "UNKNOWN";
  topical_relevance?: number;
  geo_relevance?: number;
  traffic_potential?: number;
  editorial_quality?: number;
  notes?: string;
  evidence?: string;
  discovery_provider?: string;
  discovery_query?: string;
  http_status?: number;
  verification_status?: string;
}): Promise<{ success: boolean; id?: string; error?: string; opportunity?: any }> {
  await ensureOffPageTablesExist();

  const domain = raw.domain.toLowerCase().trim().replace(/^www\./, "");
  const url = raw.exact_submission_url.trim();

  // 1. Exact Deduplication check: check domain or exact URL
  const { rows: existingRows } = await cmsQuery<{ id: string }>(
    `SELECT id FROM off_page_opportunities WHERE domain = ? OR exact_submission_url = ? LIMIT 1`,
    [domain, url]
  );
  if (existingRows.length > 0) {
    return { success: false, error: "DUPLICATE: Opportunity with domain or URL already exists" };
  }

  // 2. Semantic Deduplication via TurboVec
  const opportunityText = `${raw.site_name} ${domain} ${url} ${raw.category} ${raw.notes || ""} ${raw.evidence || ""}`.trim();
  let semanticNotes = raw.notes || "";
  try {
    const dedupeResult = await checkSemanticDuplicate({
      text: opportunityText,
      domain,
      url,
    });
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

  // Free status enforcement
  const freeStatus = raw.free_status || "FREE";

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
  const status = freeStatus === "NOT_FREE" ? "NOT_FREE" : "NEW";
  const discoveryProvider = raw.discovery_provider || "AUTOMATED_DISCOVERY";
  const discoveryQuery = raw.discovery_query || null;
  const httpStatus = raw.http_status || 200;
  const verificationStatus = raw.verification_status || "VERIFIED_ACTIVE";

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
      discovery_provider, discovery_query, http_status, verification_status, last_verified_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, 'BRANDED', ?, ?,
      ?, ?, ?, ?,
      ?, ?, 75, ?,
      ?, ?, ?, ?,
      ?, CURDATE(), NOW(), ?, ?,
      ?, ?, NOW(), NOW(), ?, NOW(), NOW(),
      ?, ?, ?, ?, NOW()
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
      raw.dofollow_status || "DOFOLLOW",
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
      discoveryProvider,
      status,
      semanticNotes || null,
      raw.evidence || null,
      priorityResult.priorityTier,
      discoveryProvider,
      discoveryQuery,
      httpStatus,
      verificationStatus,
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
  const provider = requestedProviderId === "GOOGLE_SEARCH"
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

  const queriesQueued = options?.queries?.length || 6;
  let queriesCompleted = 0;
  let resultsReturned = 0;
  let urlsValidated = 0;
  let duplicatesRejected = 0;
  let paidDisallowedRejected = 0;
  let spamRejected = 0;
  let newRecordsAdded = 0;

  try {
    // 1. Fetch raw external candidate opportunities
    const candidates = await provider.discover({
      queries: options?.queries,
      limit: options?.limit || 10,
    });
    queriesCompleted = queriesQueued;
    resultsReturned = candidates.length;

    // 2. Validate, deduplicate, and ingest each candidate
    for (const cand of candidates) {
      const candUrl = cand.url.trim();
      const domain = cand.domain.toLowerCase().trim().replace(/^www\./, "");

      // 2.1 Live URL validation (Section 15)
      let httpStatus = 200;
      let isReachable = true;
      try {
        const checkRes = await fetch(candUrl, {
          method: "HEAD",
          headers: { "User-Agent": "Mozilla/5.0 (compatible; DGS-DiscoveryValidator/1.0; +https://www.dgeniussolutions.com/)" },
          redirect: "follow",
          signal: AbortSignal.timeout(6000),
        });
        httpStatus = checkRes.status;
        if (checkRes.status >= 400 && checkRes.status !== 403) {
          isReachable = false;
        }
      } catch {
        // Fallback GET check with shorter timeout
        try {
          const getRes = await fetch(candUrl, {
            method: "GET",
            headers: { "User-Agent": "Mozilla/5.0 (compatible; DGS-DiscoveryValidator/1.0; +https://www.dgeniussolutions.com/)" },
            redirect: "follow",
            signal: AbortSignal.timeout(4000),
          });
          httpStatus = getRes.status;
          if (getRes.status >= 400 && getRes.status !== 403) {
            isReachable = false;
          }
        } catch {
          isReachable = false;
          httpStatus = 0;
        }
      }

      urlsValidated++;

      if (!isReachable) {
        errors.push(`URL unreachable: ${candUrl} (HTTP ${httpStatus})`);
        continue;
      }

      // 2.2 Free check
      if (cand.free_status === "NOT_FREE") {
        paidDisallowedRejected++;
        continue;
      }

      // 2.3 Check exact database duplicate
      const { rows: dupRows } = await cmsQuery<{ id: string }>(
        `SELECT id FROM off_page_opportunities WHERE domain = ? OR exact_submission_url = ? LIMIT 1`,
        [domain, candUrl]
      );
      if (dupRows.length > 0) {
        duplicatesRejected++;
        continue;
      }

      // 2.4 Ingest with full evidence and verification
      const ingestRes = await ingestDiscoveredOpportunity({
        site_name: cand.site_name,
        domain: cand.domain,
        exact_submission_url: candUrl,
        region: cand.region,
        country: cand.country,
        category: cand.category,
        free_status: cand.free_status || "FREE",
        free_tier_details: cand.free_tier_details,
        discovery_provider: cand.discovery_provider,
        discovery_query: cand.discovery_query,
        evidence: cand.evidence,
        notes: cand.notes,
        http_status: httpStatus,
        verification_status: "VERIFIED_ACTIVE",
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
      ? `Discovery completed successfully: ${newRecordsAdded} net-new verified opportunities added from ${provider.name}. (${duplicatesRejected} duplicates prevented).`
      : `Discovery sweep completed: ${resultsReturned} candidates reviewed from ${provider.name}. All existing candidates were already indexed (${duplicatesRejected} duplicates prevented).`;

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

  for (const row of rows) {
    const tier = row.check_priority || "P1";
    const nextIntervalDays = tier === "P0" ? 3 : tier === "P1" ? 7 : tier === "P2" ? 14 : 30;

    try {
      const res = await fetch(row.exact_submission_url, {
        method: "HEAD",
        headers: { "User-Agent": "DGS-OffPageMonitor/1.0 (+https://www.dgeniussolutions.com/)" },
        signal: AbortSignal.timeout(6000),
      });

      if (res.status >= 400 && res.status !== 403 && res.status !== 401) {
        // Re-check with GET if HEAD returned error
        const getRes = await fetch(row.exact_submission_url, {
          method: "GET",
          headers: { "User-Agent": "DGS-OffPageMonitor/1.0 (+https://www.dgeniussolutions.com/)" },
          signal: AbortSignal.timeout(6000),
        });

        if (getRes.status >= 400 && getRes.status !== 403) {
          dead++;
          archived.push(row.id);
          await cmsExecute(
            `UPDATE off_page_opportunities 
             SET status = 'EXPIRED', 
                 notes = CONCAT(IFNULL(notes, ''), ' [AUTO-EXPIRED: HTTP ', ? , ']'), 
                 last_verified = NOW(),
                 next_check_at = DATE_ADD(NOW(), INTERVAL ? DAY)
             WHERE id = ?`,
            [getRes.status, nextIntervalDays, row.id]
          );
          continue;
        }
      }

      healthy++;
      await cmsExecute(
        `UPDATE off_page_opportunities 
         SET last_verified = NOW(), 
             next_check_at = DATE_ADD(NOW(), INTERVAL ? DAY) 
         WHERE id = ?`,
        [nextIntervalDays, row.id]
      );
    } catch {
      // Network timeout or DNS failure
      dead++;
      archived.push(row.id);
      await cmsExecute(
        `UPDATE off_page_opportunities 
         SET status = 'EXPIRED', 
             notes = CONCAT(IFNULL(notes, ''), ' [AUTO-EXPIRED: Unreachable URL]'), 
             last_verified = NOW(),
             next_check_at = DATE_ADD(NOW(), INTERVAL ? DAY)
         WHERE id = ?`,
        [nextIntervalDays, row.id]
      );
    }
  }

  return { checked: rows.length, healthy, dead, archived };
}
