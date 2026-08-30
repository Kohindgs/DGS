import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanPath } from "./full-site-route-audit.mjs";

export const AUDIT_SCHEMA_VERSION = "2B.1A";
export const MOBILE_EVIDENCE_SOURCE_COMMIT = "570d3cee287975d5263fe3dcb3f012786212b843";
export const MOBILE_EVIDENCE_SHORT_SHA = MOBILE_EVIDENCE_SOURCE_COMMIT.slice(0, 7);
export const MOBILE_EVIDENCE_PATH = `data/audit/mobile-overflow-evidence.${MOBILE_EVIDENCE_SHORT_SHA}.json`;
export const PRODUCTION_CANONICAL_HOST = "www.dgeniussolutions.com";
export const REQUIRED_VIEWPORTS = ["390x844", "430x932"];

const ALLOWED_EXACT_PATHS = new Set([
  "data/audit/full-site-ranking-readiness.json",
  "data/audit/plugin-runtime-dependency-audit.json",
  MOBILE_EVIDENCE_PATH,
  "package.json",
  "package-lock.json",
]);

export function normalizeRepoPath(filePath) {
  return filePath.replace(/\\/g, "/");
}

export function isAllowedChangePath(filePath) {
  const normalized = normalizeRepoPath(filePath);
  if (normalized.startsWith("scripts/")) return true;
  if (normalized.startsWith("data/audit/weavings-screenshots/")) return true;
  if (/^data\/audit\/mobile-overflow-evidence\.[0-9a-f]{7}\.json$/.test(normalized)) return true;
  return ALLOWED_EXACT_PATHS.has(normalized);
}

export function gitOutput(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

export function assertValidCommitSha(commit) {
  return typeof commit === "string" && /^[0-9a-f]{40}$/.test(commit);
}

export function assertCleanWorktree(root) {
  const dirty = gitOutput(root, ["status", "--porcelain"]);
  if (dirty) {
    const error = new Error("Working tree is not clean");
    error.dirtyPaths = dirty.split("\n").map((line) => line.slice(3).trim()).filter(Boolean);
    throw error;
  }
}

export function assertHeadMatchesCommit(root, commit) {
  const head = gitOutput(root, ["rev-parse", "HEAD"]);
  if (head !== commit) {
    const error = new Error("HEAD does not match required commit");
    error.expected = commit;
    error.actual = head;
    throw error;
  }
}

export function commitTimestampMs(root, commit) {
  const value = Number(gitOutput(root, ["show", "-s", "--format=%ct", commit]));
  if (!Number.isFinite(value)) throw new Error(`Unable to read commit timestamp for ${commit}`);
  return value * 1000;
}

export function listChangedPaths(root, sourceCommit) {
  const paths = new Set();
  const commands = [
    ["diff", "--name-only", sourceCommit, "HEAD"],
    ["diff", "--name-only", "--cached"],
    ["diff", "--name-only"],
    ["ls-files", "--others", "--exclude-standard"],
  ];

  for (const args of commands) {
    const output = gitOutput(root, args);
    for (const line of output.split("\n").map((value) => value.trim()).filter(Boolean)) {
      paths.add(normalizeRepoPath(line));
    }
  }

  return [...paths].sort();
}

export function findUnexpectedChanges(root, sourceCommit = MOBILE_EVIDENCE_SOURCE_COMMIT) {
  return listChangedPaths(root, sourceCommit).filter((filePath) => !isAllowedChangePath(filePath));
}

export function assertMobileEvidenceReuseAllowed(root, sourceCommit = MOBILE_EVIDENCE_SOURCE_COMMIT) {
  const unexpectedPaths = findUnexpectedChanges(root, sourceCommit);
  if (unexpectedPaths.length) {
    const error = new Error("Unexpected changes detected; mobile overflow evidence cannot be reused");
    error.unexpectedPaths = unexpectedPaths;
    throw error;
  }
}

export function stableValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => stableValue(entry));
  }
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = stableValue(value[key]);
        return acc;
      }, {});
  }
  return value;
}

export function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

