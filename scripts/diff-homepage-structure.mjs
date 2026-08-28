#!/usr/bin/env node
/**
 * Diff WordPress vs Next homepage structure inventories.
 * Output: tooling/wp-mirror/homepage-structure-diff.json
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("tooling/wp-mirror");
const WP_FILE = path.join(ROOT, "homepage-structure.json");
const NEXT_FILE = path.join(ROOT, "next-homepage-structure.json");
const OUT_FILE = path.join(ROOT, "homepage-structure-diff.json");

const ORDER_KEYS = [
  "header",
  "hero",
  "rail",
  "proof",
  "capabilities",
  "portfolio",
  "caseStudies",
  "creativeGallery",
  "testimonials",
  "searchAuthority",
  "industries",
  "whyDgs",
  "faq",
  "finalCta",
  "footer",
];

function indexByKey(sections) {
  return Object.fromEntries(sections.map((s) => [s.key, s]));
}

function pctDelta(wp, next) {
  if (!wp || !next || wp === 0) return null;
  return Number((((next - wp) / wp) * 100).toFixed(2));
}

function main() {
  const wp = JSON.parse(fs.readFileSync(WP_FILE, "utf8"));
  const next = JSON.parse(fs.readFileSync(NEXT_FILE, "utf8"));
  const wpMap = indexByKey(wp.sections);
  const nextMap = indexByKey(next.sections);

  const issues = [];

  for (const key of ORDER_KEYS) {
    const w = wpMap[key];
    const n = nextMap[key];

    if (w?.present && !n?.present) {
      issues.push({ type: "MISSING_NEXT_SECTION", key, wpSelector: w.selector, wpHeading: w.heading });
      continue;
    }
    if (!w?.present && n?.present) {
      issues.push({ type: "EXTRA_NEXT_SECTION", key, nextSelector: n.selector, nextHeading: n.heading });
      continue;
    }
    if (!w?.present && !n?.present) continue;

    const wpOrder = w.order;
    const nextOrder = n.order;
    if (wpOrder !== nextOrder) {
      issues.push({
        type: "WRONG_ORDER",
        key,
        wpOrder,
        nextOrder,
      });
    }

    const heightDelta = pctDelta(w.geometry?.height, n.geometry?.height);
    if (heightDelta !== null && Math.abs(heightDelta) > 15) {
      issues.push({
        type: "HEIGHT_MISMATCH",
        key,
        wpHeight: w.geometry.height,
        nextHeight: n.geometry.height,
        deltaPercent: heightDelta,
      });
    }

    const widthDelta = pctDelta(w.geometry?.width, n.geometry?.width);
    if (widthDelta !== null && Math.abs(widthDelta) > 10) {
      issues.push({
        type: "WIDTH_MISMATCH",
        key,
        wpWidth: w.geometry.width,
        nextWidth: n.geometry.width,
        deltaPercent: widthDelta,
      });
    }

    const wpImages = w.media?.length || 0;
    const nextImages = n.media?.length || 0;
    if (Math.abs(wpImages - nextImages) > 2) {
      issues.push({
        type: "MEDIA_MISMATCH",
        key,
        wpMediaCount: wpImages,
        nextMediaCount: nextImages,
      });
    }
  }

  for (const extra of next.extraSections || []) {
    issues.push({
      type: "EXTRA_NEXT_SECTION",
      key: extra.id || extra.className || "unknown",
      nextHeading: extra.heading,
      geometry: { startY: extra.startY, height: extra.height },
    });
  }

  const summary = {
    wpSectionCount: wp.sectionCount,
    nextSectionCount: next.sectionCount,
    wpPageHeight: wp.pageHeight,
    nextPageHeight: next.pageHeight,
    issueCount: issues.length,
    byType: issues.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {}),
  };

  const report = {
    generatedAt: new Date().toISOString(),
    wpUrl: wp.url,
    nextUrl: next.url,
    summary,
    issues,
    wpSections: wp.sections,
    nextSections: next.sections,
  };

  fs.writeFileSync(OUT_FILE, `${JSON.stringify(report, null, 2)}\n`);
  console.log("[diff]", summary);
  console.log("[diff] wrote", OUT_FILE);
}

main();
