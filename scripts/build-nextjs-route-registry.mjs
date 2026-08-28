import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const WP_NORM = path.join(ROOT, "data/wordpress/normalized");
const MIGRATION = path.join(ROOT, "data/migration");
const AUDIT = path.join(ROOT, "data/audit/live");
const OUT = path.join(ROOT, "data/migration");

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

const [pages, services, posts, pagesV2, tier0, parity, routeDecisionsFile] = await Promise.all([
  readJson(path.join(WP_NORM, "pages.json")),
  readJson(path.join(WP_NORM, "services.json")),
  readJson(path.join(WP_NORM, "posts.json")),
  readJson(path.join(AUDIT, "pages-v2.json")),
  readJson(path.join(MIGRATION, "tier0-routes.json")),
  readJson(path.join(MIGRATION, "route-parity-v2.generated.json")),
  readJson(path.join(MIGRATION, "route-decisions.approved.json")),
]);

const allWp = [...pages, ...services, ...posts];
const wpByPath = new Map(allWp.map((item) => [item.path, item]));

const liveByPath = new Map();
for (const page of pagesV2) {
  const path = page.sourcePath || new URL(page.sourceUrl).pathname;
  if (!liveByPath.has(path)) {
    liveByPath.set(path, page);
  }
}

const tier0ByPath = new Map(tier0.routes.map((r) => [r.path, r]));
const parityByPath = new Map(parity.routes.map((r) => [r.path, r]));
const decisionsByPath = new Map((routeDecisionsFile.decisions || []).map((item) => [item.path, item]));

function isPublishedBlogCandidate(wp, parityRoute) {
  return wp?.type === "post" && wp?.status === "publish" && parityRoute?.proposedAction === "PUBLISHED_NOT_IN_SITEMAP_REVIEW";
}

const registry = [];
for (const [path, wp] of wpByPath) {
  const live = liveByPath.get(path);
  const t0 = tier0ByPath.get(path);
  const parityRoute = parityByPath.get(path);

  let proposedAction = "KEEP_SAME_URL";
  if (t0) {
    proposedAction = "PROTECTED";
  } else if (parityRoute?.proposedAction) {
    proposedAction = isPublishedBlogCandidate(wp, parityRoute) ? "KEEP_SAME_URL" : parityRoute.proposedAction;
  } else if (live && live.redirectChain && live.redirectChain.length > 1) {
    proposedAction = "REDIRECT_REVIEW";
  } else if (live && live.status === 404) {
    proposedAction = "RETIRE_REVIEW";
  } else if (live && live.status === 200 && !live.indexable) {
    proposedAction = "NOINDEX_REVIEW";
  }

  const canonical = live?.canonical || "";
  let canonicalMismatch = false;
  if (t0 && canonical) {
    const desired = new URL(t0.desiredCanonicalPath || t0.path, "https://www.dgeniussolutions.com").pathname;
    const actual = new URL(canonical, "https://www.dgeniussolutions.com").pathname;
    canonicalMismatch = actual !== desired;
  }

  const isReviewRequired = proposedAction !== "KEEP_SAME_URL" && proposedAction !== "PROTECTED";

  registry.push({
    path,
    wordpressId: wp.id,
    wordpressType: wp.type,
    slug: wp.slug,
    status: live?.status || null,
    title: live?.title || wp.title || null,
    description: live?.description || null,
    h1: live?.h1s?.[0] || wp.headings?.find((h) => h.level === "h1")?.text || null,
    canonical: canonical || null,
    canonicalMismatch,
    desiredCanonicalPath: t0?.desiredCanonicalPath || (t0 ? t0.path : null),
    robots: live?.robots || null,
    indexable: isReviewRequired ? false : (live?.indexable ?? true),
    includeInSitemap: isReviewRequired ? false : (t0 ? true : (live?.sitemapMember ?? true)),
    protected: Boolean(t0),
    protectedLabel: t0?.label || null,
    proposedAction,
    date: wp.date || null,
    modified: wp.modified,
    headings: live?.headings || wp.headings || [],
    faqItems: extractFaqs(live?.headings || []),
  });
}

for (const entry of registry) {
  const decision = decisionsByPath.get(entry.path);
  if (!decision?.approved) continue;
  entry.indexable = decision.indexable;
  entry.includeInSitemap = decision.includeInSitemap;
  if (decision.canonicalPath) {
    entry.canonical = `https://www.dgeniussolutions.com${decision.canonicalPath}`;
  }
  if (decision.classification === "RETIRED_GONE") {
    entry.proposedAction = "RETIRE_REVIEW";
    entry.indexable = false;
    entry.includeInSitemap = false;
  } else if (decision.indexable === false) {
    entry.proposedAction = "KEEP_SAME_URL";
  }
}

registry.sort((a, b) => a.path.localeCompare(b.path));

  const seen = new Set(registry.map((r) => r.path));
  for (const route of parity.routes) {
    const path = route.path;
    if (seen.has(path)) continue;
    if (route.proposedAction !== "KEEP_SAME_URL" && route.proposedAction !== "PROTECTED") continue;
    if (route.status === 404 || route.status === 410) continue;

    registry.push({
      path,
      wordpressId: route.wordpress?.id || null,
      wordpressType: route.wordpress?.type || "page",
      slug: route.wordpress?.slug || path.split("/").filter(Boolean).join("-") || "",
      status: route.status,
      title: route.title,
      description: liveByPath.get(path)?.description || null,
      h1: route.h1s?.[0] || null,
      canonical: route.canonical,
      canonicalMismatch: route.canonicalMismatch || false,
      desiredCanonicalPath: route.desiredCanonicalPath,
      robots: route.robots,
      indexable: route.indexable ?? true,
      includeInSitemap: route.protected ? true : (route.sitemapMember ?? true),
      protected: route.protected,
      protectedLabel: route.protectedLabel,
      proposedAction: route.proposedAction,
      modified: route.wordpress?.modified || null,
      headings: route.headings || [],
      faqItems: route.faqItems || [],
    });
    seen.add(path);
  }

await mkdir(OUT, { recursive: true });
await writeFile(
  path.join(OUT, "nextjs-route-registry.generated.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), routes: registry }, null, 2)}\n`,
  "utf8"
);

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  total: registry.length,
  protected: registry.filter((r) => r.protected).length,
  keepSameUrl: registry.filter((r) => r.proposedAction === "KEEP_SAME_URL").length,
  protectedKeep: registry.filter((r) => r.proposedAction === "PROTECTED").length,
  redirectReview: registry.filter((r) => r.proposedAction === "REDIRECT_REVIEW").length,
  retireReview: registry.filter((r) => r.proposedAction === "RETIRE_REVIEW").length,
  noindexReview: registry.filter((r) => r.proposedAction === "NOINDEX_REVIEW").length,
  canonicalMismatch: registry.filter((r) => r.canonicalMismatch).length,
}, null, 2));

function extractFaqs(headings) {
  const faqs = [];
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    if (h.level === "h2" && /faq|question|frequently asked/i.test(h.text)) {
      const answerHeadings = headings.slice(i + 1).filter((x) => x.level === "h3");
      for (const a of answerHeadings.slice(0, 10)) {
        faqs.push({ question: a.text, answer: "" });
      }
    }
  }
  return faqs;
}
