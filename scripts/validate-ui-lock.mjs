#!/usr/bin/env node
/**
 * Validate homepage architecture + visual lock against approved baseline 5002966.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import {
  ensureDir,
  settlePage,
} from "../tooling/visual-parity/lib/shared.mjs";

const APPROVED_SHA = "5002966";
const BASELINE_ROOT = path.resolve(`tooling/ui-lock/${APPROVED_SHA}`);
const PAGE_FILE = path.resolve("app/(site)/page.tsx");
const TARGET_URL = process.env.UI_LOCK_URL || "http://127.0.0.1:3000";

const VIEWPORTS = [
  { name: "390", width: 390, height: 844, file: "home-390.png", maxMismatchPercent: 6 },
  { name: "1440", width: 1440, height: 900, file: "home-1440.png", maxMismatchPercent: 4.5 },
  { name: "1920", width: 1920, height: 1080, file: "home-1920.png", maxMismatchPercent: 4.5 },
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

const GEOMETRY_TOLERANCE = 0.08;

function fail(errors, diagnostics) {
  console.error("FAIL — VISUAL REGRESSION\n");
  for (const error of errors) console.error(`  - ${error}`);
  if (diagnostics) {
    console.error("\nDiagnostics:");
    console.error(JSON.stringify(diagnostics, null, 2));
  }
  process.exit(1);
}

function pass(message) {
  console.log(message);
}

function assertHomepageArchitecture(errors) {
  const source = fs.readFileSync(PAGE_FILE, "utf8");
  if (!source.includes("HomeWpMirrorPage")) {
    errors.push("app/(site)/page.tsx must render HomeWpMirrorPage");
  }
  if (source.includes("HomePageTemplate")) {
    errors.push("app/(site)/page.tsx must NOT render HomePageTemplate (rejected native homepage pivot)");
  }
}

function loadPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

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

function comparePng(baselinePath, currentPath, diffPath) {
  const img1 = loadPng(baselinePath);
  const img2 = loadPng(currentPath);
  const width = Math.max(img1.width, img2.width);
  const height = Math.max(img1.height, img2.height);
  const a = new PNG({ width, height });
  const b = new PNG({ width, height });
  const diff = new PNG({ width, height });
  PNG.bitblt(img1, a, 0, 0, img1.width, img1.height, 0, 0);
  PNG.bitblt(img2, b, 0, 0, img2.width, img2.height, 0, 0);
  const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, {
    threshold: 0.12,
    includeAA: false,
  });
  ensureDir(path.dirname(diffPath));
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  return {
    width,
    height,
    mismatchedPixels: mismatched,
    mismatchPercent: Number(((mismatched / (width * height)) * 100).toFixed(2)),
  };
}

async function captureCurrent(page) {
  const pageMetrics = await page.evaluate(() => ({
    pageHeight: document.documentElement.scrollHeight,
    usesWpMirror: Boolean(document.querySelector(".dgs-wp-mirror-home, main.dgs-v1215")),
    usesNativeHome: Boolean(document.querySelector(".HomeV1215Shell")),
  }));

  const sections = [];
  for (const { key, selector } of SECTION_SELECTORS) {
    const metrics = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        top: Math.round(rect.top + window.scrollY),
        height: Math.round(rect.height),
        width: Math.round(rect.width),
      };
    }, selector);
    sections.push({ key, selector, present: Boolean(metrics), bounds: metrics });
  }

  return {
    pageHeight: pageMetrics.pageHeight,
    usesWpMirror: pageMetrics.usesWpMirror,
    usesNativeHome: pageMetrics.usesNativeHome,
    sectionOrder: sections.filter((s) => s.present).map((s) => s.key),
    sections,
  };
}

function compareStructure(baseline, current, errors) {
  if (current.usesNativeHome) {
    errors.push("Detected rejected native homepage shell (HomeV1215Shell)");
  }
  if (!current.usesWpMirror) {
    errors.push("WP mirror homepage root not detected (.dgs-wp-mirror-home or main.dgs-v1215)");
  }

  const baselineOrder = baseline.sectionOrder || [];
  const currentOrder = current.sectionOrder || [];
  if (baselineOrder.join("|") !== currentOrder.join("|")) {
    errors.push(`Section order changed: baseline [${baselineOrder.join(" -> ")}] vs current [${currentOrder.join(" -> ")}]`);
  }

  const missing = baselineOrder.filter((key) => !currentOrder.includes(key));
  const added = currentOrder.filter((key) => !baselineOrder.includes(key));
  if (missing.length) errors.push(`Missing sections: ${missing.join(", ")}`);
  if (added.length) errors.push(`Unexpected sections: ${added.join(", ")}`);

  const heightDelta = Math.abs((current.pageHeight || 0) - (baseline.viewport?.pageHeight || baseline.pageHeight || 0));
  const baseHeight = baseline.viewport?.pageHeight || baseline.pageHeight || 1;
  if (heightDelta / baseHeight > 0.12) {
    errors.push(`Page height changed by ${((heightDelta / baseHeight) * 100).toFixed(1)}%`);
  }

  for (const key of ["header", "hero", "footer"]) {
    const base = baseline.sections?.find((s) => s.key === key)?.bounds;
    const cur = current.sections?.find((s) => s.key === key)?.bounds;
    if (!base || !cur) continue;
    for (const dim of ["height", "width"]) {
      const delta = Math.abs(cur[dim] - base[dim]) / Math.max(base[dim], 1);
      if (delta > GEOMETRY_TOLERANCE) {
        errors.push(`${key} ${dim} changed by ${(delta * 100).toFixed(1)}%`);
      }
    }
  }
}

async function main() {
  const errors = [];
  assertHomepageArchitecture(errors);

  const structurePath = path.join(BASELINE_ROOT, "home-structure.json");
  if (!fs.existsSync(structurePath)) {
    errors.push(`Missing baseline structure: ${structurePath}`);
    fail(errors);
  }

  const baseline = JSON.parse(fs.readFileSync(structurePath, "utf8"));
  const screenshotResults = [];

  const browser = await chromium.launch({ headless: true });

  const structureContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "en-IN",
  });
  const structurePage = await structureContext.newPage();
  await structurePage.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  await prepareHomepageForCapture(structurePage);
  const currentStructure = await captureCurrent(structurePage);
  compareStructure(baseline, currentStructure, errors);
  await structureContext.close();

  const diffRoot = path.join(BASELINE_ROOT, "diffs");
  for (const viewport of VIEWPORTS) {
    const baselineShot = path.join(BASELINE_ROOT, viewport.file);
    if (!fs.existsSync(baselineShot)) {
      errors.push(`Missing baseline screenshot: ${baselineShot}`);
      continue;
    }

    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      locale: "en-IN",
    });
    const page = await context.newPage();
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
    await prepareHomepageForCapture(page);
    const currentShot = path.join(diffRoot, `current-${viewport.file}`);
    ensureDir(diffRoot);
    await page.screenshot({ path: currentShot, fullPage: true });
    await context.close();

    const baselineImg = loadPng(baselineShot);
    const currentImg = loadPng(currentShot);
    const heightDelta =
      Math.abs(currentImg.height - baselineImg.height) / Math.max(baselineImg.height, 1);
    if (heightDelta > 0.05) {
      errors.push(
        `${viewport.name} screenshot height mismatch: baseline ${baselineImg.height}px vs current ${currentImg.height}px`,
      );
    }

    const comparison = comparePng(
      baselineShot,
      currentShot,
      path.join(diffRoot, `diff-${viewport.file}`),
    );
    screenshotResults.push({
      viewport: viewport.name,
      baselineHeight: baselineImg.height,
      currentHeight: currentImg.height,
      ...comparison,
    });

    if (comparison.mismatchPercent > viewport.maxMismatchPercent) {
      errors.push(
        `${viewport.name} screenshot mismatch ${comparison.mismatchPercent}% exceeds ${viewport.maxMismatchPercent}%`,
      );
    }
  }

  await browser.close();

  if (errors.length) {
    fail(errors, { screenshotResults, currentStructure });
  }

  pass("PASS — APPROVED UI PRESERVED");
  console.log(JSON.stringify({ screenshotResults, sectionOrder: currentStructure.sectionOrder }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
