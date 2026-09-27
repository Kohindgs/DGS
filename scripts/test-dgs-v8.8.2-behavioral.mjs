import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import {
  HISTORICAL_RANKING_PEAKS,
  calculateQueryRecoveryTier,
  calculatePositionLoss,
  getHistoricalPeakConfig,
} from "../lib/seo/historical-recovery.ts";
import {
  validatePageJsonLd,
  inspectPageReputationSignals,
} from "./build-sitewide-ranking-recovery-baseline.mjs";

console.log("=== DGS V8.8.2 BEHAVIORAL & EVIDENCE ACCURACY TEST SUITE ===");

const ROOT = process.cwd();
const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
const cachePath = path.join(ROOT, "data/audit/gsc-page-query-metrics.cache.json");

// ---------------------------------------------------------------------------
// TEST 1: Cache Provenance & Metadata Verification
// ---------------------------------------------------------------------------
console.log("\n[Test 1] Verifying GSC cache metadata & export integrity...");
assert(fs.existsSync(cachePath), "GSC cache file must exist");
const cacheData = JSON.parse(fs.readFileSync(cachePath, "utf8"));

assert.strictEqual(cacheData.source, "PRODUCTION_GSC_DATABASE_EXPORT", "Cache source must be PRODUCTION_GSC_DATABASE_EXPORT");
assert(typeof cacheData.generatedAt === "string" && cacheData.generatedAt.length > 0, "Cache must have generatedAt timestamp");
assert(typeof cacheData.latestMetricDate === "string" && cacheData.latestMetricDate.length > 0, "Cache must have latestMetricDate");
assert.strictEqual(cacheData.periodType, "28d", "Period type must be 28d");
assert(Array.isArray(cacheData.queries) && cacheData.queries.length > 500, "Queries array must contain full programmatic export (>500 items)");
assert(Array.isArray(cacheData.pageMetrics) && cacheData.pageMetrics.length > 50, "Page metrics must contain full export (>50 items)");
assert(!cacheData.commercialQueries, "Manually edited commercialQueries must NOT exist in programmatic cache");
console.log("✓ Test 1 Passed: GSC cache contains full programmatic export with strict provenance metadata.");

// ---------------------------------------------------------------------------
// TEST 2: Two-Baseline Page Counts (6 User-Confirmed vs 11 Protected Tier-0)
// ---------------------------------------------------------------------------
console.log("\n[Test 2] Verifying distinct two-baseline page counts...");
assert(fs.existsSync(baselinePath), "Sitewide baseline JSON must exist");
const baselineData = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

assert.strictEqual(
  baselineData.summary.twoBaselineModel.userConfirmedStrategicPages,
  HISTORICAL_RANKING_PEAKS.length,
  `userConfirmedStrategicPages must equal ${HISTORICAL_RANKING_PEAKS.length} (got ${baselineData.summary.twoBaselineModel.userConfirmedStrategicPages})`
);
assert.strictEqual(
  baselineData.summary.twoBaselineModel.userConfirmedStrategicPages,
  6,
  "userConfirmedStrategicPages must equal exactly 6"
);
assert.strictEqual(
  baselineData.summary.protectedTier0PagesCount,
  11,
  "protectedTier0PagesCount must equal 11"
);
console.log("✓ Test 2 Passed: 6 User-Confirmed Strategic Pages vs 11 Protected Tier-0 Pages correctly separated.");

// ---------------------------------------------------------------------------
// TEST 3: Sitewide Historical Recovery Scoped to the 6 Strategic Pages Only
// ---------------------------------------------------------------------------
console.log("\n[Test 3] Verifying historical recovery is strictly scoped to the 6 peaks...");
assert.strictEqual(
  baselineData.summary.strategicRecoverySummary.totalEvaluated,
  6,
  "Total strategic recovery records evaluated must be 6"
);

let recoveryTiersSum = 0;
for (const tierCount of Object.values(baselineData.summary.recoveryTiers)) {
  recoveryTiersSum += tierCount;
}
assert.strictEqual(
  recoveryTiersSum,
  6,
  `summary.recoveryTiers must sum to 6 strategic pages, not 101 sitewide pages (got ${recoveryTiersSum})`
);

// Verify ordinary non-historical-peak pages have historicalRecovery: null and twoBaselines: null
const historicalPeaksSet = new Set(HISTORICAL_RANKING_PEAKS.map((hp) => hp.page));
for (const item of baselineData.inventory) {
  if (historicalPeaksSet.has(item.path)) {
    assert(item.historicalRecovery !== null, `Strategic page ${item.path} must have historicalRecovery populated`);
    assert(item.twoBaselines !== null, `Strategic page ${item.path} must have twoBaselines populated`);
  } else {
    assert.strictEqual(
      item.historicalRecovery,
      null,
      `Ordinary page ${item.path} must have historicalRecovery: null`
    );
    assert.strictEqual(
      item.twoBaselines,
      null,
      `Ordinary page ${item.path} must have twoBaselines: null`
    );
  }
}
console.log("✓ Test 3 Passed: Historical recovery evaluated ONLY for the 6 peaks; ordinary pages receive period trends only.");

