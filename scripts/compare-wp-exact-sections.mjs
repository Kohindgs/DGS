#!/usr/bin/env node
/**
 * Section-anchored WordPress vs Next visual diff at 1440x900.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const WP_URL = "https://www.dgeniussolutions.com/";
const NEXT_URL = process.env.WP_MIRROR_NEXT_URL || "http://localhost:3010/";
const OUT = path.resolve("tooling/wp-exact-mirror");
const VIEWPORT = { width: 1440, height: 900 };

const SECTIONS = [
  { key: "header", wp: "#dgsBar", next: "#dgsBar" },
  { key: "hero", wp: ".dgs-v1215-hero", next: ".dgs-v1215-hero" },
  { key: "rail", wp: ".dgs-v1215-rail", next: ".dgs-v1215-rail" },
  { key: "proof", wp: "#dgs-proof", next: "#dgs-proof" },
  { key: "capabilities", wp: "#dgs-v1215-services", next: "#dgs-v1215-services" },
  { key: "portfolio", wp: "#portfolio", next: "#portfolio" },
  { key: "caseStudies", wp: "#case-studies", next: "#case-studies" },
  { key: "creativeGallery", wp: "#dgs-v1215-work", next: "#dgs-v1215-work" },
  { key: "testimonials", wp: "#testimonials", next: "#testimonials" },
  { key: "searchAuthority", wp: "#dgs-v1215-search-authority", next: "#dgs-v1215-search-authority" },
  { key: "industries", wp: "#dgs-v1215-industries", next: "#dgs-v1215-industries" },
  { key: "whyDgs", wp: "#dgs-v1215-why", next: "#dgs-v1215-why" },
  { key: "faq", wp: "#dgs-v1215-faq", next: "#dgs-v1215-faq" },
  { key: "finalCta", wp: "#contact-form", next: "#contact-form" },
  { key: "footer", wp: ".dgs-footer-wrapper, footer", next: ".dgs-footer-wrapper, footer" },
];

function comparePng(aPath, bPath, diffPath) {
  const a = PNG.sync.read(fs.readFileSync(aPath));
  const b = PNG.sync.read(fs.readFileSync(bPath));
  const w = Math.max(a.width, b.width);
  const h = Math.max(a.height, b.height);
  const pa = new PNG({ width: w, height: h });
  const pb = new PNG({ width: w, height: h });
  const diff = new PNG({ width: w, height: h });
  PNG.bitblt(a, pa, 0, 0, a.width, a.height, 0, 0);
  PNG.bitblt(b, pb, 0, 0, b.width, b.height, 0, 0);
  const mismatched = pixelmatch(pa.data, pb.data, diff.data, w, h, { threshold: 0.12, includeAA: false });
  fs.mkdirSync(path.dirname(diffPath), { recursive: true });
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  const overlay = new PNG({ width: w * 2, height: h });
  PNG.bitblt(pa, overlay, 0, 0, w, h, 0, 0);
  PNG.bitblt(pb, overlay, 0, 0, w, h, w, 0);
  fs.writeFileSync(diffPath.replace(/diff\.png$/, "overlay.png"), PNG.sync.write(overlay));
  return { width: w, height: h, mismatchPercent: Number(((mismatched / (w * h)) * 100).toFixed(2)) };
}

async function capture(page, selector, file) {
  const el = page.locator(selector).first();
  if ((await el.count()) === 0) return false;
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(500);
  try {
    await el.screenshot({ path: file });
    return true;
  } catch {
    const box = await el.boundingBox();
    if (!box || box.width < 1 || box.height < 1) return false;
    await page.screenshot({ path: file, clip: box });
    return true;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const wp = await browser.newPage({ viewport: VIEWPORT });
  const next = await browser.newPage({ viewport: VIEWPORT });
  await wp.goto(WP_URL, { waitUntil: "domcontentloaded" });
  await next.goto(NEXT_URL, { waitUntil: "domcontentloaded" });
  await wp.waitForTimeout(3000);
  await next.waitForTimeout(3000);

  const report = { sections: {}, fullPage: {} };
  for (const { key, wp: wpSel, next: nextSel } of SECTIONS) {
    const dir = path.join(OUT, key);
    fs.mkdirSync(dir, { recursive: true });
    const wpOk = await capture(wp, wpSel, path.join(dir, "wp.png"));
    const nextOk = await capture(next, nextSel, path.join(dir, "next.png"));
    if (wpOk && nextOk) {
      report.sections[key] = comparePng(path.join(dir, "wp.png"), path.join(dir, "next.png"), path.join(dir, "diff.png"));
    } else {
      report.sections[key] = { status: "skipped", wpOk, nextOk };
    }
  }

  await wp.screenshot({ path: path.join(OUT, "wp-fullpage-1440.png"), fullPage: true });
  await next.screenshot({ path: path.join(OUT, "next-fullpage-1440.png"), fullPage: true });
  report.fullPage = comparePng(
    path.join(OUT, "wp-fullpage-1440.png"),
    path.join(OUT, "next-fullpage-1440.png"),
    path.join(OUT, "fullpage-diff.png"),
  );

  fs.writeFileSync(path.join(OUT, "section-comparison.json"), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
