#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  AUDIT_SCHEMA_VERSION,
  MOBILE_EVIDENCE_PATH,
  MOBILE_EVIDENCE_SOURCE_COMMIT,
  assertMobileEvidenceReuseAllowed,
  computeAuditInputDigest,
  computeMobileEvidenceDigest,
  computeReportDataDigest,
  findUnexpectedChanges,
  isAllowedChangePath,
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
    applicationSourceCommit: MOBILE_EVIDENCE_SOURCE_COMMIT,
    auditInputDigest: "input",
    mobileOverflowEvidence: {
      reused: true,
      sourceCommit: MOBILE_EVIDENCE_SOURCE_COMMIT,
      sourceReportGeneratedAt: "2026-08-29T17:01:40.416Z",
      sourceEvidencePath: MOBILE_EVIDENCE_PATH,
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

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function setupTempRepo() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "ranking-guard-"));
  git(dir, "init");
  git(dir, "config", "user.email", "test@example.com");
  git(dir, "config", "user.name", "Test");
  mkdirSync(path.join(dir, "app"), { recursive: true });
  mkdirSync(path.join(dir, "scripts"), { recursive: true });
  writeFileSync(path.join(dir, "app/page.tsx"), "export default function Page() { return null; }\n");
  writeFileSync(path.join(dir, "scripts/guard.mjs"), "export const ok = true;\n");
  git(dir, "add", ".");
  git(dir, "commit", "-m", "baseline");
  const sourceCommit = git(dir, "rev-parse", "HEAD");
  return { dir, sourceCommit };
}

test("allowlist permits only scripts and explicit audit files", () => {
  assert.equal(isAllowedChangePath("scripts/validate-full-site-ranking-readiness.mjs"), true);
  assert.equal(isAllowedChangePath("data/audit/full-site-ranking-readiness.json"), true);
  assert.equal(isAllowedChangePath(MOBILE_EVIDENCE_PATH), true);
  assert.equal(isAllowedChangePath("data/audit/other.json"), false);
  assert.equal(isAllowedChangePath("app/page.tsx"), false);
});

test("no unexpected changes since mobile evidence source commit in real repo", () => {
  assert.deepEqual(findUnexpectedChanges(ROOT, MOBILE_EVIDENCE_SOURCE_COMMIT), []);
});

