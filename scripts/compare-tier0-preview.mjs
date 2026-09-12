import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { expectsStagingNoindex } from "./lib/migration-audit-shared.mjs";
import {
  auditRankingProtectedRoute,
  auditSeoMumbaiRoute,
  loadRankingProtectionContext,
} from "./lib/tier0-preview-audit.mjs";
import { normalizePath } from "./lib/tier0-parity-compare.mjs";

const ROOT = process.cwd();
const TARGET = new URL(process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3000");
const OUT_DIR = path.join(ROOT, "data/audit/target");

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function fetchSitemapPaths() {
  const res = await fetch(new URL("/sitemap.xml", TARGET), {
    headers: { Accept: "application/xml,text/xml,*/*" },
  });
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => normalizePath(m[1], TARGET));
}

const [tier0, contentBaseline] = await Promise.all([
  readJson(path.join(ROOT, "data/migration/tier0-routes.json")),
  readJson(path.join(ROOT, "data/migration/tier0-content-baseline.generated.json")),
]);
const rankingContext = await loadRankingProtectionContext();
const sourceByPath = new Map(contentBaseline.baselines.map((item) => [item.path, item]));
const sitemapPaths = await fetchSitemapPaths();

const reports = [];
const failures = [];
const expectedStaging = [];
const realFailures = [];
const informationalFindings = [];

for (const route of tier0.routes) {
  const url = new URL(route.path, TARGET);
  const response = await fetch(url, {
    redirect: "manual",
    headers: { Accept: "text/html,*/*", "User-Agent": "DGS-Tier0-Preview/1.0" },
  });
  const html = await response.text();

  let audit;
  if (rankingContext.protectedPaths.has(route.path)) {
    const snapshot = rankingContext.frozenBaseline.routes[route.path];
    audit = await auditRankingProtectedRoute({
      routePath: route.path,
      snapshot,
      html,
      response,
      sitemapPaths,
      approvedRestorations: rankingContext.approvedRestorations,
      target: TARGET,
    });
  } else if (route.path === "/services/seo-services-in-mumbai/") {
    audit = await auditSeoMumbaiRoute({
      route,
      source: sourceByPath.get(route.path),
      html,
      response,
      target: TARGET,
    });
  } else {
    continue;
  }

  const itemFailures = [];
  const recordRouteFailure = (finding) => {
    const message = `[${finding.class}] ${finding.label}: ${finding.detail}`;
    itemFailures.push(message);
    failures.push(`${route.path}: ${message}`);
    if (finding.class === "A") expectedStaging.push(`${route.path}: ${message}`);
    else if (finding.class === "B" || finding.class === "C") informationalFindings.push(`${route.path}: ${message}`);
    else realFailures.push(`${route.path}: ${message}`);
  };

  for (const finding of audit.findings) recordRouteFailure(finding);

  reports.push({
    path: route.path,
    authority: rankingContext.protectedPaths.has(route.path) ? "ranking-protection-baseline" : "tier0-content-baseline",
    status: response.status,
    passed: audit.passed,
    findings: audit.findings,
    failures: itemFailures,
  });
}

const output = {
  checkedAt: new Date().toISOString(),
  target: TARGET.origin,
  expectStagingNoindex: expectsStagingNoindex(),
  rankingBaselineDigest: rankingContext.integrity.overallSha256,
  reports,
  failures,
  expectedStagingFailures: expectedStaging,
  informationalFindings,
  realFailures,
  findingsByClass: {
    D: realFailures.filter((item) => item.includes("[D]")),
    E: realFailures.filter((item) => item.includes("[E]")),
    F: realFailures.filter((item) => item.includes("[F]")),
  },
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "tier0-parity.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      target: TARGET.origin,
      protectedPages: reports.length,
      expectStagingNoindex: expectsStagingNoindex(),
      expectedStagingFailures: expectedStaging,
      informationalFindings,
      realFailures,
      findingsByClass: output.findingsByClass,
      failures,
    },
    null,
    2,
  ),
);

if (realFailures.length) process.exitCode = 1;
