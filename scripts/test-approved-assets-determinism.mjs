#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildApprovedAssetManifest, sha256Buffer } from "./lib/approved-assets.mjs";

const ROOT = process.cwd();

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

test("approved asset generation is deterministic", () => {
  const beforeManifest = readFileSync(path.join(ROOT, "data/migration/approved-asset-replacements.json"), "utf8");
  const beforeSocial = readFileSync(path.join(ROOT, "public/images/social/dgs-default-share.png"));
  const beforeSource = readFileSync(path.join(ROOT, "public/images/case-studies/weavings-home-page-64820-source.png"));
  const beforePresentation = readFileSync(path.join(ROOT, "public/images/case-studies/weavings-home-page-64820.png"));

  execFileSync("node", ["scripts/build-approved-assets.mjs"], { cwd: ROOT, stdio: "pipe" });

  const afterManifest = readFileSync(path.join(ROOT, "data/migration/approved-asset-replacements.json"), "utf8");
  const afterSocial = readFileSync(path.join(ROOT, "public/images/social/dgs-default-share.png"));
  const afterSource = readFileSync(path.join(ROOT, "public/images/case-studies/weavings-home-page-64820-source.png"));
  const afterPresentation = readFileSync(path.join(ROOT, "public/images/case-studies/weavings-home-page-64820.png"));

  assert.equal(beforeManifest, afterManifest);
  assert.equal(sha256Buffer(beforeSocial), sha256Buffer(afterSocial));
  assert.equal(sha256Buffer(beforeSource), sha256Buffer(afterSource));
  assert.equal(sha256Buffer(beforePresentation), sha256Buffer(afterPresentation));
});

test("approved asset manifest builder is stable", () => {
  const manifest = buildApprovedAssetManifest({
    socialSha256: "abc",
    weavingsPresentationSha256: "def",
  });
  const again = buildApprovedAssetManifest({
    socialSha256: "abc",
    weavingsPresentationSha256: "def",
  });
  assert.deepEqual(manifest, again);
});

test("capture script rejects invalid commit SHA", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "capture-guard-"));
  try {
  const result = execFileSync(
    "node",
    ["scripts/capture-mobile-overflow-evidence.mjs"],
    { cwd: ROOT, env: { ...process.env, MOBILE_EVIDENCE_SOURCE_COMMIT: "deadbeef" }, encoding: "utf8", stdio: "pipe" },
  );
  assert.fail(`expected failure, got ${result}`);
  } catch (error) {
    assert.match(String(error.stderr || error.stdout || error.message), /40-character commit SHA/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
