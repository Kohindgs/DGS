#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanPath } from "./lib/full-site-route-audit.mjs";
import {
  AUDIT_SCHEMA_VERSION,
  MOBILE_EVIDENCE_PATH,
  MOBILE_EVIDENCE_SOURCE_COMMIT,
  REQUIRED_VIEWPORTS,
  assertMobileEvidenceReuseAllowed,
  computeAuditInputDigest,
  computeMobileEvidenceDigest,
  computeReportDataDigest,
  isValidGeneratedAt,
  loadMobileEvidenceFile,
  validateMobileEvidencePayload,
  validateProductionCanonical,
} from "./lib/ranking-readiness-integrity.mjs";

const ROOT = process.cwd();
const AUDIT = path.join(ROOT, "data/audit/full-site-ranking-readiness.json");
const EXPECTED_TARGET = process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025/";

const indexability = JSON.parse(
  readFileSync(path.join(ROOT, "data/migration/indexability-manifest.generated.json"), "utf8"),
);
const registry = JSON.parse(
  readFileSync(path.join(ROOT, "data/migration/nextjs-route-registry.generated.json"), "utf8"),
);
const readiness = JSON.parse(readFileSync(path.join(ROOT, "data/audit/full-site-route-readiness.json"), "utf8")).inventory || [];

const expectedPaths = indexability.routes
  .filter((route) => route.indexable && route.includeInSitemap)
  .map((route) => cleanPath(route.path))
  .sort();

try {
  assertMobileEvidenceReuseAllowed(ROOT);
} catch (error) {
  console.error("FAIL — FULL-SITE RANKING READINESS");
  for (const unexpectedPath of error.unexpectedPaths || []) {
    console.error(unexpectedPath);
  }
  process.exit(1);
}

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

const requiredFields = [
  "auditSchemaVersion",
  "generatedAt",
  "target",
  "expectedIndexableUrlCount",
  "applicationSourceCommit",
  "auditInputDigest",
  "mobileOverflowEvidence",
  "reportDataDigest",
  "summary",
  "pages",
];
for (const field of requiredFields) {
  if (!(field in report)) fail(`Missing report field: ${field}`);
}

if (report.auditSchemaVersion !== AUDIT_SCHEMA_VERSION) {
  fail("Unsupported or stale audit schema version", {
    expected: AUDIT_SCHEMA_VERSION,
    actual: report.auditSchemaVersion,
  });
}

if (!isValidGeneratedAt(report.generatedAt)) {
  fail("Invalid generatedAt timestamp", { generatedAt: report.generatedAt });
}

if (report.expectedIndexableUrlCount !== 96) {
  fail("expectedIndexableUrlCount must be 96", { value: report.expectedIndexableUrlCount });
}

if (report.applicationSourceCommit !== MOBILE_EVIDENCE_SOURCE_COMMIT) {
  fail("applicationSourceCommit must match mobile evidence source commit", {
    expected: MOBILE_EVIDENCE_SOURCE_COMMIT,
    actual: report.applicationSourceCommit,
  });
}

const mobileEvidence = report.mobileOverflowEvidence || {};
if (!mobileEvidence.reused) fail("mobile overflow evidence must be reused in this review pass");
if (mobileEvidence.sourceCommit !== MOBILE_EVIDENCE_SOURCE_COMMIT) {
  fail("mobile overflow source commit mismatch", {
    expected: MOBILE_EVIDENCE_SOURCE_COMMIT,
    actual: mobileEvidence.sourceCommit,
  });
}
if (mobileEvidence.sourceEvidencePath !== MOBILE_EVIDENCE_PATH) {
  fail("mobile overflow source evidence path mismatch", {
    expected: MOBILE_EVIDENCE_PATH,
    actual: mobileEvidence.sourceEvidencePath,
  });
}

