#!/usr/bin/env node
/**
 * Capture WordPress vs Next inner-page visual evidence at 1440 and 390.
 * Does not iframe WordPress at runtime — screenshots only for QA.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ROOT = process.cwd();
const WP = "https://www.dgeniussolutions.com";
const NEXT = process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025";
const OUT = path.join(ROOT, "tooling/visual-parity/inner");

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

const ROUTES = [
  { key: "homepage", path: "/" },
  { key: "seo-services", path: "/services/seo-services-in-mumbai/" },
  { key: "ai-video", path: "/services/ai-video-production-agency/" },
  { key: "aeo", path: "/services/aeo-services-in-mumbai/" },
  { key: "geo", path: "/services/geo/" },
  { key: "llm-seo", path: "/services/llm-seo-service/" },
  { key: "branding", path: "/services/branding/" },
  { key: "blog-archive", path: "/blogs/" },
  { key: "blog-post", path: "/blogs/what-is-llm-seo/" },
  { key: "about", path: "/about-us/" },
  { key: "contact", path: "/contact-us/" },
  { key: "portfolio", path: "/portfolio/" },
  { key: "career", path: "/career/" },
  { key: "services-archive", path: "/services/" },
];

const FRACTIONS = [0, 0.35, 0.7];

function ensureDirSync(dir) {
  mkdir(dir, { recursive: true }).catch(() => {});
}

async function settle(page) {
  await page.waitForLoadState("domcontentloaded", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1800);
}

async function screenshotSet(page, dir) {
  await mkdir(dir, { recursive: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(dir, "above-fold.png") });
  const metrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewport: window.innerHeight,
  }));
  await page.screenshot({ path: path.join(dir, "full-page.png"), fullPage: true });
  for (const [i, fraction] of FRACTIONS.entries()) {
    const y = Math.max(0, Math.floor((metrics.scrollHeight - metrics.viewport) * fraction));
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(dir, `scroll-${String(i).padStart(2, "0")}.png`) });
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(dir, "footer.png") });
  return metrics;
}

function comparePng(aPath, bPath, diffPath) {
  if (!existsSync(aPath) || !existsSync(bPath)) return { ok: false, reason: "missing-file" };
  const img1 = PNG.sync.read(readFileSync(aPath));
  const img2 = PNG.sync.read(readFileSync(bPath));
  const width = Math.max(img1.width, img2.width);
  const height = Math.max(img1.height, img2.height);
  const a = new PNG({ width, height });
  const b = new PNG({ width, height });
  PNG.bitblt(img1, a, 0, 0, img1.width, img1.height, 0, 0);
  PNG.bitblt(img2, b, 0, 0, img2.width, img2.height, 0, 0);
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, { threshold: 0.12 });
  writeFileSync(diffPath, PNG.sync.write(diff));
  const total = width * height;
  return {
    ok: true,
    mismatched,
    total,
    percent: Number(((mismatched / total) * 100).toFixed(3)),
    wp: { width: img1.width, height: img1.height },
    next: { width: img2.width, height: img2.height },
  };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { generatedAt: new Date().toISOString(), wp: WP, next: NEXT, routes: [] };

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      userAgent: "DGS-InnerVisualParity/1.0",
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
      const wpDir = path.join(OUT, route.key, viewport.name, "wp");
      const nextDir = path.join(OUT, route.key, viewport.name, "next");
      const diffDir = path.join(OUT, route.key, viewport.name, "diff");
      await mkdir(diffDir, { recursive: true });

      let wpMetrics = null;
      let nextMetrics = null;
      try {
        await page.goto(new URL(route.path, WP).href, { waitUntil: "domcontentloaded", timeout: 90000 });
        await settle(page);
        wpMetrics = await screenshotSet(page, wpDir);
      } catch (error) {
        wpMetrics = { error: String(error) };
      }

      try {
        await page.goto(new URL(route.path, NEXT).href, { waitUntil: "domcontentloaded", timeout: 90000 });
        await settle(page);
        nextMetrics = await screenshotSet(page, nextDir);
      } catch (error) {
        nextMetrics = { error: String(error) };
      }

      const shots = ["above-fold.png", "full-page.png", "scroll-00.png", "scroll-01.png", "scroll-02.png", "footer.png"];
      const diffs = {};
      for (const shot of shots) {
        diffs[shot] = comparePng(path.join(wpDir, shot), path.join(nextDir, shot), path.join(diffDir, shot));
      }

      report.routes.push({
        key: route.key,
        path: route.path,
        viewport: viewport.name,
        wpMetrics,
        nextMetrics,
        diffs,
      });
      const fold = diffs["above-fold.png"];
      console.log(
        `${route.path} @${viewport.name} above-fold ${fold.ok ? fold.percent + "%" : fold.reason}`,
      );
    }

    await context.close();
  }

  await browser.close();
  await writeFile(path.join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log("Wrote", path.join(OUT, "report.json"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
