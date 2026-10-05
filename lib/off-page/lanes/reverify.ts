/**
 * V8.12.6 live re-verification of existing opportunity records (seeds + earlier discoveries).
 *
 * For every unassigned pipeline record: fetch the real URL, run the lane validator for its category,
 * and move it according to MEASURED evidence:
 *   QUALIFIED (lane signals on a live 2xx page)        -> status QUALIFIED, VERIFIED_ACTIVE (stays in Needs Review)
 *   dead (unreachable / 404 / 410 / 5xx)                -> status EXPIRED, DEAD
 *   bot-protected (401/403/429)                         -> status DISCOVERED, BLOCKED_UNVERIFIABLE (out of queue, manual check)
 *   reachable but lane validator / paid / spam fails    -> status REJECTED with the logged reason
 * Link type is reset to UNKNOWN (N/A for citations) unless a DGS link is observed on the page.
 * Owned / in-flight team records are never status-changed; only their link type is de-guessed.
 */
import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "../db";
import { LINK_NOT_APPLICABLE_CATEGORIES } from "../types";
import { recordVerifiedBacklink } from "../backlink-discovery";
import { getLane, type LaneDefinition, type LaneId } from "./config";
import { analyzePage, mapLimit } from "./page-analyzer";
import { validateForLane } from "./validator";

const CATEGORY_TO_LANE: Record<string, LaneId> = {
  BUSINESS_LISTING: "BUSINESS_CITATIONS",
  LOCAL_CITATION: "LOCAL_LISTINGS",
  AGENCY_DIRECTORY: "AGENCY_DIRECTORIES",
  TOOL_DIRECTORY: "AGENCY_DIRECTORIES",
  ARTICLE_SUBMISSION: "ARTICLE_CONTRIBUTIONS",
  CASE_STUDY_DISTRIBUTION: "ARTICLE_CONTRIBUTIONS",
  EXPERT_CONTRIBUTION: "EXPERT_CONTRIBUTIONS",
  GUEST_EXPERT: "EXPERT_CONTRIBUTIONS",
  PODCAST: "EXPERT_CONTRIBUTIONS",
  INTERVIEW: "EXPERT_CONTRIBUTIONS",
  DIGITAL_PR: "DIGITAL_PR",
  NEWS_SOURCE: "DIGITAL_PR",
  COMMUNITY: "COMMUNITIES_QA",
  Q_AND_A: "COMMUNITIES_QA",
  PARTNERSHIP: "PARTNERSHIPS",
  CLIENT_PARTNER: "PARTNERSHIPS",
  ASSOCIATION: "PARTNERSHIPS",
  EVENT: "PARTNERSHIPS",
  AWARD: "PARTNERSHIPS",
  RESOURCE_PAGE: "RESOURCE_PAGES",
  RESEARCH_CITATION: "RESOURCE_PAGES",
  BROKEN_LINK: "BROKEN_LINKS",
  UNLINKED_MENTION: "UNLINKED_MENTIONS",
  REVIEW_PLATFORM: "REVIEW_PLATFORMS",
};

const UNASSIGNED_ACTIVE = ["NEW", "DISCOVERED", "QUALIFIED", "MANAGER_REVIEW", "APPROVED", "VERIFYING"];

export interface ReverifyResult {
  run_id: string;
  link_type_reset: number;
  examined: number;
  qualified: number;
  expired_dead: number;
  blocked_unverifiable: number;
  rejected: number;
  skipped_owned: number;
  backlinks_found: number;
  reasons: Record<string, number>;
  per_record: Array<{ id: string; site: string; url: string; http: number | null; decision: string; reasons: string }>;
  started_at: string;
  completed_at: string;
}

