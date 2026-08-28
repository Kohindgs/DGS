import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT_DIR = path.join(ROOT, "data/audit/live");
const WP_DIR = path.join(ROOT, "data/wordpress/inventory");
const OUT_DIR = path.join(ROOT, "data/migration");

const [pages, wpRoutes, edges, tier0] = await Promise.all([
  readJson(path.join(AUDIT_DIR, "pages-v2.json")),
  readJson(path.join(WP_DIR, "routes.json")),
  readJson(path.join(AUDIT_DIR, "internal-links-v2.json")),
  readJson(path.join(OUT_DIR, "tier0-routes.json")),
]);

const protectedByPath = new Map(tier0.routes.map((route) => [cleanPath(route.path), route]));
const wpByPath = new Map(wpRoutes.map((item) => [cleanPath(item.path), item]));
const inbound = new Map();
const outbound = new Map();
for (const edge of edges) {
  const from = cleanPath(edge.from);
  const to = cleanPath(edge.to);
  inbound.set(to, (inbound.get(to) || 0) + 1);
  outbound.set(from, (outbound.get(from) || 0) + 1);
}

const records = [];
const seen = new Set();
for (const page of pages) {
  const sourcePath = cleanPath(page.sourcePath || new URL(page.sourceUrl).pathname);
  const finalPath = cleanPath(page.finalPath || new URL(page.finalUrl).pathname);
  const protectedRoute = protectedByPath.get(sourcePath) || protectedByPath.get(finalPath) || null;
  const wp = wpByPath.get(sourcePath) || wpByPath.get(finalPath) || null;
  const redirectHops = Math.max(0, (page.redirectChain?.length || 1) - 1);
  let proposedAction = "REVIEW";
  let reason = "Requires migration review.";

  if (protectedRoute) {
    proposedAction = "PROTECTED_KEEP_SAME_URL";
    reason = "Release-blocking protected route. Preserve public path and search intent even if the source sitemap/canonical implementation is defective.";
  } else if (page.resourceType !== "html") {
    proposedAction = "NON_HTML_RESOURCE_REVIEW";
    reason = "Machine-readable or non-HTML resource. Preserve only if its functional/search role is verified; HTML SEO rules do not apply.";
  } else if (redirectHops > 0) {
    proposedAction = "REDIRECT_REVIEW";
    reason = "Existing redirect detected. Do not copy blindly; approve a direct one-hop destination if the legacy source has value.";
  } else if (page.status === 200 && sourcePath === finalPath && page.indexable) {
    proposedAction = "KEEP_SAME_URL";
    reason = "Live indexable 200 route. Preserve by default until route-level review says otherwise.";
  } else if (page.status === 200 && !page.indexable) {
    proposedAction = "NOINDEX_REVIEW";
    reason = "Live 200 HTML route is currently non-indexable; verify intent before migration.";
  } else if (page.status === 404 || page.status === 410) {
    proposedAction = "RETIRE_REVIEW";
    reason = "Live route is not found/gone; do not reintroduce without evidence.";
  }

  const record = {
    path: sourcePath,
    finalPath,
    protected: Boolean(protectedRoute),
    protectedLabel: protectedRoute?.label || null,
    status: page.status,
    resourceType: page.resourceType,
    sitemapMember: Boolean(page.sitemapMember),
    sitemapGap: Boolean(protectedRoute && !page.sitemapMember),
    indexable: page.indexable,
    title: page.title || null,
    h1s: page.h1s || [],
    canonical: page.canonical || null,
    desiredCanonicalPath: protectedRoute?.desiredCanonicalPath || (protectedRoute ? protectedRoute.path : null),
    robots: page.robots || null,
    redirectHops,
    inboundInternalLinks: inbound.get(sourcePath) || inbound.get(finalPath) || 0,
    outboundInternalLinks: outbound.get(sourcePath) || outbound.get(finalPath) || 0,
    wordpress: wp ? { id: wp.id, type: wp.type, slug: wp.slug, status: wp.status, modified: wp.modified } : null,
    proposedAction,
    reason,
  };
  records.push(record);
  seen.add(sourcePath);
  seen.add(finalPath);
}

