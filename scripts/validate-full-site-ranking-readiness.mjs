#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanPath } from "./lib/full-site-route-audit.mjs";

const ROOT = process.cwd();
const AUDIT = path.join(ROOT, "data/audit/full-site-ranking-readiness.json");
const EXPECTED_TARGET = process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025/";
const REQUIRED_VIEWPORTS = ["390x844", "430x932"];

function fail(message, details = {}) {
  console.error("FAIL — FULL-SITE RANKING READINESS");
  console.error(JSON.stringify({ ok: false, message, ...details }, null, 2));
  process.exit(1);
}

let report;
try {
  report = JSON.parse(readFileSync(AUDIT, "utf8"));
} catch {
  fail("Missing or unreadable ranking readiness audit", { audit: AUDIT });
}

const requiredFields = ["generatedAt", "target", "expectedIndexableUrlCount", "mobileOverflowEvidence", "summary", "pages"];
for (const field of requiredFields) {
  if (!(field in report)) fail(`Missing report field: ${field}`);
}

if (report.expectedIndexableUrlCount !== 96) {
  fail("expectedIndexableUrlCount must be 96", { value: report.expectedIndexableUrlCount });
}

if (!report.mobileOverflowEvidence?.reused) {
  fail("mobile overflow evidence must be reused in this review pass");
}

const indexability = JSON.parse(
  readFileSync(path.join(ROOT, "data/migration/indexability-manifest.generated.json"), "utf8"),
);
const expectedPaths = indexability.routes
  .filter((route) => route.indexable && route.includeInSitemap)
  .map((route) => cleanPath(route.path))
  .sort();

if (expectedPaths.length !== 96) {
  fail("Indexability manifest must contain 96 sitemap routes", { count: expectedPaths.length });
}

const pages = report.pages || [];
if (pages.length !== 96) fail("Report must contain exactly 96 page records", { count: pages.length });

const reportPaths = pages.map((page) => cleanPath(page.path)).sort();
if (reportPaths.join("|") !== expectedPaths.join("|")) {
  fail("Report URL set must exactly match indexability manifest");
}

const duplicatePaths = reportPaths.filter((routePath, index) => reportPaths.indexOf(routePath) !== index);
if (duplicatePaths.length) fail("Duplicate page records are not allowed", { duplicatePaths });

if (new URL(report.target).href !== new URL(EXPECTED_TARGET).href) {
  fail("Audit target mismatch", { reportTarget: report.target, expectedTarget: EXPECTED_TARGET });
}

const blockingIssues = [];
const overflowIssues = [];
const ogImagePaths = [];

for (const page of pages) {
  if (page.status !== 200) blockingIssues.push(`${page.path}: status ${page.status}`);
  if (!page.title) blockingIssues.push(`${page.path}: missing rendered title`);
  if (!page.description) blockingIssues.push(`${page.path}: missing rendered description`);
  if (page.h1Count !== 1) blockingIssues.push(`${page.path}: h1 count ${page.h1Count}`);
  if (!page.canonical || !page.canonical.includes("dgeniussolutions.com")) {
    blockingIssues.push(`${page.path}: missing production canonical`);
  }
  if (/dimgrey-goat/i.test(page.canonical || "")) blockingIssues.push(`${page.path}: dimgrey canonical leak`);
  if (!Array.isArray(page.schemaTypes) || page.schemaTypes.length === 0) {
    blockingIssues.push(`${page.path}: missing schema`);
  }
  for (const viewport of REQUIRED_VIEWPORTS) {
    if (typeof page.mobileOverflow?.[viewport] !== "boolean") {
      blockingIssues.push(`${page.path}: missing mobile overflow evidence for ${viewport}`);
    } else if (page.mobileOverflow[viewport]) {
      overflowIssues.push(page.path);
    }
  }
  if (page.ogImageMissing || !page.ogImage) ogImagePaths.push(page.path);
}

const summary = report.summary || {};
const recomputed = {
  intendedIndexableUrls: pages.length,
  rankingProtected: pages.filter((page) => page.classification === "RANKING_PROTECTED").length,
  readyForPageOptimization: pages.filter((page) => page.classification === "READY_FOR_PAGE_OPTIMIZATION").length,
  technicalFixRequired: pages.filter((page) => page.classification === "TECHNICAL_FIX_REQUIRED").length,
  contentStrategyRequired: pages.filter((page) => (page.contentGrowthRecommendations || []).length > 0).length,
  cannibalizationReview: summary.cannibalizationReview || 0,
  missingTitleDefects: pages.filter((page) => !page.title).length,
  missingDescriptionDefects: pages.filter((page) => !page.description).length,
  titleLengthRecommendations: pages.filter((page) => (page.recommendations || []).includes("title_length")).length,
  descriptionLengthRecommendations: pages.filter((page) => (page.recommendations || []).includes("description_length")).length,
  h1Defects: pages.filter((page) => page.h1Count !== 1).length,
  canonicalDefects: pages.filter((page) => !page.canonical || !page.canonical.includes("dgeniussolutions.com") || /dimgrey-goat/i.test(page.canonical || "")).length,
  schemaDefects: pages.filter((page) => !page.schemaTypes?.length).length,
  ogImageDefects: ogImagePaths.length,
  twitterImageDefects: pages.filter((page) => page.twitterImageMissing || !page.twitterImage).length,
  overflowPages: pages.filter((page) => Object.values(page.mobileOverflow || {}).some(Boolean)).length,
};

for (const [key, value] of Object.entries(recomputed)) {
  if (summary[key] !== value) {
    fail(`Summary count mismatch for ${key}`, { expected: value, actual: summary[key] });
  }
}

if (blockingIssues.length) {
  fail("Blocking ranking-readiness defects found", { blockingIssues: blockingIssues.slice(0, 20), blockingCount: blockingIssues.length });
}

if (overflowIssues.length) {
  fail("Unexplained mobile overflow remains", { overflowIssues });
}

const ogImageApprovalRequired = ogImagePaths.length > 0;
const ok = true;

console.log("PASS — FULL-SITE RANKING READINESS (WITH KNOWN OG-IMAGE APPROVAL BLOCKER)");
console.log(
  JSON.stringify(
    {
      ok,
      urlsChecked: pages.length,
      missingTitleDefects: recomputed.missingTitleDefects,
      missingDescriptionDefects: recomputed.missingDescriptionDefects,
      titleLengthRecommendations: recomputed.titleLengthRecommendations,
      descriptionLengthRecommendations: recomputed.descriptionLengthRecommendations,
      ogImageApprovalRequired,
      ogImageDefectCount: ogImagePaths.length,
      ogImageAffectedPaths: ogImagePaths,
      twitterImageDefectCount: recomputed.twitterImageDefects,
      overflowPages: recomputed.overflowPages,
      mobileOverflowEvidenceReused: report.mobileOverflowEvidence,
      socialMetadataStatus: ogImageApprovalRequired
        ? "OG_IMAGE_APPROVAL_REQUIRED — social share images are not fully present"
        : "complete",
    },
    null,
    2,
  ),
);
process.exit(0);
