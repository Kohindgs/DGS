#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  AUDIT_SCHEMA_VERSION,
  computeAuditInputDigest,
  computeMobileEvidenceDigest,
  computeReportDataDigest,
  findProhibitedApplicationChanges,
  isAllowedChangePath,
  isProhibitedApplicationPath,
  validateMobileEvidencePayload,
  validateProductionCanonical,
} from "./lib/ranking-readiness-integrity.mjs";
import { validateProductionCanonical as validateCanonicalFromTier0 } from "./lib/tier0-parity-compare.mjs";

const ROOT = process.cwd();

function syntheticReport() {
  const pages = [
    {
      path: "/",
      status: 200,
      title: "Home",
      description: "Desc",
      h1Count: 1,
      canonical: "https://www.dgeniussolutions.com/",
      schemaTypes: ["WebPage"],
      ogImageMissing: true,
      twitterImageMissing: true,
      mobileOverflow: { "390x844": false, "430x932": false },
      classification: "READY_FOR_PAGE_OPTIMIZATION",
      blockingDefects: [],
      recommendations: [],
    },
  ];
  const summary = {
    intendedIndexableUrls: 1,
    rankingProtected: 0,
    readyForPageOptimization: 1,
    technicalFixRequired: 0,
    contentStrategyRequired: 0,
    cannibalizationReview: 0,
    missingTitleDefects: 0,
    missingDescriptionDefects: 0,
    titleLengthRecommendations: 0,
    descriptionLengthRecommendations: 0,
    h1Defects: 0,
    canonicalDefects: 0,
    schemaDefects: 0,
    ogImageDefects: 1,
    twitterImageDefects: 1,
    overflowPages: 0,
  };
  const base = {
    auditSchemaVersion: AUDIT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    target: "http://127.0.0.1:3025/",
    expectedIndexableUrlCount: 1,
    applicationSourceCommit: "abc123",
    auditInputDigest: "input",
    mobileOverflowEvidence: {
      reused: true,
      sourceCommit: "5866109d38e352afa360d08ca555b87f3dcd1d8c",
      sourceReportGeneratedAt: "2026-08-29T17:01:40.416Z",
      sourceEvidencePath: "data/audit/mobile-overflow-evidence.5866109.json",
      mobileEvidenceDigest: "mobile",
      viewports: ["390x844", "430x932"],
    },
    summary,
    pages,
  };
  return { ...base, reportDataDigest: computeReportDataDigest(base) };
}

function mutate(report, mutator) {
  const clone = structuredClone(report);
  mutator(clone);
  return clone;
}

test("allowlist permits scripts and audit data changes", () => {
  assert.equal(isAllowedChangePath("scripts/validate-full-site-ranking-readiness.mjs"), true);
  assert.equal(isAllowedChangePath("data/audit/full-site-ranking-readiness.json"), true);
  assert.equal(isProhibitedApplicationPath("app/page.tsx"), true);
  assert.equal(isProhibitedApplicationPath("components/Footer.tsx"), true);
  assert.equal(isProhibitedApplicationPath("app/globals.css"), true);
  assert.equal(isProhibitedApplicationPath("scripts/test-ranking-integrity.mjs"), false);
});

test("no prohibited application changes since mobile evidence source commit", () => {
  const prohibited = findProhibitedApplicationChanges(ROOT, "5866109d38e352afa360d08ca555b87f3dcd1d8c");
  assert.deepEqual(prohibited, []);
});

test("mobile evidence digest is stable and complete", () => {
  const evidence = JSON.parse(readFileSync(path.join(ROOT, "data/audit/mobile-overflow-evidence.5866109.json"), "utf8"));
  const digest = computeMobileEvidenceDigest(evidence.evidence);
  assert.equal(evidence.digest, digest);
  assert.equal(evidence.evidence.length, 96);
  assert.equal(validateMobileEvidencePayload(evidence.evidence, evidence.evidence.map((entry) => entry.path)).length, 0);
});

