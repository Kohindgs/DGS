#!/usr/bin/env node
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const TARGET = process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025";
const ROUTE = "/services/ai-video-production-agency/";
const SECTION = "#connect-ai-video-with-search-ads-and-website-conversions";
const OUT = path.resolve("tooling/ranking-protection/ai-video-links");
const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

async function sectionClip(page) {
  return page.evaluate(() => {
    const start = document.querySelector("#connect-ai-video-with-search-ads-and-website-conversions");
    const end = document.querySelector("#future-of-seo");
    if (!start || !end) return null;
    const startRect = start.getBoundingClientRect();
    const endRect = end.getBoundingClientRect();
    return {
      x: Math.min(startRect.left, endRect.left),
      y: startRect.top,
      width: Math.max(startRect.right, endRect.right) - Math.min(startRect.left, endRect.left),
      height: endRect.bottom - startRect.top,
    };
  });
}

async function capture(label) {
  const browser = await chromium.launch({ headless: true });
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(new URL(ROUTE, TARGET).href, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(SECTION, { timeout: 60000 });
    await page.locator("#future-of-seo").scrollIntoViewIfNeeded();
    const box = await sectionClip(page);
    if (!box || box.height <= 0 || box.width <= 0) throw new Error(`No bounds for link section at ${vp.name}`);
    const dir = path.join(OUT, label);
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({
      path: path.join(dir, `links-${vp.name}.png`),
      clip: box,
    });
    await context.close();
  }
  await browser.close();
}

const mode = process.argv[2] || "after";
await capture(mode);

if (mode === "compare") {
  for (const vp of VIEWPORTS) {
    const before = path.join(OUT, "before", `links-${vp.name}.png`);
    const after = path.join(OUT, "after", `links-${vp.name}.png`);
    if (!fs.existsSync(before) || !fs.existsSync(after)) continue;
    const img1 = PNG.sync.read(fs.readFileSync(before));
    const img2 = PNG.sync.read(fs.readFileSync(after));
    const width = Math.max(img1.width, img2.width);
    const height = Math.max(img1.height, img2.height);
    const a = new PNG({ width, height });
    const b = new PNG({ width, height });
    const diff = new PNG({ width, height });
    PNG.bitblt(img1, a, 0, 0, img1.width, img1.height, 0, 0);
    PNG.bitblt(img2, b, 0, 0, img2.width, img2.height, 0, 0);
    const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, { threshold: 0.1, includeAA: false });
    const pct = ((mismatched / (width * height)) * 100).toFixed(2);
    console.log(`${vp.name}: ${pct}% mismatch`);
  }
}
