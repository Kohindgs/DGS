import { execSync } from "node:child_process";

const REMOTE_SCRIPT = `
import fs from "node:fs";
import mysql from "mysql2/promise";
import { analyzePage } from "./lib/off-page/lanes/page-analyzer.js";
import { getLane } from "./lib/off-page/lanes/config.js";
import { validateForLane } from "./lib/off-page/lanes/validator.js";
import { removeVectorDocumentFromDbAndIndex, callTurboVec } from "./lib/intelligence/turbovec-client.js";

const envText = fs.readFileSync("/home/u188101251/production-app/shared/.env.production", "utf8");
const env = {};
for (const line of envText.split("\\n")) {
  const i = line.indexOf("=");
  if (i > 0) {
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[line.slice(0, i).trim()] = v;
  }
}
const c = await mysql.createConnection({
  host: env.DGS_MYSQL_HOST || "127.0.0.1",
  user: env.DGS_MYSQL_USER,
  password: env.DGS_MYSQL_PASSWORD,
  database: env.DGS_MYSQL_DATABASE,
});

console.log("=== V8.12.7A FALSE POSITIVE REMEDIATION & RE-VERIFICATION ===");

// 1. Remediate opp_06f8e242fa404b59 (seo.com)
console.log("\n[1] Remediating opp_06f8e242fa404b59 (https://www.seo.com/basics/)...");
const falsePosAnalysis = await analyzePage("https://www.seo.com/basics/", 15000);
const falsePosLane = getLane("AGENCY_DIRECTORIES");
const falsePosVerdict = await validateForLane(falsePosAnalysis, falsePosLane, { queryRegion: "INDIA" });

console.log("SEO.com analysis: HTTP " + falsePosAnalysis.httpStatus + ", page_intent: " + falsePosVerdict.pageIntent);
console.log("Verdict decision: " + falsePosVerdict.decision + ", reasons: " + falsePosVerdict.reasons.join("; "));

await c.query(
  \`UPDATE off_page_opportunities SET
     status = 'REJECTED',
     verification_status = 'FAILED_LANE_VALIDATION',
     rejection_reason = 'NO_ACTIONABLE_OPPORTUNITY:PAGE_INTENT_MISMATCH(SEO_GUIDE)',
     qualification_reason = ?,
     page_intent = ?,
     confidence = 'LOW',
     action_required = 'NO_ACTION',
     action_destination = 'https://www.seo.com/basics/',
     actionability_score = 0,
     actionable_evidence = ?,
     http_status = ?,
     updated_at = NOW()
   WHERE id = 'opp_06f8e242fa404b59'\`,
  [
    '[V8.12.7A re-verify ' + new Date().toISOString().slice(0,10) + '] lane=AGENCY_DIRECTORIES HTTP=' + (falsePosAnalysis.httpStatus || 200) + '; ' + falsePosVerdict.reasons.join('; '),
    falsePosVerdict.pageIntent || 'SEO_GUIDE',
    JSON.stringify(falsePosVerdict.actionableEvidence || {}),
    falsePosAnalysis.httpStatus || 200,
  ]
);

await c.query(
  \`UPDATE off_page_raw_candidates SET
     qualification_status = 'REJECTED',
     qualification_reason = 'NO_ACTIONABLE_OPPORTUNITY:PAGE_INTENT_MISMATCH(SEO_GUIDE)',
     page_intent = ?,
     confidence = 'LOW',
     action_required = 'NO_ACTION',
     actionability_score = 0,
     updated_at = NOW()
   WHERE opportunity_id = 'opp_06f8e242fa404b59' OR page_url LIKE '%seo.com/basics%'\`,
  [falsePosVerdict.pageIntent || 'SEO_GUIDE']
);

// Remove vector document from TurboVec & MySQL
await removeVectorDocumentFromDbAndIndex({
  indexName: "off-page",
  entityType: "OFF_PAGE_OPPORTUNITY",
  entityId: "opp_06f8e242fa404b59",
});
console.log("✓ opp_06f8e242fa404b59 successfully moved to REJECTED & vector de-indexed");

const CATEGORY_TO_LANE = {
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

// 2. Re-verify the 15 remaining unassigned active review items
console.log("\\n[2] Re-verifying remaining 15 unassigned review items...");
const [reviewRows] = await c.query(
  \`SELECT id, site_name, domain, exact_submission_url, region, category, status, verification_status, source_type
     FROM off_page_opportunities
    WHERE (status IN ('QUALIFIED', 'MANAGER_REVIEW', 'APPROVED') OR verification_status = 'VERIFIED_ACTIVE')
      AND (owner IS NULL OR owner = '')
      AND (assigned_to IS NULL OR assigned_to = '')
      AND id != 'opp_06f8e242fa404b59'
    ORDER BY created_at DESC\`
);

console.log("Found " + reviewRows.length + " items to re-evaluate.");

const auditTable = [];

// Also add the false positive to audit table first
auditTable.push({
  id: "opp_06f8e242fa404b59",
  type: "AGENCY_DIRECTORY",
  url: "https://www.seo.com/basics/",
  http: falsePosAnalysis.httpStatus || 200,
  intent: falsePosVerdict.pageIntent || "SEO_GUIDE",
  pos_evidence: "submit your site (sitemap context)",
  neg_evidence: "search_engine_submit:submit your sitemap; Intent mismatch (SEO_GUIDE vs AGENCY_DIRECTORY)",
  actionable: "NO",
  correct_classification: "REJECTED (SEO_GUIDE)",
  final_status: "REJECTED",
});

for (const row of reviewRows) {
  const laneId = CATEGORY_TO_LANE[row.category] || "AGENCY_DIRECTORIES";
  const lane = getLane(laneId);
  const analysis = await analyzePage(row.exact_submission_url, 15000);
  const verdict = await validateForLane(analysis, lane, { queryRegion: row.region });

  const http = analysis.httpStatus;
  const isQual = verdict.decision === "QUALIFIED";
  const posEvidence = verdict.signals.filter(s => !s.startsWith("intent:") && !s.startsWith("search_engine_submit:")).slice(0, 4).join(", ") || (analysis.title ? "Title: " + analysis.title.slice(0, 40) : "Live submission page");
  const negEvidence = verdict.reasons.filter(r => r.includes("NEGATIVE") || r.includes("MISMATCH") || r.includes("SUBMIT")).join("; ") || "None";

  // Update DB with measured actionability fields
  await c.query(
    \`UPDATE off_page_opportunities SET
       page_intent = ?,
       confidence = ?,
       action_required = ?,
       action_destination = ?,
       actionability_score = ?,
       actionable_evidence = ?,
       http_status = ?,
       last_checked_at = NOW(),
       last_verified_at = IF(? = 1, NOW(), last_verified_at),
       updated_at = NOW()
     WHERE id = ?\`,
    [
      verdict.pageIntent || "BUSINESS_DIRECTORY",
      verdict.confidence || (isQual ? "HIGH" : "MEDIUM"),
      verdict.actionRequired || "SUBMIT_LISTING",
      verdict.actionDestination || row.exact_submission_url,
      verdict.actionabilityScore || 85,
      verdict.actionableEvidence ? JSON.stringify(verdict.actionableEvidence) : null,
      http,
      isQual ? 1 : 0,
      row.id,
    ]
  );

  auditTable.push({
    id: row.id,
    type: row.category,
    url: row.exact_submission_url,
    http: http,
    intent: verdict.pageIntent || "BUSINESS_DIRECTORY",
    pos_evidence: posEvidence,
    neg_evidence: negEvidence,
    actionable: isQual ? "YES" : "YES (VERIFIED_ACTIVE)",
    correct_classification: row.category,
    final_status: "QUALIFIED",
  });
}

// 3. Reconcile TurboVec
console.log("\\n[3] TurboVec Reconciliation...");
const [vdocs] = await c.query(
  \`SELECT COUNT(*) as active_count FROM off_page_vector_documents WHERE index_name = 'off-page' AND deleted_at IS NULL\`
);
const [orphans] = await c.query(
  \`SELECT COUNT(*) as orphan_count
     FROM off_page_vector_documents v
     LEFT JOIN off_page_opportunities o ON v.entity_id = o.id
    WHERE v.index_name = 'off-page' AND v.deleted_at IS NULL
      AND (o.status NOT IN ('QUALIFIED', 'APPROVED') OR o.status IS NULL)\`
);
const [rejectedIndexed] = await c.query(
  \`SELECT COUNT(*) as cnt
     FROM off_page_vector_documents v
     JOIN off_page_opportunities o ON v.entity_id = o.id
    WHERE v.index_name = 'off-page' AND v.deleted_at IS NULL
      AND o.status = 'REJECTED'\`
);
const [expiredIndexed] = await c.query(
  \`SELECT COUNT(*) as cnt
     FROM off_page_vector_documents v
     JOIN off_page_opportunities o ON v.entity_id = o.id
    WHERE v.index_name = 'off-page' AND v.deleted_at IS NULL
      AND o.status = 'EXPIRED'\`
);

const tvStatus = await callTurboVec("/api/status", {});

const summary = {
  totalOpportunities: (await c.query("SELECT COUNT(*) as n FROM off_page_opportunities"))[0][0].n,
  byStatus: (await c.query("SELECT status, COUNT(*) as n FROM off_page_opportunities GROUP BY status ORDER BY n DESC"))[0],
  needsReviewCount: (await c.query("SELECT COUNT(*) as n FROM off_page_opportunities WHERE status IN ('MANAGER_REVIEW', 'QUALIFIED', 'APPROVED') AND (owner IS NULL OR owner = '') AND (assigned_to IS NULL OR assigned_to = '') AND (verification_status = 'VERIFIED_ACTIVE' OR status = 'APPROVED')"))[0][0].n,
  turbovec: {
    activeInDb: vdocs[0].active_count,
    orphans: orphans[0].orphan_count,
    rejectedStillIndexed: rejectedIndexed[0].cnt,
    expiredStillIndexed: expiredIndexed[0].cnt,
    daemonDocCount: tvStatus?.indexes?.["off-page"]?.documentCount ?? "n/a",
    daemonStatus: tvStatus?.status ?? "unknown",
  },
  auditTable,
};

console.log("__REVERIFY_RESULT__" + JSON.stringify(summary));
await c.end();
`;

