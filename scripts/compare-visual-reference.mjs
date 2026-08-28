#!/usr/bin/env node
/**
 * Compare WordPress vs Next visual references.
 * Output: tooling/visual-parity/diffs/
 */
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import {
  OUTPUT_ROOT,
  PRIORITY_VIEWPORTS,
  ensureDir,
  writeJson,
} from "../tooling/visual-parity/lib/shared.mjs";

const WP_ROOT = path.join(OUTPUT_ROOT, "wp");
const NEXT_ROOT = path.join(OUTPUT_ROOT, "next");
const DIFF_ROOT = path.join(OUTPUT_ROOT, "diffs");

const SHOTS = [
  "full-page.png",
  "header.png",
  "hero.png",
  "menu-open.png",
  "footer.png",
  ...Array.from({ length: 9 }, (_, i) => `section-scroll-${String(i).padStart(2, "0")}.png`),
];

function loadPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function compareImages(wpPath, nextPath, diffPath) {
  const img1 = loadPng(wpPath);
  const img2 = loadPng(nextPath);
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

  const sideBySide = new PNG({ width: width * 2, height });
  PNG.bitblt(a, sideBySide, 0, 0, width, height, 0, 0);
  PNG.bitblt(b, sideBySide, 0, 0, width, height, width, 0);
  fs.writeFileSync(diffPath.replace(/\.png$/, "-side-by-side.png"), PNG.sync.write(sideBySide));

  const total = width * height;
  return {
    width,
    height,
    mismatchedPixels: mismatched,
    mismatchPercent: Number(((mismatched / total) * 100).toFixed(2)),
  };
}

function compareMetrics(wpMetrics, nextMetrics) {
  const report = {};
  for (const key of new Set([...Object.keys(wpMetrics || {}), ...Object.keys(nextMetrics || {})])) {
    const wp = wpMetrics?.[key];
    const next = nextMetrics?.[key];
    if (!wp || !next) {
      report[key] = { status: "missing", wp: !!wp, next: !!next };
      continue;
    }

    const deltas = {};
    for (const dim of ["width", "height", "x", "y"]) {
      const wv = wp.boundingBox?.[dim] ?? 0;
      const nv = next.boundingBox?.[dim] ?? 0;
      const base = Math.max(Math.abs(wv), 1);
      deltas[dim] = {
        wp: wv,
        next: nv,
        deltaPercent: Number((((nv - wv) / base) * 100).toFixed(2)),
      };
    }

    report[key] = { boundingBox: deltas };
  }
  return report;
}

async function main() {
  ensureDir(DIFF_ROOT);
  const summary = { viewports: {}, generatedAt: new Date().toISOString() };

  const wpMetricsAll = JSON.parse(
    fs.readFileSync(path.join(WP_ROOT, "wp-homepage-metrics.json"), "utf8"),
  );
  const nextMetricsAll = JSON.parse(
    fs.readFileSync(path.join(NEXT_ROOT, "next-homepage-metrics.json"), "utf8"),
  );

  for (const vp of PRIORITY_VIEWPORTS) {
    const vpDir = path.join(DIFF_ROOT, vp);
    ensureDir(vpDir);
    const shots = {};

    for (const shot of SHOTS) {
      const wpFile = path.join(WP_ROOT, vp, shot);
      const nextFile = path.join(NEXT_ROOT, vp, shot);
      if (!fs.existsSync(wpFile) || !fs.existsSync(nextFile)) {
        shots[shot] = { status: "skipped", reason: "missing capture" };
        continue;
      }
      shots[shot] = compareImages(wpFile, nextFile, path.join(vpDir, shot.replace(".png", "-diff.png")));
    }

    summary.viewports[vp] = {
      screenshots: shots,
      metrics: compareMetrics(wpMetricsAll[vp], nextMetricsAll[vp]),
    };
  }

  writeJson(path.join(DIFF_ROOT, "comparison-summary.json"), summary);
  console.log(`[compare] done → ${DIFF_ROOT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
