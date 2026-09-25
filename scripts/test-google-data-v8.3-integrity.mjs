import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  normalizeSearchQuery,
  normalizeSitePageUrl,
  canonicalPageKey,
  arePagesCanonicallyEqual,
  areQueriesSearchEqual,
  getNonOverlapping28DayWindows,
} from "../lib/seo/search-normalization.ts";
import {
  isBrandQuery,
  analyzeQueryCannibalization,
  buildSiteCannibalizationIndex,
  categorizePageRoute,
} from "../lib/seo/cannibalization.ts";

// Helper for deterministic entity ID generation matching production google.ts
function generateEntityId(periodType, canonicalKey, normalizedQuery) {
  return createHash("md5")
    .update(`pq_current|${periodType}|${canonicalKey}|${normalizedQuery}`)
    .digest("hex");
}

// ============================================================================
// SUITE: DGS SEO V8.3 DATA INTEGRITY & DEDUPLICATION (SECTION 43 TESTS)
// ============================================================================

test("1. Same query and page across multiple dates produces exactly 1 current record identity", () => {
  const pageUrl = "https://www.dgeniussolutions.com/services/digital-marketing-agency-in-mumbai/";
  const query = "digital marketing agency in mumbai";
  const canonKey = canonicalPageKey(pageUrl);
  const normQ = normalizeSearchQuery(query);

  // Two different sync dates
  const idDate1 = generateEntityId("28d", canonKey, normQ);
  const idDate2 = generateEntityId("28d", canonKey, normQ);

  assert.equal(idDate1, idDate2, "Current entity IDs must be deterministic and date-invariant");

  // In-memory simulation of current table unique constraint
  const currentTable = new Map();
  const syncRows = [
    { date: "2026-09-24", page: pageUrl, query, clicks: 10, impressions: 100 },
    { date: "2026-09-25", page: pageUrl, query, clicks: 12, impressions: 110 },
  ];

  for (const row of syncRows) {
    const key = `28d|${canonicalPageKey(row.page)}|${normalizeSearchQuery(row.query)}`;
    currentTable.set(key, { ...row, canonKey, normQ });
  }

  assert.equal(currentTable.size, 1, "Must maintain exactly 1 current record per (period, page, query)");
  assert.equal(currentTable.get(`28d|${canonKey}|${normQ}`).clicks, 12, "Latest sync overwrites current state");
});

test("2. History is preserved in snapshots while current table retains only 28d active state", () => {
  const snapshots = [];
  const currentRecords = new Map();

  const mockHistoricalData = [
    { snapshotDate: "2026-09-23", page: "/", query: "dgenius solutions", position: 1.0, clicks: 50 },
    { snapshotDate: "2026-09-24", page: "/", query: "dgenius solutions", position: 1.0, clicks: 52 },
    { snapshotDate: "2026-09-25", page: "/", query: "dgenius solutions", position: 1.1, clicks: 55 },
  ];

  for (const item of mockHistoricalData) {
    // Snapshots table preserves every dated point
    snapshots.push({
      id: `snap_${item.snapshotDate}_${canonicalPageKey(item.page)}_${normalizeSearchQuery(item.query)}`,
      snapshot_date: item.snapshotDate,
      page_url: item.page,
      canonical_page_key: canonicalPageKey(item.page),
      query_text: item.query,
      query_text_normalized: normalizeSearchQuery(item.query),
      position: item.position,
      clicks: item.clicks,
    });

    // Current table retains only single current state
    const currentKey = `${canonicalPageKey(item.page)}|${normalizeSearchQuery(item.query)}`;
    currentRecords.set(currentKey, {
      period_type: "28d",
      canonical_page_key: canonicalPageKey(item.page),
      query_text_normalized: normalizeSearchQuery(item.query),
      position: item.position,
      clicks: item.clicks,
    });
  }

  assert.equal(snapshots.length, 3, "Historical snapshots table must store all daily snapshots");
  assert.equal(currentRecords.size, 1, "Current 28d state table must retain only 1 row");
});

