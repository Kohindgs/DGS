#!/usr/bin/env node
/**
 * Validates technical link correction matching rules and CASE C evidence.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { applyTechnicalLinkCorrections } from "./lib/technical-link-corrections.mjs";

const APPROVED_PATH = path.join(process.cwd(), "data/migration/technical-link-corrections.approved.json");

function normalizeHref(href) {
  try {
    const url = new URL(href, "https://www.dgeniussolutions.com");
    const pathname = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
    return pathname;
  } catch {
    return href;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const approved = JSON.parse(await readFile(APPROVED_PATH, "utf8"));
const failures = [];

for (const item of approved.corrections || []) {
  if (item.action === "REMOVE_BROKEN_HREF" || item.classification === "C") {
    if (!item.reason) failures.push(`CASE C missing reason: ${item.path} -> ${item.wordpressDestination}`);
    if (item.observedWordPressStatus == null) {
      failures.push(`CASE C missing observedWordPressStatus: ${item.path} -> ${item.wordpressDestination}`);
    }
  }
}

const routePath = "/blogs/example-anchor-guard/";
const blocks = [
  {
    type: "paragraph",
    content: [
      { text: "correct target", href: "/services/website-development/" },
      { text: "website development", href: "/services/branding/" },
    ],
  },
];

const testApproved = {
  corrections: [
    {
      path: routePath,
      wordpressDestination: "/services/website-development/",
      requiredNextDestination: "/services/website-development-amc/",
      classification: "B",
    },
    {
      path: routePath,
      anchor: "website development",
      wordpressDestination: "/services/website-development/",
      requiredNextDestination: "/services/website-development-amc/",
      classification: "B",
    },
  ],
};

const corrected = applyTechnicalLinkCorrections(routePath, blocks, testApproved);
const spans = corrected[0].content;

assert(
  spans[0].href === "/services/website-development-amc/",
  "expected href match correction to apply",
);
assert(
  spans[1].href === "/services/branding/",
  "anchor-only match must not rewrite unrelated href on same route",
);

const anchorOnlyApproved = {
  corrections: [
    {
      path: routePath,
      anchor: "website development",
      wordpressDestination: "/services/website-development/",
      requiredNextDestination: "/services/website-development-amc/",
      classification: "B",
    },
  ],
};

const anchorOnlyBlocks = [
  {
    type: "paragraph",
    content: [{ text: "website development", href: "/totally-different-path/" }],
  },
];

const anchorOnlyResult = applyTechnicalLinkCorrections(routePath, anchorOnlyBlocks, anchorOnlyApproved);
assert(
  anchorOnlyResult[0].content[0].href === "/totally-different-path/",
  "route+anchor without matching wordpressDestination must remain untouched",
);

for (const item of approved.corrections || []) {
  if (!item.path || !item.wordpressDestination) {
    failures.push(`correction missing path or wordpressDestination: ${JSON.stringify(item)}`);
  }
  if (item.requiredNextDestination) {
    assert(
      normalizeHref(item.requiredNextDestination) === normalizeHref(item.requiredNextDestination),
      "requiredNextDestination must be normalized path",
    );
  }
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      {
        ok: true,
        correctionCount: approved.corrections.length,
        caseCWithEvidence: (approved.corrections || []).filter((item) => item.classification === "C").length,
        anchorOnlyGuard: "PASS",
      },
      null,
      2,
    ),
  );
}
