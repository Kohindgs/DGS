#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const TARGET = process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025/";
const OUT_DIR = path.join(ROOT, "data/audit/weavings-screenshots");
const ROUTES = [
  "/services/website-development-amc/",
  "/services/website-development-pune-page/",
];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];

async function main() {
  const label = process.argv[2];
  if (!label || !/^[a-z0-9-]+$/.test(label)) {
    console.error("Usage: node scripts/capture-weavings-screenshots.mjs <before|after>");
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const routePath of ROUTES) {
    const slug = routePath.replace(/^\/|\/$/g, "").replace(/\//g, "-");
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
      const url = new URL(routePath, TARGET).toString();
      await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
      const screenshotPath = path.join(OUT_DIR, `${label}-${slug}-${viewport.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await page.close();
      console.log(screenshotPath);
    }
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
