import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MIGRATION_DIR = path.join(ROOT, "data/migration");
const [tier0, redirectsFile, decisionsFile] = await Promise.all([
  readJson(path.join(MIGRATION_DIR, "tier0-routes.json")),
  readJson(path.join(MIGRATION_DIR, "redirects.approved.json")),
  readJson(path.join(MIGRATION_DIR, "route-decisions.approved.json")),
]);

const errors = [];
const protectedPaths = new Set(tier0.routes.map((route) => route.path));
const redirects = redirectsFile.redirects || [];
const decisions = decisionsFile.decisions || [];

const redirectSources = new Map();
for (const redirect of redirects) {
  if (!redirect.source || !redirect.destination) errors.push("Every approved redirect needs source and destination.");
  if (![301, 302, 303, 307, 308].includes(redirect.statusCode)) errors.push(`${redirect.source}: unsupported redirect status ${redirect.statusCode}`);
  if (redirect.source === redirect.destination) errors.push(`${redirect.source}: redirect source equals destination`);
  if (redirectSources.has(redirect.source)) errors.push(`${redirect.source}: duplicate approved redirect source`);
  redirectSources.set(redirect.source, redirect.destination);
  if (protectedPaths.has(redirect.source)) errors.push(`${redirect.source}: protected Tier-0 route may not be a redirect source`);
}

for (const redirect of redirects) {
  if (redirectSources.has(redirect.destination)) errors.push(`${redirect.source}: redirect chain detected through ${redirect.destination}`);
}

for (const route of tier0.routes) {
  const desired = route.desiredCanonicalPath || route.path;
  if (desired !== route.path && route.canonicalExceptionApproved !== true) {
    errors.push(`${route.path}: protected canonical exception is not explicitly approved`);
  }
}

for (const decision of decisions) {
  if (!protectedPaths.has(decision.path)) continue;
  if (decision.approved !== true) continue;
  if (decision.indexable === false) errors.push(`${decision.path}: protected route cannot be approved as noindex`);
  if (decision.includeInSitemap === false) errors.push(`${decision.path}: protected route cannot be approved outside the sitemap`);
  if (decision.redirectTo) errors.push(`${decision.path}: protected route cannot be approved as a redirect source`);
  if (decision.canonicalPath && decision.canonicalPath !== decision.path && decision.canonicalExceptionApproved !== true) {
    errors.push(`${decision.path}: protected route cannot canonicalize elsewhere without an explicit exception`);
  }
}

if (errors.length) {
  console.error(JSON.stringify({ valid: false, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ valid: true, protectedRoutes: protectedPaths.size, approvedRedirects: redirects.length, approvedRouteDecisions: decisions.length }, null, 2));
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}