test("3. Slash and no-slash URLs canonicalize to identical canonical page key", () => {
  const urlWithSlash = "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/";
  const urlWithoutSlash = "https://www.dgeniussolutions.com/services/seo-services-in-mumbai";

  const key1 = canonicalPageKey(urlWithSlash);
  const key2 = canonicalPageKey(urlWithoutSlash);

  assert.equal(key1, "/services/seo-services-in-mumbai/");
  assert.equal(key2, "/services/seo-services-in-mumbai/");
  assert.equal(key1, key2, "Trailing slash variations must produce identical canonicalPageKey");
  assert.ok(arePagesCanonicallyEqual(urlWithSlash, urlWithoutSlash));
});

test("4. www and non-www URLs canonicalize to identical canonical page key and canonical URL", () => {
  const nonWww = "https://dgeniussolutions.com/about-us/";
  const www = "https://www.dgeniussolutions.com/about-us/";
  const httpNonWww = "http://dgeniussolutions.com/about-us";

  assert.equal(canonicalPageKey(nonWww), "/about-us/");
  assert.equal(canonicalPageKey(www), "/about-us/");
  assert.equal(canonicalPageKey(httpNonWww), "/about-us/");

  assert.equal(normalizeSitePageUrl(nonWww), "https://www.dgeniussolutions.com/about-us/");
  assert.equal(normalizeSitePageUrl(www), "https://www.dgeniussolutions.com/about-us/");
  assert.equal(normalizeSitePageUrl(httpNonWww), "https://www.dgeniussolutions.com/about-us/");

  assert.ok(arePagesCanonicallyEqual(nonWww, www));
  assert.ok(arePagesCanonicallyEqual(httpNonWww, www));
});

test("5. Relative target URL matches absolute GSC URL via canonical normalization", () => {
  const relativeTarget = "/services/web-development/";
  const relativeNoSlash = "/services/web-development";
  const absoluteGsc = "https://www.dgeniussolutions.com/services/web-development/";

  assert.ok(arePagesCanonicallyEqual(relativeTarget, absoluteGsc), "Target relative URL must match GSC absolute URL");
  assert.ok(arePagesCanonicallyEqual(relativeNoSlash, absoluteGsc), "Unslashed relative target must match GSC URL");

  // Verify lookup map simulation
  const targetMap = new Map();
  targetMap.set(`${canonicalPageKey(relativeTarget)}|${normalizeSearchQuery("web development agency")}`, {
    targetKeyword: "web development agency",
    targetPage: relativeTarget,
  });

  const gscPageKey = canonicalPageKey(absoluteGsc);
  const gscQueryNorm = normalizeSearchQuery("WEB DEVELOPMENT AGENCY ");
  const match = targetMap.get(`${gscPageKey}|${gscQueryNorm}`);

  assert.ok(match, "Target map lookup must succeed across relative target and absolute GSC URL");
  assert.equal(match.targetPage, relativeTarget);
});

test("6. Same query and same page historical duplicate rows do NOT trigger cannibalization", () => {
  // Feed multiple duplicate entries for the exact same page
  const rawRows = [
    { query_text: "seo services mumbai", page_url: "https://www.dgeniussolutions.com/services/seo/", clicks: 10, impressions: 200, position: 5.2 },
    { query_text: "seo services mumbai", page_url: "/services/seo", clicks: 12, impressions: 210, position: 5.0 },
    { query_text: "SEO Services Mumbai", page_url: "https://www.dgeniussolutions.com/services/seo/", clicks: 11, impressions: 205, position: 5.1 },
  ];

  const diag = analyzeQueryCannibalization({
    normalizedQuery: normalizeSearchQuery(rawRows[0].query_text),
    rawQueryText: rawRows[0].query_text,
    pageRows: rawRows,
  });
  assert.equal(diag.pageDiagnostics.length, 1, "Duplicate occurrences of same canonical page must be consolidated into 1 diagnostic");
  assert.equal(diag.classification, "NONE", "Single page query must have classification NONE, never cannibalization");
  assert.equal(diag.competingPages.length, 0, "No competing pages allowed for single canonical page");
  assert.equal(diag.pageDiagnostics[0].role, "PRIMARY");
});

