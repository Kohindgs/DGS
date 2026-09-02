#!/usr/bin/env node
/**
 * Visual-asset parity audit for inner-page WordPress mirrors.
 * Classifies HTML/CSS/font references without mutating ranking content.
 */
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { findRelativeCssUrls } from "./lib/rebase-css-urls.mjs";
import {
  collectHtmlVisualAssetUrls,
  looksLikePlaceholderSrc,
} from "./lib/collect-visual-stylesheets.mjs";

const ROOT = process.cwd();
const PAGES_DIR = path.join(ROOT, "data/wordpress/mirrors/pages");
const CSS_DIR = path.join(ROOT, "data/wordpress/mirrors/css");
const PUBLIC_CSS_DIR = path.join(ROOT, "public/wp-mirror-css");
const OUT = path.join(ROOT, "data/audit/wp-visual-asset-parity.json");

const PRIORITY = [
  "/services/seo-services-in-mumbai/",
  "/services/ai-video-production-agency/",
  "/services/aeo-services-in-mumbai/",
  "/services/geo/",
  "/services/llm-seo-service/",
  "/services/branding/",
  "/services/social-media-marketing/",
  "/services/website-development-amc/",
  "/services/content-creation/",
  "/services/performance-marketing/",
  "/about-us/",
  "/contact-us/",
  "/portfolio/",
  "/blogs/",
  "/our-services/",
  "/services/",
];