test("mobile evidence digest is stable and complete", () => {
  const evidence = JSON.parse(readFileSync(path.join(ROOT, MOBILE_EVIDENCE_PATH), "utf8"));
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

test("audit input digest changes when route title changes", () => {
  const registry = JSON.parse(
    readFileSync(path.join(ROOT, "data/migration/nextjs-route-registry.generated.json"), "utf8"),
  );
  const indexability = JSON.parse(
    readFileSync(path.join(ROOT, "data/migration/indexability-manifest.generated.json"), "utf8"),
  );
  const readiness = JSON.parse(readFileSync(path.join(ROOT, "data/audit/full-site-route-readiness.json"), "utf8")).inventory || [];
  const base = {
    indexabilityManifest: indexability,
    routeRegistry: registry,
    readinessInventory: readiness,
    schemaVersion: AUDIT_SCHEMA_VERSION,
  };
  const original = computeAuditInputDigest(base);
  const mutatedRegistry = structuredClone(registry);
  mutatedRegistry.routes[0].title = "Mutated Title";
  const mutated = computeAuditInputDigest({ ...base, routeRegistry: mutatedRegistry });
  assert.notEqual(original, mutated);
});

test("audit input digest changes when route description changes", () => {
  const registry = JSON.parse(
    readFileSync(path.join(ROOT, "data/migration/nextjs-route-registry.generated.json"), "utf8"),
  );
  const indexability = JSON.parse(
    readFileSync(path.join(ROOT, "data/migration/indexability-manifest.generated.json"), "utf8"),
  );
  const readiness = JSON.parse(readFileSync(path.join(ROOT, "data/audit/full-site-route-readiness.json"), "utf8")).inventory || [];
  const base = {
    indexabilityManifest: indexability,
    routeRegistry: registry,
    readinessInventory: readiness,
    schemaVersion: AUDIT_SCHEMA_VERSION,
  };
  const original = computeAuditInputDigest(base);
  const mutatedRegistry = structuredClone(registry);
  mutatedRegistry.routes[0].description = "Mutated description";
  const mutated = computeAuditInputDigest({ ...base, routeRegistry: mutatedRegistry });
  assert.notEqual(original, mutated);
});

test("audit input digest changes when indexability property changes", () => {
  const registry = JSON.parse(
    readFileSync(path.join(ROOT, "data/migration/nextjs-route-registry.generated.json"), "utf8"),
  );
  const indexability = JSON.parse(
    readFileSync(path.join(ROOT, "data/migration/indexability-manifest.generated.json"), "utf8"),
  );
  const readiness = JSON.parse(readFileSync(path.join(ROOT, "data/audit/full-site-route-readiness.json"), "utf8")).inventory || [];
  const base = {
    indexabilityManifest: indexability,
    routeRegistry: registry,
    readinessInventory: readiness,
    schemaVersion: AUDIT_SCHEMA_VERSION,
  };
  const original = computeAuditInputDigest(base);
  const mutatedIndexability = structuredClone(indexability);
  mutatedIndexability.routes[0].reason = "Mutated reason";
  const mutated = computeAuditInputDigest({ ...base, indexabilityManifest: mutatedIndexability });
  assert.notEqual(original, mutated);
});

test("audit input digest changes when readiness content status changes", () => {
  const registry = JSON.parse(
    readFileSync(path.join(ROOT, "data/migration/nextjs-route-registry.generated.json"), "utf8"),
  );
  const indexability = JSON.parse(
    readFileSync(path.join(ROOT, "data/migration/indexability-manifest.generated.json"), "utf8"),
  );
  const readiness = JSON.parse(readFileSync(path.join(ROOT, "data/audit/full-site-route-readiness.json"), "utf8")).inventory || [];
  const base = {
    indexabilityManifest: indexability,
    routeRegistry: registry,
    readinessInventory: readiness,
    schemaVersion: AUDIT_SCHEMA_VERSION,
  };
  const original = computeAuditInputDigest(base);
  const mutatedReadiness = structuredClone(readiness);
  mutatedReadiness[0].contentStatus = "CONTENT_INCOMPLETE";
  const mutated = computeAuditInputDigest({ ...base, readinessInventory: mutatedReadiness });
  assert.notEqual(original, mutated);
});

test("mutated page status fails report digest validation", () => {
  const report = syntheticReport();
  const mutated = mutate(report, (value) => {
    value.pages[0].status = 500;
  });
  assert.notEqual(mutated.reportDataDigest, computeReportDataDigest(mutated));
});

test("mutated application source commit fails report digest validation", () => {
  const report = syntheticReport();
  const mutated = mutate(report, (value) => {
    value.applicationSourceCommit = "deadbeef";
  });
  assert.notEqual(mutated.reportDataDigest, computeReportDataDigest(mutated));
});

test("mutated report digest is detectable", () => {
  const report = syntheticReport();
  assert.equal(report.reportDataDigest, computeReportDataDigest(report));
  const mutated = mutate(report, (value) => {
    value.reportDataDigest = "deadbeef";
  });
  assert.notEqual(mutated.reportDataDigest, computeReportDataDigest(mutated));
});

test("isolated guard baseline is clean", () => {
  const { dir, sourceCommit } = setupTempRepo();
  try {
    assert.deepEqual(findUnexpectedChanges(dir, sourceCommit), []);
    assert.doesNotThrow(() => assertMobileEvidenceReuseAllowed(dir, sourceCommit));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("isolated guard allows scripts changes", () => {
  const { dir, sourceCommit } = setupTempRepo();
  try {
    writeFileSync(path.join(dir, "scripts/new-guard.mjs"), "export const ok = true;\n");
    assert.deepEqual(findUnexpectedChanges(dir, sourceCommit), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("isolated guard fails on untracked app probe", () => {
  const { dir, sourceCommit } = setupTempRepo();
  try {
    writeFileSync(path.join(dir, "app/probe.tsx"), "export default function Probe() {}\n");
    assert.deepEqual(findUnexpectedChanges(dir, sourceCommit), ["app/probe.tsx"]);
    assert.throws(() => assertMobileEvidenceReuseAllowed(dir, sourceCommit));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("isolated guard fails on untracked css probe", () => {
  const { dir, sourceCommit } = setupTempRepo();
  try {
    writeFileSync(path.join(dir, "app/probe.css"), ".probe {}\n");
    assert.deepEqual(findUnexpectedChanges(dir, sourceCommit), ["app/probe.css"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("isolated guard fails on untracked data migration probe", () => {
  const { dir, sourceCommit } = setupTempRepo();
  try {
    mkdirSync(path.join(dir, "data/migration"), { recursive: true });
    writeFileSync(path.join(dir, "data/migration/probe.json"), "{}\n");
    assert.deepEqual(findUnexpectedChanges(dir, sourceCommit), ["data/migration/probe.json"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("isolated guard fails on staged prohibited file", () => {
  const { dir, sourceCommit } = setupTempRepo();
  try {
    mkdirSync(path.join(dir, "components"), { recursive: true });
    writeFileSync(path.join(dir, "components/Footer.tsx"), "export const Footer = () => null;\n");
    git(dir, "add", "components/Footer.tsx");
    assert.deepEqual(findUnexpectedChanges(dir, sourceCommit), ["components/Footer.tsx"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("isolated guard fails on unstaged tracked application change", () => {
  const { dir, sourceCommit } = setupTempRepo();
  try {
    writeFileSync(path.join(dir, "app/page.tsx"), "export default function Page() { return <main />; }\n");
    assert.deepEqual(findUnexpectedChanges(dir, sourceCommit), ["app/page.tsx"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("isolated guard fails on committed prohibited change after source commit", () => {
  const { dir, sourceCommit } = setupTempRepo();
  try {
    writeFileSync(path.join(dir, "app/page.tsx"), "export default function Page() { return <main />; }\n");
    git(dir, "add", "app/page.tsx");
    git(dir, "commit", "-m", "app change");
    assert.deepEqual(findUnexpectedChanges(dir, sourceCommit), ["app/page.tsx"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("isolated guard returns exact offending paths", () => {
  const { dir, sourceCommit } = setupTempRepo();
  try {
    writeFileSync(path.join(dir, "app/probe.tsx"), "export default function Probe() {}\n");
    mkdirSync(path.join(dir, "data/migration"), { recursive: true });
    writeFileSync(path.join(dir, "data/migration/probe.json"), "{}\n");
    assert.deepEqual(findUnexpectedChanges(dir, sourceCommit), ["app/probe.tsx", "data/migration/probe.json"]);
    try {
      assertMobileEvidenceReuseAllowed(dir, sourceCommit);
      assert.fail("expected guard failure");
    } catch (error) {
      assert.deepEqual(error.unexpectedPaths, ["app/probe.tsx", "data/migration/probe.json"]);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
