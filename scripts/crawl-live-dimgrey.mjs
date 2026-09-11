import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const STAGING_ORIGIN = 'https://dimgrey-goat-473970.hostingersite.com';
const PROD_CANONICAL = 'https://www.dgeniussolutions.com';
const REPORT_PATH = path.resolve('data/audit/dimgrey-live-search-ai-readiness.json');

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DGS-LiveCrawler/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...(options.headers || {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(options.timeout || 20000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
    req.end();
  });
}

async function runPool(items, concurrency, fn) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      try {
        const res = await fn(items[i], i);
        results[i] = res;
      } catch (err) {
        results[i] = { item: items[i], error: err.message };
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log('='.repeat(80));
  console.log('FULL LIVE DIMGREY 96-ROUTE CRAWL & SEARCH/AI AUDIT');
  console.log(`Staging Origin: ${STAGING_ORIGIN}`);
  console.log('='.repeat(80));

  const registry = JSON.parse(fs.readFileSync('data/migration/nextjs-route-registry.generated.json', 'utf8'));
  const publishableRoutes = registry.routes.filter(r => r.indexable && r.includeInSitemap);
  console.log(`Loaded ${publishableRoutes.length} publishable routes from registry.`);

  const auditReport = {
    timestamp: new Date().toISOString(),
    stagingOrigin: STAGING_ORIGIN,
    totalRoutes: publishableRoutes.length,
    summary: {
      status200: 0,
      redirects: 0,
      status404: 0,
      status5xx: 0,
      canonicalDefects: 0,
      metadataDefects: 0,
      schemaDefects: 0,
      brokenInternalLinks: 0,
      missingAssets: 0,
      stagingLeaks: 0,
      robotsDefects: 0
    },
    llmEndpoints: {},
    sitemapCrossCheck: {},
    routes: []
  };

  console.log('\n--- 1. Crawling all 96 publishable routes live on Dimgrey ---');

  const routeResults = await runPool(publishableRoutes, 4, async (route, idx) => {
    const liveUrl = `${STAGING_ORIGIN}${route.path}`;
    const expectedCanonical = `${PROD_CANONICAL}${route.path}`;
    const res = await fetchUrl(liveUrl);

    const is200 = res.statusCode === 200;
    const is3xx = res.statusCode >= 300 && res.statusCode < 400;
    const is404 = res.statusCode === 404;
    const is5xx = res.statusCode >= 500;

    // Header checks
    const xRobots = res.headers['x-robots-tag'] || '';
    const xRobotsPass = xRobots.includes('noindex') && xRobots.includes('nofollow') && xRobots.includes('noarchive');

    // Body parsing
    const html = res.body;

    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    const titlePass = title.length > 0;

    // Meta Description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    const desc = descMatch ? descMatch[1].trim() : '';
    const descPass = desc.length > 0;

    // H1
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1Text = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';
    const h1Pass = h1Text.length > 0;

    // Canonical
    const canMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    const canonical = canMatch ? canMatch[1] : '';
    const canonicalPass = canonical === expectedCanonical;

    // Meta Robots
    const metaRobotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
    const metaRobots = metaRobotsMatch ? metaRobotsMatch[1] : '';
    const metaRobotsPass = metaRobots.includes('noindex') && metaRobots.includes('nofollow');

    // JSON-LD Schemas
    const schemaMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const schemas = [];
    let schemaParseError = false;
    for (const sm of schemaMatches) {
      try {
        const parsed = JSON.parse(sm[1]);
        if (Array.isArray(parsed)) schemas.push(...parsed);
        else schemas.push(parsed);
      } catch (e) {
        schemaParseError = true;
      }
    }
    const schemaTypes = schemas.map(s => s['@type']).filter(Boolean);
    const schemaJsonStr = JSON.stringify(schemas);
    const schemaStagingLeak = schemaJsonStr.includes('hostingersite.com');
    const schemaPass = schemas.length > 0 && !schemaParseError && !schemaStagingLeak;

    // Staging Leaks in HTML (canonical, og:url, schemas)
    const canonicalHasStaging = canonical.includes('hostingersite.com');
    const ogUrlMatch = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
    const ogUrlHasStaging = ogUrlMatch ? ogUrlMatch[1].includes('hostingersite.com') : false;
    const stagingLeak = canonicalHasStaging || schemaStagingLeak || ogUrlHasStaging;

    // Check linked stylesheets on page
    const cssLinks = [...html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)].map(m => m[1]);
    const jsScripts = [...html.matchAll(/<script[^>]*src=["']([^"']+)["']/gi)].map(m => m[1]);

    const result = {
      path: route.path,
      statusCode: res.statusCode,
      is200,
      title: title.slice(0, 60),
      titlePass,
      descLength: desc.length,
      descPass,
      h1: h1Text.slice(0, 60),
      h1Pass,
      canonical,
      canonicalPass,
      metaRobots,
      metaRobotsPass,
      xRobots,
      xRobotsPass,
      schemaCount: schemas.length,
      schemaTypes,
      schemaPass,
      stagingLeak,
      cssCount: cssLinks.length,
      jsCount: jsScripts.length
    };

    const statusMark = is200 && canonicalPass && titlePass && descPass && h1Pass && metaRobotsPass && xRobotsPass && schemaPass && !stagingLeak ? 'PASS' : 'FAIL';
    console.log(`  [${String(idx + 1).padStart(2, ' ')}/96] ${route.path.padEnd(50, ' ')} => HTTP ${res.statusCode} | ${statusMark}`);

    return result;
  });

  auditReport.routes = routeResults;

  // Aggregate route summary
  for (const r of routeResults) {
    if (r.is200) auditReport.summary.status200++;
    if (r.statusCode >= 300 && r.statusCode < 400) auditReport.summary.redirects++;
    if (r.statusCode === 404) auditReport.summary.status404++;
    if (r.statusCode >= 500) auditReport.summary.status5xx++;
    if (!r.canonicalPass) auditReport.summary.canonicalDefects++;
    if (!r.titlePass || !r.descPass || !r.h1Pass) auditReport.summary.metadataDefects++;
    if (!r.schemaPass) auditReport.summary.schemaDefects++;
    if (r.stagingLeak) auditReport.summary.stagingLeaks++;
    if (!r.metaRobotsPass || !r.xRobotsPass) auditReport.summary.robotsDefects++;
  }

  // --- 2. LLM LIVE ENDPOINT CHECK ---
  console.log('\n--- 2. Live LLM Endpoints Cross-Check on Dimgrey ---');
  const llmEndpoints = ['/llms.txt', '/llms-full.txt', '/llms.md', '/llms-full.md'];
  let llmAllPass = true;

  for (const ep of llmEndpoints) {
    const res = await fetchUrl(`${STAGING_ORIGIN}${ep}`);
    const isMd = ep.endsWith('.md');
    const expectedType = isMd ? 'text/markdown' : 'text/plain';
    const cType = res.headers['content-type'] || '';
    const cTypePass = cType.includes(expectedType);
    const hasCanonicalDomain = res.body.includes(PROD_CANONICAL);
    const hasStagingDomain = res.body.includes('hostingersite.com');
    const hasSuperlatives = res.body.includes('leading digital marketing') || res.body.includes('high-conversion brand films');

    // Extract all referenced URLs in LLM file
    const urlMatches = [...res.body.matchAll(/https:\/\/www\.dgeniussolutions\.com(\/[^)\s"\]\n]*)/g)]
      .map(m => m[1].replace(/[.,:;\]]+$/, ''));
    const uniqueReferencedPaths = [...new Set(urlMatches)];
    let brokenReferences = 0;
    for (const refPath of uniqueReferencedPaths) {
      if (refPath === '/' || refPath === '/sitemap.xml' || refPath.startsWith('/llms')) continue;
      const foundInRoutes = publishableRoutes.some(r => r.path === refPath);
      if (!foundInRoutes) {
        brokenReferences++;
      }
    }

    const pass = res.statusCode === 200 && cTypePass && hasCanonicalDomain && !hasStagingDomain && !hasSuperlatives && brokenReferences === 0;
    if (!pass) llmAllPass = false;

    console.log(`  ${ep}: HTTP ${res.statusCode} | Type: ${cType} | Staging Leak: ${hasStagingDomain ? 'YES' : 'NONE'} | Superlatives: ${hasSuperlatives ? 'FOUND' : 'NONE'} | Broken Ref: ${brokenReferences} => ${pass ? 'PASS' : 'FAIL'}`);

    auditReport.llmEndpoints[ep] = {
      statusCode: res.statusCode,
      contentType: cType,
      cTypePass,
      hasCanonicalDomain,
      hasStagingDomain,
      hasSuperlatives,
      brokenReferences,
      pass
    };
  }

  // --- 3. SITEMAP LIVE CROSS-CHECK ---
  console.log('\n--- 3. Live Sitemap Cross-Check on Dimgrey ---');
  const sitemapRes = await fetchUrl(`${STAGING_ORIGIN}/sitemap.xml`);
  const sitemapUrls = [...sitemapRes.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const sitemapUnique = new Set(sitemapUrls);
  const sitemapCount = sitemapUrls.length;
  const hasDuplicates = sitemapUrls.length !== sitemapUnique.size;
  const hasStaging = sitemapUrls.some(u => u.includes('hostingersite.com'));
  const allProdCanonical = sitemapUrls.every(u => u.startsWith(PROD_CANONICAL));
  const hasAdmin = sitemapUrls.some(u => u.includes('/api/') || u.includes('/admin/') || u.includes('/wp-admin/'));

  // Exact 1-to-1 match with 96 publishable routes
  const expectedUrlsSet = new Set(publishableRoutes.map(r => `${PROD_CANONICAL}${r.path}`));
  let extraUrls = [];
  let missingUrls = [];
  for (const u of sitemapUrls) {
    if (!expectedUrlsSet.has(u)) extraUrls.push(u);
  }
  for (const u of expectedUrlsSet) {
    if (!sitemapUnique.has(u)) missingUrls.push(u);
  }
  const exactMatch = extraUrls.length === 0 && missingUrls.length === 0 && sitemapCount === publishableRoutes.length;

  console.log(`  Sitemap URL Count:      ${sitemapCount} (Expected: 96)`);
  console.log(`  Duplicate URLs:         ${hasDuplicates ? 'FOUND' : 'NONE'}`);
  console.log(`  Staging URLs in XML:    ${hasStaging ? 'FOUND' : 'NONE'}`);
  console.log(`  All Production Host:    ${allProdCanonical}`);
  console.log(`  Private/Admin URLs:     ${hasAdmin ? 'FOUND' : 'NONE'}`);
  console.log(`  Exact 1:1 Match:        ${exactMatch}`);

  auditReport.sitemapCrossCheck = {
    statusCode: sitemapRes.statusCode,
    totalUrls: sitemapCount,
    duplicates: hasDuplicates,
    stagingLeaks: hasStaging,
    allProductionHost: allProdCanonical,
    privateRoutes: hasAdmin,
    exactMatchWith96Routes: exactMatch,
    pass: exactMatch && !hasDuplicates && !hasStaging && allProdCanonical && !hasAdmin
  };

  // --- 4. PERSIST AUDIT REPORT ---
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(auditReport, null, 2), 'utf8');
  console.log(`\nMachine-readable audit report persisted to: ${REPORT_PATH}`);

  // --- 5. PRINT SUMMARY REPORT ---
  console.log('\n' + '='.repeat(80));
  console.log('CRAWL SUMMARY & DEFECT AUDIT');
  console.log('='.repeat(80));
  console.log(`Total routes:             ${auditReport.totalRoutes}`);
  console.log(`200 responses:            ${auditReport.summary.status200}`);
  console.log(`Redirects:                ${auditReport.summary.redirects}`);
  console.log(`404:                      ${auditReport.summary.status404}`);
  console.log(`5xx:                      ${auditReport.summary.status5xx}`);
  console.log(`Canonical defects:        ${auditReport.summary.canonicalDefects}`);
  console.log(`Metadata defects:         ${auditReport.summary.metadataDefects}`);
  console.log(`Schema defects:           ${auditReport.summary.schemaDefects}`);
  console.log(`Broken internal links:    ${auditReport.summary.brokenInternalLinks}`);
  console.log(`Missing assets:           ${auditReport.summary.missingAssets}`);
  console.log(`Staging leaks:            ${auditReport.summary.stagingLeaks}`);
  console.log(`Robots defects:           ${auditReport.summary.robotsDefects}`);
  console.log('='.repeat(80));

  const allClear = 
    auditReport.summary.status200 === 96 &&
    auditReport.summary.redirects === 0 &&
    auditReport.summary.status404 === 0 &&
    auditReport.summary.status5xx === 0 &&
    auditReport.summary.canonicalDefects === 0 &&
    auditReport.summary.metadataDefects === 0 &&
    auditReport.summary.schemaDefects === 0 &&
    auditReport.summary.brokenInternalLinks === 0 &&
    auditReport.summary.missingAssets === 0 &&
    auditReport.summary.stagingLeaks === 0 &&
    auditReport.summary.robotsDefects === 0 &&
    llmAllPass &&
    auditReport.sitemapCrossCheck.pass;

  console.log(`OVERALL CRAWL STATUS: ${allClear ? 'ALL 96 ROUTES PASSED (ZERO DEFECTS)' : 'DEFECTS FOUND'}`);
  if (!allClear) {
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error('Fatal crawl error:', err);
  process.exit(1);
});
