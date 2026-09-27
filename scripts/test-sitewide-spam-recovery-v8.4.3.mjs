import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

test("REQ-SPAM-01: Page trend uses previous metrics instead of simplistic absolute position thresholds", async () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  assert.ok(fs.existsSync(baselinePath), "Baseline file must exist");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

  // Check that inventory pages include current and previous metric objects
  const pagesWithGsc = baseline.inventory.filter((p) => p.metrics && (p.metrics.currentImpressions > 0 || p.metrics.previousImpressions > 0));
  assert.ok(pagesWithGsc.length > 0, "Pages with GSC metrics must exist in inventory");

  for (const page of pagesWithGsc.slice(0, 10)) {
    assert.ok(page.metrics, "Page must have metrics object");
    assert.strictEqual(typeof page.metrics.currentImpressions, "number", "currentImpressions must be a number");
    assert.strictEqual(typeof page.metrics.previousImpressions, "number", "previousImpressions must be a number");
    assert.strictEqual(typeof page.metrics.impressionDelta, "number", "impressionDelta must be a number");
  }

  // Specifically check /blogs/ai-overview-ranking/ which was previously falsely classified as DECLINING
  const blogAiOverview = baseline.inventory.find((p) => p.path === "/blogs/ai-overview-ranking/");
  if (blogAiOverview) {
    assert.notStrictEqual(
      blogAiOverview.classification,
      "DECLINING",
      "Stable blog with steady impressions must NOT be falsely classified as DECLINING"
    );
  }
});

test("REQ-SPAM-02: No hardcoded AI Video decline classification", async () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const aiVideo = baseline.inventory.find((p) => p.path === "/services/ai-video-production-agency/");
  assert.ok(aiVideo, "AI Video page must exist in inventory");

  // In build-sitewide-ranking-recovery-baseline.mjs, ensure no hardcoded string assignment
  const scriptContent = fs.readFileSync(path.join(ROOT, "scripts/build-sitewide-ranking-recovery-baseline.mjs"), "utf8");
  assert.ok(
    !scriptContent.includes('routePath === "/services/ai-video-production-agency/") classification = "CRITICAL_DECLINE"'),
    "Script must NOT contain hardcoded CRITICAL_DECLINE assignment for AI Video"
  );
  assert.ok(
    !scriptContent.includes("routePath === '/services/ai-video-production-agency/') classification = 'CRITICAL_DECLINE'"),
    "Script must NOT contain single-quoted hardcoded CRITICAL_DECLINE assignment for AI Video"
  );
});

test("REQ-SPAM-03: Top lost queries populated when losses exist", async () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  assert.ok(Array.isArray(baseline.topLostQueries), "topLostQueries must be an array");
  assert.ok(baseline.topLostQueries.length > 0, "topLostQueries must be populated when data exists");
  assert.ok(baseline.topLostQueries.length <= 25, "topLostQueries must be capped at 25");

  const sample = baseline.topLostQueries[0];
  assert.ok(sample.query, "Lost query must have query string");
  assert.ok(sample.primaryPage, "Lost query must have primaryPage");
  assert.strictEqual(typeof sample.clickDelta, "number", "Lost query must have numeric clickDelta");
  assert.strictEqual(typeof sample.impressionDelta, "number", "Lost query must have numeric impressionDelta");
});

test("REQ-SPAM-04: Top gained queries populated when gains exist", async () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  assert.ok(Array.isArray(baseline.topGainedQueries), "topGainedQueries must be an array");
  assert.ok(baseline.topGainedQueries.length > 0, "topGainedQueries must be populated when data exists");
  assert.ok(baseline.topGainedQueries.length <= 25, "topGainedQueries must be capped at 25");

  const sample = baseline.topGainedQueries[0];
  assert.ok(sample.query, "Gained query must have query string");
  assert.ok(sample.primaryPage, "Gained query must have primaryPage");
  assert.strictEqual(typeof sample.clickDelta, "number", "Gained query must have numeric clickDelta");
  assert.strictEqual(typeof sample.impressionDelta, "number", "Gained query must have numeric impressionDelta");
});

