#!/usr/bin/env node
/**
 * Forensic robots.txt comparison across staging, production simulation, and live endpoints.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/audit/robots-forensic-report.json");
const DISALLOWED_PATHS = ["/api/", "/admin/", "/wp-admin/", "/wp-login.php"];
const SITE_URL = "https://www.dgeniussolutions.com";

function buildRobotsManifest(publicIndexing) {
  if (!publicIndexing) {
    return { rules: [{ userAgent: "*", allow: "/" }] };
  }
  const crawlRules = { allow: "/", disallow: DISALLOWED_PATHS };
  return {
    rules: [
      { userAgent: "*", ...crawlRules },
      { userAgent: "Googlebot", ...crawlRules },
      { userAgent: "Bingbot", ...crawlRules },
      { userAgent: "OAI-SearchBot", ...crawlRules },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

function robotsToText(manifest) {
  const lines = [];
  for (const rule of manifest.rules || []) {
    lines.push(`User-agent: ${rule.userAgent}`);
    for (const allow of [rule.allow].flat().filter(Boolean)) lines.push(`Allow: ${allow}`);
    for (const disallow of rule.disallow || []) lines.push(`Disallow: ${disallow}`);
    lines.push("");
  }
  if (manifest.sitemap) lines.push(`Sitemap: ${manifest.sitemap}`);
  if (manifest.host) lines.push(`Host: ${manifest.host}`);
  return lines.join("\n").trim();
}

async function fetchText(url) {
  try {
    const response = await fetch(url, { headers: { "User-Agent": "DGS-Robots-Forensic/1.0" } });
    return { status: response.status, body: await response.text() };
  } catch (error) {
    return { status: 0, body: "", error: String(error.message || error) };
  }
}

const stagingManifest = buildRobotsManifest(false);
const productionManifest = buildRobotsManifest(true);
const dimgrey = await fetchText("https://dimgrey-goat-473970.hostingersite.com/robots.txt");
const productionWp = await fetchText("https://www.dgeniussolutions.com/robots.txt");
const localPort = process.env.ROBOTS_FORENSIC_PORT || "3025";
const local = await fetchText(`http://127.0.0.1:${localPort}/robots.txt`);

const googlebotBlockRe = /User-agent:\s*Googlebot[\s\S]*?Disallow:\s*\/\s*$/im;
const dimgreyHasGooglebotBlock = googlebotBlockRe.test(dimgrey.body);
const repoHasGooglebotBlock =
  googlebotBlockRe.test(robotsToText(stagingManifest)) ||
  googlebotBlockRe.test(robotsToText(productionManifest));

const report = {
  generatedAt: new Date().toISOString(),
  sources: {
    publicDimgrey: {
      url: "https://dimgrey-goat-473970.hostingersite.com/robots.txt",
      status: dimgrey.status,
      body: dimgrey.body,
      googlebotDisallowRoot: dimgreyHasGooglebotBlock,
    },
    localStagingApp: {
      url: `http://127.0.0.1:${localPort}/robots.txt`,
      status: local.status,
      body: local.status === 200 ? local.body : "",
      note: local.status === 200 ? "origin app output" : "local app not reachable",
      googlebotDisallowRoot: local.status === 200 ? googlebotBlockRe.test(local.body) : false,
    },
    repositoryStagingSimulation: {
      env: "DGS_PUBLIC_INDEXING unset/false",
      body: robotsToText(stagingManifest),
      googlebotDisallowRoot: googlebotBlockRe.test(robotsToText(stagingManifest)),
    },
    repositoryProductionSimulation: {
      env: "DGS_PUBLIC_INDEXING=true",
      body: robotsToText(productionManifest),
      googlebotDisallowRoot: googlebotBlockRe.test(robotsToText(productionManifest)),
    },
    productionWordPressReference: {
      url: "https://www.dgeniussolutions.com/robots.txt",
      status: productionWp.status,
      body: productionWp.body,
      googlebotDisallowRoot: googlebotBlockRe.test(productionWp.body),
    },
  },
  findings: {
    googlebotDisallowReproducedOnDimgrey: dimgreyHasGooglebotBlock,
    googlebotDisallowInRepositorySource: repoHasGooglebotBlock,
    classification:
      dimgreyHasGooglebotBlock && !repoHasGooglebotBlock
        ? "HOSTINGER_OR_CDN_INJECTION — not present in Next.js robots-policy.ts"
        : dimgreyHasGooglebotBlock
          ? "REPRODUCED_IN_SOURCE"
          : "FALSE_POSITIVE_OR_RESOLVED",
    productionGooglebotCrawlableInRepoSimulation: !googlebotBlockRe.test(robotsToText(productionManifest)),
    oaiSearchBotCrawlableInRepoSimulation: /User-agent:\s*OAI-SearchBot[\s\S]*Allow:\s*\//i.test(
      robotsToText(productionManifest),
    ),
  },
};

writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.findings, null, 2));