export function buildMobileEvidencePayload(pagesByPath) {
  return [...pagesByPath.entries()]
    .map(([routePath, overflow]) => ({
      path: cleanPath(routePath),
      "390x844": Boolean(overflow["390x844"]),
      "430x932": Boolean(overflow["430x932"]),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function serializeMobileEvidencePayload(payload) {
  return JSON.stringify(payload);
}

export function computeDigest(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function computeMobileEvidenceDigest(payload) {
  return computeDigest(serializeMobileEvidencePayload(payload));
}

export function loadMobileEvidenceFile(root) {
  const filePath = path.join(root, MOBILE_EVIDENCE_PATH);
  const evidence = JSON.parse(readFileSync(filePath, "utf8"));
  return { filePath, evidence };
}

export function mobileEvidenceMapFromPayload(payload) {
  return new Map(payload.map((entry) => [entry.path, { "390x844": entry["390x844"], "430x932": entry["430x932"] }]));
}

export function validateMobileEvidencePayload(payload, expectedPaths) {
  const issues = [];
  if (!Array.isArray(payload)) {
    return ["mobile evidence payload must be an array"];
  }

  const seen = new Set();
  for (const entry of payload) {
    if (!entry?.path || typeof entry.path !== "string") {
      issues.push("mobile evidence entry missing path");
      continue;
    }
    const routePath = cleanPath(entry.path);
    if (seen.has(routePath)) issues.push(`duplicate mobile evidence path: ${routePath}`);
    seen.add(routePath);
    for (const viewport of REQUIRED_VIEWPORTS) {
      if (typeof entry[viewport] !== "boolean") {
        issues.push(`${routePath}: missing boolean viewport ${viewport}`);
      }
    }
  }

  for (const routePath of expectedPaths) {
    if (!seen.has(routePath)) issues.push(`missing mobile evidence path: ${routePath}`);
  }
  for (const routePath of seen) {
    if (!expectedPaths.includes(routePath)) issues.push(`unexpected mobile evidence path: ${routePath}`);
  }

  return issues;
}

export function getApplicationSourceCommit(root) {
  assertMobileEvidenceReuseAllowed(root);
  return MOBILE_EVIDENCE_SOURCE_COMMIT;
}

export function indexabilityAuditInputs(indexabilityManifest) {
  return indexabilityManifest.routes
    .filter((route) => route.indexable && route.includeInSitemap)
    .map((route) => stableValue(route))
    .sort((a, b) => cleanPath(a.path).localeCompare(cleanPath(b.path)));
}

export function registryAuditInputs(routeRegistry, expectedPaths) {
  const expected = new Set(expectedPaths);
  return routeRegistry.routes
    .filter((route) => expected.has(cleanPath(route.path)))
    .map((route) => stableValue(route))
    .sort((a, b) => cleanPath(a.path).localeCompare(cleanPath(b.path)));
}

export function readinessAuditInputs(readinessInventory, expectedPaths) {
  const expected = new Set(expectedPaths);
  return readinessInventory
    .filter((route) => expected.has(cleanPath(route.path)))
    .map((route) => stableValue(route))
    .sort((a, b) => cleanPath(a.path).localeCompare(cleanPath(b.path)));
}

export function computeAuditInputDigest({ indexabilityManifest, routeRegistry, readinessInventory, schemaVersion }) {
  const expectedPaths = indexabilityManifest.routes
    .filter((route) => route.indexable && route.includeInSitemap)
    .map((route) => cleanPath(route.path))
    .sort();

  const payload = {
    schemaVersion,
    indexability: indexabilityAuditInputs(indexabilityManifest),
    routeRegistry: registryAuditInputs(routeRegistry, expectedPaths),
    readinessInventory: readinessAuditInputs(readinessInventory, expectedPaths),
  };
  return computeDigest(stableStringify(payload));
}

export function canonicalPageData(page) {
  return {
    path: cleanPath(page.path),
    status: page.status,
    title: page.title || "",
    description: page.description || "",
    h1Count: page.h1Count,
    canonical: page.canonical || "",
    schemaTypes: [...(page.schemaTypes || [])].sort(),
    ogImage: page.ogImage || "",
    twitterImage: page.twitterImage || "",
    twitterCard: page.twitterCard || "",
    ogImageMissing: Boolean(page.ogImageMissing),
    twitterImageMissing: Boolean(page.twitterImageMissing),
    mobileOverflow: {
      "390x844": Boolean(page.mobileOverflow?.["390x844"]),
      "430x932": Boolean(page.mobileOverflow?.["430x932"]),
    },
    classification: page.classification || "",
    blockingDefects: [...(page.blockingDefects || [])].sort(),
    recommendations: [...(page.recommendations || [])].sort(),
  };
}

export function computeReportDataDigest(report) {
  const payload = {
    auditSchemaVersion: report.auditSchemaVersion,
    target: report.target,
    expectedIndexableUrlCount: report.expectedIndexableUrlCount,
    applicationSourceCommit: report.applicationSourceCommit,
    auditInputDigest: report.auditInputDigest,
    mobileOverflowEvidence: report.mobileOverflowEvidence,
    summary: report.summary,
    pages: (report.pages || []).map(canonicalPageData).sort((a, b) => a.path.localeCompare(b.path)),
  };
  return computeDigest(stableStringify(payload));
}

export function validateProductionCanonical(canonical, pagePath) {
  if (!canonical) return { ok: false, reason: "missing" };
  let url;
  try {
    url = new URL(canonical);
  } catch {
    return { ok: false, reason: "invalid-url" };
  }
  if (url.protocol !== "https:") return { ok: false, reason: "non-https" };
  if (url.username || url.password) return { ok: false, reason: "credentials" };
  if (url.port) return { ok: false, reason: "unexpected-port" };
  if (url.search || url.hash) return { ok: false, reason: "query-or-hash" };
  if (url.hostname !== PRODUCTION_CANONICAL_HOST) return { ok: false, reason: "wrong-host" };
  if (/dimgrey-goat/i.test(canonical)) return { ok: false, reason: "dimgrey-leak" };

  let expectedPath = cleanPath(pagePath);
  let actualPath = url.pathname || "/";
  if (actualPath !== "/" && !actualPath.endsWith("/")) actualPath += "/";
  if (expectedPath !== "/" && !expectedPath.endsWith("/")) expectedPath += "/";

  if (actualPath !== expectedPath) return { ok: false, reason: "path-mismatch" };
  return { ok: true };
}

export function isValidGeneratedAt(value) {
  if (!value || typeof value !== "string") return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  if (date.getTime() > Date.now() + 60_000) return false;
  return true;
}
