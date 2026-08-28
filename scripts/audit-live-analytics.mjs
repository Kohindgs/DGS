import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SITE = new URL(process.env.DGS_SOURCE_URL || "https://www.dgeniussolutions.com");
const OUT_DIR = path.join(ROOT, "data/audit/live");
const tier0 = JSON.parse(await readFile(path.join(ROOT, "data/migration/tier0-routes.json"), "utf8"));

const routes = ["/", ...tier0.routes.map((route) => route.path)];
const uniqueRoutes = [...new Set(routes)];
const reports = [];

for (const route of uniqueRoutes) {
  const url = new URL(route, SITE);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { Accept: "text/html,*/*", "User-Agent": "DGS-NextJS-Analytics-Audit/1.0" },
    });
    const html = await response.text();
    reports.push({
      path: route,
      status: response.status,
      finalUrl: response.url,
      googleTagManagerIds: uniqueMatches(html, /GTM-[A-Z0-9]+/g),
      googleAnalytics4Ids: uniqueMatches(html, /G-[A-Z0-9]+/g),
      googleAdsIds: uniqueMatches(html, /AW-[0-9]+/g),
      measurementProtocolMentions: countMatches(html, /google-analytics\.com\/g\/collect|analytics\.google\.com|gtag\s*\(/gi),
      gtmLoaderMentions: countMatches(html, /googletagmanager\.com\/(?:gtm|gtag)\.js/gi),
      dataLayerMentions: countMatches(html, /dataLayer/gi),
      fluentFormMentions: countMatches(html, /fluentform|fluent_form/gi),
      metaPixelMentions: countMatches(html, /connect\.facebook\.net|fbq\s*\(/gi),
      linkedinInsightMentions: countMatches(html, /snap\.licdn\.com|_linkedin_partner_id/gi),
      sourceScripts: scriptSources(html),
    });
  } catch (error) {
    reports.push({ path: route, status: 0, error: String(error) });
  }
}

const allGtm = new Set(reports.flatMap((item) => item.googleTagManagerIds || []));
const allGa4 = new Set(reports.flatMap((item) => item.googleAnalytics4Ids || []));
const allAds = new Set(reports.flatMap((item) => item.googleAdsIds || []));
const warnings = [];
if (allGtm.size > 1) warnings.push(`Multiple GTM container IDs detected: ${[...allGtm].join(", ")}`);
if (allGa4.size > 1) warnings.push(`Multiple GA4 measurement IDs detected: ${[...allGa4].join(", ")}`);
if (allAds.size > 1) warnings.push(`Multiple Google Ads IDs detected: ${[...allAds].join(", ")}`);

const output = {
  generatedAt: new Date().toISOString(),
  source: SITE.origin,
  warning: "Public tag detection establishes implementation evidence only. It does not prove which properties/accounts are authoritative or which events/conversions are configured in Google products.",
  detected: {
    googleTagManagerIds: [...allGtm].sort(),
    googleAnalytics4Ids: [...allGa4].sort(),
    googleAdsIds: [...allAds].sort(),
  },
  warnings,
  pages: reports,
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "analytics-tags.generated.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ detected: output.detected, warnings }, null, 2));

function uniqueMatches(value, regex) {
  return [...new Set(value.match(regex) || [])].sort();
}
function countMatches(value, regex) {
  return [...value.matchAll(regex)].length;
}
function scriptSources(html) {
  const sources = [];
  for (const tag of html.match(/<script\b[^>]*>/gi) || []) {
    const match = tag.match(/\ssrc\s*=\s*["']([^"']+)["']/i);
    if (match) sources.push(match[1]);
  }
  return [...new Set(sources)].sort();
}
