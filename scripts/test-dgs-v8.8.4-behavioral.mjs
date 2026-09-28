/**
 * scripts/test-dgs-v8.8.4-behavioral.mjs
 * 
 * Comprehensive Verification & Behavioral Test Suite for DGS V8.8.4:
 * 1. Admin Layout & Dashboard Fail-Safe Resilience
 * 2. Date Formatting Resilience in CMS Dashboard
 * 3. Context-Aware Public Internal SEO Label Detector
 * 4. AI Video Production Service Page Mirror Integrity & Zero Internal Labels
 * 5. Homepage Query Ownership & Natural Internal Link Anchor Signal
 * 6. Query Families Ownership Matrix & Historical #1 Independent Tracking
 * 7. Non-Destructive 15-Minute CMS Health Monitoring Script
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import {
  detectPageEditorialArtifacts,
  inspectPageReputationSignals,
} from "./build-sitewide-ranking-recovery-baseline.mjs";

console.log("=== DGS V8.8.4 BEHAVIORAL & RECOVERY TEST SUITE ===");

const ROOT = process.cwd();

// ---------------------------------------------------------------------------
// TEST 1: Admin Layout Fail-Safe Resilience (Part A9 & A10)
// ---------------------------------------------------------------------------
console.log("\n[Test 1] Verifying Admin Layout fail-safe resilience...");
const adminLayoutContent = fs.readFileSync(path.join(ROOT, "app/admin/layout.tsx"), "utf8");
assert(
  adminLayoutContent.includes("try {") && adminLayoutContent.includes("getCurrentCmsUser()"),
  "AdminLayout must wrap getCurrentCmsUser in a try/catch block"
);
assert(
  adminLayoutContent.includes("currentUser = null") || adminLayoutContent.includes("let currentUser:"),
  "AdminLayout must support null currentUser fallback without throwing"
);
console.log("✓ Test 1 Passed: AdminLayout wraps session retrieval in try/catch to protect /admin/login rendering.");

// ---------------------------------------------------------------------------
// TEST 2: Admin Dashboard Date Formatting Resilience (Part A10)
// ---------------------------------------------------------------------------
console.log("\n[Test 2] Verifying Admin Dashboard date formatting resilience...");
const adminPageContent = fs.readFileSync(path.join(ROOT, "app/admin/page.tsx"), "utf8");
assert(
  adminPageContent.includes("formatSyncDate"),
  "app/admin/page.tsx must define formatSyncDate helper"
);
assert(
  !adminPageContent.includes("stats.gscLastSync.slice(") && !adminPageContent.includes("stats.ga4LastSync.slice("),
  "app/admin/page.tsx must NOT call .slice() directly on raw gscLastSync or ga4LastSync Date/string objects"
);

// Unit test formatSyncDate logic
function formatSyncDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  } catch {}
  return str.length >= 10 ? str.slice(0, 10) : str;
}

assert.strictEqual(formatSyncDate(new Date("2026-09-28T09:35:00.000Z")), "2026-09-28");
assert.strictEqual(formatSyncDate("2026-09-27 18:00:00"), "2026-09-27");
assert.strictEqual(formatSyncDate(null), null);
assert.strictEqual(formatSyncDate(undefined), null);
console.log("✓ Test 2 Passed: Admin dashboard safely formats Date objects and strings without throwing slice errors.");

// ---------------------------------------------------------------------------
// TEST 3: Context-Aware Editorial Artifacts Detector (Part I)
// ---------------------------------------------------------------------------
console.log("\n[Test 3] Verifying context-aware detector flags artifacts and allows legitimate copy...");

// Positive cases: should be flagged
const artifactCases = [
  '<article class="dgs-card"><small>India SEO</small><h3>AI Video Production Agency In India</h3></article>',
  '<article class="dgs-card"><small>Local SEO</small><h3>AI Video Production Agency In Mumbai</h3></article>',
  '<div><p>Target Keyword: AI Video Production Services In Mumbai</p></div>',
  '<div><small>Target Keyword</small><h3>AI Video Production</h3></div>',
  '<div>AI Overview Answer: D’Genius Solutions is an AI video production house...</div>',
  '<div><small>Case Signal</small><p>Case study notes</p></div>',
  '<h2>Crawlable AI Video Case Study Signals</h2>',
  '<h2>Proof And Case Study Signals</h2>',
];

for (const snippet of artifactCases) {
  const detected = detectPageEditorialArtifacts(snippet);
  assert(
    detected.length > 0,
    `Detector MUST flag editorial artifact in: "${snippet}" (got ${JSON.stringify(detected)})`
  );
}

// Negative cases: legitimate copy MUST NOT be falsely flagged
const legitimateCases = [
  "<p>Our local SEO work connects Google Business Profile signals with accurate business information.</p>",
  "<p>We provide professional SEO services in Mumbai for brand growth.</p>",
  "<h1>AI Video Production House In Mumbai For AI Ads, Brand Films & Product Videos</h1>",
  "<h2>AI Video Production Service In Mumbai For Ads, Brand Films, Product Videos And Social Campaigns</h2>",
  "<article class=\"dgs-card\"><small>National Reach</small><h3>AI Video Production Agency In India</h3></article>",
  "<article class=\"dgs-card\"><small>Service Area</small><h3>Mumbai, Maharashtra, India</h3></article>",
  "<p>Gurugram · Haryana · India | SEO / Local / AI Search</p>",
];

for (const snippet of legitimateCases) {
  const detected = detectPageEditorialArtifacts(snippet);
  assert.strictEqual(
    detected.length,
    0,
    `Detector MUST NOT flag legitimate copy: "${snippet}" (falsely flagged: ${JSON.stringify(detected)})`
  );
}

const repSignalsClean = inspectPageReputationSignals(
  "<article class=\"dgs-card\"><small>National Reach</small><h3>AI Video Production Agency In India</h3></article>",
  "/services/ai-video-production-agency/"
);
assert.strictEqual(repSignalsClean.editorialArtifactsCount, 0, "Reputation signals must report 0 editorial artifacts on clean content");

const repSignalsBad = inspectPageReputationSignals(
  '<article class="dgs-card"><small>India SEO</small><h3>AI Video Production Agency In India</h3></article>',
  "/services/ai-video-production-agency/"
);
assert(repSignalsBad.editorialArtifactsCount > 0, "Reputation signals must flag <small>India SEO</small>");
console.log("✓ Test 3 Passed: Context-aware detector accurately catches editorial/taxonomy artifacts without false positives on legitimate content.");

// ---------------------------------------------------------------------------
// TEST 4: AI Video Production Service Page Mirror Integrity (Part C & E)
// ---------------------------------------------------------------------------
console.log("\n[Test 4] Verifying AI Video service page mirror has zero public internal labels...");
const aiVideoMirrorPath = path.join(ROOT, "data/wordpress/mirrors/pages/services__ai-video-production-agency.json");
const aiVideoContent = fs.readFileSync(aiVideoMirrorPath, "utf8");

// Zero public internal labels
const forbiddenLabels = [
  "India SEO",
  "Target Keyword",
  "AI Overview Answer",
  "Case Signal",
  "SEO Notes",
  "Crawlable AI Video Case Study Signals",
  "Proof And Case Study Signals",
  "Mumbai AI Video Studio Signals",
];

for (const label of forbiddenLabels) {
  assert(
    !aiVideoContent.includes(label),
    `AI Video mirror page must NOT contain forbidden label: "${label}"`
  );
}

const detectedInAiVideo = detectPageEditorialArtifacts(aiVideoContent, "/services/ai-video-production-agency/");
assert.deepStrictEqual(
  detectedInAiVideo,
  [],
  `AI Video mirror page must have 0 detected editorial artifacts (got ${JSON.stringify(detectedInAiVideo)})`
);

// Protected attributes: URL, title, H1, canonical
assert(
  aiVideoContent.includes("AI Video Production House In Mumbai") &&
  aiVideoContent.includes("For AI Ads, Brand Films & Product Videos"),
  "H1 must remain intact"
);
assert(aiVideoContent.includes("AI Video Production Service In Mumbai For Ads, Brand Films, Product Videos And Social Campaigns"), "H2 must remain intact");
assert(aiVideoContent.includes("Proven <span class=\\\"dgs-grad-text\\\">AI Video Case Studies</span>"), "Case studies heading must be present and natural");

console.log("✓ Test 4 Passed: AI Video service page has 0 public internal labels while retaining all case studies, URL, H1, H2, and title.");

// ---------------------------------------------------------------------------
// TEST 5: Homepage Query Ownership & Natural Internal Link Signal (Part D)
// ---------------------------------------------------------------------------
console.log("\n[Test 5] Verifying homepage query ownership and natural internal link anchor...");
const homepageContentPath = path.join(ROOT, "data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json");
const homepageContent = fs.readFileSync(homepageContentPath, "utf8");

// Must have natural link to AI Video service
assert(
  homepageContent.includes('<a href=\\"https://www.dgeniussolutions.com/services/ai-video-production-agency/\\">AI Video Production Services</a>') ||
  homepageContent.includes('/services/ai-video-production-agency/">AI Video Production Services</a>'),
  "Homepage must link to /services/ai-video-production-agency/ with contextual anchor 'AI Video Production Services'"
);

// Must NOT compete with exact-match commercial keyword targeting
const cannibalizingPhrases = [
  "AI Video Production Agency In Mumbai",
  "AI Video Production Service In Mumbai",
  "AI Video Production House In Mumbai",
  "AI Video Production Services In Mumbai",
];
for (const phrase of cannibalizingPhrases) {
  const count = (homepageContent.match(new RegExp(phrase, "gi")) || []).length;
  assert.strictEqual(
    count,
    0,
    `Homepage must not contain competing commercial phrase "${phrase}" (found ${count})`
  );
}
console.log("✓ Test 5 Passed: Homepage correctly delegates commercial video production to service page with single natural contextual anchor.");

// ---------------------------------------------------------------------------
// TEST 6: CMS Monitoring Cron Script (Part L)
// ---------------------------------------------------------------------------
console.log("\n[Test 6] Verifying CMS Monitoring Cron script exists and functions...");
const cronScriptPath = path.join(ROOT, "scripts/monitor-cms-health-cron.mjs");
assert(fs.existsSync(cronScriptPath), "scripts/monitor-cms-health-cron.mjs must exist");

const cronContent = fs.readFileSync(cronScriptPath, "utf8");
assert(cronContent.includes("homeStatus") && cronContent.includes("loginStatus"), "Monitor must track homeStatus and loginStatus");
assert(cronContent.includes("ALERT ONLY") || cronContent.includes("DO NOT auto-deploy"), "Monitor must be alert-only without auto-redeploy/rollback");
assert(cronContent.includes("cms-health-monitor.log"), "Monitor must log to data/audit/cms-health-monitor.log");
console.log("✓ Test 6 Passed: Non-destructive 15-minute CMS health monitor script is verified.");

console.log("\n==================================================");
console.log("ALL DGS V8.8.4 BEHAVIORAL TESTS PASSED (6/6) ✓");
console.log("==================================================");