export async function reverifyExistingOpportunities(opts?: { limit?: number }): Promise<ReverifyResult> {
  await ensureOffPageTablesExist();
  const runId = `reverify_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const started = new Date();
  const result: ReverifyResult = {
    run_id: runId,
    link_type_reset: 0,
    examined: 0,
    qualified: 0,
    expired_dead: 0,
    blocked_unverifiable: 0,
    rejected: 0,
    skipped_owned: 0,
    backlinks_found: 0,
    reasons: {},
    per_record: [],
    started_at: started.toISOString(),
    completed_at: "",
  };

  await cmsExecute(
    `INSERT INTO off_page_discovery_runs (run_id, provider, started_at, status) VALUES (?, 'REVERIFY:EXISTING', NOW(), 'RUNNING')`,
    [runId]
  ).catch(() => {});

  // 1. De-guess link type on every record that has no observation evidence.
  const citationList = Array.from(LINK_NOT_APPLICABLE_CATEGORIES);
  const ph = citationList.map(() => "?").join(",");
  const r1: any = await cmsExecute(
    `UPDATE off_page_opportunities SET dofollow_status = 'N/A'
      WHERE category IN (${ph}) AND dofollow_status <> 'N/A'`,
    citationList
  );
  const r2: any = await cmsExecute(
    `UPDATE off_page_opportunities SET dofollow_status = 'UNKNOWN'
      WHERE category NOT IN (${ph}) AND dofollow_status NOT IN ('UNKNOWN','N/A')`,
    citationList
  );
  result.link_type_reset = Number(r1?.affectedRows || 0) + Number(r2?.affectedRows || 0);

  // Correct provenance for Google News records (source_type was defaulted to 'curated').
  await cmsExecute(
    `UPDATE off_page_opportunities SET source_type = 'google_news_rss'
      WHERE (source = 'GOOGLE_NEWS_RSS' OR discovery_provider = 'GOOGLE_NEWS_RSS') AND (source_type IS NULL OR source_type = 'curated')`
  ).catch(() => {});
  await cmsExecute(
    `UPDATE off_page_opportunities SET source_type = 'curated_seed'
      WHERE source = 'CURATED_SEED' AND (source_type IS NULL OR source_type = 'curated')`
  ).catch(() => {});

  // 2. Live re-verification of unassigned active records
  const sph = UNASSIGNED_ACTIVE.map(() => "?").join(",");
  const { rows } = await cmsQuery<any>(
    `SELECT id, site_name, domain, exact_submission_url, region, category, status, owner, assigned_to
       FROM off_page_opportunities
      WHERE status IN (${sph})
      ORDER BY created_at ASC
      ${opts?.limit ? `LIMIT ${Number(opts.limit)}` : ""}`,
    UNASSIGNED_ACTIVE
  );

  const work = rows.filter((r) => {
    const owned = (r.owner && String(r.owner).trim()) || (r.assigned_to && String(r.assigned_to).trim());
    if (owned) result.skipped_owned++;
    return !owned;
  });

  const verdicts = await mapLimit(work, 5, async (row) => {
    const laneId = CATEGORY_TO_LANE[row.category] || "DIGITAL_PR";
    const lane = getLane(laneId) as LaneDefinition;
    const analysis = await analyzePage(row.exact_submission_url, 15000);
    const verdict = await validateForLane(analysis, lane, { queryRegion: row.region, brokenLinkCheckLimit: 15 });
    return { row, lane, analysis, verdict };
  });

  for (const { row, lane, analysis, verdict } of verdicts) {
    result.examined++;
    const http = analysis.httpStatus;
    const blocked = http === 401 || http === 403 || http === 429;
    const dead = !analysis.fetched || http === 404 || http === 410 || (http !== null && http >= 500);

    let newStatus: string;
    let verification: string;
    if (verdict.decision === "QUALIFIED") {
      newStatus = "QUALIFIED";
      verification = "VERIFIED_ACTIVE";
      result.qualified++;
    } else if (dead) {
      newStatus = "EXPIRED";
      verification = "DEAD";
      result.expired_dead++;
    } else if (blocked) {
      newStatus = "DISCOVERED";
      verification = "BLOCKED_UNVERIFIABLE";
      result.blocked_unverifiable++;
    } else {
      newStatus = "REJECTED";
      verification = "FAILED_LANE_VALIDATION";
      result.rejected++;
    }
    const reasonText = `[V8.12.6 re-verify ${new Date().toISOString().slice(0, 10)}] lane=${lane.id} HTTP=${http ?? "n/a"}; ${verdict.reasons.join("; ")}${
      verdict.signals.length ? `; signals=${verdict.signals.slice(0, 8).join(",")}` : ""
    }`.slice(0, 1500);
    for (const r of verdict.reasons) {
      const k = r.split(":")[0];
      result.reasons[k] = (result.reasons[k] || 0) + 1;
    }

    const linkType = analysis.dgsLinks.length > 0 ? verdict.linkType : LINK_NOT_APPLICABLE_CATEGORIES.has(row.category) ? "N/A" : "UNKNOWN";

    const isVerified = verification === "VERIFIED_ACTIVE";
    await cmsExecute(
      `UPDATE off_page_opportunities SET
         status = ?, verification_status = ?, http_status = ?, last_checked_at = NOW(),
         ${isVerified ? "last_verified_at = NOW(), last_verified = NOW()," : ""}
         free_status = ?, dofollow_status = ?, discovery_lane = COALESCE(discovery_lane, ?),
         page_title = COALESCE(?, page_title), qualification_reason = ?,
         page_intent = ?, confidence = ?, action_required = ?, action_destination = ?,
         actionability_score = ?, actionable_evidence = ?, updated_at = NOW()
       WHERE id = ? AND (owner IS NULL OR owner = '') AND (assigned_to IS NULL OR assigned_to = '')`,
      [
        newStatus,
        verification,
        http,
        verdict.freeStatus,
        linkType,
        lane.id,
        analysis.title || null,
        reasonText,
        verdict.pageIntent || null,
        verdict.confidence || "LOW",
        verdict.actionRequired || "NO_ACTION",
        verdict.actionDestination || row.exact_submission_url,
        verdict.actionabilityScore || 0,
        verdict.actionableEvidence ? JSON.stringify(verdict.actionableEvidence) : null,
        row.id,
      ]
    );

    // If an opportunity is no longer qualified, remove its TurboVec vector!
    if (newStatus !== "QUALIFIED" && newStatus !== "APPROVED") {
      const { removeVectorDocumentFromDbAndIndex } = await import("@/lib/intelligence/turbovec-client");
      await removeVectorDocumentFromDbAndIndex({
        indexName: "off-page",
        entityType: "OFF_PAGE_OPPORTUNITY",
        entityId: row.id,
      }).catch(() => {});
    }

    if (analysis.dgsLinks.length > 0) {
      const rec = await recordVerifiedBacklink({
        analysis,
        sourceTitle: analysis.title || row.site_name,
        sourceType: "reverify_existing",
        note: `Observed during V8.12.7A re-verification of ${row.id}`,
      }).catch(() => null);
      if (rec) result.backlinks_found++;
    }

    const posEvidence = verdict.signals.filter((s) => !s.startsWith("intent:") && !s.startsWith("search_engine_submit:")).slice(0, 5).join(", ");
    const negEvidence = verdict.reasons.filter((r) => r.includes("NEGATIVE") || r.includes("MISMATCH") || r.includes("SUBMIT")).join("; ") || "None";

    result.per_record.push({
      id: row.id,
      site: row.site_name,
      url: row.exact_submission_url,
      http,
      decision: `${newStatus}/${verification}`,
      reasons: verdict.reasons.join("; ").slice(0, 300),
      // @ts-ignore
      page_intent: verdict.pageIntent,
      // @ts-ignore
      positive_evidence: posEvidence || "None observed",
      // @ts-ignore
      negative_evidence: negEvidence,
      // @ts-ignore
      actionable_by_dgs: newStatus === "QUALIFIED" ? "YES" : "NO",
      // @ts-ignore
      correct_classification: lane.category,
      // @ts-ignore
      final_status: newStatus,
    });
  }

  result.completed_at = new Date().toISOString();
  await cmsExecute(
    `UPDATE off_page_discovery_runs SET completed_at = NOW(), results_returned = ?, valid_candidates = ?, spam_rejected = ?,
       inserted_count = 0, status = 'COMPLETED', details = ? WHERE run_id = ?`,
    [result.examined, result.qualified, result.rejected, JSON.stringify(result), runId]
  ).catch(() => {});
  return result;
}