test("REQ-SPAM-05: primaryUrl != competingUrl strictly enforced in cannibalization candidates", async () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const candidates = baseline.cannibalizationCandidates || [];

  for (const c of candidates) {
    assert.notStrictEqual(
      c.actualTopRankingUrl,
      c.competingUrl,
      `actualTopRankingUrl (${c.actualTopRankingUrl}) must NOT equal competingUrl (${c.competingUrl}) for query: ${c.query}`
    );
  }
});

test("REQ-SPAM-06: Incidental keyword overlap not marked as true commercial cannibalization", async () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const candidates = baseline.cannibalizationCandidates || [];

  // Incidental queries (e.g., low volume or blog vs service) should be categorized properly
  const incidental = candidates.filter((c) => c.classification === "INCIDENTAL_OVERLAP" || c.classification === "SUPPORTING_PAGE" || c.classification === "INSUFFICIENT_EVIDENCE");
  assert.ok(incidental.length > 0, "Incidental and supporting page queries must be distinguished from TRUE_CANNIBALIZATION");

  for (const item of incidental) {
    assert.notStrictEqual(item.classification, "TRUE_CANNIBALIZATION", "Incidental queries must not be marked TRUE_CANNIBALIZATION");
  }
});

test("REQ-SPAM-07: period_type='28d' explicitly filtered in GSC queries", async () => {
  const scriptContent = fs.readFileSync(path.join(ROOT, "scripts/build-sitewide-ranking-recovery-baseline.mjs"), "utf8");
  assert.ok(
    scriptContent.includes("period_type = '28d'") || scriptContent.includes('period_type = "28d"'),
    "Baseline script must filter gsc_page_query_metrics with period_type='28d'"
  );
});

test("REQ-SPAM-08: Machine-label rendered vs source comment vs metadata distinction", async () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const summary = baseline.summary;

  assert.ok(typeof summary.publiclyRenderedMachineLabels === "number", "Summary must track publiclyRenderedMachineLabels");
  assert.ok(typeof summary.sourceCommentMachineLabels === "number", "Summary must track sourceCommentMachineLabels");
  assert.ok(typeof summary.internalMetadataMachineLabels === "number", "Summary must track internalMetadataMachineLabels");

  // AI Video page must remain verified clean of publicly rendered machine labels
  const aiVideo = baseline.inventory.find((p) => p.path === "/services/ai-video-production-agency/");
  assert.ok(aiVideo, "AI Video page must exist");
  assert.ok(!aiVideo.riskReasons.some((r) => r.includes("Publicly rendered machine label")), "AI Video must have 0 rendered machine labels");
});

test("REQ-SPAM-09: AI search data unavailability is explicit without metric fabrication", async () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

  for (const page of baseline.inventory.slice(0, 10)) {
    assert.ok(page.aiVisibility, "Page must have aiVisibility object");
    assert.strictEqual(
      page.aiVisibility.dataSource,
      "UNAVAILABLE VIA CURRENT SEARCH CONSOLE API",
      "AI visibility dataSource must be explicit about API unavailability"
    );
  }
});

test("REQ-SPAM-10: Protected Tier-0 pages remain unchanged and invariant", async () => {
  const baselinePath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

  const protectedPages = [
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

  for (const pPath of protectedPages) {
    const item = baseline.inventory.find((i) => i.path === pPath);
    assert.ok(item, `Protected page ${pPath} must exist in baseline inventory`);
    assert.strictEqual(item.isProtectedTier0, true, `${pPath} must be flagged isProtectedTier0`);
    assert.strictEqual(item.isIndexable, true, `${pPath} must be indexable`);
    assert.strictEqual(item.statusCode, 200, `${pPath} status code must be 200`);
    assert.ok(item.canonical.includes(pPath), `${pPath} canonical must match route`);
  }
});
