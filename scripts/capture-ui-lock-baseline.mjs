#!/usr/bin/env node
/**
 * Capture approved UI baseline for homepage lock (SHA 5002966).
 * Default source: approved Dimgrey staging release.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import {
  ensureDir,
  writeJson,
  settlePage,
} from "../tooling/visual-parity/lib/shared.mjs";

const APPROVED_SHA = "5002966";
const BASELINE_ROOT = path.resolve(`tooling/ui-lock/${APPROVED_SHA}`);
const BASELINE_URL =
  process.env.UI_LOCK_BASELINE_URL ||
  "https://dimgrey-goat-473970.hostingersite.com/";

const VIEWPORTS = [
  { name: "390", width: 390, height: 844, file: "home-390.png" },
  { name: "1440", width: 1440, height: 900, file: "home-1440.png" },
  { name: "1920", width: 1920, height: 1080, file: "home-1920.png" },
];

const SECTION_SELECTORS = [
  { key: "header", selector: "#dgsNav" },
  { key: "hero", selector: ".dgs-v1215-hero" },
  { key: "rail", selector: ".dgs-v1215-rail" },
  { key: "proof", selector: ".dgs-v1215-proof-stack, #dgs-proof" },
  { key: "capabilities", selector: "#dgs-v1215-services" },
  { key: "portfolio", selector: ".dgs-v1215-ai-portfolio, #portfolio" },
  { key: "caseStudies", selector: ".dgs-v1215-case-block, #case-studies" },
  { key: "creativeGallery", selector: "#dgs-v1215-work" },
  { key: "testimonials", selector: ".dgs-v1215-testimonials, #testimonials" },
  { key: "searchAuthority", selector: "#dgs-v1215-search-authority" },
  { key: "industries", selector: "#dgs-v1215-industries" },
  { key: "whyDgs", selector: "#dgs-v1215-why" },
  { key: "faq", selector: "#dgs-v1215-faq" },
  { key: "finalCta", selector: "#contact-form, .dgs-v1215-final" },
  { key: "footer", selector: "footer, .dgs-footer" },
];

async function stabilizeMirrorForCapture(page) {
  await page.addStyleTag({
    content: `
      #dgs-v1215-canvas { visibility: hidden !important; }
      .dgs-v1215-fallback { animation: none !important; transform: none !important; }
    `,
  });
  await page.waitForTimeout(600);
}

async function prepareHomepageForCapture(page) {
  await page.waitForFunction(
    () =>
      Boolean(
        document.querySelector(".dgs-wp-mirror-home") ||
          document.querySelector("main.dgs-v1215"),
      ),
    { timeout: 90000 },
  );
  await settlePage(page, 2500);
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = Math.max(window.innerHeight, 400);
    const maxY = document.documentElement.scrollHeight;
    for (let y = 0; y <= maxY; y += step) {
      window.scrollTo(0, y);
      await delay(120);
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  await stabilizeMirrorForCapture(page);
}

async function captureStructure(page) {
  const pageMetrics = await page.evaluate(() => ({
    pageHeight: document.documentElement.scrollHeight,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    usesWpMirror: Boolean(document.querySelector(".dgs-wp-mirror-home, main.dgs-v1215")),
    usesNativeHome: Boolean(document.querySelector(".HomeV1215Shell, .home-page article[data-migration-content]")),
  }));

  const sections = [];
  for (const { key, selector } of SECTION_SELECTORS) {
    const metrics = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        selector: sel,
        top: Math.round(rect.top + window.scrollY),
        height: Math.round(rect.height),
        width: Math.round(rect.width),
      };
    }, selector);

    sections.push({
      key,
      selector,
      present: Boolean(metrics),
      bounds: metrics,
    });
  }

  return {
    capturedAt: new Date().toISOString(),
    approvedSha: APPROVED_SHA,
    sourceUrl: BASELINE_URL,
    viewport: pageMetrics,
    sectionOrder: sections.filter((s) => s.present).map((s) => s.key),
    sections,
    headerBounds: sections.find((s) => s.key === "header")?.bounds || null,
    heroBounds: sections.find((s) => s.key === "hero")?.bounds || null,
    footerBounds: sections.find((s) => s.key === "footer")?.bounds || null,
    importantSelectors: {
      wpMirrorRoot: await page.locator(".dgs-wp-mirror-home, main.dgs-v1215").count(),
      mirrorCanvas: await page.locator("#dgs-v1215-canvas").count(),
      nativeHeader: await page.locator("header#dgsNav").count(),
    },
  };
}

async function main() {
  ensureDir(BASELINE_ROOT);
  const browser = await chromium.launch({ headless: true });
  const structureViewport = VIEWPORTS.find((v) => v.name === "1440");

  const context = await browser.newContext({
    viewport: { width: structureViewport.width, height: structureViewport.height },
    deviceScaleFactor: 1,
    locale: "en-IN",
  });
  const page = await context.newPage();
  await page.goto(BASELINE_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  await prepareHomepageForCapture(page);

  const structure = await captureStructure(page);
  writeJson(path.join(BASELINE_ROOT, "home-structure.json"), structure);

  for (const viewport of VIEWPORTS) {
    const vpContext = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      locale: "en-IN",
    });
    const vpPage = await vpContext.newPage();
    await vpPage.goto(BASELINE_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
    await prepareHomepageForCapture(vpPage);
    const shotPath = path.join(BASELINE_ROOT, viewport.file);
    await vpPage.screenshot({ path: shotPath, fullPage: true });
    const pageHeight = await vpPage.evaluate(() => document.documentElement.scrollHeight);
    const captured = PNG.sync.read(fs.readFileSync(shotPath));
    if (Math.abs(captured.height - pageHeight) > 80) {
      throw new Error(
        `${viewport.file} capture height ${captured.height} does not match page height ${pageHeight}`,
      );
    }
    await vpContext.close();
  }

  await context.close();
  await browser.close();

  console.log(`Captured UI lock baseline at ${BASELINE_ROOT}`);
  console.log(`Section order: ${structure.sectionOrder.join(" -> ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
