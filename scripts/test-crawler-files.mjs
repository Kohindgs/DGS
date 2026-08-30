#!/usr/bin/env node
import assert from "node:assert/strict";
import test from "node:test";
import {
  compareSitemapUrls,
  evaluateCrawlerAccess,
  parseRobotsGroups,
  rootPathBlocked,
} from "./validate-crawler-files.mjs";

test("Googlebot root block fails", () => {
  const groups = parseRobotsGroups(`User-agent: Googlebot\nDisallow: /\n\nUser-agent: *\nAllow: /`);
  const result = evaluateCrawlerAccess(groups, "Googlebot");
  assert.equal(result.crawlable, false);
  assert.equal(result.matchedBy, "specific");
});

test("OAI-SearchBot root block fails", () => {
  const groups = parseRobotsGroups(`User-agent: OAI-SearchBot\nDisallow: /\n\nUser-agent: *\nAllow: /`);
  const result = evaluateCrawlerAccess(groups, "OAI-SearchBot");
  assert.equal(result.crawlable, false);
});

test("safe wildcard access passes", () => {
  const groups = parseRobotsGroups(`User-agent: *\nAllow: /\nDisallow: /api/`);
  const googlebot = evaluateCrawlerAccess(groups, "Googlebot");
  const oai = evaluateCrawlerAccess(groups, "OAI-SearchBot");
  assert.equal(googlebot.crawlable, true);
  assert.equal(googlebot.matchedBy, "wildcard");
  assert.equal(oai.crawlable, true);
});

test("rules from a later agent group cannot be attributed to an earlier group", () => {
  const groups = parseRobotsGroups(`User-agent: Googlebot\nAllow: /\n\nUser-agent: *\nDisallow: /`);
  const googlebot = evaluateCrawlerAccess(groups, "Googlebot");
  const wildcard = evaluateCrawlerAccess(groups, "*");
  assert.equal(googlebot.crawlable, true);
  assert.equal(wildcard.crawlable, false);
  assert.equal(rootPathBlocked(groups[0]), false);
  assert.equal(rootPathBlocked(groups[1]), true);
});

test("missing sitemap URL fails comparison", () => {
  const comparison = compareSitemapUrls(["https://www.dgeniussolutions.com/"], ["/", "/about-us/"]);
  assert.equal(comparison.missing.length, 1);
  assert.equal(comparison.missing[0], "https://www.dgeniussolutions.com/about-us/");
});

test("unexpected sitemap URL fails comparison", () => {
  const comparison = compareSitemapUrls(
    ["https://www.dgeniussolutions.com/", "https://www.dgeniussolutions.com/extra/"],
    ["/"],
  );
  assert.equal(comparison.unexpected.length, 1);
});

test("duplicate sitemap URL fails comparison", () => {
  const comparison = compareSitemapUrls(
    ["https://www.dgeniussolutions.com/", "https://www.dgeniussolutions.com/"],
    ["/"],
  );
  assert.equal(comparison.duplicates.length, 1);
});
