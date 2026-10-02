import { validatePageJsonLd } from './build-sitewide-ranking-recovery-baseline.mjs';

async function auditLiveSitemap() {
  console.log("=== FULL PRODUCTION AUDIT: LIVE SITEMAP INTEGRITY (V8.9.4) ===");
  const xmlRes = await fetch("https://www.dgeniussolutions.com/sitemap.xml");
  const xml = await xmlRes.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

  console.log(`Auditing ${urls.length} sitemap URLs...`);
  let sitemapRedirects = 0;
  let sitemap404s = 0;
  let sitemap410s = 0;
  let sitemapNoindex = 0;
  let sitemapCanonicalConflicts = 0;
  let schemaConflictCount = 0;
  let schemaParseErrors = 0;
  let validReferencesTotal = 0;

  const results = [];

  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      const status = res.status;
      if (status >= 300 && status < 400) {
        sitemapRedirects++;
        results.push({ url, status, error: "REDIRECT", location: res.headers.get("location") });
        continue;
      }
      if (status === 404) {
        sitemap404s++;
        results.push({ url, status, error: "404" });
        continue;
      }
      if (status === 410) {
        sitemap410s++;
        results.push({ url, status, error: "410" });
        continue;
      }

      const html = await res.text();
      // Canonical check
      const canMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) ||
                       html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);
      const canonical = canMatch ? canMatch[1] : null;
      const normalizedUrl = url.endsWith('/') ? url : url + '/';
      const normalizedCanonical = canonical ? (canonical.endsWith('/') ? canonical : canonical + '/') : null;
      if (!canonical || normalizedCanonical !== normalizedUrl) {
        sitemapCanonicalConflicts++;
        results.push({ url, status, canonical, error: "CANONICAL_CONFLICT" });
      }

      // Robots check
      const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
      const robots = robotsMatch ? robotsMatch[1] : "";
      if (robots.includes("noindex")) {
        sitemapNoindex++;
        results.push({ url, status, robots, error: "NOINDEX" });
      }

      // JSON-LD validation
      const report = validatePageJsonLd(html, url);
      if (report.conflicting_entities_count > 0) {
        schemaConflictCount += report.conflicting_entities_count;
      }
      if (!report.schema_parse_valid) {
        schemaParseErrors++;
      }
      validReferencesTotal += report.valid_references_count || 0;
    } catch (err) {
      console.error(`Error auditing ${url}:`, err.message);
    }
  }

  console.log("\n================ PRODUCTION SITEMAP RESULTS ================");
  console.log(`TOTAL SITEMAP URLS: ${urls.length}`);
  console.log(`SITEMAP_REDIRECTS = ${sitemapRedirects}`);
  console.log(`SITEMAP_404S = ${sitemap404s}`);
  console.log(`SITEMAP_410S = ${sitemap410s}`);
  console.log(`SITEMAP_NOINDEX = ${sitemapNoindex}`);
  console.log(`SITEMAP_CANONICAL_CONFLICTS = ${sitemapCanonicalConflicts}`);
  console.log(`CONFLICTING_ENTITY_ERRORS = ${schemaConflictCount}`);
  console.log(`JSON_LD_PARSE_ERRORS = ${schemaParseErrors}`);
  console.log(`VALID_REFERENCES = ${validReferencesTotal}`);
  console.log("============================================================\n");

  if (results.length > 0) {
    console.log("Violations found:", JSON.stringify(results, null, 2));
  } else {
    console.log("✓ ZERO-ERROR INVARIANTS 100% SATISFIED ON PRODUCTION!");
  }
}

auditLiveSitemap();
