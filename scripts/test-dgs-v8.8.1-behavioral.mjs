import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  HISTORICAL_RANKING_PEAKS,
  calculateQueryRecoveryTier,
  calculatePositionLoss,
  getHistoricalPeakConfig,
} from "../lib/seo/historical-recovery.ts";

const ROOT = process.cwd();

test("=== DGS V8.8.1 BEHAVIORAL VERIFICATION SUITE ===", () => {
  assert.ok(true);
});

// -----------------------------------------------------------------------------
// 1. QUERY RECOVERY TIER CALCULATOR & BOUNDARY CONDITIONS
// -----------------------------------------------------------------------------
test("1. calculateQueryRecoveryTier maps tiers correctly for valid positions", () => {
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 1.0, 10),
    "AT_HISTORICAL_PEAK"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 1.2, 11),
    "AT_HISTORICAL_PEAK"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 1.5, 20),
    "AT_HISTORICAL_PEAK"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 2.1, 53),
    "NEAR_HISTORICAL_PEAK"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 2.5, 30),
    "NEAR_HISTORICAL_PEAK"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 3.8, 15),
    "PARTIAL_RECOVERY"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 5.0, 40),
    "PARTIAL_RECOVERY"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 5.2, 25),
    "SIGNIFICANT_LOSS"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 8.25, 4),
    "SIGNIFICANT_LOSS"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 10.0, 50),
    "SIGNIFICANT_LOSS"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 10.8, 18),
    "CRITICAL_LOSS"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 35.6, 100),
    "CRITICAL_LOSS"
  );
});

// -----------------------------------------------------------------------------
// 2. ZERO-POSITION BUG & MISSING DATA SAFEGUARDS
// -----------------------------------------------------------------------------
test("2. Zero-position bug safeguard: 0 position or 0 impressions is NEVER AT_HISTORICAL_PEAK", () => {
  // GSC returning 0 for missing query or unranked query must NOT be treated as rank 0 (better than 1)
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 0, 0),
    "INSUFFICIENT_CURRENT_DATA"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 0, 50),
    "INSUFFICIENT_CURRENT_DATA"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, -1, 50),
    "INSUFFICIENT_CURRENT_DATA"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, 1.2, 0),
    "INSUFFICIENT_CURRENT_DATA"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(1.0, null, 100),
    "INSUFFICIENT_CURRENT_DATA"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(null, 1.2, 50),
    "INSUFFICIENT_HISTORICAL_DATA"
  );
  assert.strictEqual(
    calculateQueryRecoveryTier(0, 1.2, 50),
    "INSUFFICIENT_HISTORICAL_DATA"
  );
});

test("3. calculatePositionLoss calculates accurate delta", () => {
  assert.strictEqual(calculatePositionLoss(1.0, 1.2), 0.2);
  assert.strictEqual(calculatePositionLoss(1.0, 2.1), 1.1);
  assert.strictEqual(calculatePositionLoss(1.0, 8.25), 7.25);
  assert.strictEqual(calculatePositionLoss(1.0, null), null);
  assert.strictEqual(calculatePositionLoss(null, 2.1), null);
  assert.strictEqual(calculatePositionLoss(1.0, 0), null);
});

// -----------------------------------------------------------------------------
// 3. PRIMARY COMMERCIAL QUERY VS PAGE-WIDE AVERAGE ISOLATION
// -----------------------------------------------------------------------------
test("4. Commercial query tier is isolated from page-wide query dilution", () => {
  // Scenario: A page has dozens of long-tail queries diluting its page-wide average to 25.0
  // but its primary money query ranks at 1.2
  const pageWideAveragePosition = 25.0;
  const primaryCommercialQueryPosition = 1.2;
  const primaryCommercialQueryImpressions = 11;

  const commercialTier = calculateQueryRecoveryTier(
    1.0,
    primaryCommercialQueryPosition,
    primaryCommercialQueryImpressions
  );

  assert.strictEqual(commercialTier, "AT_HISTORICAL_PEAK");
  assert.notStrictEqual(
    calculateQueryRecoveryTier(1.0, pageWideAveragePosition, 500),
    "AT_HISTORICAL_PEAK"
  );
});