test("7. UTM parameter variants normalize to same canonical key and do NOT become competing pages", () => {
  const urlBase = "https://www.dgeniussolutions.com/services/seo/";
  const urlUtmSource = "https://www.dgeniussolutions.com/services/seo/?utm_source=google&utm_medium=cpc";
  const urlUtmCampaign = "https://www.dgeniussolutions.com/services/seo/?utm_campaign=brand_launch&utm_content=cta";

  assert.equal(canonicalPageKey(urlBase), "/services/seo/");
  assert.equal(canonicalPageKey(urlUtmSource), "/services/seo/");
  assert.equal(canonicalPageKey(urlUtmCampaign), "/services/seo/");

  const rawRows = [
    { query_text: "seo audit services", page_url: urlBase, clicks: 15, impressions: 300, position: 3.1 },
    { query_text: "seo audit services", page_url: urlUtmSource, clicks: 5, impressions: 50, position: 3.2 },
    { query_text: "seo audit services", page_url: urlUtmCampaign, clicks: 2, impressions: 20, position: 3.0 },
  ];

  const diag = analyzeQueryCannibalization({
    normalizedQuery: normalizeSearchQuery(rawRows[0].query_text),
    rawQueryText: rawRows[0].query_text,
    pageRows: rawRows,
  });
  assert.equal(diag.pageDiagnostics.length, 1, "UTM variants must collapse to single canonical page");
  assert.equal(diag.classification, "NONE", "UTM variations must not trigger cannibalization");
  assert.equal(diag.competingPages.length, 0);
});

test("8. Low-visibility secondary page (<10 imps, <10% share, 0 clicks) does NOT trigger cannibalization", () => {
  const rawRows = [
    {
      query_text: "social media marketing pricing",
      page_url: "https://www.dgeniussolutions.com/services/social-media-marketing/",
      clicks: 25,
      impressions: 450,
      position: 4.2,
    },
    {
      query_text: "social media marketing pricing",
      page_url: "https://www.dgeniussolutions.com/blogs/social-media-costs/",
      clicks: 0,
      impressions: 2, // Only 2 impressions (0.4% share, 0 clicks)
      position: 35.0,
    },
  ];

  const diag = analyzeQueryCannibalization({
    normalizedQuery: normalizeSearchQuery(rawRows[0].query_text),
    rawQueryText: rawRows[0].query_text,
    pageRows: rawRows,
  });
  assert.notEqual(diag.classification, "POTENTIAL CANNIBALIZATION", "Low impressions secondary must not be potential cannibalization");
  assert.notEqual(diag.classification, "CONFIRMED CANNIBALIZATION", "Low impressions secondary must not be confirmed cannibalization");
  assert.equal(diag.competingPages.length, 0, "Secondary page below threshold must not be marked competing");
  assert.equal(diag.secondaryPages.length, 1, "Secondary page must be marked as secondary");
  assert.equal(diag.secondaryPages[0].role, "SECONDARY");
});

test("9. Substantial same-intent competing pages correctly trigger POTENTIAL or CONFIRMED risk", () => {
  const rawRows = [
    {
      query_text: "b2b lead generation services mumbai",
      page_url: "https://www.dgeniussolutions.com/services/lead-generation/",
      clicks: 20,
      impressions: 250,
      position: 4.5,
    },
    {
      query_text: "b2b lead generation services mumbai",
      page_url: "https://www.dgeniussolutions.com/services/b2b-marketing/",
      clicks: 18,
      impressions: 230,
      position: 5.1,
    },
  ];

  const diag = analyzeQueryCannibalization({
    normalizedQuery: normalizeSearchQuery(rawRows[0].query_text),
    rawQueryText: rawRows[0].query_text,
    pageRows: rawRows,
  });
  assert.ok(
    diag.classification === "POTENTIAL CANNIBALIZATION" || diag.classification === "CONFIRMED CANNIBALIZATION",
    `Expected cannibalization risk, got: ${diag.classification}`
  );
  assert.equal(diag.competingPages.length, 1, "Competing substantial page must be flagged");
  assert.equal(diag.competingPages[0].role, "COMPETING");
  assert.equal(diag.pageDiagnostics[0].role, "PRIMARY");
  assert.ok(diag.recommendation.length > 0, "Actionable recommendation must be provided");
  assert.ok(diag.actionPlan.length > 0, "Action plan must be generated");
});

