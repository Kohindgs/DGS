import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { validatePageJsonLd } from "./build-sitewide-ranking-recovery-baseline.mjs";

const ROOT = process.cwd();

console.log("==================================================");
console.log("  DGS V8.8.3 BEHAVIORAL VERIFICATION TEST SUITE   ");
console.log("==================================================");

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

// -------------------------------------------------------------
// 1. Verify GSC Cache Freshness Metadata & periodType
// -------------------------------------------------------------
runTest("GSC Cache file contains dataset-specific freshness metadata", () => {
  const cachePath = path.join(ROOT, "data/audit/gsc-page-query-metrics.cache.json");
  assert(fs.existsSync(cachePath), "Cache file data/audit/gsc-page-query-metrics.cache.json must exist");
  const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));

  assert.match(cache.latestDailyMetricDate, /^\d{4}-\d{2}-\d{2}$/, "latestDailyMetricDate must be YYYY-MM-DD");
  assert.match(cache.latestQueryMetricDate, /^\d{4}-\d{2}-\d{2}$/, "latestQueryMetricDate must be YYYY-MM-DD");
  assert.match(cache.latestPageMetricDate, /^\d{4}-\d{2}-\d{2}$/, "latestPageMetricDate must be YYYY-MM-DD");
  assert.match(cache.latestAvailableMetricDate, /^\d{4}-\d{2}-\d{2}$/, "latestAvailableMetricDate must be YYYY-MM-DD");

  assert.equal(cache.periodType, "28d", "periodType must be preserved as '28d'");
  assert.equal(cache.source, "PRODUCTION_GSC_DATABASE_EXPORT", "Source must be PRODUCTION_GSC_DATABASE_EXPORT");

  const expectedMax = [cache.latestDailyMetricDate, cache.latestQueryMetricDate, cache.latestPageMetricDate].sort().reverse()[0];
  assert.equal(cache.latestAvailableMetricDate, expectedMax, "latestAvailableMetricDate must equal MAX(daily, query, page)");
});

// -------------------------------------------------------------
// 2. Schema Validator: Distinguish Entity Reference vs Entity Duplication
// -------------------------------------------------------------
runTest("validatePageJsonLd treats entity reference pointers (@id only) as REFERENCE_OK without warnings", () => {
  const mockHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://www.dgeniussolutions.com/#website",
          "name": "DGenius Solutions",
          "url": "https://www.dgeniussolutions.com"
        }
        </script>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://www.dgeniussolutions.com/services/seo/#webpage",
          "isPartOf": {
            "@id": "https://www.dgeniussolutions.com/#website"
          },
          "publisher": {
            "@id": "https://www.dgeniussolutions.com/#organization"
          }
        }
        </script>
      </head>
      <body></body>
    </html>
  `;

  const result = validatePageJsonLd(mockHtml, "https://www.dgeniussolutions.com/services/seo/");
  assert.equal(result.schema_parse_valid, true, "Schema parse must be valid");
  assert.equal(result.schema_validation_errors.length, 0, "Must have 0 schema validation errors");
  assert.equal(result.conflicting_entities_count, 0, "Must have 0 conflicting entities");
  assert.equal(result.redundant_entities_count, 0, "Must have 0 redundant entities");
  assert.equal(result.valid_references_count, 2, "Must identify 2 valid entity references");
  assert.equal(result.schema_validation_warnings.length, 0, "Must have 0 warnings for valid entity references");
});

runTest("validatePageJsonLd flags conflicting duplicate full definitions as error", () => {
  const mockConflictHtml = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://www.dgeniussolutions.com/#organization",
      "name": "DGenius Solutions",
      "url": "https://www.dgeniussolutions.com"
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://www.dgeniussolutions.com/#organization",
      "name": "Different Name Entirely",
      "url": "https://www.otherdomain.com"
    }
    </script>
  `;

  const result = validatePageJsonLd(mockConflictHtml, "https://www.dgeniussolutions.com/");
  assert.equal(result.conflicting_entities_count, 1, "Must detect 1 conflicting duplicate entity definition");
  assert(result.schema_validation_errors.some((e) => e.includes("CONFLICTING ENTITY DEFINITION")), "Must output CONFLICTING ENTITY DEFINITION error");
});