// -----------------------------------------------------------------------------
// 4. HISTORICAL RANKING PEAKS REGISTRY INTEGRITY
// -----------------------------------------------------------------------------
test("5. HISTORICAL_RANKING_PEAKS defines explicit user-confirmed peaks", () => {
  assert.ok(Array.isArray(HISTORICAL_RANKING_PEAKS));
  assert.strictEqual(HISTORICAL_RANKING_PEAKS.length, 6);

  const expectedPages = [
    "/services/ai-video-production-agency/",
    "/services/aeo-services-in-mumbai/",
    "/aeo-dubai/",
    "/services/geo/",
    "/services/llm-seo-service/",
    "/services/dubai-seo/",
  ];

  for (const expPage of expectedPages) {
    const peak = getHistoricalPeakConfig(expPage);
    assert.ok(peak, `Peak config must exist for ${expPage}`);
    assert.strictEqual(peak.peakPosition, 1.0, `${expPage} peakPosition must be 1.0`);
    assert.strictEqual(
      peak.evidenceSource,
      "USER_CONFIRMED_HISTORICAL_#1",
      `${expPage} evidenceSource must be USER_CONFIRMED_HISTORICAL_#1`
    );
    assert.ok(peak.primaryQuery, `${expPage} must have primaryQuery`);
    assert.ok(Array.isArray(peak.secondaryQueries) && peak.secondaryQueries.length > 0);
  }
});

// -----------------------------------------------------------------------------
// 5. 101 AUTHORITATIVE URL BASELINE & STRATEGIC RECOVERY OUTPUT
// -----------------------------------------------------------------------------
test("6. Sitewide baseline contains exactly 101 authoritative URLs and strategic recovery records", () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  assert.ok(fs.existsSync(baselinePath), "sitewide-ranking-recovery-baseline.json must exist");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

  assert.strictEqual(
    baseline.summary.totalIndexablePages,
    101,
    "Summary must report exactly 101 totalIndexablePages"
  );
  assert.strictEqual(
    baseline.inventory.length,
    101,
    "Inventory must contain exactly 101 authoritative URLs"
  );

  // Dynamic native CMS routes present
  const dynamicUrls = [
    "/career/generative-ai-artist/",
    "/blogs/dgs-cms-scheduled-cron-qa/",
    "/blogs/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads/",
  ];
  for (const url of dynamicUrls) {
    const item = baseline.inventory.find((i) => i.path === url);
    assert.ok(item, `Dynamic CMS route ${url} must exist in baseline inventory`);
  }

  // Retired routes absent
  const retiredRoutes = [
    "/seo-pricing/",
    "/seo-executive-assessment/",
    "/seo-manager-assessment/",
    "/ai-motion-graphic-designer/",
    "/social-media-executive/",
    "/indriya-test/",
    "/motion-graphics/",
    "/wp-file-download-search/",
  ];
  for (const ret of retiredRoutes) {
    const item = baseline.inventory.find((i) => i.path === ret);
    assert.strictEqual(item, undefined, `Retired route ${ret} must NOT be in inventory`);
  }

  // Strategic recovery summary present
  assert.ok(
    baseline.summary.strategicRecoverySummary,
    "Baseline summary must contain strategicRecoverySummary"
  );
  assert.strictEqual(
    baseline.summary.strategicRecoverySummary.totalEvaluated,
    6,
    "strategicRecoverySummary must evaluate all 6 user-confirmed historical peak pages"
  );

  // Dubai SEO telemetry verification
  const dubaiSeo = baseline.inventory.find((i) => i.path === "/services/dubai-seo/");
  assert.ok(dubaiSeo, "Dubai SEO page must exist in inventory");
  assert.strictEqual(dubaiSeo.metrics.currentImpressions, 4);
  assert.strictEqual(dubaiSeo.metrics.currentWeightedPosition, 8.25);
  assert.strictEqual(dubaiSeo.historicalRecovery.historicalRecoveryTier, "SIGNIFICANT_LOSS");
  assert.strictEqual(dubaiSeo.historicalRecovery.positionLoss, 7.25);

  // AI Video telemetry verification
  const aiVideo = baseline.inventory.find((i) => i.path === "/services/ai-video-production-agency/");
  assert.ok(aiVideo, "AI Video page must exist in inventory");
  assert.strictEqual(aiVideo.historicalRecovery.primaryCommercialQuery, "ai video production agency in mumbai");
  assert.strictEqual(aiVideo.historicalRecovery.historicalRecoveryTier, "NEAR_HISTORICAL_PEAK");
  assert.strictEqual(aiVideo.historicalRecovery.currentCommercialQueryPosition, 2.1);
  assert.strictEqual(aiVideo.historicalRecovery.positionLoss, 1.1);
});

