#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import {
  TIER0_PATHS,
  cleanPath,
  fetchRoute,
} from "./lib/full-site-route-audit.mjs";
import { jsonLdTypesFromHtml } from "./lib/migration-audit-shared.mjs";
import {
  canonicalFromHtml,
  metaFromHtml,
  extractHeadings,
  extractArticleHtml,
} from "./lib/tier0-parity-compare.mjs";

const ROOT = process.cwd();
const TARGET = new URL(process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025");
const OUT = path.join(ROOT, "data/audit/full-site-ranking-readiness.json");
const registry = JSON.parse(readFileSync(path.join(ROOT, "data/migration/nextjs-route-registry.generated.json"), "utf8"));
const indexability = JSON.parse(readFileSync(path.join(ROOT, "data/migration/indexability-manifest.generated.json"), "utf8"));
const readiness = JSON.parse(readFileSync(path.join(ROOT, "data/audit/full-site-route-readiness.json"), "utf8")).inventory || [];

const indexablePaths = new Set(
  indexability.routes.filter((r) => r.indexable && r.includeInSitemap).map((r) => cleanPath(r.path)),
);

const readinessByPath = new Map(readiness.map((r) => [cleanPath(r.path), r]));
const VIEWPORTS = [
  { name: "390x844", width: 390, height: 844 },
  { name: "430x932", width: 430, height: 932 },
];

function classifyRoute(routePath, record) {
  if (TIER0_PATHS.has(routePath)) return "RANKING_PROTECTED";
  if (record.defects?.length) return "TECHNICAL_FIX_REQUIRED";
  return "READY_FOR_PAGE_OPTIMIZATION";
}

const pages = [];
const browser = await chromium.launch({ headless: true });

for (const route of registry.routes) {
  const routePath = cleanPath(route.path);
  if (!indexablePaths.has(routePath)) continue;

  const { html, response } = await fetchRoute(TARGET, routePath);
  const article = extractArticleHtml(html) || html;
  const headings = extractHeadings(article);
  const h1s = headings.filter((h) => h.level === "h1");
  const title = metaFromHtml(html, "title") || route.title || "";
  const description = metaFromHtml(html, "description") || route.description || "";
  const canonical = canonicalFromHtml(html) || route.desiredCanonicalPath || routePath;
  const robots = metaFromHtml(html, "robots") || "";
  const schemaTypes = jsonLdTypesFromHtml(html);
  const defects = [];
  if (!title) defects.push("missing_title");
  if (title.length > 60) defects.push("title_length");
  if (!description) defects.push("missing_description");
  if (description.length > 160) defects.push("description_length");
  if (h1s.length !== 1) defects.push("h1_count");
  if (!canonical.includes("dgeniussolutions.com")) defects.push("canonical_host");
  if (/dimgrey-goat/i.test(canonical)) defects.push("staging_canonical_leak");

  const overflow = {};
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    await page.goto(new URL(routePath, TARGET).href, { waitUntil: "domcontentloaded", timeout: 90000 });
    overflow[viewport.name] = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2,
    );
    await context.close();
  }

  const readinessRecord = readinessByPath.get(routePath);
  const record = {
    path: routePath,
    wordpressId: route.wordpressId || null,
    status: response.status,
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    h1Count: h1s.length,
    h1Text: h1s[0]?.text || null,
    canonical,
    robots,
    sitemapInclusion: true,
    schemaTypes,
    ogTitle: metaFromHtml(html, "og:title"),
    ogDescription: metaFromHtml(html, "og:description"),
    ogImage: metaFromHtml(html, "og:image"),
    twitterCard: metaFromHtml(html, "twitter:card"),
    mobileOverflow: overflow,
    visualMirrorStatus: readinessRecord?.visualMirrorStatus || null,
    contentStatus: readinessRecord?.contentStatus || null,
    defects,
    classification: "",
    contentGrowthRecommendations: [],
  };

  if (record.contentStatus === "CONTENT_INCOMPLETE") {
    record.contentGrowthRecommendations.push("CONTENT GROWTH RECOMMENDATION — NOT IMPLEMENTED");
  }

  record.classification = classifyRoute(routePath, record);
  pages.push(record);
}

await browser.close();

const summary = {
  intendedIndexableUrls: pages.length,
  rankingProtected: pages.filter((p) => p.classification === "RANKING_PROTECTED").length,
  readyForPageOptimization: pages.filter((p) => p.classification === "READY_FOR_PAGE_OPTIMIZATION").length,
  technicalFixRequired: pages.filter((p) => p.classification === "TECHNICAL_FIX_REQUIRED").length,
  contentStrategyRequired: pages.filter((p) => p.contentGrowthRecommendations.length > 0).length,
  cannibalizationReview: 0,
  titleDefects: pages.filter((p) => p.defects.includes("title_length") || p.defects.includes("missing_title")).length,
  descriptionDefects: pages.filter((p) => p.defects.includes("description_length") || p.defects.includes("missing_description")).length,
  h1Defects: pages.filter((p) => p.defects.includes("h1_count")).length,
  canonicalDefects: pages.filter((p) => p.defects.some((d) => d.includes("canonical"))).length,
  schemaDefects: pages.filter((p) => !p.schemaTypes.length).length,
  overflowPages: pages.filter((p) => Object.values(p.mobileOverflow).some(Boolean)).length,
};

writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), target: TARGET.href, summary, pages }, null, 2));
console.log(JSON.stringify(summary, null, 2));
