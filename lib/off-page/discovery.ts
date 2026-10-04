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
        assigned_to, notes, evidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

  const domain = raw.domain.toLowerCase().trim();
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
  if (freeStatus === "NOT_FREE") {
    // If payment is mandatory, mark status = NOT_FREE and do NOT put in active queue
  }

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
      notes, evidence
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), NOW(), 'AUTOMATED_DISCOVERY', ?, ?, ?)`,
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
      "BRANDED",
      raw.link_type || "DIRECTORY",
      raw.dofollow_status || "DOFOLLOW",
      authorityScore >= 90 ? "VERY_HIGH" : authorityScore >= 75 ? "HIGH" : "MEDIUM",
      topical,
      geo,
      traffic,
      editorial,
      spamRisk,
      75,
      priorityResult.valueScore,
      priorityResult.difficultyScore,
      priorityResult.priorityScore,
      priorityResult.priorityTier,
      authorityScore,
      spamResult.spamStatus,
      status,
      raw.notes || null,
      raw.evidence || null,
    ]
  );

  return { success: true, id };
}

/**
 * Revalidates submission URLs for active opportunities.
 * If URL returns 4xx/5xx or dies, updates status to EXPIRED or ARCHIVED.
 */
export async function revalidateOpportunityUrls(limit: number = 20): Promise<{
  checked: number;
  healthy: number;
  dead: number;
  archived: string[];
}> {
  await ensureOffPageTablesExist();

  const { rows } = await cmsQuery<{ id: string; exact_submission_url: string; status: string }>(
    `SELECT id, exact_submission_url, status 
     FROM off_page_opportunities 
     WHERE status NOT IN ('ARCHIVED', 'EXPIRED', 'SPAM', 'NOT_FREE')
     ORDER BY (last_verified IS NOT NULL), last_verified ASC 
     LIMIT ${Number(limit)}`
  );

  let healthy = 0;
  let dead = 0;
  const archived: string[] = [];

  for (const row of rows) {
    try {
      const res = await fetch(row.exact_submission_url, {
        method: "HEAD",
        headers: { "User-Agent": "DGS-OffPageMonitor/1.0" },
        signal: AbortSignal.timeout(6000),
      });

      if (res.status >= 400 && res.status !== 403 && res.status !== 401) {
        // Re-check with GET if HEAD returned error
        const getRes = await fetch(row.exact_submission_url, {
          method: "GET",
          headers: { "User-Agent": "DGS-OffPageMonitor/1.0" },
          signal: AbortSignal.timeout(6000),
        });

        if (getRes.status >= 400 && getRes.status !== 403) {
          dead++;
          archived.push(row.id);
          await cmsExecute(
            `UPDATE off_page_opportunities 
             SET status = 'EXPIRED', notes = CONCAT(IFNULL(notes, ''), ' [AUTO-EXPIRED: HTTP ', ? , ']'), last_verified = NOW() 
             WHERE id = ?`,
            [getRes.status, row.id]
          );
          continue;
        }
      }

      healthy++;
      await cmsExecute(
        `UPDATE off_page_opportunities SET last_verified = NOW() WHERE id = ?`,
        [row.id]
      );
    } catch {
      // Network timeout or DNS failure
      dead++;
      archived.push(row.id);
      await cmsExecute(
        `UPDATE off_page_opportunities 
         SET status = 'EXPIRED', notes = CONCAT(IFNULL(notes, ''), ' [AUTO-EXPIRED: Unreachable URL]'), last_verified = NOW() 
         WHERE id = ?`,
        [row.id]
      );
    }
  }

  return { checked: rows.length, healthy, dead, archived };
}
