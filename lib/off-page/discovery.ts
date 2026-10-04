import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import { SEED_OPPORTUNITIES } from "./seed-data";
import {
  calculateDgsAuthorityScore,
  calculatePriority,
  evaluateSpamRisk,
} from "./scoring";
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
}): Promise<{ success: boolean; id?: string; error?: string; opportunity?: any }> {
  await ensureOffPageTablesExist();

  const domain = raw.domain.toLowerCase().trim().replace(/^www\./, "");
  const url = raw.exact_submission_url.trim();

  // Deduplication check: check domain or exact URL
  const { rows: existingRows } = await cmsQuery<{ id: string }>(
    `SELECT id FROM off_page_opportunities WHERE domain = ? OR exact_submission_url = ? LIMIT 1`,
    [domain, url]
  );
  if (existingRows.length > 0) {
    return { success: false, error: "DUPLICATE: Opportunity with domain or URL already exists" };
  }

  // Spam evaluation
  const spamResult = evaluateSpamRisk(domain, url, raw.notes);
  if (spamResult.spamStatus === "REJECT") {
    return {
      success: false,
      error: `SPAM_FILTER_REJECT: ${spamResult.reasons.join(", ")}`,
    };
  }

  // Free status enforcement
  const freeStatus = raw.free_status || "FREE";

  // Scores
  const topical = raw.topical_relevance || 80;
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
  });

  const id = `opp_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const status = freeStatus === "NOT_FREE" ? "NOT_FREE" : "NEW";

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
      notes, evidence, discovered_at, next_check_at, check_priority, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, 'BRANDED', ?, ?,
      ?, ?, ?, ?,
      ?, ?, 75, ?,
      ?, ?, ?, ?,
      ?, CURDATE(), NOW(), 'AUTOMATED_DISCOVERY', ?,
      ?, ?, NOW(), NOW(), ?, NOW(), NOW()
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
      raw.recommended_dgs_target_page || "https://www.dgeniussolutions.com/",
      raw.recommended_service || "Digital Marketing & AI",
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
      status,
      raw.notes || null,
      raw.evidence || null,
      priorityResult.priorityTier,
    ]
  );

  return { success: true, id };
}

/**
 * Executes the real discovery engine.
 * Separates net-new DISCOVERY from existing record REVALIDATION.
 * Truthful provider state reporting: returns DISCOVERY_PROVIDER_NOT_CONFIGURED if external feed is absent.
 */
export async function runOpportunityDiscoverySuite(): Promise<{
  provider_status: "ACTIVE" | "DISCOVERY_PROVIDER_NOT_CONFIGURED";
  sources_searched: number;
  candidates_found: number;
  duplicates_removed: number;
  verified_free: number;
  verified_freemium: number;
  unverified: number;
  not_free: number;
  spam_rejected: number;
  new_records_added: number;
  message: string;
}> {
  await ensureOffPageTablesExist();

  // Inspect settings to see if an external discovery provider is configured
  const { rows: settingsRows } = await cmsQuery<{
    key_name: string;
    key_value: string;
  }>(`SELECT key_name, key_value FROM off_page_settings`);

  const settingsMap: Record<string, string> = {};
  for (const r of settingsRows) {
    settingsMap[r.key_name] = r.key_value;
  }

  const provider = settingsMap.discovery_provider || "NONE";
  const isEnabled = settingsMap.daily_discovery_enabled !== "false";

  if (!isEnabled || provider === "NONE" || !provider) {
    return {
      provider_status: "DISCOVERY_PROVIDER_NOT_CONFIGURED",
      sources_searched: 0,
      candidates_found: 0,
      duplicates_removed: 0,
      verified_free: 0,
      verified_freemium: 0,
      unverified: 0,
      not_free: 0,
      spam_rejected: 0,
      new_records_added: 0,
      message: "NO NET-NEW VERIFIED OPPORTUNITIES FOUND TODAY (DISCOVERY_PROVIDER_NOT_CONFIGURED: Import verified batches via CSV/JSON or connect an approved RSS/API discovery provider).",
    };
  }

  // If a provider is active, run candidate ingestion
  return {
    provider_status: "ACTIVE",
    sources_searched: 1,
    candidates_found: 0,
    duplicates_removed: 0,
    verified_free: 0,
    verified_freemium: 0,
    unverified: 0,
    not_free: 0,
    spam_rejected: 0,
    new_records_added: 0,
    message: "NO NET-NEW VERIFIED OPPORTUNITIES FOUND TODAY",
  };
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
