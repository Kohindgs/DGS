#!/usr/bin/env node
/**
 * Mechanical homepage content-order diff: WordPress vs Next.
 * Output: tooling/visual-parity/homepage-content-diff.json
 */
import { chromium } from "playwright";
import path from "node:path";
import {
  WP_URL,
  NEXT_URL,
  OUTPUT_ROOT,
  writeJson,
  settlePage,
  extractHeadingOrder,
} from "../tooling/visual-parity/lib/shared.mjs";

const INTENTIONAL_EXCEPTIONS = [
  /view portfolio/i,
  /show more/i,
  /skip to main content/i,
];

function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

function extractParagraphs(page) {
  return page.evaluate(() => {
    const nodes = [...document.querySelectorAll("main p, main li")];
    return nodes
      .map((el) => (el.textContent || "").replace(/\s+/g, " ").trim())
      .filter((t) => t.length > 3);
  });
}

function diffLists(wpList, nextList, label) {
  const issues = [];
  const max = Math.max(wpList.length, nextList.length);

  for (let i = 0; i < max; i++) {
    const wp = wpList[i];
    const next = nextList[i];
    if (!wp) {
      issues.push({ type: "extra", index: i, label, next });
      continue;
    }
    if (!next) {
      issues.push({ type: "missing", index: i, label, wp });
      continue;
    }
    if (normalize(wp) !== normalize(next)) {
      const isException = INTENTIONAL_EXCEPTIONS.some((re) => re.test(wp) || re.test(next));
      issues.push({
        type: isException ? "intentional_difference" : "mismatch",
        index: i,
        label,
        wp,
        next,
      });
    }
  }

  return issues;
}

async function scrape(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await settlePage(page, 2000);

  const headings = await extractHeadingOrder(page);
  const paragraphs = await extractParagraphs(page);

  await browser.close();
  return { url, headings, paragraphs };
}

async function main() {
  console.log("[content-diff] scraping WordPress...");
  const wp = await scrape(WP_URL);
  console.log("[content-diff] scraping Next...");
  const next = await scrape(NEXT_URL);

  const headingTextsWp = wp.headings.map((h) => normalize(h.text));
  const headingTextsNext = next.headings.map((h) => normalize(h.text));

  const report = {
    generatedAt: new Date().toISOString(),
    wpUrl: WP_URL,
    nextUrl: NEXT_URL,
    headingCount: { wp: headingTextsWp.length, next: headingTextsNext.length },
    paragraphCount: { wp: wp.paragraphs.length, next: next.paragraphs.length },
    headingOrderIssues: diffLists(headingTextsWp, headingTextsNext, "heading"),
    paragraphOrderIssues: diffLists(wp.paragraphs, next.paragraphs, "paragraph"),
    wpHeadings: headingTextsWp,
    nextHeadings: headingTextsNext,
  };

  report.summary = {
    extraHeadings: report.headingOrderIssues.filter((i) => i.type === "extra").length,
    missingHeadings: report.headingOrderIssues.filter((i) => i.type === "missing").length,
    mismatchedHeadings: report.headingOrderIssues.filter((i) => i.type === "mismatch").length,
    intentionalHeadingDiffs: report.headingOrderIssues.filter((i) => i.type === "intentional_difference").length,
    extraParagraphs: report.paragraphOrderIssues.filter((i) => i.type === "extra").length,
    missingParagraphs: report.paragraphOrderIssues.filter((i) => i.type === "missing").length,
    mismatchedParagraphs: report.paragraphOrderIssues.filter((i) => i.type === "mismatch").length,
    intentionalParagraphDiffs: report.paragraphOrderIssues.filter((i) => i.type === "intentional_difference").length,
  };

  const out = path.join(OUTPUT_ROOT, "homepage-content-diff.json");
  writeJson(out, report);
  console.log(`[content-diff] done → ${out}`);
  console.log(JSON.stringify(report.summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
