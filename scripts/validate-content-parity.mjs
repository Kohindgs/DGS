#!/usr/bin/env node
/**
 * Phase 1F.1 strict content parity validator.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  INTENTIONALLY_NATIVE_PATHS,
  TIER0_PATHS,
  cleanPath,
  extractExpectedFromBlocks,
  compareRenderedContent,
  fetchRoute,
} from "./lib/full-site-route-audit.mjs";
import { applyTechnicalLinkCorrections } from "./lib/technical-link-corrections.mjs";
import {
  collapseComparableText,
  findApprovedHeadingNormalization,
  headingIsPresent,
  internalLinkIsPresent,
  listApprovedHeadingNormalizations,
  textIsPresent,
} from "./lib/content-parity.mjs";
import { extractArticleHtml, extractPageH1Html, extractHeadings, extractFaqItems, extractContextualLinks, normalizeText } from "./lib/tier0-parity-compare.mjs";

const ROOT = process.cwd();
const TARGET = new URL(process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025");

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

const [registry, contentBlocksFile, technicalApproved, readiness] = await Promise.all([
  readJson(path.join(ROOT, "data/migration/nextjs-route-registry.generated.json")),
  readJson(path.join(ROOT, "data/wordpress/blocks/content-blocks.generated.json")),
  readJson(path.join(ROOT, "data/migration/technical-link-corrections.approved.json")),
  readJson(path.join(ROOT, "data/audit/full-site-route-readiness.json")).catch(() => null),
]);

const retainedRoutes = (readiness?.inventory || registry.routes)
  .filter((route) => {
    const migrationClass = route.migrationClass || route.classification;
    return migrationClass === "200_RETAINED" || migrationClass === "NOINDEX_RETAINED";
  })
  .map((route) => cleanPath(route.path));

const blocksByPath = contentBlocksFile.blocks || {};
const failures = [];
const summary = {
  checkedRoutes: 0,
  contentTextParity: 0,
  headingLevelParity: 0,
  approvedHeadingNormalizations: 0,
  linkParity: 0,
  faqParity: 0,
  listParity: 0,
  rankingProtected: 0,
  intentionallyNative: 0,
  unexplainedTextGaps: 0,
  unexplainedHeadingLevelMismatches: 0,
  unexplainedFaqGaps: 0,
  unexplainedListGaps: 0,
  unexplainedLinkGaps: 0,
};

const SKIP_STRICT_CONTENT_PATHS = new Set(["/"]);

for (const routePath of retainedRoutes) {
  summary.checkedRoutes += 1;

  if (SKIP_STRICT_CONTENT_PATHS.has(routePath)) {
    continue;
  }

  if (TIER0_PATHS.has(routePath)) {
    summary.rankingProtected += 1;
    continue;
  }
  if (INTENTIONALLY_NATIVE_PATHS.has(routePath)) {
    summary.intentionallyNative += 1;
    continue;
  }

  const routeBlocks = blocksByPath[routePath]?.blocks || [];
  const correctedBlocks = applyTechnicalLinkCorrections(routePath, routeBlocks, technicalApproved);
  const expected = extractExpectedFromBlocks(correctedBlocks, {
    wordpressId: blocksByPath[routePath]?.wordpressId || null,
  });

  const { html, response } = await fetchRoute(TARGET, routePath);
  if (response.status !== 200) {
    failures.push(`${routePath}: HTTP ${response.status}`);
    continue;
  }

  const comparison = compareRenderedContent(expected, html, new URL(routePath, TARGET).href, routePath);
  const article = extractArticleHtml(html);
  const pageH1Html = extractPageH1Html(html);
  const renderedHeadings = extractHeadings(article || html);
  if (pageH1Html && !renderedHeadings.some((h) => h.level === "h1")) {
    renderedHeadings.unshift({ level: "h1", text: pageH1Html.replace(/<[^>]+>/g, "") });
  }
  const renderedText = collapseComparableText(`${article || ""} ${pageH1Html || ""}`);

  let routeOk = true;

  for (const heading of expected.headings) {
    const approved = findApprovedHeadingNormalization(routePath, heading);
    if (approved) {
      if (!headingIsPresent(routePath, heading, renderedHeadings)) {
        summary.unexplainedHeadingLevelMismatches += 1;
        failures.push(
          `${routePath}: approved heading normalization not rendered (${heading.level} -> ${approved.renderedLevel}): ${heading.text}`,
        );
        routeOk = false;
      } else {
        summary.approvedHeadingNormalizations += 1;
      }
      continue;
    }

    if (!headingIsPresent(routePath, heading, renderedHeadings)) {
      summary.unexplainedHeadingLevelMismatches += 1;
      failures.push(`${routePath}: heading level/text mismatch ${heading.level} ${heading.text}`);
      routeOk = false;
    } else {
      summary.headingLevelParity += 1;
    }
  }

  for (const paragraph of expected.paragraphs) {
    if (!textIsPresent(paragraph, renderedText)) {
      summary.unexplainedTextGaps += 1;
      failures.push(`${routePath}: missing paragraph ${paragraph.text.slice(0, 80)}`);
      routeOk = false;
    } else {
      summary.contentTextParity += 1;
    }
  }

  for (const listItem of expected.lists) {
    if (!textIsPresent(listItem, renderedText, { minLength: 15, slice: 60 })) {
      summary.unexplainedListGaps += 1;
      failures.push(`${routePath}: missing list item ${listItem.text.slice(0, 80)}`);
      routeOk = false;
    } else {
      summary.listParity += 1;
    }
  }

  const renderedFaq = extractFaqItems(article || html);
  for (const faq of expected.faqs) {
    const match = renderedFaq.find((item) => item.question === faq.question);
    if (!match) {
      summary.unexplainedFaqGaps += 1;
      failures.push(`${routePath}: missing FAQ ${faq.question}`);
      routeOk = false;
    } else {
      summary.faqParity += 1;
    }
  }

  const renderedLinks = extractContextualLinks(article || html, new URL(routePath, TARGET).href);
  for (const link of expected.links.filter(
    (item) => item.path.startsWith("/") && !/wp-content/i.test(item.path) && !/\/wp-json\//i.test(item.path),
  )) {
    if (!internalLinkIsPresent(link, renderedLinks)) {
      summary.unexplainedLinkGaps += 1;
      failures.push(`${routePath}: missing internal link ${link.path} (anchor: ${link.anchor?.slice(0, 60) || "n/a"})`);
      routeOk = false;
    } else {
      summary.linkParity += 1;
    }
  }

  if (!routeOk && comparison.contentComplete) {
    failures.push(`${routePath}: compareRenderedContent reported complete but strict validator found gaps`);
  }
}

const approvedCount = listApprovedHeadingNormalizations().length;
const ok =
  failures.length === 0 &&
  summary.unexplainedTextGaps === 0 &&
  summary.unexplainedHeadingLevelMismatches === 0 &&
  summary.unexplainedFaqGaps === 0 &&
  summary.unexplainedListGaps === 0 &&
  summary.unexplainedLinkGaps === 0 &&
  summary.rankingProtected === 5 &&
  summary.intentionallyNative === 3 &&
  summary.checkedRoutes === 105 &&
  approvedCount >= 6;

if (ok) {
  console.log("PASS — STRICT CONTENT PARITY");
} else {
  console.error("FAIL — STRICT CONTENT PARITY");
}

console.log(
  JSON.stringify(
    {
      ok,
      target: TARGET.href,
      approvedHeadingNormalizationsConfigured: approvedCount,
      ...summary,
      failureCount: failures.length,
      failures: failures.slice(0, 20),
    },
    null,
    2,
  ),
);

process.exit(ok ? 0 : 1);