runTest("validatePageJsonLd flags redundant duplicate full definitions as warning", () => {
  const mockRedundantHtml = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://www.dgeniussolutions.com/#organization",
      "name": "DGenius Solutions",
      "url": "https://www.dgeniussolutions.com"
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://www.dgeniussolutions.com/#organization",
      "name": "DGenius Solutions",
      "url": "https://www.dgeniussolutions.com"
    }
    </script>
  `;

  const result = validatePageJsonLd(mockRedundantHtml, "https://www.dgeniussolutions.com/");
  assert.equal(result.redundant_entities_count, 1, "Must detect 1 redundant duplicate entity definition");
  assert(result.schema_validation_warnings.some((w) => w.includes("REDUNDANT ENTITY DEFINITION")), "Must output REDUNDANT ENTITY DEFINITION warning");
});

// -------------------------------------------------------------
// 3. Baseline Recovery File: Dubai SEO & Strategic Queries
// -------------------------------------------------------------
runTest("Sitewide ranking baseline contains dataset-specific freshness and strategic query records", () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  assert(fs.existsSync(baselinePath), "Baseline file must exist");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

  // Check top-level freshness
  assert.match(baseline.latestDailyMetricDate, /^\d{4}-\d{2}-\d{2}$/, "baseline latestDailyMetricDate must be YYYY-MM-DD");
  assert.match(baseline.latestQueryMetricDate, /^\d{4}-\d{2}-\d{2}$/, "baseline latestQueryMetricDate must be YYYY-MM-DD");
  assert.match(baseline.latestPageMetricDate, /^\d{4}-\d{2}-\d{2}$/, "baseline latestPageMetricDate must be YYYY-MM-DD");
  assert.match(baseline.latestAvailableMetricDate, /^\d{4}-\d{2}-\d{2}$/, "baseline latestAvailableMetricDate must be YYYY-MM-DD");
  assert.equal(baseline.periodType, "28d", "baseline periodType must be '28d'");

  const records = baseline.summary?.strategicRecoverySummary?.records || [];
  assert.equal(records.length, 6, "Must evaluate exactly 6 user-confirmed strategic pages");

  // Check Dubai SEO record
  const dubaiRecord = records.find((r) => r.path === "/services/dubai-seo/");
  assert(dubaiRecord, "Must contain record for /services/dubai-seo/");
  assert.equal(dubaiRecord.metricScope, "PAGE_LEVEL_PROXY", "Dubai SEO metricScope must be PAGE_LEVEL_PROXY");
  assert.equal(dubaiRecord.primaryQuery, "seo agency in dubai", "Dubai SEO primaryQuery must be 'seo agency in dubai'");
  assert.equal(dubaiRecord.queryMetricAvailable, false, "Dubai SEO queryMetricAvailable must be false");
  assert.equal(dubaiRecord.proxyPosition, 8.25, "Dubai SEO proxyPosition must be 8.25");
  assert.equal(dubaiRecord.fallbackReason, "QUERY_WITHHELD_BY_GSC_PRIVACY_THRESHOLD", "fallbackReason must be QUERY_WITHHELD_BY_GSC_PRIVACY_THRESHOLD");
  assert(dubaiRecord.recoveryStatusLabel.includes("PROXY-BASED RECOVERY STATUS"), "Dubai SEO recoveryStatusLabel must indicate proxy-based status");
  assert.equal(dubaiRecord.metricDate, baseline.latestPageMetricDate, "Dubai SEO metricDate must match latestPageMetricDate");

  // Check the other 5 strategic queries
  const other5 = records.filter((r) => r.path !== "/services/dubai-seo/");
  assert.equal(other5.length, 5, "Must have 5 query-level records");
  for (const qRec of other5) {
    assert.equal(qRec.metricScope, "QUERY_LEVEL", `${qRec.path} must have metricScope QUERY_LEVEL`);
    assert.equal(qRec.queryMetricAvailable, true, `${qRec.path} must have queryMetricAvailable true`);
    assert.equal(qRec.proxyPosition, null, `${qRec.path} must have proxyPosition null`);
    assert.equal(qRec.metricDate, baseline.latestQueryMetricDate, `${qRec.path} must have metricDate matching latestQueryMetricDate`);
  }
});

// -------------------------------------------------------------
// 4. Schema Status Reporting in Baseline Summary
// -------------------------------------------------------------
runTest("Baseline summary contains required schema status categories", () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const schemaSummary = baseline.summary?.schemaValidationSummary;

  assert(schemaSummary, "schemaValidationSummary must exist in baseline summary");
  assert.equal(schemaSummary.jsonLdParseErrors, 0, "jsonLdParseErrors must be 0");
  assert.equal(schemaSummary.conflictingEntityErrors, 0, "conflictingEntityErrors must be 0");
  assert.equal(schemaSummary.redundantEntityWarnings, 0, "redundantEntityWarnings must be 0");
  assert(schemaSummary.validReferencesCount > 0, "validReferencesCount must be > 0 (pointer references verified)");
  assert.equal(schemaSummary.googleExternalValidation, "NOT RUN", "googleExternalValidation must report 'NOT RUN'");
  assert.equal(schemaSummary.status, "PASS", "schema status must be PASS");
});

// -------------------------------------------------------------
// 5. CMS Drawer UI: GoogleUpdatesClientView.tsx
// -------------------------------------------------------------
runTest("GoogleUpdatesClientView component contains GSC Data Freshness with daily, query, and page telemetry", () => {
  const uiFilePath = path.join(ROOT, "app/admin/google-updates/GoogleUpdatesClientView.tsx");
  assert(fs.existsSync(uiFilePath), "GoogleUpdatesClientView.tsx must exist");
  const uiContent = fs.readFileSync(uiFilePath, "utf8");

  assert(uiContent.includes("GSC Data Freshness"), "UI must have 'GSC Data Freshness' heading");
  assert(uiContent.includes("Daily telemetry:"), "UI must display 'Daily telemetry:'");
  assert(uiContent.includes("Query telemetry:"), "UI must display 'Query telemetry:'");
  assert(uiContent.includes("Page telemetry:"), "UI must display 'Page telemetry:'");
});

// -------------------------------------------------------------
// 6. Compliance Engine Schema Check Details Formatting
// -------------------------------------------------------------
runTest("compliance-engine.ts reports complete schema status categories in Check 3", () => {
  const cePath = path.join(ROOT, "lib/google-updates/compliance-engine.ts");
  assert(fs.existsSync(cePath), "compliance-engine.ts must exist");
  const ceContent = fs.readFileSync(cePath, "utf8");

  assert(ceContent.includes("JSON-LD PARSE ERRORS:"), "Must report JSON-LD PARSE ERRORS");
  assert(ceContent.includes("CONFLICTING ENTITY ERRORS:"), "Must report CONFLICTING ENTITY ERRORS");
  assert(ceContent.includes("REDUNDANT ENTITY WARNINGS:"), "Must report REDUNDANT ENTITY WARNINGS");
  assert(ceContent.includes("VALID REFERENCES:"), "Must report VALID REFERENCES");
  assert(ceContent.includes("Google external validation:"), "Must report Google external validation");
});

console.log("==================================================");
console.log(`RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log("==================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("✓ ALL V8.8.3 BEHAVIORAL CRITERIA VERIFIED SUCCESSFULLY!");
  process.exit(0);
}
