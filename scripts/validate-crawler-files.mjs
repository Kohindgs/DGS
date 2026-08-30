#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanPath } from "./lib/full-site-route-audit.mjs";

const ROOT = process.cwd();
const PRODUCTION_SITEMAP = "https://www.dgeniussolutions.com/sitemap.xml";
const PRODUCTION_HOST = "https://www.dgeniussolutions.com";

export function parseRobotsGroups(body) {
  const groups = [];
  let current = null;

  const pushCurrent = () => {
    if (current?.agents.length) groups.push(current);
    current = null;
  };

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.split("#")[0].trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (key === "user-agent") {
      if (current && (current.allow.length || current.disallow.length)) {
        pushCurrent();
        current = { agents: [value], allow: [], disallow: [] };
      } else if (current) {
        current.agents.push(value);
      } else {
        current = { agents: [value], allow: [], disallow: [] };
      }
      continue;
    }

    if (!current) current = { agents: ["*"], allow: [], disallow: [] };
    if (key === "allow") current.allow.push(value);
    if (key === "disallow") current.disallow.push(value);
  }

  pushCurrent();
  return groups;
}

export function groupsForAgent(groups, agent) {
  const normalized = agent.toLowerCase();
  const specific = groups.filter((group) =>
    group.agents.some((value) => value.toLowerCase() === normalized),
  );
  if (specific.length) return { groups: specific, matchedBy: "specific" };
  const wildcard = groups.filter((group) => group.agents.some((value) => value === "*"));
  if (wildcard.length) return { groups: wildcard, matchedBy: "wildcard" };
  return { groups: [], matchedBy: "none" };
}

export function resolveRobotsGroup(groups, agent) {
  const resolved = groupsForAgent(groups, agent);
  if (!resolved.groups.length) return { group: null, matchedBy: resolved.matchedBy };
  return {
    group: {
      agents: [...new Set(resolved.groups.flatMap((group) => group.agents))],
      allow: resolved.groups.flatMap((group) => group.allow),
      disallow: resolved.groups.flatMap((group) => group.disallow),
    },
    matchedBy: resolved.matchedBy,
  };
}

export function rootPathBlocked(group) {
  if (!group) return false;
  return group.disallow.some((rule) => rule === "/");
}

export function evaluateCrawlerAccess(groups, agent) {
  const resolved = resolveRobotsGroup(groups, agent);
  return {
    agent,
    matchedBy: resolved.matchedBy,
    crawlable: !rootPathBlocked(resolved.group),
  };
}