// ---------------------------------------------------------------------------
// TEST 4: Query Provenance in Strategic Recovery Records
// ---------------------------------------------------------------------------
console.log("\n[Test 4] Verifying query provenance in all 6 strategic recovery records...");
for (const rec of baselineData.summary.strategicRecoverySummary.records) {
  assert(
    rec.dataSource === "GSC_DATABASE" || rec.dataSource === "GSC_CACHE_SNAPSHOT",
    `Record ${rec.path} must have valid dataSource (got ${rec.dataSource})`
  );
  assert(typeof rec.metricDate === "string" && rec.metricDate.length > 0, `Record ${rec.path} must specify metricDate`);
  assert.strictEqual(rec.periodType, "28d", `Record ${rec.path} must specify periodType '28d'`);
  assert(typeof rec.isFallback === "boolean", `Record ${rec.path} must specify isFallback boolean`);
  assert(rec.historicalRecoveryTier != null, `Record ${rec.path} must have valid historicalRecoveryTier`);
  assert(rec.evidenceSource != null, `Record ${rec.path} must report evidenceSource`);
}
console.log("✓ Test 4 Passed: All 6 strategic recovery records expose complete data provenance.");

// ---------------------------------------------------------------------------
// TEST 5: Zero-Position / Missing Telemetry Safeguard
// ---------------------------------------------------------------------------
console.log("\n[Test 5] Verifying zero-position / missing telemetry returns INSUFFICIENT_CURRENT_DATA...");
assert.strictEqual(
  calculateQueryRecoveryTier(1.0, 0, 0),
  "INSUFFICIENT_CURRENT_DATA",
  "Position 0 must return INSUFFICIENT_CURRENT_DATA, never #1"
);
assert.strictEqual(
  calculateQueryRecoveryTier(1.0, null, 10),
  "INSUFFICIENT_CURRENT_DATA",
  "Null position must return INSUFFICIENT_CURRENT_DATA"
);
assert.strictEqual(
  calculateQueryRecoveryTier(1.0, 1.2, 0),
  "INSUFFICIENT_CURRENT_DATA",
  "Zero impressions must return INSUFFICIENT_CURRENT_DATA"
);
assert.strictEqual(
  calculateQueryRecoveryTier(1.0, 1.2, 10),
  "AT_HISTORICAL_PEAK",
  "Position 1.2 with 10 impressions must return AT_HISTORICAL_PEAK"
);
console.log("✓ Test 5 Passed: Zero-position bug safeguard verified.");

// ---------------------------------------------------------------------------
// TEST 6: Local JSON-LD AST Validation
// ---------------------------------------------------------------------------
console.log("\n[Test 6] Verifying raw JSON-LD AST validation...");
const sampleValidHtml = `
<html>
<head>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.dgeniussolutions.com/#organization",
  "name": "DGenius Solutions",
  "url": "https://www.dgeniussolutions.com"
}
</script>
</head>
<body><h1>Test</h1></body>
</html>
`;
const valRes = validatePageJsonLd(sampleValidHtml, "https://www.dgeniussolutions.com");
assert.strictEqual(valRes.schema_parse_valid, true, "Valid JSON-LD must parse successfully");
assert.strictEqual(valRes.schema_jsonld_count, 1, "Must detect 1 JSON-LD script");
assert(valRes.schemaTypes.includes("Organization"), "Must extract Organization type");

const sampleInvalidHtml = `
<html>
<head>
<script type="application/ld+json">
{ malformed: json,
</script>
</head>
<body></body>
</html>
`;
const invalidValRes = validatePageJsonLd(sampleInvalidHtml, "https://www.dgeniussolutions.com");
assert.strictEqual(invalidValRes.schema_parse_valid, false, "Malformed JSON-LD must fail parse");
assert(invalidValRes.schema_validation_errors.length > 0, "Must report parse errors");

assert(baselineData.schemaValidationSummary, "Baseline must include schemaValidationSummary");
assert.strictEqual(
  baselineData.schemaValidationSummary.astValidationMode,
  "LOCAL_JSON_LD_AST_VALIDATION",
  "Must report LOCAL_JSON_LD_AST_VALIDATION"
);
assert(
  baselineData.schemaValidationSummary.externalApiDisclaimer.includes("Google Rich Results API not invoked"),
  "Must include disclaimer that external API was not invoked"
);
console.log("✓ Test 6 Passed: Local AST schema validation behaves correctly without overclaiming external API verification.");

