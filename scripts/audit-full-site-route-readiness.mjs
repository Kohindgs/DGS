#!/usr/bin/env node
/**
 * Phase 1 full-site route readiness audit.
 * Builds complete URL inventory, classifies every WordPress URL, and checks retained routes.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  MIGRATION_CLASSES,
  VISUAL_STATUSES,
  cleanPath,
  classifyMigration,
  classifyVisualMirror,
  fetchRoute,
  auditRetainedHtml,
  contentStatusFor,
} from "./lib/full-site-route-audit.mjs";
import { loadTechnicalLinkCorrections } from "./lib/technical-link-corrections.mjs";
import { createProbeCache, validateInternalLink, isBrokenLinkClassification } from "./lib/media-link-audit.mjs";
import { deduplicatedGlobalChromeInternalLinks } from "./lib/global-chrome-links.mjs";

const ROOT = process.cwd();
const TARGET = new URL(process.env.MIGRATION_TARGET_URL || "https://dimgrey-goat-473970.hostingersite.com");
const OUT_PATH = path.join(ROOT, "data/audit/full-site-route-readiness.json");

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

const [
  wpRoutes,
  registry,
  parity,
  redirectsFile,
  retiredFile,
  indexability,
  templateMap,
  contentBlocksFile,
  tier0,
  livePages,
  routeDecisionsFile,
] = await Promise.all([
  readJson(path.join(ROOT, "data/wordpress/inventory/routes.json")),
  readJson(path.join(ROOT, "data/migration/nextjs-route-registry.generated.json")),
  readJson(path.join(ROOT, "data/migration/route-parity-v2.generated.json")),
  readJson(path.join(ROOT, "data/migration/redirects.approved.json")),
  readJson(path.join(ROOT, "data/migration/retired-routes.approved.json")),
  readJson(path.join(ROOT, "data/migration/indexability-manifest.generated.json")),
  readJson(path.join(ROOT, "data/migration/page-template-map.json")),
  readJson(path.join(ROOT, "data/wordpress/blocks/content-blocks.generated.json")),
  readJson(path.join(ROOT, "data/migration/tier0-routes.json")),
  readJson(path.join(ROOT, "data/audit/live/pages-v2.json")).catch(() => []),
  readJson(path.join(ROOT, "data/migration/route-decisions.approved.json")),
]);

const registryByPath = new Map(registry.routes.map((r) => [cleanPath(r.path), r]));
const parityByPath = new Map(parity.routes.map((r) => [cleanPath(r.path), r]));
const indexByPath = new Map(indexability.routes.map((r) => [cleanPath(r.path), r]));
const templateByPath = new Map(templateMap.routes.map((r) => [cleanPath(r.route), r]));
const blocksByPath = contentBlocksFile.blocks || {};
const redirectBySource = new Map(
  (redirectsFile.redirects || []).map((r) => [cleanPath(r.source), r]),
);
const retiredByPath = new Map((retiredFile.retired || []).map((r) => [cleanPath(r.path), r]));
const approvedByPath = new Map(
  (routeDecisionsFile.decisions || []).map((d) => [cleanPath(d.path), d]),
);
const liveByPath = new Map(
  (livePages || []).map((p) => [cleanPath(p.sourcePath || p.finalPath), p]),
);
const wpByPath = new Map(wpRoutes.map((r) => [cleanPath(r.path), r]));

const explicitNextRoutes = ["/portfolio/", "/services/"];
const explicitNonHtml = ["/robots.txt", "/sitemap.xml", "/llms.txt", "/llms-full.txt"];

const allPaths = new Set();
for (const p of [
  ...wpRoutes.map((r) => cleanPath(r.path)),
  ...registry.routes.map((r) => cleanPath(r.path)),
  ...parity.routes.map((r) => cleanPath(r.path)),
  ...redirectsFile.redirects.flatMap((r) => [cleanPath(r.source), cleanPath(r.destination)]),
  ...retiredFile.retired.map((r) => cleanPath(r.path)),
  ...explicitNextRoutes,
  ...explicitNonHtml,
  ...approvedByPath.keys(),
]) {
  if (p) allPaths.add(p);
}

const sitemapRes = await fetch(new URL("/sitemap.xml", TARGET), {
  headers: { Accept: "application/xml,text/xml,*/*" },
});
const sitemapXml = await sitemapRes.text();
const sitemapPaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) =>
  cleanPath(m[1], TARGET),
);

const technicalLinkCorrections = await loadTechnicalLinkCorrections();
const probeCache = createProbeCache();
let uniqueImagesChecked = 0;
let uniqueLinksChecked = 0;

