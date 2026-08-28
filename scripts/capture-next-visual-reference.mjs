#!/usr/bin/env node
/**
 * Capture Next.js (staging/local) visual reference for homepage mirror QA.
 * Output: tooling/visual-parity/next/
 */
import { chromium } from "playwright";
import path from "node:path";
import {
  VIEWPORTS,
  NEXT_URL,
  OUTPUT_ROOT,
  ensureDir,
  writeJson,
  settlePage,
  scrollToFraction,
  measureElement,
  discoverHomepageSections,
  extractHeadingOrder,
  openMenuIfPresent,
  closeMenuIfPresent,
} from "../tooling/visual-parity/lib/shared.mjs";

const OUT = path.join(OUTPUT_ROOT, "next");

const METRIC_SELECTORS = [
  { key: "header", selector: "header" },
  { key: "hero", selector: "main h1" },
  { key: "footer", selector: "footer" },
];

async function safeElementScreenshot(locator, filePath, page) {
  try {
    if ((await locator.count()) === 0) return false;
    await locator.screenshot({ path: filePath, timeout: 10000 });
    return true;
  } catch {
    try {
      const box = await locator.boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        await page.screenshot({ path: filePath, clip: box });
        return true;
      }
    } catch {
      /* fall through */
    }
    return false;
  }
}

const SECTION_SCROLL_FRACTIONS = [0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84, 0.96];

async function captureViewport(browser, viewport) {
  const dir = path.join(OUT, viewport.name);
  ensureDir(dir);

  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    locale: "en-IN",
  });
  const page = await context.newPage();

  await page.goto(NEXT_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  await settlePage(page, 2500);

  await page.screenshot({
    path: path.join(dir, "full-page.png"),
    fullPage: true,
  });

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(400);

  const header = page.locator("header").first();
  await safeElementScreenshot(header, path.join(dir, "header.png"), page);

  const h1 = page.locator("main h1").first();
  if ((await h1.count()) > 0) {
    const box = await h1.evaluate((el) => {
      const r = el.closest("section, article, main")?.getBoundingClientRect() ||
        el.getBoundingClientRect();
      return {
        x: Math.max(r.x - 24, 0),
        y: Math.max(r.y - 24, 0),
        width: Math.min(r.width + 48, window.innerWidth),
        height: Math.min(r.height + 120, window.innerHeight),
      };
    });
    await page.screenshot({ path: path.join(dir, "hero.png"), clip: box });
  }

  const menuTrigger = await openMenuIfPresent(page);
  if (menuTrigger) {
    const panel = page.locator("#site-menu-panel, [role='dialog']").first();
    if ((await panel.count()) > 0) {
      await panel.screenshot({ path: path.join(dir, "menu-open.png") }).catch(async () => {
        await page.screenshot({ path: path.join(dir, "menu-open.png") });
      });
    } else {
      await page.screenshot({ path: path.join(dir, "menu-open.png") });
    }
    await closeMenuIfPresent(page);
  }

  for (let i = 0; i < SECTION_SCROLL_FRACTIONS.length; i++) {
    await scrollToFraction(page, SECTION_SCROLL_FRACTIONS[i]);
    await page.screenshot({
      path: path.join(dir, `section-scroll-${String(i).padStart(2, "0")}.png`),
    });
  }

  await scrollToFraction(page, 1);
  const footer = page.locator("footer").first();
  await safeElementScreenshot(footer, path.join(dir, "footer.png"), page);

  const sections = await discoverHomepageSections(page);
  const headings = await extractHeadingOrder(page);
  const metrics = {};
  for (const { key, selector } of METRIC_SELECTORS) {
    metrics[key] = await measureElement(page, selector);
  }

  const backgroundTech = await page.evaluate(() => {
    const canvas = document.querySelectorAll("canvas").length;
    const video = document.querySelectorAll("video").length;
    const webgl = [...document.querySelectorAll("canvas")].some((c) => {
      try {
        return !!(c.getContext("webgl") || c.getContext("webgl2"));
      } catch {
        return false;
      }
    });
    const gsap = !!(window.gsap || window.ScrollTrigger);
    const bodyBg = getComputedStyle(document.body).backgroundImage;
    return { canvas, video, webgl, gsap, bodyBg };
  });

  await context.close();
  return { viewport: viewport.name, sections, headings, metrics, backgroundTech };
}

async function main() {
  ensureDir(OUT);
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`[next] capturing ${vp.name} @ ${NEXT_URL}...`);
    results.push(await captureViewport(browser, vp));
  }

  await browser.close();

  writeJson(path.join(OUT, "homepage-sections.json"), Object.fromEntries(results.map((r) => [r.viewport, r.sections])));
  writeJson(path.join(OUT, "homepage-headings.json"), Object.fromEntries(results.map((r) => [r.viewport, r.headings])));
  writeJson(path.join(OUT, "next-homepage-metrics.json"), Object.fromEntries(results.map((r) => [r.viewport, r.metrics])));
  writeJson(path.join(OUT, "background-tech.json"), results[0]?.backgroundTech || {});
  writeJson(path.join(OUT, "capture-manifest.json"), {
    url: NEXT_URL,
    capturedAt: new Date().toISOString(),
    viewports: VIEWPORTS.map((v) => v.name),
  });

  console.log(`[next] done → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
