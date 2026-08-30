#!/usr/bin/env node
import assert from "node:assert/strict";
import test from "node:test";
import {
  metaByNameFromHtml,
  metaByPropertyFromHtml,
  renderedMetadataFromHtml,
  titleFromHtml,
} from "./lib/tier0-parity-compare.mjs";

test("titleFromHtml reads rendered title element", () => {
  const html = "<html><head><title>Rendered Page Title</title></head></html>";
  assert.equal(titleFromHtml(html), "Rendered Page Title");
});

test("renderedMetadataFromHtml does not fall back to registry title", () => {
  const html = "<html><head></head><body>No title tag</body></html>";
  const metadata = renderedMetadataFromHtml(html);
  assert.equal(metadata.title, "");
});

test("metaByPropertyFromHtml reads Open Graph property tags", () => {
  const html = `<html><head>
    <meta content="OG Description" property="og:description">
    <meta property='og:title' content="OG Title">
    <meta CONTENT="https://www.dgeniussolutions.com/share.png" PROPERTY="og:image">
  </head></html>`;
  assert.equal(metaByPropertyFromHtml(html, "og:title"), "OG Title");
  assert.equal(metaByPropertyFromHtml(html, "og:description"), "OG Description");
  assert.equal(metaByPropertyFromHtml(html, "og:image"), "https://www.dgeniussolutions.com/share.png");
});

test("metaByNameFromHtml reads Twitter name tags", () => {
  const html = `<html><head>
    <meta name="twitter:card" content="summary_large_image">
    <meta content="Twitter Title" name="twitter:title">
    <meta name='twitter:description' content='Twitter Description'>
    <meta content="https://www.dgeniussolutions.com/tw.png" name="twitter:image">
  </head></html>`;
  assert.equal(metaByNameFromHtml(html, "twitter:card"), "summary_large_image");
  assert.equal(metaByNameFromHtml(html, "twitter:title"), "Twitter Title");
  assert.equal(metaByNameFromHtml(html, "twitter:description"), "Twitter Description");
  assert.equal(metaByNameFromHtml(html, "twitter:image"), "https://www.dgeniussolutions.com/tw.png");
});

test("metadata parser is insensitive to attribute order", () => {
  const html = `<html><head>
    <meta content="Value First" name="description">
    <meta name="robots" content="index,follow">
    <meta content="Property Value" property="og:title">
  </head></html>`;
  const metadata = renderedMetadataFromHtml(html);
  assert.equal(metadata.description, "Value First");
  assert.equal(metadata.robots, "index,follow");
  assert.equal(metadata.ogTitle, "Property Value");
});
