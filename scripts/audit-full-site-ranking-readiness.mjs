#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  TIER0_PATHS,
  cleanPath,
  fetchRoute,
} from "./lib/full-site-route-audit.mjs";
import { jsonLdTypesFromHtml } from "./lib/migration-audit-shared.mjs";
import {
  canonicalFromHtml,
  extractHeadings,
  extractArticleHtml,
  renderedMetadataFromHtml,
} from "./lib/tier0-parity-compare.mjs";

const ROOT = process.cwd();
const TARGET = new URL(process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025");
const OUT = path.join(ROOT, "data/audit/full-site-ranking-readiness.json");
const PRIOR_OUT = OUT;
const REQUIRED_VIEWPORTS = ["390x844", "430x932"];

const registry = JSON.parse(readFileSync(path.join(ROOT, "data/migration/nextjs-route-registry.generated.json"), "utf8"));
const indexability = JSON.parse(readFileSync(path.join(ROOT, "data/migration/indexability-manifest.generated.json"), "utf8"));
const readiness = JSON.parse(readFileSync(path.join(ROOT, "data/audit/full-site-route-readiness.json"), "utf8")).inventory || [];

const expectedPaths = indexability.routes
  .filter((route) => route.indexable && route.includeInSitemap)
  .map((route) => cleanPath(route.path))
  .sort();

if (expectedPaths.length !== 96) {
  console.error(`Expected 96 indexable sitemap routes, found ${expectedPaths.length}`);
  process.exit(1);
}

let priorReport;
try {
  priorReport = JSON.parse(readFileSync(PRIOR_OUT, "utf8"));
} catch (error) {
  console.error(`Missing prior ranking-readiness report for mobile overflow reuse: ${PRIOR_OUT}`);
  process.exit(1);
}

const priorOverflowByPath = new Map(
  (priorReport.pages || []).map((page) => [cleanPath(page.path), page.mobileOverflow || {}]),
);

for (const routePath of expectedPaths) {
  const overflow = priorOverflowByPath.get(routePath);
  if (!overflow) {
    console.error(`Missing prior mobile overflow evidence for ${routePath}`);
    process.exit(1);
  }
  for (const viewport of REQUIRED_VIEWPORTS) {
    if (typeof overflow[viewport] !== "boolean") {
      console.error(`Missing prior mobile overflow evidence for ${routePath} at ${viewport}`);
      process.exit(1);
    }
  }
}

const indexablePaths = new Set(expectedPaths);
const readinessByPath = new Map(readiness.map((route) => [cleanPath(route.path), route]));

function classifyRoute(routePath, record) {
  if (TIER0_PATHS.has(routePath)) return "RANKING_PROTECTED";
  if (record.blockingDefects?.length) return "TECHNICAL_FIX_REQUIRED";
  return "READY_FOR_PAGE_OPTIMIZATION";
}

const pages = [];

for (const route of registry.routes) {
  const routePath = cleanPath(route.path);
  if (!indexablePaths.has(routePath)) continue;

  const { html, response } = await fetchRoute(TARGET, routePath);
  const article = extractArticleHtml(html) || html;
  const headings = extractHeadings(article);
  const h1s = headings.filter((heading) => heading.level === "h1");
  const metadata = renderedMetadataFromHtml(html);
  const canonical = canonicalFromHtml(html) || "";
  const schemaTypes = jsonLdTypesFromHtml(html);

  const blockingDefects = [];
  const recommendations = [];
  if (!metadata.title) blockingDefects.push("missing_title");
  if (metadata.title.length > 60) recommendations.push("title_length");
  if (!metadata.description) blockingDefects.push("missing_description");
  if (metadata.description.length > 160) recommendations.push("description_length");
  if (h1s.length !== 1) blockingDefects.push("h1_count");
  if (!canonical.includes("dgeniussolutions.com")) blockingDefects.push("canonical_host");
  if (/dimgrey-goat/i.test(canonical)) blockingDefects.push("staging_canonical_leak");
  if (!schemaTypes.length) blockingDefects.push("missing_schema");

  const ogImageMissing = !metadata.ogImage;
  const twitterImageMissing = !metadata.twitterImage;

  const readinessRecord = readinessByPath.get(routePath);
  const record = {
    path: routePath,
    wordpressId: route.wordpressId || null,
    status: response.status,
    title: metadata.title,
    titleLength: metadata.title.length,
    description: metadata.description,
    descriptionLength: metadata.description.length,
    h1Count: h1s.length,
    h1Text: h1s[0]?.text || null,
    canonical,
    robots: metadata.robots,
    sitemapInclusion: true,
    schemaTypes,
    ogTitle: metadata.ogTitle,
    ogDescription: metadata.ogDescription,
    ogImage: metadata.ogImage,
    twitterCard: metadata.twitterCard,
    twitterTitle: metadata.twitterTitle,
    twitterDescription: metadata.twitterDescription,
    twitterImage: metadata.twitterImage,
    mobileOverflow: priorOverflowByPath.get(routePath),
    visualMirrorStatus: readinessRecord?.visualMirrorStatus || null,
    contentStatus: readinessRecord?.contentStatus || null,
    blockingDefects,
    recommendations,
    ogImageMissing,
    twitterImageMissing,
    classification: "",
    contentGrowthRecommendations: [],
  };

  if (record.contentStatus === "CONTENT_INCOMPLETE") {
    record.contentGrowthRecommendations.push("CONTENT GROWTH RECOMMENDATION — NOT IMPLEMENTED");
  }

  record.classification = classifyRoute(routePath, record);
  pages.push(record);
}

pages.sort((a, b) => a.path.localeCompare(b.path));

const summary = {
  intendedIndexableUrls: pages.length,
  rankingProtected: pages.filter((page) => page.classification === "RANKING_PROTECTED").length,
  readyForPageOptimization: pages.filter((page) => page.classification === "READY_FOR_PAGE_OPTIMIZATION").length,
  technicalFixRequired: pages.filter((page) => page.classification === "TECHNICAL_FIX_REQUIRED").length,
  contentStrategyRequired: pages.filter((page) => page.contentGrowthRecommendations.length > 0).length,
  cannibalizationReview: 0,
  missingTitleDefects: pages.filter((page) => page.blockingDefects.includes("missing_title")).length,
  missingDescriptionDefects: pages.filter((page) => page.blockingDefects.includes("missing_description")).length,
  titleLengthRecommendations: pages.filter((page) => page.recommendations.includes("title_length")).length,
  descriptionLengthRecommendations: pages.filter((page) => page.recommendations.includes("description_length")).length,
  h1Defects: pages.filter((page) => page.blockingDefects.includes("h1_count")).length,
  canonicalDefects: pages.filter((page) => page.blockingDefects.some((defect) => defect.includes("canonical"))).length,
  schemaDefects: pages.filter((page) => page.blockingDefects.includes("missing_schema")).length,
  ogImageDefects: pages.filter((page) => page.ogImageMissing).length,
  twitterImageDefects: pages.filter((page) => page.twitterImageMissing).length,
  overflowPages: pages.filter((page) => Object.values(page.mobileOverflow || {}).some(Boolean)).length,
};

const priorDigest = createHash("sha256").update(JSON.stringify(priorOverflowByPath)).digest("hex");

const report = {
  generatedAt: new Date().toISOString(),
  target: TARGET.href,
  expectedIndexableUrlCount: 96,
  mobileOverflowEvidence: {
    reused: true,
    sourceReportGeneratedAt: priorReport.generatedAt,
    sourceReportPath: "data/audit/full-site-ranking-readiness.json",
    sourceOverflowDigest: priorDigest,
    viewports: REQUIRED_VIEWPORTS,
  },
  summary,
  pages,
};

writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(JSON.stringify(summary, null, 2));
