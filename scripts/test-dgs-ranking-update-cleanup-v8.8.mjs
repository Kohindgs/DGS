import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

test("=== DGS V8.8 RANKING & UPDATE CLEANUP TEST SUITE ===", () => {
  assert.ok(true);
});

// -----------------------------------------------------------------------------
// 1. RETIRED ROUTES (410 GONE) & CLEAN REMOVAL
// -----------------------------------------------------------------------------
test("1. All 8 candidate obsolete routes registered as 410 Gone", () => {
  const regPath = path.join(ROOT, "data/migration/retired-routes.approved.json");
  assert.ok(fs.existsSync(regPath), "retired-routes.approved.json must exist");
  const reg = JSON.parse(fs.readFileSync(regPath, "utf8"));

  const required410Routes = [
    "/wp-file-download-search/",
    "/seo-pricing/",
    "/seo-executive-assessment/",
    "/seo-manager-assessment/",
    "/ai-motion-graphic-designer/",
    "/social-media-executive/",
    "/indriya-test/",
    "/motion-graphics/",
  ];

  for (const route of required410Routes) {
    const entry = (reg.retired || []).find((r) => r.path === route);
    assert.ok(entry, `Route ${route} must be registered in retired-routes.approved.json`);
    assert.strictEqual(entry.statusCode, 410, `Route ${route} must have statusCode 410`);
    assert.ok(entry.reason, `Route ${route} must have a documented reason`);
  }
});

test("2. Obsolete physical assessment directories cleanly deleted", () => {
  const execDir = path.join(ROOT, "app/(site)/seo-executive-assessment");
  const mgrDir = path.join(ROOT, "app/(site)/seo-manager-assessment");
  assert.strictEqual(fs.existsSync(execDir), false, "app/(site)/seo-executive-assessment must not exist");
  assert.strictEqual(fs.existsSync(mgrDir), false, "app/(site)/seo-manager-assessment must not exist");
});

test("3. getIndexableRoutes filters out retired routes", () => {
  const routesFile = fs.readFileSync(path.join(ROOT, "lib/nextjs/routes.ts"), "utf8");
  assert.ok(routesFile.includes("getRetiredRoute"), "routes.ts must import getRetiredRoute");
  assert.ok(
    routesFile.includes("!getRetiredRoute(r.path)"),
    "getIndexableRoutes must filter out !getRetiredRoute(r.path)"
  );
});

test("4. Route registry marks retired routes with RETIRE and non-indexable", () => {
  const regPath = path.join(ROOT, "data/migration/nextjs-route-registry.generated.json");
  const reg = JSON.parse(fs.readFileSync(regPath, "utf8"));
  const retiredCandidates = [
    "/seo-pricing/",
    "/seo-executive-assessment/",
    "/seo-manager-assessment/",
    "/ai-motion-graphic-designer/",
    "/social-media-executive/",
    "/indriya-test/",
    "/motion-graphics/",
    "/wp-file-download-search/",
  ];
  for (const p of retiredCandidates) {
    const r = reg.routes.find((item) => item.path === p);
    if (r) {
      assert.strictEqual(r.proposedAction, "RETIRE", `${p} must have proposedAction RETIRE`);
      assert.strictEqual(r.indexable, false, `${p} must have indexable false`);
      assert.strictEqual(r.includeInSitemap, false, `${p} must have includeInSitemap false`);
    }
  }
});

// -----------------------------------------------------------------------------
// 2. ARCHIVAL INTEGRITY & FORM 18 PRESERVATION
// -----------------------------------------------------------------------------
test("5. Legacy assessments and seo-pricing properly archived with documentation", () => {
  assert.ok(fs.existsSync(path.join(ROOT, "data/archive/legacy-assessments/RESTORE_README.md")), "RESTORE_README for legacy assessments must exist");
  assert.ok(fs.existsSync(path.join(ROOT, "data/archive/seo-pricing/RESTORE_README.md")), "RESTORE_README for seo-pricing must exist");
  assert.ok(fs.existsSync(path.join(ROOT, "data/archive/seo-pricing/seo-pricing.json")), "Archived seo-pricing.json must exist");
});

test("6. Form 18 preserved and marked ARCHIVED / INACTIVE in system health", () => {
  const sysHealth = fs.readFileSync(path.join(ROOT, "lib/cms/system-health.ts"), "utf8");
  assert.ok(sysHealth.includes("ARCHIVED / INACTIVE"), "system-health.ts must document Form 18 as ARCHIVED / INACTIVE");
  assert.ok(sysHealth.includes("Form 18"), "system-health.ts must retain Form 18 tracking");
});