const { evidence: mobileEvidenceFile } = loadMobileEvidenceFile(ROOT);
const mobileEvidenceIssues = validateMobileEvidencePayload(mobileEvidenceFile.evidence, expectedPaths);
if (mobileEvidenceIssues.length) {
  fail("immutable mobile evidence file is invalid", { issues: mobileEvidenceIssues.slice(0, 10) });
}
if (mobileEvidenceFile.sourceCommit !== MOBILE_EVIDENCE_SOURCE_COMMIT) {
  fail("immutable mobile evidence file source commit mismatch");
}
const expectedMobileDigest = computeMobileEvidenceDigest(mobileEvidenceFile.evidence);
if (mobileEvidence.mobileEvidenceDigest !== expectedMobileDigest) {
  fail("mobileEvidenceDigest mismatch", {
    expected: expectedMobileDigest,
    actual: mobileEvidence.mobileEvidenceDigest,
  });
}
if (mobileEvidenceFile.digest !== expectedMobileDigest) {
  fail("immutable mobile evidence file digest mismatch");
}

if (expectedPaths.length !== 96) {
  fail("Indexability manifest must contain 96 sitemap routes", { count: expectedPaths.length });
}

const expectedAuditInputDigest = computeAuditInputDigest({
  indexabilityManifest: indexability,
  routeRegistry: registry,
  readinessInventory: readiness,
  schemaVersion: AUDIT_SCHEMA_VERSION,
});
if (report.auditInputDigest !== expectedAuditInputDigest) {
  fail("auditInputDigest mismatch", {
    expected: expectedAuditInputDigest,
    actual: report.auditInputDigest,
  });
}

const expectedReportDataDigest = computeReportDataDigest(report);
if (report.reportDataDigest !== expectedReportDataDigest) {
  fail("reportDataDigest mismatch", {
    expected: expectedReportDataDigest,
    actual: report.reportDataDigest,
  });
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

const mobilePayloadIssues = validateMobileEvidencePayload(
  pages.map((page) => ({
    path: page.path,
    "390x844": page.mobileOverflow?.["390x844"],
    "430x932": page.mobileOverflow?.["430x932"],
  })),
  expectedPaths,
);
if (mobilePayloadIssues.length) {
  fail("Report mobile overflow evidence is incomplete or invalid", { issues: mobilePayloadIssues.slice(0, 10) });
}

const blockingIssues = [];
const overflowIssues = [];
const ogImagePaths = [];

for (const page of pages) {
  if (page.status !== 200) blockingIssues.push(`${page.path}: status ${page.status}`);
  if (!page.title) blockingIssues.push(`${page.path}: missing rendered title`);
  if (!page.description) blockingIssues.push(`${page.path}: missing rendered description`);
  if (page.h1Count !== 1) blockingIssues.push(`${page.path}: h1 count ${page.h1Count}`);
  const canonicalCheck = validateProductionCanonical(page.canonical, page.path);
  if (!canonicalCheck.ok) blockingIssues.push(`${page.path}: canonical ${canonicalCheck.reason}`);
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
  canonicalDefects: pages.filter((page) => !validateProductionCanonical(page.canonical, page.path).ok).length,
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

if (ogImagePaths.length > 0) {
  fail("OG/Twitter social images are missing on indexable routes", {
    ogImageDefectCount: ogImagePaths.length,
    samplePaths: ogImagePaths.slice(0, 10),
  });
}

console.log("PASS — FULL-SITE RANKING READINESS");
console.log(
  JSON.stringify(
    {
      ok: true,
      urlsChecked: pages.length,
      auditSchemaVersion: report.auditSchemaVersion,
      applicationSourceCommit: report.applicationSourceCommit,
      auditInputDigest: report.auditInputDigest,
      reportDataDigest: report.reportDataDigest,
      mobileEvidenceDigest: mobileEvidence.mobileEvidenceDigest,
      missingTitleDefects: recomputed.missingTitleDefects,
      missingDescriptionDefects: recomputed.missingDescriptionDefects,
      titleLengthRecommendations: recomputed.titleLengthRecommendations,
      descriptionLengthRecommendations: recomputed.descriptionLengthRecommendations,
      ogImageDefectCount: 0,
      twitterImageDefectCount: recomputed.twitterImageDefects,
      overflowPages: recomputed.overflowPages,
      mobileOverflowEvidenceReused: report.mobileOverflowEvidence,
      socialMetadataStatus: "complete",
    },
    null,
    2,
  ),
);
process.exit(0);
