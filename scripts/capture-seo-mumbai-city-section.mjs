#!/usr/bin/env node
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const TARGET = process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025";
const ROUTE = "/services/seo-services-in-mumbai/";
const SECTION = "#seo-services-across-major-indian-cities";
const OUT = path.resolve("tooling/tier0/seo-mumbai-cities");
const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

async function sectionClip(page) {
  return page.evaluate(() => {
    const start = document.querySelector("#seo-services-across-major-indian-cities");
    const end = document.querySelector("#ready-to-grow-with-seo-services-in-mumbai-");
    if (!start || !end) return null;
    const startRect = start.getBoundingClientRect();
    const endRect = end.getBoundingClientRect();
    return {
      x: Math.min(startRect.left, endRect.left),
      y: startRect.top,
      width: Math.max(startRect.right, endRect.right) - Math.min(startRect.left, endRect.left),
      height: endRect.top - startRect.top,
    };
  });
}

const browser = await chromium.launch({ headless: true });
for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await context.newPage();
  await page.goto(new URL(ROUTE, TARGET).href, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(SECTION, { timeout: 60000 });
  await page.locator(SECTION).scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const box = await sectionClip(page);
  if (!box || box.height <= 0 || box.width <= 0) {
    throw new Error(`No bounds for city section at ${vp.name}`);
  }
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({
    path: path.join(OUT, `cities-${vp.name}.png`),
    clip: box,
  });
  await context.close();
}
await browser.close();
console.log(`Captured SEO Mumbai city section to ${OUT}`);