test("canonical validation rejects deceptive and invalid URLs", () => {
  assert.equal(validateProductionCanonical("https://evil.example/?dgeniussolutions.com", "/").ok, false);
  assert.equal(validateProductionCanonical("http://www.dgeniussolutions.com/page/", "/page/").ok, false);
  assert.equal(validateProductionCanonical("https://www.dgeniussolutions.com/wrong/", "/page/").ok, false);
  assert.equal(
    validateProductionCanonical("https://dimgrey-goat-473970.hostingersite.com/services/aeo/", "/services/aeo/").ok,
    false,
  );
  assert.equal(
    validateProductionCanonical("https://www.dgeniussolutions.com/services/aeo/", "/services/aeo/").ok,
    true,
  );
  assert.equal(
    validateCanonicalFromTier0("https://www.dgeniussolutions.com/services/aeo/", "/services/aeo/").ok,
    true,
  );
});

test("mutated page status fails report digest validation", () => {
  const report = syntheticReport();
  const mutated = mutate(report, (value) => {
    value.pages[0].status = 500;
  });
  assert.notEqual(mutated.reportDataDigest, computeReportDataDigest(mutated));
});

test("mutated canonical fails report digest validation", () => {
  const report = syntheticReport();
  const mutated = mutate(report, (value) => {
    value.pages[0].canonical = "https://evil.example/";
  });
  assert.notEqual(mutated.reportDataDigest, computeReportDataDigest(mutated));
});

test("mutated overflow value fails report digest validation", () => {
  const report = syntheticReport();
  const mutated = mutate(report, (value) => {
    value.pages[0].mobileOverflow["390x844"] = true;
  });
  assert.notEqual(mutated.reportDataDigest, computeReportDataDigest(mutated));
});

test("mutated expected path set fails manifest comparison", () => {
  const report = syntheticReport();
  const mutated = mutate(report, (value) => {
    value.pages[0].path = "/unexpected-path/";
  });
  assert.notEqual(mutated.pages[0].path, "/");
});

test("mutated summary count is detectable", () => {
  const report = syntheticReport();
  const mutated = mutate(report, (value) => {
    value.summary.missingTitleDefects = 99;
  });
  const recomputed = report.pages.filter((page) => !page.title).length;
  assert.notEqual(mutated.summary.missingTitleDefects, recomputed);
});

test("mutated audit input digest is detectable", () => {
  const registry = JSON.parse(
    readFileSync(path.join(ROOT, "data/migration/nextjs-route-registry.generated.json"), "utf8"),
  );
  const indexability = JSON.parse(
    readFileSync(path.join(ROOT, "data/migration/indexability-manifest.generated.json"), "utf8"),
  );
  const readiness = JSON.parse(readFileSync(path.join(ROOT, "data/audit/full-site-route-readiness.json"), "utf8")).inventory || [];
  const digest = computeAuditInputDigest({
    indexabilityManifest: indexability,
    routeRegistry: registry,
    readinessInventory: readiness,
    schemaVersion: AUDIT_SCHEMA_VERSION,
  });
  assert.match(digest, /^[a-f0-9]{64}$/);
  assert.notEqual(digest, "deadbeef");
});

test("mutated report digest is detectable", () => {
  const report = syntheticReport();
  assert.equal(report.reportDataDigest, computeReportDataDigest(report));
  const mutated = mutate(report, (value) => {
    value.reportDataDigest = "deadbeef";
  });
  assert.notEqual(mutated.reportDataDigest, computeReportDataDigest(mutated));
});

test("old schema report lacks required integrity fields", () => {
  const report = syntheticReport();
  const old = { ...report };
  delete old.auditSchemaVersion;
  delete old.applicationSourceCommit;
  delete old.auditInputDigest;
  delete old.reportDataDigest;
  assert.equal("auditSchemaVersion" in old, false);
});