// -----------------------------------------------------------------------------
// 3. STRATEGIC MONEY PAGES PROTECTED
// -----------------------------------------------------------------------------
test("7. Strategic Tier-0 pages remain strictly protected and indexable", () => {
  const regPath = path.join(ROOT, "data/migration/nextjs-route-registry.generated.json");
  const reg = JSON.parse(fs.readFileSync(regPath, "utf8"));

  const strategicPages = [
    "/",
    "/services/seo-services-in-mumbai/",
    "/services/ai-video-production-agency/",
    "/services/aeo-services-in-mumbai/",
    "/services/geo/",
    "/services/llm-seo-service/",
    "/services/performance-marketing/",
    "/services/social-media-marketing/",
    "/services/website-development-amc/",
    "/services/branding/",
    "/services/content-creation/",
  ];

  for (const sp of strategicPages) {
    const route = reg.routes.find((r) => r.path === sp);
    assert.ok(route, `Strategic page ${sp} must exist in registry`);
    assert.strictEqual(route.indexable, true, `Strategic page ${sp} must be indexable`);
    assert.strictEqual(route.includeInSitemap, true, `Strategic page ${sp} must be included in sitemap`);
    assert.ok(route.h1, `Strategic page ${sp} must have H1`);
    assert.ok(route.title, `Strategic page ${sp} must have title`);
  }
});

// -----------------------------------------------------------------------------
// 4. GOOGLE UPDATE COMPLIANCE ENGINE RECTIFICATIONS
// -----------------------------------------------------------------------------
test("8. Site Policy Compliance separated from Ranking Impact", () => {
  const compEngine = fs.readFileSync(path.join(ROOT, "lib/google-updates/compliance-engine.ts"), "utf8");
  assert.ok(compEngine.includes("export type SitePolicyCompliance ="), "Must export SitePolicyCompliance type");
  assert.ok(compEngine.includes("export type RankingImpactStatus ="), "Must export RankingImpactStatus type");
  assert.ok(compEngine.includes("sitePolicyCompliance?:"), "FullAssessmentResult must include sitePolicyCompliance");
  assert.ok(compEngine.includes("rankingImpactStatus?:"), "FullAssessmentResult must include rankingImpactStatus");
});

test("9. Rollout date logic caps at actual GSC date without future projection", () => {
  const compEngine = fs.readFileSync(path.join(ROOT, "lib/google-updates/compliance-engine.ts"), "utf8");
  assert.ok(compEngine.includes("latestGscDate"), "compliance-engine.ts must determine latestGscDate");
  assert.ok(compEngine.includes("actualRollEnd"), "compliance-engine.ts must cap window to actualRollEnd");
  assert.ok(compEngine.includes("PARTIAL ROLLOUT DATA:"), "Must indicate partial rollout data when in progress");
});

test("10. Active/incomplete rollout returns WARN and PENDING POST-ROLLOUT, never PASS", () => {
  const compEngine = fs.readFileSync(path.join(ROOT, "lib/google-updates/compliance-engine.ts"), "utf8");
  assert.ok(compEngine.includes('result: "WARN"'), "Incomplete rollout correlation must set WARN");
  assert.ok(compEngine.includes('rankingImpactStatus = "PENDING POST-ROLLOUT"'), "Incomplete rollout correlation must set PENDING POST-ROLLOUT");
});

test("11. GSC recommendation avoids false 'Connect Google Search Console' when data present", () => {
  const compEngine = fs.readFileSync(path.join(ROOT, "lib/google-updates/compliance-engine.ts"), "utf8");
  assert.ok(
    compEngine.includes("Continue collecting daily GSC telemetry until post-rollout observation window completes"),
    "Must recommend continuing collection when GSC data is present"
  );
});

test("12. Pillar 2 wording includes Google unspecified signals disclaimer", () => {
  const compEngine = fs.readFileSync(path.join(ROOT, "lib/google-updates/compliance-engine.ts"), "utf8");
  assert.ok(
    compEngine.includes("Google has not publicly specified every internal system updated"),
    "Pillar 2 must document that Google has not publicly specified every system"
  );
});

