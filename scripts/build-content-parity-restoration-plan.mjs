#!/usr/bin/env node
/**
 * Phase 1F content parity restoration plan generator.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import audit from "../data/audit/full-site-route-readiness.json" with { type: "json" };
import blocksFile from "../data/wordpress/blocks/content-blocks.generated.json" with { type: "json" };
import {
  extractExpectedFromBlocks,
  compareRenderedContent,
  spanText,
} from "./lib/full-site-route-audit.mjs";
import { applyTechnicalLinkCorrections } from "./lib/technical-link-corrections.mjs";
import approved from "../data/migration/technical-link-corrections.approved.json" with { type: "json" };

const TARGET = process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025";
const OUT = path.join(process.cwd(), "data/audit/content-parity-restoration-plan.json");

function classifyFinding(routePath, finding, block) {
  if (finding.blockType === "heading") {
    if (/^(Frequently Asked Questions|FAQs)$/i.test(finding.text) && block?.level === 1) {
      return {
        classification: "C",
        proposedTechnicalFix: "Demote FAQ section heading to h2 in extracted blocks; render via SemanticContent",
        pageSpecificFixRequired: false,
      };
    }
    if (finding.text === "Archives" && ["/blogs/", "/our-services/"].includes(routePath)) {
      return {
        classification: "B",
        proposedTechnicalFix: "Correct archive hub heading in content-blocks to live WordPress visible title",
        pageSpecificFixRequired: false,
      };
    }
    if (finding.text?.includes("Let's build together")) {
      return {
        classification: "D",
        proposedTechnicalFix: "Count page-level H1 and allow h1/h2 equivalence in heading parity compare",
        pageSpecificFixRequired: false,
      };
    }
    return {
      classification: "C",
      proposedTechnicalFix: "Stop filtering non-duplicate in-content h1 blocks; compare headings with h1/h2 equivalence",
      pageSpecificFixRequired: false,
    };
  }

  if (finding.blockType === "list" || finding.blockType === "paragraph") {
    const multiSpan = block?.content?.length > 1 || block?.items?.some?.((item) => item.length > 1);
    if (multiSpan) {
      return {
        classification: "D",
        proposedTechnicalFix:
          "Compare multi-span paragraph/list text using spaced span join, punctuation-normalized matching, and per-span presence checks",
        pageSpecificFixRequired: false,
      };
    }
  }

  return {
    classification: "G",
    proposedTechnicalFix: "Verify WordPress source block renders in SemanticContent at source order",
    pageSpecificFixRequired: true,
  };
}

const incomplete = audit.inventory.filter((item) => item.contentStatus === "CONTENT_INCOMPLETE");
const routes = [];

for (const route of incomplete) {
  const routeBlocks = blocksFile.blocks[route.path]?.blocks || [];
  const corrected = applyTechnicalLinkCorrections(route.path, routeBlocks, approved);
  const expected = extractExpectedFromBlocks(corrected, {
    wordpressId: route.nextRegistry?.wordpressId || route.wordpress?.id || null,
  });

  let html = "";
  try {
    html = await (await fetch(new URL(route.path, TARGET))).text();
  } catch {
    html = "";
  }
  const comparison = html
    ? compareRenderedContent(expected, html, new URL(route.path, TARGET).href)
    : route.liveChecks?.content || { contentComplete: false };

  const findings = [];
  for (const item of [
    ...(comparison.missingParagraphs || []),
    ...(comparison.missingLists || []),
    ...(comparison.missingHeadings || []),
  ]) {
    const block = routeBlocks[item.blockIndex];
    const classification = classifyFinding(route.path, item, block);
    findings.push({
      path: route.path,
      wordpressId: item.wordpressId || route.nextRegistry?.wordpressId || route.wordpress?.id || null,
      currentStatus: "CONTENT_INCOMPLETE",
      missingBlockCount: 1,
      findingClassification: classification.classification,
      sourceBlockIndex: item.blockIndex,
      sourceBlockType: item.blockType || block?.type || null,
      exactSourceText: item.text || block?.text || spanText(block?.content || block?.items?.[0] || []),
      sourceOrder: item.blockIndex,
      proposedTechnicalFix: classification.proposedTechnicalFix,
      pageSpecificFixRequired: classification.pageSpecificFixRequired,
      rankingProtected: false,
    });
  }

  routes.push({
    path: route.path,
    wordpressId: route.nextRegistry?.wordpressId || route.wordpress?.id || null,
    currentStatus: "CONTENT_INCOMPLETE",
    findings,
  });
}

const classificationCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0 };
for (const route of routes) {
  for (const finding of route.findings) {
    classificationCounts[finding.findingClassification] =
      (classificationCounts[finding.findingClassification] || 0) + 1;
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  startingIncompleteCount: incomplete.length,
  classificationCounts,
  policy:
    "Phase 1F migration recovery only. Restore verified WordPress visible content without SEO rewrites or visual redesign.",
  routes,
};

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: OUT, routes: routes.length, classificationCounts }, null, 2));