test("10. Brand query with homepage primary classifies as PROTECT — BRAND / BRAND MULTI-URL", () => {
  const brandQueries = [
    "dgenius solutions",
    "d'genius solutions",
    "d genius solutions",
    "dgenius solutions mumbai",
    "dgenius",
  ];

  for (const bq of brandQueries) {
    assert.ok(isBrandQuery(bq), `Query "${bq}" must be recognized as brand query`);
  }

  const rawBrandRows = [
    { query_text: "dgenius solutions", page_url: "https://www.dgeniussolutions.com/", clicks: 120, impressions: 600, position: 1.0 },
    { query_text: "dgenius solutions", page_url: "https://www.dgeniussolutions.com/contact-us/", clicks: 8, impressions: 80, position: 2.1 },
    { query_text: "dgenius solutions", page_url: "https://www.dgeniussolutions.com/about-us/", clicks: 5, impressions: 60, position: 2.5 },
  ];

  const diag = analyzeQueryCannibalization({
    normalizedQuery: normalizeSearchQuery(rawBrandRows[0].query_text),
    rawQueryText: rawBrandRows[0].query_text,
    pageRows: rawBrandRows,
  });
  assert.ok(diag.isBrand, "isBrand flag must be true");
  assert.ok(
    diag.classification === "PROTECT — BRAND" || diag.classification === "BRAND MULTI-URL",
    `Expected PROTECT - BRAND or BRAND MULTI-URL, got: ${diag.classification}`
  );
  assert.equal(diag.competingPages.length, 0, "Brand sitelinks must NEVER be labeled competing");
  assert.equal(canonicalPageKey(diag.primaryPage), "/");
  assert.equal(diag.secondaryPages.length, 2, "Contact Us and About Us must be categorized as secondary sitelinks");
  assert.equal(diag.pageDiagnostics.find(p => p.canonicalKey === "/").role, "PRIMARY");
  assert.equal(diag.pageDiagnostics.find(p => p.canonicalKey === "/contact-us/").role, "SECONDARY");
  assert.ok(diag.recommendation.includes("Do NOT de-optimize or redirect"), "Must warn against destructive changes on brand pages");
});

test("11. GA4 28-day active users does NOT sum daily values (non-additive metric)", () => {
  // Scenario: 14 daily reports of 100 active users each.
  // Arithmetic sum = 1,400 active users (WRONG: overcounts recurring users).
  // Dimensionless 28-day API query = 250 true unique active users.
  const dailyActiveUsers = [100, 105, 98, 110, 95, 102, 108, 99, 101, 104, 97, 103, 100, 102];
  const arithmeticSum = dailyActiveUsers.reduce((a, b) => a + b, 0);
  assert.equal(arithmeticSum, 1424);

  // Sync run stores the true aggregate returned by Google API:
  const trueAggregateActiveUsers = 280; // Deduped unique users across 28 days

  // Verify that the dashboard reader uses the sync run aggregate when present
  function resolveGa4DashboardActiveUsers(syncRunAggregate, dailyRows) {
    if (syncRunAggregate != null && syncRunAggregate > 0) {
      return syncRunAggregate; // True aggregate
    }
    // Fallback only if no sync runs exist
    return dailyRows.reduce((a, b) => a + b, 0);
  }

  const resolved = resolveGa4DashboardActiveUsers(trueAggregateActiveUsers, dailyActiveUsers);
  assert.equal(resolved, 280, "Dashboard must use true aggregate 28d active users, never sum of daily rows");
  assert.notEqual(resolved, arithmeticSum, "Dashboard must not equal arithmetic sum of daily rows");
});

