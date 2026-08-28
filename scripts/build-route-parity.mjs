import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT_DIR = path.join(ROOT, "data/audit/live");
const WP_DIR = path.join(ROOT, "data/wordpress/inventory");
const OUT_DIR = path.join(ROOT, "data/migration");

const [sitemapPages, tier0Audit, wpRoutes, edges] = await Promise.all([
  readJson(path.join(AUDIT_DIR, "pages.json")),
  readOptionalJson(path.join(AUDIT_DIR, "tier0-pages.json"), { pages: [] }),
  readJson(path.join(WP_DIR, "routes.json")),
  readJson(path.join(AUDIT_DIR, "internal-links.json")),
]);

function cleanPath(input) {
  try {
    const url = new URL(input, "https://www.dgeniussolutions.com");
    let pathname = url.pathname || "/";
    if (pathname !== "/" && !pathname.endsWith("/")) pathname += "/";
    return pathname;
  } catch {
    return input;
  }
}

function pageRecordFromTier0(item) {
  return {
    sourceUrl: new URL(item.path, "https://www.dgeniussolutions.com").href,
    finalUrl: item.finalUrl,
    status: item.status,
    redirectChain: [],
    title: item.title,
    h1s: item.h1s || [],
    canonical: item.canonical || "",
    robots: item.robots || "",
    indexable: item.status === 200 && !/noindex/i.test(item.robots || ""),
    directTier0Audit: true,
  };
}

const pageByPath = new Map();
for (const page of sitemapPages) {
  const pathKey = cleanPath(page.sourceUrl || page.finalUrl);
  pageByPath.set(pathKey, page);
}

for (const item of tier0Audit.pages || []) {
  const pathKey = cleanPath(item.path);
  if (!pageByPath.has(pathKey) || item.status === 200) {
    pageByPath.set(pathKey, pageRecordFromTier0(item));
  }
}

const pages = [...pageByPath.values()];
const wpByPath = new Map(wpRoutes.map((item) => [cleanPath(item.path), item]));
const inbound = new Map();
const outbound = new Map();

for (const edge of edges) {
  const from = cleanPath(edge.from);
  const to = cleanPath(edge.to);
  inbound.set(to, (inbound.get(to) || 0) + 1);
  outbound.set(from, (outbound.get(from) || 0) + 1);
}

const records = pages.map((page) => {
  const sourcePath = cleanPath(new URL(page.sourceUrl).pathname);
  const finalPath = cleanPath(new URL(page.finalUrl || page.sourceUrl).pathname);
  const wp = wpByPath.get(sourcePath) || wpByPath.get(finalPath) || null;
  const redirectHops = Math.max(0, (page.redirectChain?.length || 1) - 1);

  let proposedAction = "REVIEW";
  let reason = "Requires migration review.";

  if (page.status === 200 && sourcePath === finalPath && page.indexable) {
    proposedAction = "KEEP_SAME_URL";
    reason = page.directTier0Audit
      ? "Protected route verified directly as live indexable 200. Preserve the public URL even if the legacy sitemap omits it; fix sitemap/canonical defects in Next.js rather than reproducing them."
      : "Live indexable 200 route; preserve route exactly unless explicitly approved otherwise.";
  } else if (redirectHops > 0) {
    proposedAction = "REDIRECT_REVIEW";
    reason = "Existing redirect detected. Do not copy blindly; verify whether the source URL has backlinks, traffic or historical value and normalize to a one-hop redirect if retained.";
  } else if (page.status === 200 && !page.indexable) {
    proposedAction = "NOINDEX_REVIEW";
    reason = "Live 200 route is currently non-indexable; verify intent before migration.";
  } else if (page.status === 404 || page.status === 410) {
    proposedAction = "RETIRE_REVIEW";
    reason = "Live route is not found/gone; do not reintroduce without evidence.";
  }

  return {
    path: sourcePath,
    finalPath,
    status: page.status,
    indexable: page.indexable,
    title: page.title,
    h1s: page.h1s,
    canonical: page.canonical,
    robots: page.robots,
    redirectHops,
    directTier0Audit: Boolean(page.directTier0Audit),
    inboundInternalLinks: inbound.get(sourcePath) || inbound.get(finalPath) || 0,
    outboundInternalLinks: outbound.get(sourcePath) || outbound.get(finalPath) || 0,
    wordpress: wp
      ? { id: wp.id, type: wp.type, slug: wp.slug, status: wp.status, modified: wp.modified }
      : null,
    proposedAction,
    reason,
  };
});

for (const wp of wpRoutes) {
  const wpPath = cleanPath(wp.path);
  if (!records.some((item) => item.path === wpPath || item.finalPath === wpPath)) {
    records.push({
      path: wpPath,
      finalPath: null,
      status: null,
      indexable: null,
      title: null,
      h1s: [],
      canonical: null,
      robots: null,
      redirectHops: null,
      directTier0Audit: false,
      inboundInternalLinks: inbound.get(wpPath) || 0,
      outboundInternalLinks: outbound.get(wpPath) || 0,
      wordpress: { id: wp.id, type: wp.type, slug: wp.slug, status: wp.status, modified: wp.modified },
      proposedAction: "REST_ONLY_REVIEW",
      reason: "WordPress REST route was not found in the discovered sitemap crawl or Tier-0 direct audit; investigate indexability, canonicalization, orphaning or sitemap omission.",
    });
  }
}

records.sort((a, b) => a.path.localeCompare(b.path));

const summary = {
  generatedAt: new Date().toISOString(),
  totals: {
    routes: records.length,
    keepSameUrl: records.filter((item) => item.proposedAction === "KEEP_SAME_URL").length,
    redirectReview: records.filter((item) => item.proposedAction === "REDIRECT_REVIEW").length,
    noindexReview: records.filter((item) => item.proposedAction === "NOINDEX_REVIEW").length,
    restOnlyReview: records.filter((item) => item.proposedAction === "REST_ONLY_REVIEW").length,
    directTier0Audits: records.filter((item) => item.directTier0Audit).length,
    otherReview: records.filter((item) => item.proposedAction === "REVIEW").length,
  },
  warning: "Generated actions are audit recommendations only. No redirect, retirement, noindex or URL change is authorized by this file.",
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "route-parity.generated.json"), `${JSON.stringify({ summary, routes: records }, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function readOptionalJson(file, fallback) {
  try {
    return await readJson(file);
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}