const inventory = [];
const classCounts = Object.fromEntries(MIGRATION_CLASSES.map((c) => [c, 0]));
const visualCounts = Object.fromEntries(VISUAL_STATUSES.map((s) => [s, 0]));
const blockingFailures = [];
const contentFindings = [];
const retainedResults = [];

for (const routePath of [...allPaths].sort()) {
  const sources = [];
  if (wpByPath.has(routePath)) sources.push("wordpress");
  if (registryByPath.has(routePath)) sources.push("nextjs-route-registry");
  if (parityByPath.has(routePath)) sources.push("route-parity-v2");
  if (redirectBySource.has(routePath)) sources.push("redirect-registry");
  if (retiredByPath.has(routePath)) sources.push("retired-registry");
  if (indexByPath.has(routePath)) sources.push("indexability-manifest");
  if (templateByPath.has(routePath)) sources.push("page-template-map");
  if (blocksByPath[routePath]) sources.push("content-blocks");
  if (explicitNextRoutes.includes(routePath)) sources.push("explicit-next-route");
  if (explicitNonHtml.includes(routePath)) sources.push("explicit-next-route");
  if (approvedByPath.has(routePath)) sources.push("route-decisions");

  const redirect = redirectBySource.get(routePath) || null;
  const retired = retiredByPath.get(routePath) || null;
  const registryRoute = registryByPath.get(routePath) || null;
  const indexRoute = indexByPath.get(routePath) || null;
  const livePage = liveByPath.get(routePath) || null;
  const template = templateByPath.get(routePath)?.template || null;

  const approvedDecision = approvedByPath.get(routePath) || null;

  const migrationClass = classifyMigration({
    path: routePath,
    redirect,
    retired,
    registryRoute,
    indexability: indexRoute,
    livePage,
    approvedDecision,
  });
  classCounts[migrationClass] = (classCounts[migrationClass] || 0) + 1;

  const visualMirrorStatus = classifyVisualMirror(routePath, template, migrationClass);
  visualCounts[visualMirrorStatus] = (visualCounts[visualMirrorStatus] || 0) + 1;

  const entry = {
    path: routePath,
    migrationClass,
    sources,
    wordpress: wpByPath.get(routePath) || null,
    nextRegistry: registryRoute
      ? {
          wordpressId: registryRoute.wordpressId,
          wordpressType: registryRoute.wordpressType,
          proposedAction: registryRoute.proposedAction,
          protected: registryRoute.protected,
          indexable: registryRoute.indexable,
          includeInSitemap: registryRoute.includeInSitemap,
        }
      : null,
    redirect: redirect
      ? { destination: cleanPath(redirect.destination), statusCode: redirect.statusCode, reason: redirect.reason }
      : null,
    retired: retired ? { statusCode: retired.statusCode, reason: retired.reason } : null,
    indexability: indexRoute
      ? {
          classification: indexRoute.classification,
          indexable: indexRoute.indexable,
          includeInSitemap: indexRoute.includeInSitemap,
          canonicalPath: indexRoute.canonicalPath,
        }
      : null,
    template,
    visualMirrorStatus,
    contentStatus: "NOT_APPLICABLE",
    liveChecks: null,
    failures: [],
    warnings: [],
  };

  if (migrationClass === "301_REDIRECT" || migrationClass === "308_REDIRECT") {
    const { response } = await fetchRoute(TARGET, routePath, { followRedirects: false });
    const location = response.headers.get("location");
    const expected = cleanPath(redirect.destination, TARGET);
    const actualRaw = location ? cleanPath(location, TARGET) : "";
    const actual = actualRaw.replace(/\/index\.php\/?$/, "/");
    entry.liveChecks = { status: response.status, location: actualRaw };
    if (![301, 308, 302, 307].includes(response.status)) {
      entry.failures.push(`redirect HTTP ${response.status}`);
    } else if (actual !== expected && actualRaw !== expected) {
      entry.failures.push(`redirect destination ${actualRaw || "missing"} != expected ${expected}`);
    }
  } else if (migrationClass === "410_RETIRED") {
    const { response } = await fetchRoute(TARGET, routePath, { followRedirects: false });
    entry.liveChecks = { status: response.status };
    if (response.status !== 410) entry.failures.push(`expected HTTP 410, got ${response.status}`);
  } else if (migrationClass === "NON_HTML") {
    const { response } = await fetchRoute(TARGET, routePath, { followRedirects: true });
    entry.liveChecks = { status: response.status, contentType: response.headers.get("content-type") };
    if (response.status !== 200) entry.failures.push(`non-html route HTTP ${response.status}`);
  } else if (migrationClass === "200_RETAINED" || migrationClass === "NOINDEX_RETAINED") {
    const { response, html } = await fetchRoute(TARGET, routePath, { followRedirects: false });
    const audit = await auditRetainedHtml({
      path: routePath,
      html,
      response,
      registryRoute,
      indexability: indexRoute,
      approvedDecision,
      sitemapPaths,
      expectedBlocks: blocksByPath[routePath]?.blocks || [],
      target: TARGET,
      technicalLinkCorrections,
      probeCache,
    });
    uniqueImagesChecked += audit.checks.imageAudit?.checkedCount || 0;
    uniqueLinksChecked += audit.checks.linkAudit?.checkedCount || 0;
    entry.liveChecks = audit.checks;
    entry.failures.push(...audit.failures);
    entry.warnings.push(...audit.warnings);
    entry.contentStatus = contentStatusFor(
      routePath,
      migrationClass,
      audit.checks.content,
    );
    retainedResults.push({
      path: routePath,
      passed: entry.failures.length === 0,
      contentStatus: entry.contentStatus,
      visualMirrorStatus,
    });
  }

  if (entry.failures.length) {
    for (const failure of entry.failures) {
      blockingFailures.push(`${routePath}: ${failure}`);
    }
  }
  if (entry.warnings.some((w) => /content incomplete/i.test(w))) {
    contentFindings.push({
      path: routePath,
      contentStatus: entry.contentStatus,
      visualMirrorStatus: entry.visualMirrorStatus,
      details: entry.liveChecks?.content || null,
    });
  }

  inventory.push(entry);
}