// ---------------------------------------------------------------------------
// TEST 7: Site Reputation Automated URL Screen vs Human Ownership
// ---------------------------------------------------------------------------
console.log("\n[Test 7] Verifying Site Reputation screen & human review requirement...");
const cleanHtml = `<html><body><p>Welcome to DGenius Solutions</p></body></html>`;
const repResClean = inspectPageReputationSignals(cleanHtml, "/services/seo-services-in-mumbai/");
assert.strictEqual(repResClean.urlPatternRisk, "PASS", "Normal service page must pass URL pattern risk");
assert.strictEqual(repResClean.sponsoredLinksCount, 0, "Clean HTML must have 0 sponsored links");
assert.strictEqual(repResClean.affiliateLinksCount, 0, "Clean HTML must have 0 affiliate links");
assert.strictEqual(repResClean.offTopicMarkersDetected, 0, "Clean HTML must have 0 off-topic markers");

const spamHtml = `<html><body><a href="https://example.com" rel="sponsored">Link</a><a href="https://bet.com?aff=123">Bet</a> casino games</body></html>`;
const repResSpam = inspectPageReputationSignals(spamHtml, "/services/seo-services-in-mumbai/");
assert.strictEqual(repResSpam.sponsoredLinksCount, 1, "Must detect sponsored link");
assert.strictEqual(repResSpam.affiliateLinksCount, 1, "Must detect affiliate param");
assert.strictEqual(repResSpam.offTopicMarkersDetected, 1, "Must detect off-topic casino keyword");

assert(baselineData.siteReputationSummary, "Baseline must include siteReputationSummary");
assert.strictEqual(baselineData.siteReputationSummary.urlLevelAutomatedScreen, "PASS", "URL screen must report PASS");
assert.strictEqual(baselineData.siteReputationSummary.contentOwnershipStatus, "HUMAN REVIEW REQUIRED", "Content ownership must require human review");
assert.strictEqual(baselineData.siteReputationSummary.humanSignoffPreserved, true, "Human signoff requirement must be preserved");
console.log("✓ Test 7 Passed: Site Reputation distinguishes automated URL screen from human editorial signoff.");

// ---------------------------------------------------------------------------
// TEST 8: Scaled Content 5 Distinct Screens
// ---------------------------------------------------------------------------
console.log("\n[Test 8] Verifying Scaled Content Multi-Screen evidence...");
const sc = baselineData.scaledContentSummary;
assert(sc, "Baseline must include scaledContentSummary");
assert(sc.wordCountScreen, "Must include wordCountScreen");
assert.strictEqual(typeof sc.wordCountScreen.thinContentThreshold, "number", "Must report thin content threshold (250)");
assert(sc.duplicationScreen, "Must include duplicationScreen");
assert(sc.locationTemplateScreen, "Must include locationTemplateScreen");
assert(sc.titleH1Uniqueness, "Must include titleH1Uniqueness");
assert(sc.doorwayRisk, "Must include doorwayRisk");
console.log("✓ Test 8 Passed: Scaled content provides 5 distinct evidentiary screens.");

// ---------------------------------------------------------------------------
// TEST 9: AI Search Telemetry Separation & Wording
// ---------------------------------------------------------------------------
console.log("\n[Test 9] Verifying AI Search Telemetry wording in baseline & client view...");
const aiSample = baselineData.inventory[0].aiVisibility;
assert.strictEqual(
  aiSample.googleSearchConsole,
  "Available in dedicated Generative AI report",
  "GSC status must be 'Available in dedicated Generative AI report'"
);
assert.strictEqual(
  aiSample.dgsCmsIngestion,
  "Not connected / Not yet ingested",
  "CMS ingestion status must be 'Not connected / Not yet ingested'"
);
assert.strictEqual(
  aiSample.currentCmsMetrics,
  "Standard Search GSC only",
  "Current CMS metrics must be 'Standard Search GSC only'"
);

const clientViewContent = fs.readFileSync(
  path.join(ROOT, "app/admin/google-updates/GoogleUpdatesClientView.tsx"),
  "utf8"
);
assert(
  clientViewContent.includes("Available in dedicated Generative AI report"),
  "Client view must show 'Available in dedicated Generative AI report'"
);
assert(
  clientViewContent.includes("Not connected / Not yet ingested"),
  "Client view must show 'Not connected / Not yet ingested'"
);
assert(
  clientViewContent.includes("Standard Search GSC only"),
  "Client view must show 'Standard Search GSC only'"
);
console.log("✓ Test 9 Passed: AI Search telemetry wording accurately separated across CMS and Search Console.");

console.log("\n=== ALL DGS V8.8.2 BEHAVIORAL TESTS PASSED! ===");