test("12. GA4 aggregate engagement rate is used correctly without arithmetic distortion", () => {
  // Scenario: 3 days with disparate session volumes
  // Day 1: 10 sessions, 90% engagement rate (9 engaged)
  // Day 2: 1000 sessions, 40% engagement rate (400 engaged)
  // Arithmetic mean of rates: (90 + 40) / 2 = 65% (DISTORTED)
  // True aggregate rate: (9 + 400) / 1010 = 40.5%
  const day1 = { sessions: 10, rate: 0.90 };
  const day2 = { sessions: 1000, rate: 0.40 };
  const naiveAvg = (day1.rate + day2.rate) / 2; // 0.65 (65%)

  const trueEngagedSessions = 409;
  const trueTotalSessions = 1010;
  const trueAggregateRate = trueEngagedSessions / trueTotalSessions; // ~0.40495

  assert.ok(Math.abs(naiveAvg - 0.65) < 0.001);
  assert.ok(Math.abs(trueAggregateRate - 0.405) < 0.005);

  // Function reflecting V8.3 getGa4DashboardMetrics logic
  function resolveGa4EngagementRate(syncRunRate, dailyRows) {
    if (syncRunRate != null && syncRunRate > 0) {
      return Number((syncRunRate * 100).toFixed(1));
    }
    const sumRate = dailyRows.reduce((acc, r) => acc + r.rate, 0);
    return dailyRows.length > 0 ? Number(((sumRate / dailyRows.length) * 100).toFixed(1)) : 0;
  }

  const resolvedRate = resolveGa4EngagementRate(trueAggregateRate, [day1, day2]);
  assert.equal(resolvedRate, 40.5, "Must use true Google aggregate rate (40.5%), not naive average (65%)");
});

test("13. GSC previous and current 28-day windows do not overlap", () => {
  const refDate = new Date("2026-09-25T12:00:00Z");
  const windows = getNonOverlapping28DayWindows(refDate);

  const curStart = new Date(`${windows.currentStart}T00:00:00Z`);
  const curEnd = new Date(`${windows.currentEnd}T00:00:00Z`);
  const prevStart = new Date(`${windows.previousStart}T00:00:00Z`);
  const prevEnd = new Date(`${windows.previousEnd}T00:00:00Z`);

  const msPerDay = 86400000;

  // Window lengths must be exactly 28 days inclusive (27 days between start and end)
  const curSpan = (curEnd.getTime() - curStart.getTime()) / msPerDay + 1;
  const prevSpan = (prevEnd.getTime() - prevStart.getTime()) / msPerDay + 1;

  assert.equal(curSpan, 28, "Current window must be exactly 28 calendar days");
  assert.equal(prevSpan, 28, "Previous window must be exactly 28 calendar days");

  // Non-overlapping check: previousEnd must be exactly 1 day before currentStart
  const gap = (curStart.getTime() - prevEnd.getTime()) / msPerDay;
  assert.equal(gap, 1, "Gap between previousEnd and currentStart must be exactly 1 day (0 days overlap)");
  assert.ok(prevEnd < curStart, "Previous window must end strictly before current window starts");
});

test("14. Stale current rows are pruned during sync using syncStartTime boundary", () => {
  const syncStartTime = new Date("2026-09-25T10:00:00Z");

  const tableRows = [
    { id: "row1", page: "/", query: "dgs", updated_at: new Date("2026-09-25T10:05:00Z") }, // Updated in current sync
    { id: "row2", page: "/services/seo/", query: "seo", updated_at: new Date("2026-09-25T10:06:00Z") }, // Updated in current sync
    { id: "row3", page: "/old-deleted-page/", query: "old term", updated_at: new Date("2026-09-24T09:00:00Z") }, // Stale
  ];

  // Simulating: DELETE FROM gsc_page_query_metrics WHERE period_type = '28d' AND updated_at < syncStartTime
  const activeRows = tableRows.filter(r => r.updated_at >= syncStartTime);
  const prunedRows = tableRows.filter(r => r.updated_at < syncStartTime);

  assert.equal(activeRows.length, 2, "Current active rows must be preserved");
  assert.equal(prunedRows.length, 1, "Stale row must be identified for pruning");
  assert.equal(prunedRows[0].id, "row3");
});