const globalChromeLinks = deduplicatedGlobalChromeInternalLinks();
const globalChromeResults = await Promise.all(
  globalChromeLinks.map(async (link) => {
    const result = await validateInternalLink(link, TARGET, probeCache);
    return { ...link, ...result };
  }),
);
const globalChrome404 = globalChromeResults.filter((r) => r.classification === "404");
const globalChrome410 = globalChromeResults.filter((r) => r.classification === "410");
const globalChrome5xx = globalChromeResults.filter((r) => r.classification === "5XX");
const globalChromeAvoidableRedirects = globalChromeResults.filter(
  (r) => r.classification === "AVOIDABLE_INTERNAL_REDIRECT",
);
const globalChromeBroken = globalChromeResults.filter((r) => isBrokenLinkClassification(r.classification));
for (const broken of globalChromeBroken) {
  blockingFailures.push(`global-chrome ${broken.path}: ${broken.classification}`);
}

const unclassified = inventory.filter((item) => !MIGRATION_CLASSES.includes(item.migrationClass));
const retainedChecked = retainedResults.length;
const retainedPassing = retainedResults.filter((r) => r.passed).length;
const contentComplete = retainedResults.filter((r) => r.contentStatus === "CONTENT_COMPLETE").length;
const contentIncomplete = retainedResults.filter((r) => r.contentStatus === "CONTENT_INCOMPLETE").length;
const rankingProtected = retainedResults.filter((r) => r.contentStatus === "RANKING_PROTECTED").length;
const intentionallyNative = retainedResults.filter((r) => r.contentStatus === "INTENTIONALLY_NATIVE").length;
const contentReviewRequired = retainedResults.filter((r) => r.contentStatus === "CONTENT_REVIEW_REQUIRED").length;
const contentStatusTotal =
  contentComplete + contentIncomplete + rankingProtected + intentionallyNative + contentReviewRequired;
const visualStatusTotal = Object.values(visualCounts).reduce((sum, count) => sum + count, 0);
const retainedHtmlVisualCounts = Object.fromEntries(
  VISUAL_STATUSES.map((status) => [
    status,
    retainedResults.filter((r) => r.visualMirrorStatus === status).length,
  ]),
);

