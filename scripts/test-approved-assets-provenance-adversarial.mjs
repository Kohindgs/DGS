#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  APPROVED_SOCIAL,
  PINNED_LOGO,
  PINNED_WEAVINGS_SOURCE,
  WEAVINGS_PRESENTATION,
  WEAVINGS_ROUTES,
  assertPinnedSource,
  assertStrictImageMimeAndFormat,
  buildApprovedAssetManifest,
  isStrictPngContentType,
  validateApprovedAssetUrl,
  validateManifestProvenance,
} from "./lib/approved-assets.mjs";

const ROOT = process.cwd();

function loadManifest() {
  return JSON.parse(readFileSync(path.join(ROOT, "data/migration/approved-asset-replacements.json"), "utf8"));
}

function mutateManifest(mutator) {
  const manifest = loadManifest();
  mutator(manifest);
  return manifest;
}

test("rejects final URL on evil.example", () => {
  const result = validateApprovedAssetUrl("https://evil.example/wp-content/uploads/logo.png");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "wrong-host");
});

test("rejects final URL on Dimgrey/Hostinger staging", () => {
  const result = validateApprovedAssetUrl(
    "https://dimgrey-goat-473970.hostingersite.com/wp-content/uploads/2026/02/cropped-DGS-LOGO.png",
  );
  assert.equal(result.ok, false);
});

test("rejects HTTP final URL", () => {
  const result = validateApprovedAssetUrl("http://www.dgeniussolutions.com/wp-content/uploads/logo.png");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "non-https");
});

test("rejects URL containing credentials", () => {
  const result = validateApprovedAssetUrl("https://user:pass@www.dgeniussolutions.com/wp-content/uploads/logo.png");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "credentials");
});

test("rejects URL with explicit port", () => {
  const result = validateApprovedAssetUrl("https://www.dgeniussolutions.com:8443/wp-content/uploads/logo.png");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "unexpected-port");
});

test("rejects correct hash/dimensions/png format with text/html MIME", () => {
  const actual = {
    finalUrl: PINNED_LOGO.url,
    sha256: PINNED_LOGO.sha256,
    width: PINNED_LOGO.width,
    height: PINNED_LOGO.height,
    contentType: "text/html; charset=utf-8",
    format: "png",
  };
  assert.throws(() => assertPinnedSource(actual, PINNED_LOGO, "Logo"), /Content-Type must be image\/png/);
  assert.equal(isStrictPngContentType("text/html; charset=utf-8"), false);
});

test("rejects correct MIME/hash/dimensions with non-PNG decoded format", () => {
  const actual = {
    finalUrl: PINNED_LOGO.url,
    sha256: PINNED_LOGO.sha256,
    width: PINNED_LOGO.width,
    height: PINNED_LOGO.height,
    contentType: "image/png",
    format: "jpeg",
  };
  assert.throws(() => assertPinnedSource(actual, PINNED_LOGO, "Logo"), /decoded format must be png/);
  assert.throws(() => assertStrictImageMimeAndFormat("image/png", "jpeg", "Logo"), /decoded format must be png/);
});

test("rejects changed manifest source URL", () => {
  const manifest = mutateManifest((value) => {
    value.replacements[0].replacement.sourceUrl = "https://www.dgeniussolutions.com/wp-content/uploads/evil.png";
  });
  const result = validateManifestProvenance(manifest);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.includes("sourceUrl")));
});

test("rejects changed WordPress media ID", () => {
  const manifest = mutateManifest((value) => {
    value.replacements[0].replacement.wordpressMediaId = 99999;
  });
  const result = validateManifestProvenance(manifest);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.includes("wordpressMediaId")));
});

test("rejects changed local path", () => {
  const manifest = mutateManifest((value) => {
    value.replacements[0].replacement.localPath = "/images/case-studies/evil.png";
  });
  const result = validateManifestProvenance(manifest);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.includes("localPath")));
});

test("rejects changed presentation hash", () => {
  const manifest = mutateManifest((value) => {
    value.replacements[0].replacement.presentationSha256 = "0".repeat(64);
  });
  const result = validateManifestProvenance(manifest);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.includes("presentationSha256")));
});

test("rejects changed approved route list", () => {
  const manifest = mutateManifest((value) => {
    value.replacements[0].routes = ["/services/evil/"];
  });
  const result = validateManifestProvenance(manifest);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.includes("routes")));
});

test("approved manifest passes provenance validation", () => {
  const manifest = loadManifest();
  const result = validateManifestProvenance(manifest);
  assert.equal(result.ok, true, result.issues.join("; "));
});

test("manifest builder matches pinned provenance constants", () => {
  const manifest = buildApprovedAssetManifest({
    socialSha256: "test-social-sha",
    weavingsPresentationSha256: "test-presentation-sha",
  });
  assert.equal(manifest.social.defaultShareImage.sourceLogoUrl, PINNED_LOGO.url);
  assert.equal(manifest.social.productionUrl, APPROVED_SOCIAL.productionUrl);
  assert.deepEqual(manifest.replacements[0].routes, WEAVINGS_ROUTES);
  assert.equal(manifest.replacements[0].replacement.wordpressMediaId, PINNED_WEAVINGS_SOURCE.wordpressMediaId);
  assert.equal(manifest.replacements[0].replacement.alt, WEAVINGS_PRESENTATION.alt);
});
