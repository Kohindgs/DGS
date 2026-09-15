#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import test from "node:test";
import { WEAVINGS_PRESENTATION, WEAVINGS_ROUTES } from "./lib/approved-assets.mjs";

const ROOT = process.cwd();
const TARGET = process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025/";
const BASELINE_PATH = path.join(ROOT, "data/audit/weavings-layout-baseline.json");
const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));

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

for (const routePath of WEAVINGS_ROUTES) {
  for (const viewport of VIEWPORTS) {
    test(`${routePath} layout preserved at ${viewport.name}`, async () => {
      const expected = baseline.routes[routePath][viewport.name];
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
      try {
        const response = await page.goto(new URL(routePath, TARGET).toString(), {
          waitUntil: "networkidle",
          timeout: 120_000,
        });
        assert.equal(response?.status(), 200);
        await waitForWeavingsImage(page);
        const actual = await measureRoute(page, routePath);

        assert.ok(Math.abs(actual.imageHeight - expected.imageHeight) <= 1, `image height delta ${actual.imageHeight - expected.imageHeight}`);
        assert.ok(Math.abs(actual.contentBelowTop - expected.contentBelowTop) <= 1, `content-below delta ${actual.contentBelowTop - expected.contentBelowTop}`);
        assert.ok(Math.abs(actual.scrollHeight - expected.scrollHeight) <= 1, `scroll height delta ${actual.scrollHeight - expected.scrollHeight}`);
        assert.ok(Math.abs(actual.imageWidth - expected.imageWidth) <= 1, `image width delta ${actual.imageWidth - expected.imageWidth}`);

        const screenshot = await page.screenshot({ fullPage: true });
        assert.ok(screenshot.length > 0);
      } finally {
        await page.close();
        await browser.close();
      }
    });
  }
}
