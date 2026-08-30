import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanPath } from "./full-site-route-audit.mjs";

export const AUDIT_SCHEMA_VERSION = "2A.1A";
export const MOBILE_EVIDENCE_SOURCE_COMMIT = "5866109d38e352afa360d08ca555b87f3dcd1d8c";
export const MOBILE_EVIDENCE_PATH = "data/audit/mobile-overflow-evidence.5866109.json";
export const PRODUCTION_CANONICAL_HOST = "www.dgeniussolutions.com";
export const REQUIRED_VIEWPORTS = ["390x844", "430x932"];

const ALLOWED_CHANGE_PREFIXES = [
  "scripts/",
  "data/audit/",
  "package.json",
  "package-lock.json",
];

export function isAllowedChangePath(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  if (ALLOWED_CHANGE_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(prefix))) {
    return true;
  }
  return false;
}

export function isProhibitedApplicationPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  if (isAllowedChangePath(normalized)) return false;
  if (normalized.endsWith(".css")) return true;
  if (
    normalized.startsWith("app/") ||
    normalized.startsWith("components/") ||
    normalized.startsWith("lib/") ||
    normalized.startsWith("styles/") ||
    normalized.startsWith("public/")
  ) {
    return true;
  }
  if (["next.config.ts", "middleware.ts", "proxy.ts"].includes(normalized)) return true;
  return false;
}

export function listChangedPaths(root, sourceCommit) {
  const paths = new Set();
  const commands = [
    ["git", "diff", "--name-only", sourceCommit, "HEAD"],
    ["git", "diff", "--name-only", "--cached"],
    ["git", "diff", "--name-only"],
  ];
  for (const args of commands) {
    const output = execFileSync(args[0], args.slice(1), { cwd: root, encoding: "utf8" }).trim();
    for (const line of output.split("\n").map((value) => value.trim()).filter(Boolean)) {
      paths.add(line);
    }
  }
  return [...paths].sort();
}

export function findProhibitedApplicationChanges(root, sourceCommit) {
  return listChangedPaths(root, sourceCommit).filter(isProhibitedApplicationPath);
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
  const prohibited = findProhibitedApplicationChanges(root, MOBILE_EVIDENCE_SOURCE_COMMIT);
  if (prohibited.length) {
    const error = new Error("Application/UI changes detected; mobile overflow evidence cannot be reused");
    error.prohibitedPaths = prohibited;
    throw error;
  }
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
}

export function computeAuditInputDigest({ indexabilityManifest, routeRegistry, readinessInventory, schemaVersion }) {
  const payload = {
    schemaVersion,
    indexability: indexabilityManifest.routes
      .filter((route) => route.indexable && route.includeInSitemap)
      .map((route) => cleanPath(route.path))
      .sort(),
    registryPaths: routeRegistry.routes.map((route) => cleanPath(route.path)).sort(),
    readinessPaths: readinessInventory.map((route) => cleanPath(route.path)).sort(),
  };
  return computeDigest(JSON.stringify(payload));
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
    expectedIndexableUrlCount: report.expectedIndexableUrlCount,
    summary: report.summary,
    pages: (report.pages || []).map(canonicalPageData).sort((a, b) => a.path.localeCompare(b.path)),
  };
  return computeDigest(JSON.stringify(payload));
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
