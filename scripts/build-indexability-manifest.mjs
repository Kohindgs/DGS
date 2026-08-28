import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MIGRATION_DIR = path.join(ROOT, "data/migration");
const parity = await readJson(path.join(MIGRATION_DIR, "route-parity-v2.generated.json"));
const approved = await readJson(path.join(MIGRATION_DIR, "route-decisions.approved.json"));
const decisions = new Map((approved.decisions || []).map((item) => [item.path, item]));

const routes = parity.routes.map((route) => {
  const explicit = decisions.get(route.path) || null;
  if (route.protected) {
    return {
      path: route.path,
      classification: "PROTECTED_INDEXABLE",
      deployable: true,
      indexable: true,
      includeInSitemap: true,
      canonicalPath: route.desiredCanonicalPath || route.path,
      redirectTo: null,
      reason: "Tier-0 protected route. Source defects must be corrected without removing the route.",
      sourceSitemapGap: route.sitemapGap,
    };
  }

  if (explicit) {
    return {
      path: route.path,
      classification: explicit.classification,
      deployable: explicit.approved === true,
      indexable: explicit.indexable,
      includeInSitemap: explicit.includeInSitemap,
      canonicalPath: explicit.canonicalPath || (explicit.indexable ? route.path : null),
      redirectTo: explicit.redirectTo || null,
      reason: explicit.reason || "Explicit route decision.",
      sourceSitemapGap: !route.sitemapMember,
    };
  }

  if (route.proposedAction === "KEEP_SAME_URL") {
    return {
      path: route.path,
      classification: "PRESERVE_INDEXABLE_SOURCE",
      deployable: true,
      indexable: true,
      includeInSitemap: true,
      canonicalPath: route.path,
      redirectTo: null,
      reason: "Indexable 200 source route; preserve until a reviewed decision supersedes it.",
      sourceSitemapGap: false,
    };
  }

  return {
    path: route.path,
    classification: "REVIEW_REQUIRED",
    deployable: false,
    indexable: null,
    includeInSitemap: null,
    canonicalPath: null,
    redirectTo: null,
    reason: route.reason,
    sourceSitemapGap: !route.sitemapMember,
  };
});

const summary = {
  generatedAt: new Date().toISOString(),
  totals: {
    routes: routes.length,
    deployable: routes.filter((item) => item.deployable).length,
    reviewRequired: routes.filter((item) => !item.deployable).length,
    protected: routes.filter((item) => item.classification === "PROTECTED_INDEXABLE").length,
    sitemap: routes.filter((item) => item.includeInSitemap === true).length,
    noindex: routes.filter((item) => item.indexable === false).length,
    redirects: routes.filter((item) => Boolean(item.redirectTo)).length,
  },
};

await mkdir(MIGRATION_DIR, { recursive: true });
await writeFile(path.join(MIGRATION_DIR, "indexability-manifest.generated.json"), `${JSON.stringify({ summary, routes }, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}
