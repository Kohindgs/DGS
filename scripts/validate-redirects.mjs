import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const redirectsFile = path.join(ROOT, "data/migration/redirects.approved.json");
const tier0File = path.join(ROOT, "data/migration/tier0-routes.json");

const registry = JSON.parse(await readFile(redirectsFile, "utf8"));
const tier0 = JSON.parse(await readFile(tier0File, "utf8"));

const redirects = registry.redirects || [];
const tier0Paths = new Set(tier0.routes.map((item) => normalizePath(item.path)));
const errors = [];
const sources = new Set();

for (const redirect of redirects) {
  const source = normalizePath(redirect.source);
  const destination = normalizePath(redirect.destination);
  const statusCode = Number(redirect.statusCode || 301);

  if (!redirect.source || !redirect.destination) errors.push("Redirect entries require source and destination.");
  if (!String(redirect.source || "").startsWith("/")) errors.push(`${redirect.source}: source must be a same-site path.`);
  if (!String(redirect.destination || "").startsWith("/")) errors.push(`${redirect.source}: destination must be a same-site path.`);
  if (![301, 308].includes(statusCode)) errors.push(`${source}: statusCode must be 301 or 308.`);
  if (source === destination) errors.push(`${source}: source and destination are identical.`);
  if (sources.has(source)) errors.push(`${source}: duplicate redirect source.`);
  if (tier0Paths.has(source)) errors.push(`${source}: Tier-0 ranking-protected URL cannot be redirected during migration.`);

  sources.add(source);
}

for (const redirect of redirects) {
  const source = normalizePath(redirect.source);
  const destination = normalizePath(redirect.destination);
  if (sources.has(destination)) {
    errors.push(`${source}: destination ${destination} is another redirect source; redirect chains are not allowed.`);
  }
}

console.log(
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      redirectCount: redirects.length,
      tier0ProtectedRoutes: tier0Paths.size,
      errors,
    },
    null,
    2,
  ),
);

if (errors.length) process.exitCode = 1;

function normalizePath(input) {
  if (!input) return "";
  const url = new URL(input, "https://www.dgeniussolutions.com");
  let pathname = url.pathname || "/";
  if (pathname !== "/" && !pathname.endsWith("/")) pathname += "/";
  return pathname + url.search;
}