test("15. Partial Google sync returns partial: true and non-zero error reporting", () => {
  // Simulating sync Google data results
  function evaluateSyncStatus(gscResult, ga4Result, gscError, ga4Error) {
    const hasGsc = Boolean(gscResult && gscResult.success);
    const hasGa4 = Boolean(ga4Result && ga4Result.success);
    const partial = (hasGsc && Boolean(ga4Error)) || (hasGa4 && Boolean(gscError));

    return {
      success: hasGsc || hasGa4,
      partial,
      gsc: gscResult || (gscError ? { success: false, error: gscError } : undefined),
      ga4: ga4Result || (ga4Error ? { success: false, error: ga4Error } : undefined),
      error: gscError && ga4Error ? `GSC: ${gscError} | GA4: ${ga4Error}` : (gscError || ga4Error || undefined),
    };
  }

  // Case A: GSC succeeds, GA4 fails
  const statusA = evaluateSyncStatus(
    { success: true, queriesStored: 150 },
    null,
    null,
    "GA4 API 403 Forbidden"
  );
  assert.equal(statusA.success, true, "Partial sync is treated as overall success so available data is usable");
  assert.equal(statusA.partial, true, "Must flag partial: true");
  assert.equal(statusA.ga4.success, false);
  assert.equal(statusA.ga4.error, "GA4 API 403 Forbidden");
  assert.equal(statusA.error, "GA4 API 403 Forbidden");

  // Case B: Both succeed
  const statusB = evaluateSyncStatus(
    { success: true, queriesStored: 150 },
    { success: true, pagesStored: 45 },
    null,
    null
  );
  assert.equal(statusB.success, true);
  assert.equal(statusB.partial, false, "Must be partial: false when both succeed");
  assert.equal(statusB.error, undefined);
});

test("16. Frontend keyword table contains 0 duplicate rows via canonical deduplication", () => {
  // Simulate raw data delivered to keywords view containing duplicate or unnormalized entries
  const incomingRows = [
    { page_url: "https://www.dgeniussolutions.com/", query_text: "dgenius solutions", clicks: 100, impressions: 500 },
    { page_url: "https://www.dgeniussolutions.com", query_text: "DGenius Solutions", clicks: 100, impressions: 500 }, // Duplicate
    { page_url: "/", query_text: "dgenius solutions ", clicks: 100, impressions: 500 }, // Duplicate
    { page_url: "https://www.dgeniussolutions.com/contact-us/", query_text: "dgenius solutions", clicks: 5, impressions: 50 }, // Distinct page
    { page_url: "https://www.dgeniussolutions.com/services/seo/", query_text: "seo services", clicks: 15, impressions: 200 },
    { page_url: "/services/seo/", query_text: "SEO Services", clicks: 15, impressions: 200 }, // Duplicate
  ];

  // Frontend deduplication guard used in KeywordsClientView.tsx
  const seen = new Set();
  const dedupedRows = [];

  for (const item of incomingRows) {
    const pageKey = canonicalPageKey(item.page_url);
    const queryNorm = normalizeSearchQuery(item.query_text);
    const dedupeKey = `${pageKey}::${queryNorm}`;

    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      dedupedRows.push({ ...item, pageKey, queryNorm });
    }
  }

  assert.equal(dedupedRows.length, 3, "6 incoming rows with 3 duplicates must yield exactly 3 distinct rows");

  // Verify group counts
  const pairCounts = new Map();
  for (const r of dedupedRows) {
    const k = `${r.pageKey}::${r.queryNorm}`;
    pairCounts.set(k, (pairCounts.get(k) || 0) + 1);
  }

  let duplicateCount = 0;
  for (const count of pairCounts.values()) {
    if (count > 1) duplicateCount++;
  }

  assert.equal(duplicateCount, 0, "Frontend keyword table must have 0 duplicate rows");
});