function classifyAsset(url) {
  if (!url) return "MISSING";
  if (looksLikePlaceholderSrc(url)) return "PLACEHOLDER";
  if (/\/wp-mirror-css\//i.test(url) && !/\.css(\?|$)/i.test(url)) return "WRONG URL";
  if (/^https?:\/\/www\.dgeniussolutions\.com\/wp-content\//i.test(url)) return "MATCH";
  if (/^https?:\/\/www\.dgeniussolutions\.com\/wp-includes\//i.test(url)) return "MATCH";
  if (/^https?:\/\//i.test(url)) return "MATCH";
  if (url.startsWith("/wp-content/") || url.startsWith("/wp-includes/")) return "WRONG URL";
  if (url.startsWith("data:")) return looksLikePlaceholderSrc(url) ? "PLACEHOLDER" : "MATCH";
  return "WRONG URL";
}

async function loadCssText(file, cache) {
  if (cache.has(file)) return cache.get(file);
  let text = "";
  try {
    text = await readFile(path.join(PUBLIC_CSS_DIR, file), "utf8");
  } catch {
    try {
      text = await readFile(path.join(CSS_DIR, file), "utf8");
    } catch {
      text = "";
    }
  }
  cache.set(file, text);
  return text;
}

async function main() {
  const registry = JSON.parse(
    await readFile(path.join(ROOT, "data/migration/nextjs-route-registry.generated.json"), "utf8"),
  );
  const routes = registry.routes.filter(
    (r) => (r.proposedAction === "KEEP_SAME_URL" || r.proposedAction === "PROTECTED") && r.path !== "/",
  );
  const cssCache = new Map();
  const familyCounts = {};
  const pages = [];
  let totalRefs = 0;
  let placeholders = 0;
  let missingCss = 0;
  let missingFonts = 0;
  let relativeCssUrls = 0;
  let liveWithoutCss = 0;
  let css404 = 0;

  for (const route of routes) {
    const file = `${String(route.path)
      .replace(/^\/+|\/+$/g, "")
      .replaceAll("/", "__") || "root"}.json`;
    let page;
    try {
      page = JSON.parse(await readFile(path.join(PAGES_DIR, file), "utf8"));
    } catch {
      pages.push({
        path: route.path,
        classification: "MISSING",
        notes: "mirror json missing",
      });
      continue;
    }

    familyCounts[page.family] = (familyCounts[page.family] || 0) + 1;
    const htmlUrls = collectHtmlVisualAssetUrls(page.body || "");
    const htmlClasses = htmlUrls.map((url) => ({ url, classification: classifyAsset(url) }));
    const leftoverPlaceholders = htmlClasses.filter((row) => row.classification === "PLACEHOLDER");
    placeholders += leftoverPlaceholders.length;
    totalRefs += htmlUrls.length;

    const cssFiles = page.cssFiles || [];
    const fontLinks = page.fontLinks || [];
    const hasFontPreload = fontLinks.some((tag) => /as=["']font["']/i.test(tag) || /cache\/fonts\//i.test(tag));
    const cssMissingForLive = page.source === "live" && cssFiles.length === 0;
    if (cssMissingForLive) {
      liveWithoutCss += 1;
      missingCss += 1;
    }
    if (page.source === "live" && !hasFontPreload && page.path !== "/career/") {
      missingFonts += 1;
    }

    const cssRelative = [];
    for (const cssFile of cssFiles) {
      const text = await loadCssText(cssFile, cssCache);
      if (!text) {
        css404 += 1;
        cssRelative.push({ file: cssFile, classification: "404" });
        continue;
      }
      const rel = findRelativeCssUrls(text);
      relativeCssUrls += rel.length;
      for (const value of rel) cssRelative.push({ file: cssFile, url: value, classification: "WRONG URL" });
      totalRefs += (text.match(/url\(/gi) || []).length;
    }

    const inlineUrls = (page.styles || "").match(/url\(([^)]+)\)/gi) || [];
    totalRefs += inlineUrls.length;

    let pageClass = "MATCH";
    if (cssMissingForLive) pageClass = "CSS DEPENDENCY MISSING";
    else if (leftoverPlaceholders.length) pageClass = "PLACEHOLDER";
    else if (cssRelative.length) pageClass = "WRONG URL";
    else if (page.source === "rest-fallback" && page.path === "/career/") pageClass = "INTENTIONAL DIFFERENCE";
    else if (page.source === "live" && !hasFontPreload) pageClass = "FONT/ICON DEPENDENCY MISSING";

    pages.push({
      path: page.path,
      family: page.family,
      source: page.source,
      cssFileCount: cssFiles.length,
      fontLinkCount: fontLinks.length,
      hasFontPreload,
      htmlAssetCount: htmlUrls.length,
      leftoverPlaceholders: leftoverPlaceholders.length,
      relativeCssUrls: cssRelative,
      classification: pageClass,
      priority: PRIORITY.includes(page.path),
    });
  }

  const publicCss = new Set(await readdir(PUBLIC_CSS_DIR).catch(() => []));
  const dataCss = new Set(await readdir(CSS_DIR).catch(() => []));

  const report = {
    generatedAt: new Date().toISOString(),
    phase: "3B.2-asset-fidelity",
    routeCount: routes.length,
    pagesAudited: pages.length,
    familyCounts,
    totals: {
      assetReferences: totalRefs,
      leftoverPlaceholders: placeholders,
      livePagesMissingCss: liveWithoutCss,
      missingFontPreloads: missingFonts,
      relativeCssUrls,
      cssFile404: css404,
      publicCssFiles: publicCss.size,
      dataCssFiles: dataCss.size,
    },
    priority: pages.filter((p) => p.priority),
    defects: pages.filter((p) => p.classification !== "MATCH" && p.classification !== "INTENTIONAL DIFFERENCE"),
    pages,
  };

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(report, null, 2)}\n`);
  const ok = liveWithoutCss === 0 && relativeCssUrls === 0 && css404 === 0;
  console.log(ok ? "PASS — WP VISUAL ASSETS" : "FAIL — WP VISUAL ASSETS");
  console.log(
    JSON.stringify(
      {
        ok,
        routeCount: report.routeCount,
        totals: report.totals,
        defectCount: report.defects.length,
        priorityDefects: report.priority.filter((p) => p.classification !== "MATCH" && p.classification !== "INTENTIONAL DIFFERENCE"),
      },
      null,
      2,
    ),
  );
  process.exit(ok ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
