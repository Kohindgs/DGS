#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { WEAVINGS_PRESENTATION, WEAVINGS_ROUTES } from "./lib/approved-assets.mjs";

const ROOT = process.cwd();
const TARGET = process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025/";
const OUT = path.join(ROOT, "data/audit/weavings-layout-baseline.json");
const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];

async function waitForWeavingsImage(page) {
  await page.waitForFunction(
    ({ altText, assetSlug }) => {
      const img = [...document.querySelectorAll("img")].find((node) => {
        if ((node.getAttribute("alt") || "") !== altText) return false;
        const src = node.getAttribute("src") || "";
        const srcset = node.getAttribute("srcset") || "";
        return src.includes(assetSlug) || srcset.includes(assetSlug);
      });
      return Boolean(img && img.complete && img.naturalHeight > 0);
    },
    { altText: WEAVINGS_PRESENTATION.alt, assetSlug: "weavings-home-page-64820" },
    { timeout: 60_000 },
  );
}

async function measureRoute(page, routePath) {
  return page.evaluate(
    ({ route, altText, assetSlug }) => {
      const figure = [...document.querySelectorAll("figure")].find((node) => {
        const img = node.querySelector("img");
        if (!img) return false;
        if ((img.getAttribute("alt") || "") !== altText) return false;
        const src = img.getAttribute("src") || "";
        const srcset = img.getAttribute("srcset") || "";
        return src.includes(assetSlug) || srcset.includes(assetSlug);
      });
      if (!figure) throw new Error(`Weavings figure not found on ${route}`);
      const rect = figure.getBoundingClientRect();
      const imageBottom = rect.bottom + window.scrollY;
      let sibling = figure.nextElementSibling;
      while (sibling && sibling.tagName === "SCRIPT") sibling = sibling.nextElementSibling;
      const belowTop = sibling ? sibling.getBoundingClientRect().top + window.scrollY : imageBottom;
      return {
        imageTop: rect.top + window.scrollY,
        imageBottom,
        contentBelowTop: belowTop,
        scrollHeight: document.documentElement.scrollHeight,
        imageHeight: rect.height,
        imageWidth: rect.width,
      };
    },
    { route: routePath, altText: WEAVINGS_PRESENTATION.alt, assetSlug: "weavings-home-page-64820" },
  );
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const routes = {};
  for (const routePath of WEAVINGS_ROUTES) {
    routes[routePath] = {};
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
      await page.goto(new URL(routePath, TARGET).toString(), { waitUntil: "networkidle", timeout: 120_000 });
      await waitForWeavingsImage(page);
      routes[routePath][viewport.name] = await measureRoute(page, routePath);
      await page.close();
    }
  }
  await browser.close();
  writeFileSync(
    OUT,
    `${JSON.stringify({ version: "2B.1A", target: TARGET, presentation: WEAVINGS_PRESENTATION, routes }, null, 2)}\n`,
  );
  console.log(OUT);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