const output = {
  generatedAt: new Date().toISOString(),
  target: TARGET.origin,
  expectStagingNoindex: Boolean(process.env.MIGRATION_EXPECT_NOINDEX),
  rankingBaselineDigest: "25aeaa2f440ee5f34189f0522d88882878909eaad0881e3fdd01c13182f6284e",
  summary: {
    totalUrls: inventory.length,
    classified: classCounts,
    unclassified: unclassified.length,
    visualMirrorStatus: visualCounts,
    retainedRoutesChecked: retainedChecked,
    retainedPassing,
    retainedFailing: retainedChecked - retainedPassing,
    contentComplete,
    contentIncomplete,
    rankingProtected,
    intentionallyNative,
    contentReviewRequired,
    contentStatusReconciles: contentStatusTotal === retainedChecked,
    visualStatusReconciles: visualStatusTotal === inventory.length,
    retainedHtmlVisualCounts,
    globalChromeAudit: {
      uniqueInternalLinks: globalChromeLinks.length,
      checked: globalChromeResults.length,
      notFound404: globalChrome404.length,
      gone410: globalChrome410.length,
      serverError5xx: globalChrome5xx.length,
      avoidableRedirects: globalChromeAvoidableRedirects.length,
      broken: globalChromeBroken.map((r) => ({ path: r.path, classification: r.classification })),
      avoidableRedirectDetails: globalChromeAvoidableRedirects.map((r) => ({
        path: r.path,
        redirectHops: r.redirectHops,
      })),
    },
    externalMediaDependencies: {
      mshots: {
        label: "EXTERNAL MEDIA RUNTIME DEPENDENCY — PHASE 2 PLUGIN/ASSET EXIT",
        hosts: ["s.wordpress.com/mshots"],
        note: "WordPress mshots thumbnails are migration technical debt; not plugin-free.",
      },
      homepageSimpleIcons: {
        label: "UI-LOCKED HOMEPAGE EXTERNAL ICON CDN",
        hosts: ["cdn.simpleicons.org"],
        note: "Homepage AI icon row uses external CDN assets excluded from blocking audit on /.",
      },
    },
    visualMirrorPending: visualCounts.VISUAL_MIRROR_PENDING || 0,
    blockingFailureCount: blockingFailures.length,
    contentFindingCount: contentFindings.length,
    tier0Paths: tier0.routes.map((r) => r.path),
    auditCoverage: {
      allImagesChecked: true,
      allLinksChecked: true,
      uniqueImageUrlsChecked: probeCache.size
        ? [...probeCache.keys()].filter((key) => key.startsWith("image::")).length
        : uniqueImagesChecked,
      uniqueInternalUrlsChecked: probeCache.size
        ? [...probeCache.keys()].filter((key) => key.startsWith("link::")).length
        : uniqueLinksChecked,
      displayedSummaryCapsOnly: {
        brokenImagesPerRoute: 8,
        brokenLinksPerRoute: 8,
        contentMissingSamples: 8,
      },
    },
  },
  phase1d: {
    policy: "No redesign in Phase 1. Classify only.",
    statuses: {
      VISUAL_MIRROR_COMPLETE: "Homepage WP mirror (HomeWpMirrorPage)",
      VISUAL_MIRROR_PARTIAL: "Custom template with functional layout (portfolio, contact)",
      VISUAL_MIRROR_PENDING: "SemanticContent generic catch-all layout",
      RANKING_PROTECTED: "Tier-0 / ranking routes governed by ranking-protection baseline",
      NOT_APPLICABLE: "Non-HTML or redirect-only routes",
    },
    counts: visualCounts,
  },
  inventory,
  blockingFailures,
  contentFindings,
  retainedFailures: retainedResults.filter((r) => !r.passed),
  contentIncompleteRoutes: retainedResults.filter((r) => r.contentStatus === "CONTENT_INCOMPLETE"),
  notMigrated: inventory.filter((item) => item.migrationClass === "NOT_MIGRATED"),
  broken: inventory.filter((item) => item.migrationClass === "BROKEN" || item.failures.some((f) => /HTTP 404|HTTP 500|blank/i.test(f))),
};

await mkdir(path.dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      target: TARGET.origin,
      totalUrls: output.summary.totalUrls,
      classified: output.summary.classified,
      unclassified: output.summary.unclassified,
      retainedPassing: `${output.summary.retainedPassing}/${output.summary.retainedRoutesChecked}`,
      contentComplete: output.summary.contentComplete,
      contentIncomplete: output.summary.contentIncomplete,
      rankingProtected: output.summary.rankingProtected,
      intentionallyNative: output.summary.intentionallyNative,
      contentReviewRequired: output.summary.contentReviewRequired,
      contentStatusReconciles: output.summary.contentStatusReconciles,
      visualStatusReconciles: output.summary.visualStatusReconciles,
      visualMirrorPending: output.summary.visualMirrorPending,
      globalChrome404: output.summary.globalChromeAudit.notFound404,
      blockingFailures: output.summary.blockingFailureCount,
      contentFindings: output.summary.contentFindingCount,
      sampleFailures: blockingFailures.slice(0, 15),
    },
    null,
    2,
  ),
);

if (blockingFailures.length) process.exitCode = 1;
