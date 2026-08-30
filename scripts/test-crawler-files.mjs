#!/usr/bin/env node
import assert from "node:assert/strict";
import test from "node:test";
import {
  compareSitemapUrls,
  evaluateCrawlerAccess,
  parseRobotsGroups,
  rootPathBlocked,
} from "./validate-crawler-files.mjs";

test("consecutive Googlebot and Bingbot agents with Disallow: / block both", () => {
  const groups = parseRobotsGroups(`User-agent: Googlebot\nUser-agent: Bingbot\nDisallow: /`);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].agents, ["Googlebot", "Bingbot"]);
  const googlebot = evaluateCrawlerAccess(groups, "Googlebot");
  const bingbot = evaluateCrawlerAccess(groups, "Bingbot");
  assert.equal(googlebot.crawlable, false);
  assert.equal(bingbot.crawlable, false);
  assert.equal(googlebot.matchedBy, "specific");
});

test("Googlebot specific allow overrides unrelated wildcard root block", () => {
  const groups = parseRobotsGroups(`User-agent: Googlebot\nAllow: /\n\nUser-agent: *\nDisallow: /`);
  const googlebot = evaluateCrawlerAccess(groups, "Googlebot");
  const wildcard = evaluateCrawlerAccess(groups, "*");
  assert.equal(googlebot.crawlable, true);
  assert.equal(googlebot.matchedBy, "specific");
  assert.equal(wildcard.crawlable, false);
});

test("later group rules do not leak backward", () => {
  const groups = parseRobotsGroups(`User-agent: Googlebot\nAllow: /\n\nUser-agent: *\nDisallow: /`);
  assert.equal(rootPathBlocked(groups[0]), false);
  assert.equal(rootPathBlocked(groups[1]), true);
  const googlebot = evaluateCrawlerAccess(groups, "Googlebot");
  assert.equal(googlebot.crawlable, true);
});

test("empty Disallow remains crawlable", () => {
  const groups = parseRobotsGroups(`User-agent: Googlebot\nDisallow:\n\nUser-agent: *\nAllow: /`);
  const googlebot = evaluateCrawlerAccess(groups, "Googlebot");
  assert.equal(rootPathBlocked(groups[0]), false);
  assert.equal(googlebot.crawlable, true);
});

test("exact root disallow fails", () => {
  const groups = parseRobotsGroups(`User-agent: Googlebot\nDisallow: /`);
  assert.equal(rootPathBlocked(groups[0]), true);
  assert.equal(evaluateCrawlerAccess(groups, "Googlebot").crawlable, false);
});

test("OAI-SearchBot root block fails", () => {
  const groups = parseRobotsGroups(`User-agent: OAI-SearchBot\nDisallow: /\n\nUser-agent: *\nAllow: /`);
  const result = evaluateCrawlerAccess(groups, "OAI-SearchBot");
  assert.equal(result.crawlable, false);
  assert.equal(result.matchedBy, "specific");
});

test("safe wildcard access passes", () => {
  const groups = parseRobotsGroups(`User-agent: *\nAllow: /\nDisallow: /api/`);
  const googlebot = evaluateCrawlerAccess(groups, "Googlebot");
  const oai = evaluateCrawlerAccess(groups, "OAI-SearchBot");
  assert.equal(googlebot.crawlable, true);
  assert.equal(googlebot.matchedBy, "wildcard");
  assert.equal(oai.crawlable, true);
});

test("production-simulation robots marks Googlebot and OAI-SearchBot as specific and crawlable", () => {
  const body = `User-Agent: *
Allow: /
Disallow: /api/

User-Agent: Googlebot
Allow: /
Disallow: /api/

User-Agent: Bingbot
Allow: /
Disallow: /api/

User-Agent: OAI-SearchBot
Allow: /
Disallow: /api/`;
  const groups = parseRobotsGroups(body);
  const googlebot = evaluateCrawlerAccess(groups, "Googlebot");
  const oai = evaluateCrawlerAccess(groups, "OAI-SearchBot");
  assert.equal(googlebot.matchedBy, "specific");
  assert.equal(googlebot.crawlable, true);
  assert.equal(oai.matchedBy, "specific");
  assert.equal(oai.crawlable, true);
});

test("missing sitemap URL fails comparison", () => {
  const comparison = compareSitemapUrls(["https://www.dgeniussolutions.com/"], ["/", "/about-us/"]);
  assert.equal(comparison.missing.length, 1);
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
