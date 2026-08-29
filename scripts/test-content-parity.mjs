#!/usr/bin/env node
import assert from "node:assert/strict";
import test from "node:test";
import {
  collapseComparableText,
  filterDuplicatePageH1Block,
  headingIsPresent,
  orderedSpanSequencePresent,
  spanText,
  textIsPresent,
} from "./lib/content-parity.mjs";

test("filterDuplicatePageH1Block removes only the first matching page H1", () => {
  const blocks = [
    { type: "heading", level: 1, text: "Example Title" },
    { type: "paragraph", content: [{ text: "Body" }] },
    { type: "heading", level: 2, text: "Example Title" },
    { type: "heading", level: 3, text: "Example Title" },
    { type: "heading", level: 1, text: "Example Title" },
  ];

  const filtered = filterDuplicatePageH1Block(blocks, "Example Title");
  assert.equal(filtered.length, 4);
  assert.equal(filtered.filter((block) => block.type === "heading" && block.text === "Example Title").length, 3);
  assert.equal(filtered[0].type, "paragraph");
  assert.deepEqual(
    filtered
      .filter((block) => block.type === "heading")
      .map((block) => block.level),
    [2, 3, 1],
  );
});

test("orderedSpanSequencePresent accepts adjoining multi-span text", () => {
  const rendered = collapseComparableText(
    "For stronger organic visibility in the UAE, AEO should work with SEO services, GEO, AIO, and LLM SEO.",
  );
  const spans = [
    { text: "For stronger organic visibility in the UAE, AEO should work with " },
    { text: "SEO services", href: "/services/seo-services-in-mumbai/" },
    { text: ", GEO, AIO, and LLM SEO." },
  ];
  assert.equal(orderedSpanSequencePresent(spans, rendered), true);
  assert.equal(textIsPresent({ text: spanText(spans), spans }, rendered), true);
});

test("orderedSpanSequencePresent rejects spans found far apart", () => {
  const rendered = collapseComparableText(
    "Alpha segment here. " + "x".repeat(120) + " Omega segment at the end.",
  );
  const spans = [{ text: "Alpha segment" }, { text: "Omega segment" }];
  assert.equal(orderedSpanSequencePresent(spans, rendered, { maxGap: 48 }), false);
});

test("headingIsPresent requires exact level unless approved normalization applies", () => {
  const rendered = [{ level: "h2", text: "Frequently Asked Questions" }];
  assert.equal(
    headingIsPresent("/blogs/example/", { level: "h1", text: "Frequently Asked Questions" }, rendered),
    false,
  );
  assert.equal(
    headingIsPresent(
      "/blogs/core-update-strategy/",
      { level: "h1", text: "Frequently Asked Questions" },
      rendered,
    ),
    true,
  );
});