for (const wp of wpRoutes) {
  const wpPath = cleanPath(wp.path);
  if (seen.has(wpPath)) continue;
  const protectedRoute = protectedByPath.get(wpPath) || null;
  records.push({
    path: wpPath,
    finalPath: null,
    protected: Boolean(protectedRoute),
    protectedLabel: protectedRoute?.label || null,
    status: null,
    resourceType: "unknown",
    sitemapMember: false,
    sitemapGap: Boolean(protectedRoute),
    indexable: null,
    title: null,
    h1s: [],
    canonical: null,
    desiredCanonicalPath: protectedRoute?.desiredCanonicalPath || (protectedRoute ? protectedRoute.path : null),
    robots: null,
    redirectHops: null,
    inboundInternalLinks: inbound.get(wpPath) || 0,
    outboundInternalLinks: outbound.get(wpPath) || 0,
    wordpress: { id: wp.id, type: wp.type, slug: wp.slug, status: wp.status, modified: wp.modified },
    proposedAction: protectedRoute ? "PROTECTED_KEEP_SAME_URL" : "PUBLISHED_NOT_IN_SITEMAP_REVIEW",
    reason: protectedRoute
      ? "Protected route exists in WordPress but was omitted from sitemap discovery; keep route and fix sitemap/canonical/indexability architecture."
      : "Published WordPress REST route was not found in the discovered sitemap crawl; classify before migration.",
  });
}

for (const route of tier0.routes) {
  const routePath = cleanPath(route.path);
  if (records.some((item) => item.path === routePath || item.finalPath === routePath)) continue;
  records.push({
    path: routePath,
    finalPath: routePath,
    protected: true,
    protectedLabel: route.label,
    status: null,
    resourceType: "unknown",
    sitemapMember: false,
    sitemapGap: true,
    indexable: null,
    title: null,
    h1s: [],
    canonical: null,
    desiredCanonicalPath: route.desiredCanonicalPath || route.path,
    robots: null,
    redirectHops: null,
    inboundInternalLinks: inbound.get(routePath) || 0,
    outboundInternalLinks: outbound.get(routePath) || 0,
    wordpress: null,
    proposedAction: "PROTECTED_KEEP_SAME_URL",
    reason: "Tier-0 registry overrides incomplete source discovery. Protected route may not be removed or redirected without explicit approval.",
  });
}

records.sort((a, b) => a.path.localeCompare(b.path));
const summary = {
  generatedAt: new Date().toISOString(),
  totals: {
    routes: records.length,
    protected: records.filter((item) => item.protected).length,
    protectedSitemapGaps: records.filter((item) => item.protected && item.sitemapGap).length,
    keepSameUrl: records.filter((item) => item.proposedAction === "KEEP_SAME_URL").length,
    protectedKeepSameUrl: records.filter((item) => item.proposedAction === "PROTECTED_KEEP_SAME_URL").length,
    redirectReview: records.filter((item) => item.proposedAction === "REDIRECT_REVIEW").length,
    publishedNotInSitemapReview: records.filter((item) => item.proposedAction === "PUBLISHED_NOT_IN_SITEMAP_REVIEW").length,
    nonHtmlReview: records.filter((item) => item.proposedAction === "NON_HTML_RESOURCE_REVIEW").length,
    noindexReview: records.filter((item) => item.proposedAction === "NOINDEX_REVIEW").length,
    retireReview: records.filter((item) => item.proposedAction === "RETIRE_REVIEW").length,
    otherReview: records.filter((item) => item.proposedAction === "REVIEW").length,
  },
  warning: "Generated actions are audit recommendations only. Protected routes override source defects. No redirect, retirement, noindex or URL change is authorized by this generated file.",
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "route-parity-v2.generated.json"), `${JSON.stringify({ summary, routes: records }, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));

function cleanPath(input) {
  try {
    const url = new URL(input, "https://www.dgeniussolutions.com");
    let pathname = url.pathname || "/";
    if (pathname !== "/" && !pathname.endsWith("/") && !/\.[a-z0-9]{1,8}$/i.test(pathname)) pathname += "/";
    return pathname;
  } catch {
    return input;
  }
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}