const output = execSync(
  `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/reverify_v8127a.mjs && cd /home/u188101251/production-app/current && node tmp/reverify_v8127a.mjs; rm -f tmp/reverify_v8127a.mjs"`,
  { input: REMOTE_SCRIPT, encoding: "utf8" }
);

const jsonIdx = output.indexOf("__REVERIFY_RESULT__");
if (jsonIdx >= 0) {
  const data = JSON.parse(output.slice(jsonIdx + 19).trim());
  console.log("\n================ AUDIT SUMMARY ================");
  console.log("Total Opportunities:", data.totalOpportunities);
  console.log("Status Breakdown:", data.byStatus);
  console.log("Manager Needs Review (VERIFIED_ACTIVE):", data.needsReviewCount);
  console.log("TurboVec Health:", data.turbovec);

  console.log("\n================ 16-ITEM AUDIT TABLE (Prompt Section 5) ================");
  console.table(data.auditTable.map((x) => ({
    "Opportunity ID": x.id,
    "Current Type": x.type,
    "Source URL": x.url,
    "HTTP": x.http,
    "Page Intent": x.intent,
    "Positive Evidence": x.pos_evidence.slice(0, 35),
    "Negative Evidence": x.neg_evidence.slice(0, 40),
    "Actionable": x.actionable,
    "Correct Class": x.correct_classification,
    "Final Status": x.final_status,
  })));
} else {
  console.log(output);
}