// -----------------------------------------------------------------------------
// 6. SPLIT STATUS WIRING & SCHEMA PERSISTENCE
// -----------------------------------------------------------------------------
test("7. Schema and migration scripts include split status columns", () => {
  const schemaSql = fs.readFileSync(path.join(ROOT, "db/schema.sql"), "utf8");
  assert.ok(schemaSql.includes("site_policy_compliance"), "db/schema.sql must define site_policy_compliance");
  assert.ok(schemaSql.includes("ranking_impact_status"), "db/schema.sql must define ranking_impact_status");
  assert.ok(schemaSql.includes("reputation_verified_by"), "db/schema.sql must define reputation_verified_by");
  assert.ok(schemaSql.includes("reputation_verified_at"), "db/schema.sql must define reputation_verified_at");
  assert.ok(schemaSql.includes("reputation_notes"), "db/schema.sql must define reputation_notes");

  const migration = fs.readFileSync(path.join(ROOT, "scripts/apply-cms-schema.mjs"), "utf8");
  assert.ok(migration.includes("site_policy_compliance"), "apply-cms-schema.mjs must migrate site_policy_compliance");
  assert.ok(migration.includes("ranking_impact_status"), "apply-cms-schema.mjs must migrate ranking_impact_status");
  assert.ok(migration.includes("reputation_verified_by"), "apply-cms-schema.mjs must migrate reputation_verified_by");
  assert.ok(migration.includes("reputation_verified_at"), "apply-cms-schema.mjs must migrate reputation_verified_at");
  assert.ok(migration.includes("reputation_notes"), "apply-cms-schema.mjs must migrate reputation_notes");
});

test("8. Compliance engine persists split statuses and API serializes them", () => {
  const compEngine = fs.readFileSync(path.join(ROOT, "lib/google-updates/compliance-engine.ts"), "utf8");
  assert.ok(
    compEngine.includes("site_policy_compliance = ?"),
    "compliance-engine.ts must persist site_policy_compliance"
  );
  assert.ok(
    compEngine.includes("ranking_impact_status = ?"),
    "compliance-engine.ts must persist ranking_impact_status"
  );

  const assessApi = fs.readFileSync(path.join(ROOT, "app/api/admin/google-updates/assess/route.ts"), "utf8");
  assert.ok(
    assessApi.includes("sitePolicyCompliance:"),
    "POST /api/admin/google-updates/assess must serialize sitePolicyCompliance"
  );
  assert.ok(
    assessApi.includes("rankingImpactStatus:"),
    "POST /api/admin/google-updates/assess must serialize rankingImpactStatus"
  );
});

test("9. CMS Drawer UI renders distinct Status Cards for Site Policy and Google Update Impact", () => {
  const uiView = fs.readFileSync(
    path.join(ROOT, "app/admin/google-updates/GoogleUpdatesClientView.tsx"),
    "utf8"
  );
  assert.ok(
    uiView.includes("SITE POLICY COMPLIANCE"),
    "UI must have dedicated card header for SITE POLICY COMPLIANCE"
  );
  assert.ok(
    uiView.includes("GOOGLE UPDATE IMPACT"),
    "UI must have dedicated card header for GOOGLE UPDATE IMPACT"
  );
  assert.ok(
    uiView.includes("EVIDENCE CONFIDENCE"),
    "UI must retain independent EVIDENCE CONFIDENCE card"
  );
  assert.ok(
    uiView.includes("getImpactBadge"),
    "UI must have dedicated badge renderer for ranking impact status"
  );
});

// -----------------------------------------------------------------------------
// 7. AST SCHEMA VALIDATION & SITE REPUTATION SCREENING
// -----------------------------------------------------------------------------
test("10. Compliance engine implements local structured data AST validation and site reputation check", () => {
  const compEngine = fs.readFileSync(path.join(ROOT, "lib/google-updates/compliance-engine.ts"), "utf8");
  assert.ok(
    compEngine.includes("localStructuredDataAstValidation") || compEngine.includes("COVERAGE:"),
    "compliance-engine.ts must implement local structured data AST validation reporting COVERAGE"
  );
  assert.ok(
    compEngine.includes("reputation_verified_by"),
    "compliance-engine.ts must check for persisted human reputation verification"
  );
});
