import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const MIGRATION_DIR = path.join(ROOT, "data/migration");
const TARGET_DIR = path.join(ROOT, "data/audit/target");
const AUDIT_DIR = path.join(ROOT, "data/audit");
const required = [
  ["route parity", path.join(MIGRATION_DIR, "route-parity-v2.generated.json")],
  ["indexability manifest", path.join(MIGRATION_DIR, "indexability-manifest.generated.json")],
  ["source defects", path.join(MIGRATION_DIR, "source-defects.json")],
  ["defect resolutions", path.join(MIGRATION_DIR, "defect-resolutions.approved.json")],
  ["Tier-0 target parity", path.join(TARGET_DIR, "tier0-parity.json")],
  ["ranking protection report", path.join(AUDIT_DIR, "ranking-protection-report.json")],
];

const errors = [];
const loaded = {};

const rankingRun = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-ranking-protection.mjs")],
  { cwd: ROOT, env: process.env, encoding: "utf8" },
);
if (rankingRun.status !== 0) {
  errors.push("Ranking protection release blocker failed");
  if (rankingRun.stdout) errors.push(rankingRun.stdout.trim());
  if (rankingRun.stderr) errors.push(rankingRun.stderr.trim());
}

for (const [label, file] of required) {
  try {
    loaded[label] = JSON.parse(await readFile(file, "utf8"));
  } catch {
    errors.push(`Missing or unreadable ${label}: ${file}`);
  }
}

if (!errors.length) {
  const parity = loaded["route parity"];
  const indexability = loaded["indexability manifest"];
  const sourceDefects = loaded["source defects"];
  const resolutions = loaded["defect resolutions"];
  const targetParity = loaded["Tier-0 target parity"];
  const rankingProtection = loaded["ranking protection report"];

  if (rankingProtection && rankingProtection.passed !== true) {
    errors.push(
      `Ranking protection blocker: ${(rankingProtection.blockingFailures || []).length} unexplained failures`,
    );
  }

  const unresolvedRoutes = indexability.routes.filter((route) => !route.deployable);
  if (unresolvedRoutes.length) errors.push(`${unresolvedRoutes.length} routes still require an approved migration/indexability decision`);

  const protectedRoutes = parity.routes.filter((route) => route.protected);
  for (const route of protectedRoutes) {
    const target = indexability.routes.find((item) => item.path === route.path);
    if (!target) errors.push(`${route.path}: protected route missing from indexability manifest`);
    else {
      if (!target.indexable) errors.push(`${route.path}: protected route is not indexable`);
      if (!target.includeInSitemap) errors.push(`${route.path}: protected route is not in sitemap`);
      if (target.canonicalPath !== route.path) errors.push(`${route.path}: protected route is not self-canonical`);
      if (target.redirectTo) errors.push(`${route.path}: protected route has a redirect target`);
    }
  }

  if ((targetParity.realFailures || targetParity.failures || []).length) {
    const realCount = (targetParity.realFailures || targetParity.failures || []).length;
    errors.push(`Tier-0 target parity has ${realCount} failures`);
  }

  const requiredSeverities = new Set(["critical-migration", "technical-seo", "semantic-html", "redirect"]);
  const resolutionById = new Map((resolutions.resolutions || []).map((item) => [item.id, item]));
  for (const finding of sourceDefects.findings || []) {
    if (!requiredSeverities.has(finding.severity)) continue;
    const resolution = resolutionById.get(finding.id);
    if (!resolution?.approved) errors.push(`${finding.id}: source defect has no approved resolution`);
    else if (!resolution.action || !resolution.evidence) errors.push(`${finding.id}: approved resolution needs action and evidence`);
  }
}

if (errors.length) {
  console.error(JSON.stringify({ ready: false, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ready: true, message: "Core route/search migration gates passed. Forms, analytics, media, accessibility and performance still require their own launch gates." }, null, 2));
}