// -----------------------------------------------------------------------------
// 5. TWO-BASELINE MODEL & 6-TIER RECOVERY EVALUATION
// -----------------------------------------------------------------------------
test("13. Two-Baseline Model and 6-Tier Recovery defined in Sitewide Baseline", () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

  assert.ok(baseline.summary.twoBaselineModel, "Baseline summary must contain twoBaselineModel");
  assert.strictEqual(baseline.summary.twoBaselineModel.historicalPeakBaselineDefined, true);
  assert.strictEqual(baseline.summary.twoBaselineModel.currentPerformanceBaselineDefined, true);

  const tiers = baseline.summary.recoveryTiers;
  assert.ok(tiers, "Summary must contain recoveryTiers breakdown");
  const expectedTiers = [
    "AT_HISTORICAL_PEAK",
    "NEAR_HISTORICAL_PEAK",
    "PARTIAL_RECOVERY",
    "SIGNIFICANT_LOSS",
    "CRITICAL_LOSS",
    "INSUFFICIENT_HISTORICAL_DATA",
  ];
  for (const t of expectedTiers) {
    assert.ok(typeof tiers[t] === "number", `recoveryTiers must include ${t}`);
  }

  // Check inventory entries
  const aiVideo = (baseline.inventory || []).find((i) => i.path === "/services/ai-video-production-agency/");
  assert.ok(aiVideo, "AI Video page must exist in baseline inventory");
  assert.ok(aiVideo.twoBaselines, "Inventory item must have twoBaselines structure");
  assert.strictEqual(
    aiVideo.twoBaselines.historicalPeakBaseline.evidenceStatus,
    "USER-CONFIRMED HISTORICAL #1 + GSC HISTORICAL DATE EVIDENCE UNAVAILABLE"
  );
  assert.strictEqual(aiVideo.twoBaselines.historicalPeakBaseline.peakPosition, 1.0);
});

test("14. Machine-label detector whitelists marketing terms and reports 0 public labels", () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  assert.strictEqual(
    baseline.summary.publiclyRenderedMachineLabels,
    0,
    "Publicly rendered machine labels must be 0 after whitelisting legitimate marketing terms"
  );
});

test("15. Cannibalization taxonomy excludes homepage/brand from TRUE_CANNIBALIZATION", () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const candidates = baseline.cannibalizationCandidates || [];

  for (const c of candidates) {
    if (c.actualTopRankingUrl === "/" || c.competingUrl === "/" || /d[\s'-]?genius/i.test(c.query)) {
      assert.notStrictEqual(
        c.classification,
        "TRUE_CANNIBALIZATION",
        `Homepage or brand query '${c.query}' must not be marked TRUE_CANNIBALIZATION`
      );
      assert.strictEqual(
        c.classification,
        "BRAND_HOMEPAGE_ANCHOR",
        `Homepage or brand query '${c.query}' must be BRAND_HOMEPAGE_ANCHOR`
      );
    }
  }
});

// -----------------------------------------------------------------------------
// 6. CMS GOOGLE UPDATES DRAWER UI RESPONSIVENESS & DRILL-DOWN
// -----------------------------------------------------------------------------
test("16. CMS Drawer UI eliminated maxWidth 680px and implemented responsive width", () => {
  const uiFile = fs.readFileSync(path.join(ROOT, "app/admin/google-updates/GoogleUpdatesClientView.tsx"), "utf8");
  assert.strictEqual(uiFile.includes('maxWidth: "680px"'), false, "Must not contain maxWidth: 680px");
  assert.ok(uiFile.includes('width: "min(94vw, 920px)"'), "Must use responsive width: min(94vw, 920px)");
  assert.ok(uiFile.includes("@media (max-width: 720px)"), "Must include mobile <=720px media queries");
  assert.ok(uiFile.includes("overflowX: \"hidden\""), "Drawer must prevent horizontal overflow");
  assert.ok(uiFile.includes("minWidth: 0"), "Flex/grid children must use minWidth: 0");
});

test("17. CMS Drawer UI table wrapper is self-contained with overflowX auto", () => {
  const uiFile = fs.readFileSync(path.join(ROOT, "app/admin/google-updates/GoogleUpdatesClientView.tsx"), "utf8");
  assert.ok(uiFile.includes('overflowX: "auto"'), "Table wrapper must have overflowX: auto");
  assert.ok(uiFile.includes('minWidth: "760px"'), "Table must have minWidth: 760px to preserve columns without crushing");
});

test("18. CMS Drawer UI has interactive clickable drill-down filtering", () => {
  const uiFile = fs.readFileSync(path.join(ROOT, "app/admin/google-updates/GoogleUpdatesClientView.tsx"), "utf8");
  assert.ok(uiFile.includes("drillDownFilter"), "Must maintain drillDownFilter state");
  assert.ok(uiFile.includes("setDrillDownFilter"), "Must support toggling drillDownFilter");
  assert.ok(uiFile.includes("Filtered by:"), "Must display filter indicator when active");
});