export function extractSitemapLocs(body) {
  return [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((match) => match[1].trim());
}

export function compareSitemapUrls(actualLocs, expectedPaths) {
  const expectedUrls = expectedPaths
    .map((routePath) => `${PRODUCTION_HOST}${routePath === "/" ? "/" : routePath}`)
    .sort();
  const actualUrls = [...actualLocs].sort();
  const expectedSet = new Set(expectedUrls);
  const actualSet = new Set(actualUrls);

  const missing = expectedUrls.filter((url) => !actualSet.has(url));
  const unexpected = actualUrls.filter((url) => !expectedSet.has(url));
  const duplicates = actualUrls.filter((url, index) => actualUrls.indexOf(url) !== index);

  return {
    expectedCount: expectedUrls.length,
    actualCount: actualUrls.length,
    missing,
    unexpected,
    duplicates: [...new Set(duplicates)],
  };
}

export function loadExpectedSitemapPaths(root = ROOT) {
  const indexability = JSON.parse(
    readFileSync(path.join(root, "data/migration/indexability-manifest.generated.json"), "utf8"),
  );
  return indexability.routes
    .filter((route) => route.indexable && route.includeInSitemap)
    .map((route) => cleanPath(route.path))
    .sort();
}

async function fetchInfo(base, route) {
  const url = `${base.replace(/\/$/, "")}${route}`;
  const response = await fetch(url, { headers: { "User-Agent": "DGS-Crawler-Files/1.0" } });
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();
  return { status: response.status, contentType, body };
}

export async function validateCrawlerFiles(options = {}) {
  const base = (options.target || process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025").replace(/\/$/, "");
  const root = options.root || ROOT;
  const failures = [];
  const checks = [];

  const robots = await fetchInfo(base, "/robots.txt");
  const robotsLeak = /dimgrey-goat-473970\.hostingersite\.com/i.test(robots.body);
  const robotsHas400050 = /400050/.test(robots.body);
  const robotsGroups = parseRobotsGroups(robots.body);
  const googlebot = evaluateCrawlerAccess(robotsGroups, "Googlebot");
  const oaiSearchBot = evaluateCrawlerAccess(robotsGroups, "OAI-SearchBot");
  const sitemapDirectivePresent = robots.body.includes(`Sitemap: ${PRODUCTION_SITEMAP}`);

  if (robots.status !== 200) failures.push({ route: "/robots.txt", issue: "status", status: robots.status });
  if (!robots.contentType.includes("text/plain")) failures.push({ route: "/robots.txt", issue: "content-type", contentType: robots.contentType });
  if (robotsLeak) failures.push({ route: "/robots.txt", issue: "dimgrey-leak" });
  if (robotsHas400050) failures.push({ route: "/robots.txt", issue: "400050" });
  if (!googlebot.crawlable) failures.push({ route: "/robots.txt", issue: "googlebot-root-blocked", ...googlebot });
  if (!oaiSearchBot.crawlable) failures.push({ route: "/robots.txt", issue: "oai-searchbot-root-blocked", ...oaiSearchBot });
  if (!sitemapDirectivePresent) failures.push({ route: "/robots.txt", issue: "missing-production-sitemap-directive" });

  checks.push({
    route: "/robots.txt",
    ok: !failures.some((failure) => failure.route === "/robots.txt"),
    status: robots.status,
    contentType: robots.contentType,
    googlebot,
    oaiSearchBot,
  });

  const sitemap = await fetchInfo(base, "/sitemap.xml");
  const sitemapLocs = extractSitemapLocs(sitemap.body);
  const expectedPaths = loadExpectedSitemapPaths(root);
  const sitemapComparison = compareSitemapUrls(sitemapLocs, expectedPaths);

  if (sitemap.status !== 200) failures.push({ route: "/sitemap.xml", issue: "status", status: sitemap.status });
  if (!sitemap.contentType.includes("xml")) failures.push({ route: "/sitemap.xml", issue: "content-type", contentType: sitemap.contentType });
  if (/dimgrey-goat-473970\.hostingersite\.com/i.test(sitemap.body)) failures.push({ route: "/sitemap.xml", issue: "dimgrey-leak" });
  if (sitemapComparison.expectedCount !== 96) failures.push({ route: "/sitemap.xml", issue: "unexpected-expected-count", count: sitemapComparison.expectedCount });
  if (sitemapComparison.actualCount !== sitemapComparison.expectedCount) {
    failures.push({
      route: "/sitemap.xml",
      issue: "count-mismatch",
      expected: sitemapComparison.expectedCount,
      actual: sitemapComparison.actualCount,
    });
  }
  if (sitemapComparison.missing.length) failures.push({ route: "/sitemap.xml", issue: "missing-urls", count: sitemapComparison.missing.length });
  if (sitemapComparison.unexpected.length) failures.push({ route: "/sitemap.xml", issue: "unexpected-urls", count: sitemapComparison.unexpected.length });
  if (sitemapComparison.duplicates.length) failures.push({ route: "/sitemap.xml", issue: "duplicate-urls", count: sitemapComparison.duplicates.length });
  for (const loc of sitemapLocs) {
    if (!loc.startsWith(`${PRODUCTION_HOST}/`) && loc !== `${PRODUCTION_HOST}/`) {
      failures.push({ route: "/sitemap.xml", issue: "non-production-hostname", loc });
    }
  }

  checks.push({
    route: "/sitemap.xml",
    ok: !failures.some((failure) => failure.route === "/sitemap.xml"),
    status: sitemap.status,
    contentType: sitemap.contentType,
    sitemapComparison,
  });

  for (const [route, contentTypes] of [
    ["/llms.txt", ["text/plain"]],
    ["/llms-full.txt", ["text/plain"]],
    ["/locations.kml", ["kml", "xml"]],
  ]) {
    const info = await fetchInfo(base, route);
    const leak = /dimgrey-goat-473970\.hostingersite\.com/i.test(info.body);
    const has400050 = /400050/.test(info.body);
    const ok =
      info.status === 200 &&
      contentTypes.some((type) => info.contentType.includes(type)) &&
      !leak &&
      !has400050;
    if (!ok) failures.push({ route, status: info.status, contentType: info.contentType, leak, has400050 });
    checks.push({ route, ok, status: info.status, contentType: info.contentType, leak, has400050 });
  }

  return {
    ok: failures.length === 0,
    checks,
    failures,
    robots: { googlebot, oaiSearchBot },
    sitemap: sitemapComparison,
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isMain) {
  const result = await validateCrawlerFiles();
  console.log(result.ok ? "PASS — CRAWLER FILES" : "FAIL — CRAWLER FILES");
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        googlebot: result.robots.googlebot,
        oaiSearchBot: result.robots.oaiSearchBot,
        sitemap: result.sitemap,
        failureCount: result.failures.length,
        failures: result.failures.slice(0, 20),
      },
      null,
      2,
    ),
  );
  process.exit(result.ok ? 0 : 1);
}
