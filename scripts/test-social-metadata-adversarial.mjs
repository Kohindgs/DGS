#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  APPROVED_DEFAULT_SHARE_IMAGE_URL,
  APPROVED_TWITTER_CARD,
  deriveSocialMetadataStatus,
  evaluatePageSocialMetadata,
  recomputeSocialSummary,
  validateApprovedSocialImageUrl,
  validateApprovedTwitterCard,
} from "./lib/social-metadata-validation.mjs";
import { computeReportDataDigest } from "./lib/ranking-readiness-integrity.mjs";

const ROOT = process.cwd();
const VALIDATOR = path.join(ROOT, "scripts/validate-full-site-ranking-readiness.mjs");

function basePage(overrides = {}) {
  return {
    path: "/",
    status: 200,
    title: "Home",
    description: "Desc",
    h1Count: 1,
    canonical: "https://www.dgeniussolutions.com/",
    schemaTypes: ["WebPage"],
    ogImage: APPROVED_DEFAULT_SHARE_IMAGE_URL,
    twitterImage: APPROVED_DEFAULT_SHARE_IMAGE_URL,
    twitterCard: APPROVED_TWITTER_CARD,
    mobileOverflow: { "390x844": false, "430x932": false },
    classification: "READY_FOR_PAGE_OPTIMIZATION",
    blockingDefects: [],
    recommendations: [],
    ...overrides,
  };
}

function runValidatorWithReport(report) {
  const auditPath = path.join(ROOT, "data/audit/full-site-ranking-readiness.json");
  const original = readFileSync(auditPath, "utf8");
  writeFileSync(auditPath, `${JSON.stringify(report, null, 2)}\n`);
  try {
    return execFileSync("node", [VALIDATOR], { cwd: ROOT, encoding: "utf8", stdio: "pipe" });
  } catch (error) {
    error.stdout = error.stdout?.toString?.() || "";
    error.stderr = error.stderr?.toString?.() || "";
    throw error;
  } finally {
    writeFileSync(auditPath, original);
  }
}

test("approved social image URL accepts only exact production asset", () => {
  assert.equal(validateApprovedSocialImageUrl(APPROVED_DEFAULT_SHARE_IMAGE_URL).ok, true);
  assert.equal(validateApprovedSocialImageUrl("http://www.dgeniussolutions.com/images/social/dgs-default-share.png").ok, false);
  assert.equal(validateApprovedSocialImageUrl("https://evil.example/?dgeniussolutions.com/images/social/dgs-default-share.png").ok, false);
  assert.equal(validateApprovedSocialImageUrl("https://dimgrey-goat-473970.hostingersite.com/images/social/dgs-default-share.png").ok, false);
  assert.equal(validateApprovedSocialImageUrl(undefined).ok, false);
});

test("missing twitter image is a social defect", () => {
  const page = basePage({ twitterImage: "" });
  const social = evaluatePageSocialMetadata(page);
  assert.equal(social.twitterImageDefect, true);
  const summary = recomputeSocialSummary([page]);
  assert.equal(summary.twitterImageDefects, 1);
  assert.equal(deriveSocialMetadataStatus([page]), "SOCIAL_METADATA_DEFECTS_PRESENT");
});

test("wrong twitter card is a social defect", () => {
  const page = basePage({ twitterCard: "summary" });
  const social = evaluatePageSocialMetadata(page);
  assert.equal(social.twitterCardDefect, true);
  assert.equal(validateApprovedTwitterCard("summary").ok, false);
});

test("report digest includes social URLs and twitter card", () => {
  const page = basePage();
  const report = {
    auditSchemaVersion: "2B.1A",
    generatedAt: new Date().toISOString(),
    target: "http://127.0.0.1:3025/",
    expectedIndexableUrlCount: 1,
    applicationSourceCommit: "b90118c17fc0950071979686ebeb81dadd03320c",
    auditInputDigest: "input",
    mobileOverflowEvidence: {
      reused: true,
      sourceCommit: "b90118c17fc0950071979686ebeb81dadd03320c",
      sourceReportGeneratedAt: "2026-08-30T10:25:52.770Z",
      sourceEvidencePath: "data/audit/mobile-overflow-evidence.b90118c.json",
      mobileEvidenceDigest: "mobile",
      viewports: ["390x844", "430x932"],
    },
    summary: {
      intendedIndexableUrls: 1,
      rankingProtected: 0,
      readyForPageOptimization: 1,
      technicalFixRequired: 0,
      contentStrategyRequired: 0,
      cannibalizationReview: 0,
      missingTitleDefects: 0,
      missingDescriptionDefects: 0,
      titleLengthRecommendations: 0,
      descriptionLengthRecommendations: 0,
      h1Defects: 0,
      canonicalDefects: 0,
      schemaDefects: 0,
      ogImageDefects: 0,
      twitterImageDefects: 0,
      twitterCardDefects: 0,
      overflowPages: 0,
    },
    pages: [page],
  };
  const digest = computeReportDataDigest(report);
  const mutated = structuredClone(report);
  mutated.pages[0].twitterCard = "summary";
  assert.notEqual(computeReportDataDigest(mutated), digest);
});

const adversarialCases = [
  {
    name: "missing twitter:image",
    mutate: (page) => {
      page.twitterImage = "";
      page.twitterImageMissing = false;
    },
  },
  {
    name: "twitterImageDefects summary drift",
    mutate: (_page, summary) => {
      summary.twitterImageDefects = 1;
    },
  },
  {
    name: "evil.example OG image",
    mutate: (page) => {
      page.ogImage = "https://evil.example/?dgeniussolutions.com/images/social/dgs-default-share.png";
      page.ogImageMissing = false;
    },
  },
  {
    name: "http twitter image",
    mutate: (page) => {
      page.twitterImage = "http://www.dgeniussolutions.com/images/social/dgs-default-share.png";
      page.twitterImageMissing = false;
    },
  },
];

for (const adversarial of adversarialCases) {
  test(`adversarial validator exits 1 for ${adversarial.name}`, () => {
    const audit = JSON.parse(readFileSync(path.join(ROOT, "data/audit/full-site-ranking-readiness.json"), "utf8"));
    const pages = structuredClone(audit.pages || []);
    const target = pages.find((entry) => entry.path === "/") || pages[0];
    const summary = structuredClone(audit.summary || {});
    adversarial.mutate(target, summary);
    const socialSummary = recomputeSocialSummary(pages);
    if (adversarial.name !== "twitterImageDefects summary drift") {
      summary.ogImageDefects = socialSummary.ogImageDefects;
      summary.twitterImageDefects = socialSummary.twitterImageDefects;
      summary.twitterCardDefects = socialSummary.twitterCardDefects;
    }
    const report = {
      ...audit,
      pages,
      summary,
    };
    report.reportDataDigest = computeReportDataDigest(report);
    assert.throws(() => runValidatorWithReport(report));
  });
}
