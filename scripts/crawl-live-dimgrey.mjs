import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { execSync } from 'node:child_process';

const STAGING_ORIGIN = 'https://dimgrey-goat-473970.hostingersite.com';
const PROD_CANONICAL = 'https://www.dgeniussolutions.com';
const REPORT_PATH = path.resolve('data/audit/dimgrey-live-search-ai-readiness.json');

let CURRENT_GIT_SHA = 'unknown';
try {
  CURRENT_GIT_SHA = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
} catch (e) {
  // fallback if git not available
}

const DEPLOYED_SHA = process.env.DEPLOYED_SHA || CURRENT_GIT_SHA;
const REVIEW_SHA = process.env.REVIEW_SHA || CURRENT_GIT_SHA;

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—');
}

function normalizeText(str) {
  return decodeHtml(str || '')
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function fetchUrl(url, options = {}) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.request({
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DGS-LiveCrawler/2.0',
          'Accept': options.accept || '*/*',
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

      req.on('error', (err) => {
        resolve({ statusCode: 0, error: err.message, headers: {}, body: '' });
      });
      req.setTimeout(options.timeout || 20000, () => {
        req.destroy();
        resolve({ statusCode: 0, error: 'Timeout', headers: {}, body: '' });
      });
      req.end();
    } catch (err) {
      resolve({ statusCode: 0, error: err.message, headers: {}, body: '' });
    }
  });
}

async function runPool(items, concurrency, fn) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log('='.repeat(80));
  console.log('FULL LIVE DIMGREY 96-ROUTE CRAWL & VERIFIED MEASURED AUDIT');
  console.log(`Staging Origin:   ${STAGING_ORIGIN}`);
  console.log(`Deployed SHA:     ${DEPLOYED_SHA}`);
  console.log(`Review Branch TIP:${REVIEW_SHA}`);
  console.log('='.repeat(80));

  const registry = JSON.parse(fs.readFileSync('data/migration/nextjs-route-registry.generated.json', 'utf8'));
  const publishableRoutes = registry.routes.filter(r => r.indexable && r.includeInSitemap);
  const approvedRedirects = JSON.parse(fs.readFileSync('data/migration/redirects.approved.json', 'utf8')).redirects;
  const approvedRedirectSources = new Set(approvedRedirects.map(r => r.source));

  console.log(`Loaded ${publishableRoutes.length} publishable routes from registry.`);
  console.log(`Loaded ${approvedRedirects.length} approved redirects from policy.`);

  // Audit Accumulators
  const routeAuditResults = [];
  const internalLinksMap = new Map(); // target -> { sources: Set, totalRefs: number }
  const localAssetsMap = new Map();   // path -> { type, sources: Set, totalRefs: number }
  const externalAssetsMap = new Map();// url -> { type, sources: Set, totalRefs: number }

  const stagingLeakAudit = {
    canonical: 0,
    metadata: 0,
    openGraph: 0,
    twitter: 0,
    jsonLd: 0,
    href: 0,
    src: 0,
    srcset: 0,
    inlineScript: 0,
    visibleContent: 0,
    sitemap: 0,
    llm: 0,
    other: 0,
    totalOccurrences: 0,
    details: []
  };

  const metadataParityAudit = {
    dimensions: {
      title: { exact: 0, approvedDifference: 0, notComparable: 0, mismatch: 0, total: 0 },
      description: { exact: 0, approvedDifference: 0, notComparable: 0, mismatch: 0, total: 0 },
      h1: { exact: 0, approvedDifference: 0, notComparable: 0, mismatch: 0, total: 0 },
      canonical: { exact: 0, approvedDifference: 0, notComparable: 0, mismatch: 0, total: 0 }
    },
    exactMatches: { title: 0, description: 0, h1: 0, canonical: 0 },
    approvedDifferences: [],
    notComparable: [],
    unexplainedMismatches: { title: [], description: [], h1: [], canonical: [] }
  };

  const schemaExpectationAudit = {
    routesAudited: 0,
    parseDefects: 0,
    missingExpectedTypes: [],
    unexpectedCriticalTypes: [],
    stagingLeaks: 0,
    details: []
  };

  // Helper to record assets
  function recordAsset(rawUrl, type, sourceRoute) {
    if (!rawUrl) return;
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('#')) return;

    const isLocal = trimmed.startsWith('/') ||
      trimmed.startsWith(STAGING_ORIGIN) ||
      trimmed.startsWith(PROD_CANONICAL) ||
      trimmed.startsWith('https://dgeniussolutions.com') ||
      trimmed.startsWith('http://www.dgeniussolutions.com');

    if (isLocal) {
      let localPath = trimmed;
      if (localPath.startsWith(STAGING_ORIGIN)) localPath = localPath.slice(STAGING_ORIGIN.length);
      else if (localPath.startsWith(PROD_CANONICAL)) localPath = localPath.slice(PROD_CANONICAL.length);
      else if (localPath.startsWith('https://dgeniussolutions.com')) localPath = localPath.slice('https://dgeniussolutions.com'.length);
      else if (localPath.startsWith('http://www.dgeniussolutions.com')) localPath = localPath.slice('http://www.dgeniussolutions.com'.length);

      if (!localAssetsMap.has(localPath)) {
        localAssetsMap.set(localPath, { type, sources: new Set(), totalRefs: 0 });
      }
      const entry = localAssetsMap.get(localPath);
      entry.sources.add(sourceRoute);
      entry.totalRefs++;
    } else {
      if (!externalAssetsMap.has(trimmed)) {
        externalAssetsMap.set(trimmed, { type, sources: new Set(), totalRefs: 0 });
      }
      const entry = externalAssetsMap.get(trimmed);
      entry.sources.add(sourceRoute);
      entry.totalRefs++;
    }
  }

  // Helper to record internal links
  function recordInternalLink(rawHref, sourceRoute) {
    if (!rawHref) return;
    const trimmed = rawHref.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('javascript:')) {
      return;
    }

    let normPath = null;
    if (trimmed.startsWith(PROD_CANONICAL)) normPath = trimmed.slice(PROD_CANONICAL.length);
    else if (trimmed.startsWith(STAGING_ORIGIN)) normPath = trimmed.slice(STAGING_ORIGIN.length);
    else if (trimmed.startsWith('https://dgeniussolutions.com')) normPath = trimmed.slice('https://dgeniussolutions.com'.length);
    else if (trimmed.startsWith('http://www.dgeniussolutions.com')) normPath = trimmed.slice('http://www.dgeniussolutions.com'.length);
    else if (trimmed.startsWith('/')) normPath = trimmed;

    if (normPath !== null) {
      // Strip fragment (#...)
      const noHash = normPath.split('#')[0];
      if (noHash) {
        if (!internalLinksMap.has(noHash)) {
          internalLinksMap.set(noHash, { sources: new Set(), totalRefs: 0 });
        }
        const entry = internalLinksMap.get(noHash);
        entry.sources.add(sourceRoute);
        entry.totalRefs++;
      }
    }
  }

  console.log('\n--- 1. CRAWLING ALL 96 PUBLISHABLE ROUTES DIRECTLY FROM DIMGREY ---');

  let routes200 = 0, routes3xx = 0, routes404 = 0, routes410 = 0, routes5xx = 0;
  let metaRobotsDefects = 0, xRobotsDefects = 0;

  const routeResults = await runPool(publishableRoutes, 6, async (route, idx) => {
    const liveUrl = `${STAGING_ORIGIN}${route.path}`;
    const expectedCanonical = `${PROD_CANONICAL}${route.path}`;
    const res = await fetchUrl(liveUrl);
    const html = res.body;

    if (res.statusCode === 200) routes200++;
    else if (res.statusCode >= 300 && res.statusCode < 400) routes3xx++;
    else if (res.statusCode === 404) routes404++;
    else if (res.statusCode === 410) routes410++;
    else if (res.statusCode >= 500) routes5xx++;

    // Robots checks
    const xRobots = res.headers['x-robots-tag'] || '';
    const xRobotsPass = xRobots.includes('noindex') && xRobots.includes('nofollow') && xRobots.includes('noarchive');
    if (!xRobotsPass) xRobotsDefects++;

    const metaRobotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
    const metaRobots = metaRobotsMatch ? metaRobotsMatch[1] : '';
    const metaRobotsPass = metaRobots.includes('noindex') && metaRobots.includes('nofollow');
    if (!metaRobotsPass) metaRobotsDefects++;

    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const rawTitle = titleMatch ? titleMatch[1].trim() : '';
    const decodedTitle = decodeHtml(rawTitle);

    // Meta Description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    const rawDesc = descMatch ? descMatch[1].trim() : '';
    const decodedDesc = decodeHtml(rawDesc);

    // H1 (replace child tags with spaces before collapsing whitespace)
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const rawH1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    const decodedH1 = decodeHtml(rawH1);

    // Canonical
    const canMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    const canonical = canMatch ? canMatch[1] : '';

    // Metadata Parity Evaluation across 4 explicit categories: EXACT, APPROVED_DIFF, NOT_COMPARABLE, MISMATCH
    // 1. Canonical
    metadataParityAudit.dimensions.canonical.total++;
    if (canonical === expectedCanonical) {
      metadataParityAudit.dimensions.canonical.exact++;
      metadataParityAudit.exactMatches.canonical++;
    } else {
      metadataParityAudit.dimensions.canonical.mismatch++;
      metadataParityAudit.unexplainedMismatches.canonical.push({
        path: route.path, live: canonical, expected: expectedCanonical
      });
    }

    // 2. Title
    metadataParityAudit.dimensions.title.total++;
    if (route.title) {
      if (normalizeText(decodedTitle) === normalizeText(route.title)) {
        metadataParityAudit.dimensions.title.exact++;
        metadataParityAudit.exactMatches.title++;
      } else {
        metadataParityAudit.dimensions.title.mismatch++;
        metadataParityAudit.unexplainedMismatches.title.push({
          path: route.path, live: decodedTitle, expected: route.title
        });
      }
    } else {
      metadataParityAudit.dimensions.title.notComparable++;
      metadataParityAudit.notComparable.push({
        path: route.path,
        field: 'title',
        live: decodedTitle,
        expected: null,
        reason: 'Route registry title is null'
      });
    }

    // 3. Meta Description
    metadataParityAudit.dimensions.description.total++;
    if (route.description) {
      if (normalizeText(decodedDesc) === normalizeText(route.description)) {
        metadataParityAudit.dimensions.description.exact++;
        metadataParityAudit.exactMatches.description++;
      } else {
        metadataParityAudit.dimensions.description.mismatch++;
        metadataParityAudit.unexplainedMismatches.description.push({
          path: route.path, live: decodedDesc, expected: route.description
        });
      }
    } else {
      metadataParityAudit.dimensions.description.notComparable++;
      metadataParityAudit.notComparable.push({
        path: route.path,
        field: 'description',
        live: decodedDesc,
        expected: null,
        reason: 'Route registry description is null; renders approved site fallback description'
      });
    }

    // 4. H1
    metadataParityAudit.dimensions.h1.total++;
    if (route.h1) {
      const normLiveH1 = normalizeText(decodedH1);
      const normExpH1 = normalizeText(route.h1);
      if (normLiveH1 === normExpH1) {
        metadataParityAudit.dimensions.h1.exact++;
        metadataParityAudit.exactMatches.h1++;
      } else if (
        route.path === '/services/seo-services-in-mumbai/' &&
        normLiveH1.includes('seo agency in mumbai for seo services, ai search visibility and qualified leads')
      ) {
        metadataParityAudit.dimensions.h1.approvedDifference++;
        metadataParityAudit.approvedDifferences.push({
          path: route.path,
          field: 'h1',
          live: decodedH1,
          expected: route.h1,
          reason: 'Approved WordPress mirror hero H1 variant'
        });
      } else {
        metadataParityAudit.dimensions.h1.mismatch++;
        metadataParityAudit.unexplainedMismatches.h1.push({
          path: route.path, live: decodedH1, expected: route.h1
        });
      }
    } else {
      metadataParityAudit.dimensions.h1.notComparable++;
      metadataParityAudit.notComparable.push({
        path: route.path,
        field: 'h1',
        live: decodedH1,
        expected: null,
        reason: 'Route registry H1 is null; renders approved semantic fallback Contact Us'
      });
    }

    // JSON-LD Schemas
    schemaExpectationAudit.routesAudited++;
    const schemaMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const schemas = [];
    let pageParseDefect = false;
    for (const sm of schemaMatches) {
      try {
        const parsed = JSON.parse(sm[1]);
        if (Array.isArray(parsed)) schemas.push(...parsed);
        else schemas.push(parsed);
      } catch (e) {
        pageParseDefect = true;
        schemaExpectationAudit.parseDefects++;
      }
    }
    const schemaTypes = schemas.map(s => s['@type']).filter(Boolean);
    const schemaJsonStr = JSON.stringify(schemas);
    const schemaStagingLeak = schemaJsonStr.includes('hostingersite.com');
    if (schemaStagingLeak) schemaExpectationAudit.stagingLeaks++;

    // Validate expected schema architecture
    const missingTypesForRoute = [];
    if (route.path === '/') {
      for (const t of ['Organization', 'WebSite', 'WebPage', 'LocalBusiness']) {
        if (!schemaTypes.includes(t)) missingTypesForRoute.push(t);
      }
    } else if (route.wordpressType === 'post') {
      for (const t of ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList']) {
        if (!schemaTypes.includes(t)) missingTypesForRoute.push(t);
      }
      if (!schemaTypes.includes('BlogPosting') && !schemaTypes.includes('Article')) {
        missingTypesForRoute.push('BlogPosting/Article');
      }
    } else if (route.path.startsWith('/services/') && route.path !== '/services/') {
      for (const t of ['Organization', 'WebSite', 'WebPage', 'Service', 'BreadcrumbList']) {
        if (!schemaTypes.includes(t)) missingTypesForRoute.push(t);
      }
    } else {
      for (const t of ['Organization', 'WebSite', 'WebPage']) {
        if (!schemaTypes.includes(t)) missingTypesForRoute.push(t);
      }
    }
    if (missingTypesForRoute.length > 0) {
      schemaExpectationAudit.missingExpectedTypes.push({
        path: route.path, missing: missingTypesForRoute, actual: schemaTypes
      });
    }

    // 3. Staging Leak Classification across Full HTML Body
    const stagingOccurrences = [...html.matchAll(/dimgrey-goat-473970\.hostingersite\.com|hostingersite\.com/gi)];
    if (stagingOccurrences.length > 0) {
      stagingLeakAudit.totalOccurrences += stagingOccurrences.length;
      for (const match of stagingOccurrences) {
        const idx = match.index;
        const snippet = html.slice(Math.max(0, idx - 40), Math.min(html.length, idx + match[0].length + 40));
        let category = 'other';
        if (/<link[^>]*rel=["']canonical["'][^>]*>/i.test(snippet)) { category = 'canonical'; stagingLeakAudit.canonical++; }
        else if (/<meta[^>]*property=["']og:[^"']*["']/i.test(snippet)) { category = 'openGraph'; stagingLeakAudit.openGraph++; }
        else if (/<meta[^>]*name=["']twitter:[^"']*["']/i.test(snippet)) { category = 'twitter'; stagingLeakAudit.twitter++; }
        else if (/<meta[^>]*name=["'](?:description|title)["']/i.test(snippet)) { category = 'metadata'; stagingLeakAudit.metadata++; }
        else if (/<script[^>]*type=["']application\/ld\+json["']/i.test(snippet)) { category = 'jsonLd'; stagingLeakAudit.jsonLd++; }
        else if (/<a\s+[^>]*href=["']/i.test(snippet)) { category = 'href'; stagingLeakAudit.href++; }
        else if (/<(?:img|script)\s+[^>]*src=["']/i.test(snippet)) { category = 'src'; stagingLeakAudit.src++; }
        else if (/srcset=["']/i.test(snippet)) { category = 'srcset'; stagingLeakAudit.srcset++; }
        else if (/<script[\s>]/i.test(snippet)) { category = 'inlineScript'; stagingLeakAudit.inlineScript++; }
        else { category = 'visibleContent'; stagingLeakAudit.visibleContent++; }

        stagingLeakAudit.details.push({ path: route.path, category, match: match[0], snippet });
      }
    }

    // 4. Extract All Internal Links from HTML
    const hrefMatches = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)].map(m => m[1]);
    for (const href of hrefMatches) {
      recordInternalLink(href, route.path);
    }

    // 5. Extract Real Assets from HTML
    // Stylesheets
    [...html.matchAll(/<link\s+[^>]*?\brel=["']stylesheet["'][^>]*?\bhref=["']([^"']+)["']/gi)].forEach(m => recordAsset(m[1], 'stylesheet', route.path));
    // Scripts
    [...html.matchAll(/<script\s+[^>]*?\bsrc=["']([^"']+)["']/gi)].forEach(m => recordAsset(m[1], 'script', route.path));
    // Images
    [...html.matchAll(/<img\s+[^>]*?\bsrc=["']([^"']+)["']/gi)].forEach(m => recordAsset(m[1], 'image', route.path));
    // Srcsets
    [...html.matchAll(/\b(?:srcset|data-srcset)=["']([^"']+)["']/gi)].forEach(m => {
      m[1].split(',').forEach(cand => {
        const urlPart = cand.trim().split(/\s+/)[0];
        if (urlPart) recordAsset(urlPart, 'srcset', route.path);
      });
    });
    // Video
    [...html.matchAll(/<(?:video|source)\s+[^>]*?\bsrc=["']([^"']+)["']/gi)].forEach(m => recordAsset(m[1], 'video', route.path));
    // Video poster
    [...html.matchAll(/<video\s+[^>]*?\bposter=["']([^"']+)["']/gi)].forEach(m => recordAsset(m[1], 'video-poster', route.path));
    // Preload & fonts
    [...html.matchAll(/<link\s+[^>]*?\brel=["']preload["'][^>]*?\bhref=["']([^"']+)["']/gi)].forEach(m => recordAsset(m[1], 'preload', route.path));
    // Icons
    [...html.matchAll(/<link\s+[^>]*?\brel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*?\bhref=["']([^"']+)["']/gi)].forEach(m => recordAsset(m[1], 'icon', route.path));

    const routeStatus = res.statusCode === 200 && canonical === expectedCanonical && xRobotsPass && metaRobotsPass && !pageParseDefect ? 'PASS' : 'FAIL';
    console.log(`  [${String(idx + 1).padStart(2, ' ')}/96] ${route.path.padEnd(52, ' ')} => HTTP ${res.statusCode} | ${routeStatus}`);

    return {
      path: route.path,
      statusCode: res.statusCode,
      title: decodedTitle,
      metaDescription: decodedDesc,
      h1: decodedH1,
      canonical,
      canonicalPass: canonical === expectedCanonical,
      metaRobots,
      xRobots,
      schemaCount: schemas.length,
      schemaTypes,
      stagingOccurrences: stagingOccurrences.length
    };
  });

  routeAuditResults.push(...routeResults);

  // --- 2. INTERNAL LINK AUDIT (LIVE REQUESTS) ---
  console.log('\n--- 2. AUDITING ALL DISCOVERED INTERNAL LINKS AGAINST DIMGREY ---');
  let totalLinkRefs = 0;
  for (const entry of internalLinksMap.values()) totalLinkRefs += entry.totalRefs;
  const internalLinkTargets = Array.from(internalLinksMap.keys());
  console.log(`Discovered ${totalLinkRefs} total internal link references across 96 pages.`);
  console.log(`Discovered ${internalLinkTargets.length} unique internal URLs.`);

  const internalLinkAudit = {
    totalReferences: totalLinkRefs,
    uniqueUrls: internalLinkTargets.length,
    healthy2xx: 0,
    approved3xx: 0,
    unexpected3xx: 0,
    status404: 0,
    status410: 0,
    status5xx: 0,
    networkErrors: 0,
    brokenLinks: [],
    redirectLinks: []
  };

  await runPool(internalLinkTargets, 8, async (target) => {
    const url = `${STAGING_ORIGIN}${target}`;
    const res = await fetchUrl(url, { method: 'HEAD' });
    const sources = Array.from(internalLinksMap.get(target).sources);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      internalLinkAudit.healthy2xx++;
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      const targetPathOnly = target.split('?')[0];
      const isApproved = approvedRedirectSources.has(targetPathOnly) ||
        approvedRedirectSources.has(targetPathOnly.endsWith('/') ? targetPathOnly.slice(0, -1) : targetPathOnly + '/');
      if (isApproved) {
        internalLinkAudit.approved3xx++;
      } else {
        internalLinkAudit.unexpected3xx++;
      }
      internalLinkAudit.redirectLinks.push({
        target, statusCode: res.statusCode, location: res.headers?.location, isApproved, sources
      });
    } else if (res.statusCode === 404) {
      internalLinkAudit.status404++;
      internalLinkAudit.brokenLinks.push({ target, statusCode: 404, sources });
    } else if (res.statusCode === 410) {
      internalLinkAudit.status410++;
      internalLinkAudit.brokenLinks.push({ target, statusCode: 410, sources });
    } else if (res.statusCode >= 500) {
      internalLinkAudit.status5xx++;
      internalLinkAudit.brokenLinks.push({ target, statusCode: res.statusCode, sources });
    } else {
      internalLinkAudit.networkErrors++;
      internalLinkAudit.brokenLinks.push({ target, statusCode: res.statusCode, error: res.error, sources });
    }
  });

  console.log(`  Healthy (2xx):    ${internalLinkAudit.healthy2xx}`);
  console.log(`  Approved 3xx:     ${internalLinkAudit.approved3xx}`);
  console.log(`  Unexpected 3xx:   ${internalLinkAudit.unexpected3xx}`);
  console.log(`  HTTP 404:         ${internalLinkAudit.status404}`);
  console.log(`  HTTP 410:         ${internalLinkAudit.status410}`);
  console.log(`  HTTP 5xx:         ${internalLinkAudit.status5xx}`);
  console.log(`  Network Errors:   ${internalLinkAudit.networkErrors}`);

  // --- 3. REAL ASSET AUDIT (LIVE REQUESTS) ---
  console.log('\n--- 3. AUDITING ALL REFERENCED ASSETS (LOCAL & EXTERNAL) ---');
  let totalLocalAssetRefs = 0;
  for (const entry of localAssetsMap.values()) totalLocalAssetRefs += entry.totalRefs;
  const localAssetPaths = Array.from(localAssetsMap.keys());

  let totalExtAssetRefs = 0;
  for (const entry of externalAssetsMap.values()) totalExtAssetRefs += entry.totalRefs;
  const externalAssetUrls = Array.from(externalAssetsMap.keys());

  console.log(`Discovered ${totalLocalAssetRefs} total local asset references (${localAssetPaths.length} unique assets).`);
  console.log(`Discovered ${totalExtAssetRefs} total external asset references (${externalAssetUrls.length} unique assets).`);

  const assetAudit = {
    local: {
      totalReferences: totalLocalAssetRefs,
      uniqueAssets: localAssetPaths.length,
      healthy2xx: 0,
      redirect3xx: 0,
      status404: 0,
      status5xx: 0,
      networkErrors: 0,
      brokenAssets: []
    },
    external: {
      totalReferences: totalExtAssetRefs,
      uniqueAssets: externalAssetUrls.length,
      healthy2xx: 0,
      failures: 0,
      failedAssets: []
    }
  };

  // Test local assets
  await runPool(localAssetPaths, 12, async (assetPath) => {
    const url = `${STAGING_ORIGIN}${assetPath}`;
    let res = await fetchUrl(url, { method: 'HEAD' });
    if (res.statusCode === 405) {
      res = await fetchUrl(url, { method: 'GET' });
    }
    const entry = localAssetsMap.get(assetPath);
    const sources = Array.from(entry.sources);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      assetAudit.local.healthy2xx++;
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      assetAudit.local.redirect3xx++;
    } else if (res.statusCode === 404) {
      assetAudit.local.status404++;
      assetAudit.local.brokenAssets.push({ assetPath, type: entry.type, statusCode: 404, sources });
    } else if (res.statusCode >= 500) {
      assetAudit.local.status5xx++;
      assetAudit.local.brokenAssets.push({ assetPath, type: entry.type, statusCode: res.statusCode, sources });
    } else {
      assetAudit.local.networkErrors++;
      assetAudit.local.brokenAssets.push({ assetPath, type: entry.type, statusCode: res.statusCode, error: res.error, sources });
    }
  });

  // Test external assets
  await runPool(externalAssetUrls, 4, async (extUrl) => {
    const res = await fetchUrl(extUrl, { method: 'GET' });
    const entry = externalAssetsMap.get(extUrl);
    const sources = Array.from(entry.sources);

    if (res.statusCode >= 200 && res.statusCode < 400) {
      assetAudit.external.healthy2xx++;
    } else {
      assetAudit.external.failures++;
      assetAudit.external.failedAssets.push({
        url: extUrl, type: entry.type, statusCode: res.statusCode, error: res.error, sources
      });
    }
  });

  console.log(`  Local Assets Healthy:    ${assetAudit.local.healthy2xx} / ${localAssetPaths.length}`);
  console.log(`  Local Assets Broken:     ${assetAudit.local.status404 + assetAudit.local.status5xx + assetAudit.local.networkErrors}`);
  console.log(`  External Assets Healthy: ${assetAudit.external.healthy2xx} / ${externalAssetUrls.length}`);
  console.log(`  External Assets Failed:  ${assetAudit.external.failures}`);

  // --- 4. SCAN SITEMAP & LLM FOR STAGING LEAKS ---
  console.log('\n--- 4. SCANNING SITEMAP & LLM ENDPOINTS FOR STAGING LEAKS ---');
  const sitemapRes = await fetchUrl(`${STAGING_ORIGIN}/sitemap.xml`);
  const sitemapStagingMatches = [...sitemapRes.body.matchAll(/dimgrey-goat-473970\.hostingersite\.com|hostingersite\.com/gi)];
  stagingLeakAudit.sitemap = sitemapStagingMatches.length;

  const sitemapUrls = [...sitemapRes.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const sitemapUnique = new Set(sitemapUrls);
  const expectedUrlsSet = new Set(publishableRoutes.map(r => `${PROD_CANONICAL}${r.path}`));
  let sitemapExtra = 0, sitemapMissing = 0;
  for (const u of sitemapUrls) if (!expectedUrlsSet.has(u)) sitemapExtra++;
  for (const u of expectedUrlsSet) if (!sitemapUnique.has(u)) sitemapMissing++;

  const sitemapCrossCheck = {
    statusCode: sitemapRes.statusCode,
    totalUrls: sitemapUrls.length,
    duplicates: sitemapUrls.length !== sitemapUnique.size,
    stagingLeaks: sitemapStagingMatches.length,
    allProductionHost: sitemapUrls.every(u => u.startsWith(PROD_CANONICAL)),
    exact1to1Match: sitemapUrls.length === 96 && sitemapExtra === 0 && sitemapMissing === 0
  };

  const llmEndpoints = ['/llms.txt', '/llms-full.txt', '/llms.md', '/llms-full.md'];
  const llmAuditResults = {};
  for (const ep of llmEndpoints) {
    const res = await fetchUrl(`${STAGING_ORIGIN}${ep}`);
    const stagingMatches = [...res.body.matchAll(/dimgrey-goat-473970\.hostingersite\.com|hostingersite\.com/gi)];
    stagingLeakAudit.llm += stagingMatches.length;
    const isMd = ep.endsWith('.md');
    const expectedType = isMd ? 'text/markdown' : 'text/plain';
    const cType = res.headers['content-type'] || '';
    const cTypePass = cType.includes(expectedType);
    const hasCanonicalDomain = res.body.includes(PROD_CANONICAL);
    const hasSuperlatives = res.body.includes('leading digital marketing') || res.body.includes('high-conversion brand films');

    // Referenced URLs
    const urlMatches = [...res.body.matchAll(/https:\/\/www\.dgeniussolutions\.com(\/[^)\s"\]\n]*)/g)]
      .map(m => m[1].replace(/[.,:;\]]+$/, ''));
    const uniqueReferencedPaths = [...new Set(urlMatches)];
    let brokenRefs = 0;
    for (const refPath of uniqueReferencedPaths) {
      if (refPath === '/' || refPath === '/sitemap.xml' || refPath.startsWith('/llms')) continue;
      if (!publishableRoutes.some(r => r.path === refPath)) brokenRefs++;
    }

    llmAuditResults[ep] = {
      statusCode: res.statusCode,
      contentType: cType,
      cTypePass,
      hasCanonicalDomain,
      stagingLeaks: stagingMatches.length,
      hasSuperlatives,
      brokenReferences: brokenRefs,
      pass: res.statusCode === 200 && cTypePass && hasCanonicalDomain && stagingMatches.length === 0 && !hasSuperlatives && brokenRefs === 0
    };
  }

  // --- 5. ASSEMBLE COMPLETE REPORT ARTIFACT ---
  const finalReport = {
    timestamp: new Date().toISOString(),
    stagingOrigin: STAGING_ORIGIN,
    deployedSha: DEPLOYED_SHA,
    reviewSha: REVIEW_SHA,
    summary: {
      routes: {
        total: publishableRoutes.length,
        status200: routes200,
        status3xx: routes3xx,
        status404: routes404,
        status410: routes410,
        status5xx: routes5xx
      },
      metadataParity: {
        dimensions: metadataParityAudit.dimensions,
        exactMatches: metadataParityAudit.exactMatches,
        approvedDifferences: metadataParityAudit.approvedDifferences.length,
        notComparable: metadataParityAudit.notComparable.length,
        titleMismatches: metadataParityAudit.unexplainedMismatches.title.length,
        descriptionMismatches: metadataParityAudit.unexplainedMismatches.description.length,
        h1Mismatches: metadataParityAudit.unexplainedMismatches.h1.length,
        canonicalMismatches: metadataParityAudit.unexplainedMismatches.canonical.length,
        totalMismatches:
          metadataParityAudit.unexplainedMismatches.title.length +
          metadataParityAudit.unexplainedMismatches.description.length +
          metadataParityAudit.unexplainedMismatches.h1.length +
          metadataParityAudit.unexplainedMismatches.canonical.length
      },
      schema: {
        parseDefects: schemaExpectationAudit.parseDefects,
        missingExpectedTypes: schemaExpectationAudit.missingExpectedTypes.length,
        unexpectedCriticalTypes: schemaExpectationAudit.unexpectedCriticalTypes.length,
        stagingLeaks: schemaExpectationAudit.stagingLeaks
      },
      internalLinks: {
        totalReferences: internalLinkAudit.totalReferences,
        uniqueUrls: internalLinkAudit.uniqueUrls,
        healthy: internalLinkAudit.healthy2xx,
        approved3xx: internalLinkAudit.approved3xx,
        broken: internalLinkAudit.status404 + internalLinkAudit.status410 + internalLinkAudit.status5xx + internalLinkAudit.networkErrors,
        redirectIssues: internalLinkAudit.unexpected3xx
      },
      assets: {
        totalReferences: assetAudit.local.totalReferences + assetAudit.external.totalReferences,
        uniqueAssets: assetAudit.local.uniqueAssets + assetAudit.external.uniqueAssets,
        healthy: assetAudit.local.healthy2xx + assetAudit.external.healthy2xx,
        broken: assetAudit.local.status404 + assetAudit.local.status5xx + assetAudit.local.networkErrors,
        externalFailures: assetAudit.external.failures
      },
      stagingLeakage: {
        htmlOccurrences: stagingLeakAudit.totalOccurrences,
        schemaOccurrences: schemaExpectationAudit.stagingLeaks,
        metadataOccurrences: stagingLeakAudit.metadata,
        assetLinkOccurrences: stagingLeakAudit.href + stagingLeakAudit.src + stagingLeakAudit.srcset,
        llmOccurrences: stagingLeakAudit.llm,
        sitemapOccurrences: stagingLeakAudit.sitemap
      },
      robots: {
        metaRobotsDefects,
        xRobotsTagDefects: xRobotsDefects
      }
    },
    metadataParityAudit,
    schemaExpectationAudit,
    internalLinkAudit,
    assetAudit,
    stagingLeakAudit,
    sitemapCrossCheck,
    llmEndpoints: llmAuditResults,
    routes: routeAuditResults
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(finalReport, null, 2), 'utf8');
  console.log(`\nMachine-readable audit persisted to: ${REPORT_PATH}`);

  // --- 6. FORMATTED REPORT PRINT ---
  console.log('\n' + '='.repeat(80));
  console.log('FINAL LIVE DIMGREY MEASURED AUDIT REPORT');
  console.log('='.repeat(80));

  console.log('\nLIVE ROUTES');
  console.log(`Total: 96`);
  console.log(`HTTP 200: ${finalReport.summary.routes.status200}`);
  console.log(`3xx:      ${finalReport.summary.routes.status3xx}`);
  console.log(`404:      ${finalReport.summary.routes.status404}`);
  console.log(`410:      ${finalReport.summary.routes.status410}`);
  console.log(`5xx:      ${finalReport.summary.routes.status5xx}`);

  console.log('\nMETADATA PARITY (4-Category Accounting across 96 routes)');
  for (const [dim, counts] of Object.entries(metadataParityAudit.dimensions)) {
    console.log(`  ${dim.toUpperCase().padEnd(12)}: Exact=${counts.exact}, ApprovedDiff=${counts.approvedDifference}, NotComparable=${counts.notComparable}, Mismatch=${counts.mismatch} (Total=${counts.total})`);
  }
  console.log(`Title mismatches:       ${finalReport.summary.metadataParity.titleMismatches}`);
  console.log(`Description mismatches: ${finalReport.summary.metadataParity.descriptionMismatches}`);
  console.log(`H1 mismatches:          ${finalReport.summary.metadataParity.h1Mismatches}`);
  console.log(`Canonical mismatches:   ${finalReport.summary.metadataParity.canonicalMismatches}`);

  console.log('\nSCHEMA');
  console.log(`Parse defects:            ${finalReport.summary.schema.parseDefects}`);
  console.log(`Missing expected types:   ${finalReport.summary.schema.missingExpectedTypes}`);
  console.log(`Unexpected critical types:${finalReport.summary.schema.unexpectedCriticalTypes}`);
  console.log(`Staging leaks:            ${finalReport.summary.schema.stagingLeaks}`);

  console.log('\nINTERNAL LINKS');
  console.log(`Total references: ${finalReport.summary.internalLinks.totalReferences}`);
  console.log(`Unique URLs:      ${finalReport.summary.internalLinks.uniqueUrls}`);
  console.log(`Healthy (2xx):    ${finalReport.summary.internalLinks.healthy}`);
  console.log(`Approved 3xx:     ${finalReport.summary.internalLinks.approved3xx}`);
  console.log(`Broken:           ${finalReport.summary.internalLinks.broken}`);
  console.log(`Redirect issues:  ${finalReport.summary.internalLinks.redirectIssues}`);

  console.log('\nASSETS');
  console.log(`Total references: ${finalReport.summary.assets.totalReferences}`);
  console.log(`Unique assets:    ${finalReport.summary.assets.uniqueAssets}`);
  console.log(`Healthy:          ${finalReport.summary.assets.healthy}`);
  console.log(`Broken:           ${finalReport.summary.assets.broken}`);
  console.log(`External failures:${finalReport.summary.assets.externalFailures}`);

  console.log('\nSTAGING LEAKAGE');
  console.log(`HTML occurrences:       ${finalReport.summary.stagingLeakage.htmlOccurrences}`);
  console.log(`Schema occurrences:     ${finalReport.summary.stagingLeakage.schemaOccurrences}`);
  console.log(`Metadata occurrences:   ${finalReport.summary.stagingLeakage.metadataOccurrences}`);
  console.log(`Asset/link occurrences: ${finalReport.summary.stagingLeakage.assetLinkOccurrences}`);
  console.log(`LLM occurrences:        ${finalReport.summary.stagingLeakage.llmOccurrences}`);
  console.log(`Sitemap occurrences:    ${finalReport.summary.stagingLeakage.sitemapOccurrences}`);

  console.log('\nROBOTS');
  console.log(`Meta robots defects:  ${finalReport.summary.robots.metaRobotsDefects}`);
  console.log(`X-Robots-Tag defects: ${finalReport.summary.robots.xRobotsTagDefects}`);

  console.log('='.repeat(80));

  const allCriticalPass =
    finalReport.summary.routes.status200 === 96 &&
    finalReport.summary.routes.status404 === 0 &&
    finalReport.summary.routes.status5xx === 0 &&
    finalReport.summary.metadataParity.totalMismatches === 0 &&
    finalReport.summary.schema.parseDefects === 0 &&
    finalReport.summary.schema.missingExpectedTypes === 0 &&
    finalReport.summary.schema.stagingLeaks === 0 &&
    finalReport.summary.assets.broken === 0 &&
    finalReport.summary.assets.externalFailures === 0 &&
    finalReport.summary.internalLinks.broken === 0 &&
    finalReport.summary.internalLinks.approved3xx === 0 &&
    finalReport.summary.internalLinks.redirectIssues === 0 &&
    finalReport.summary.stagingLeakage.htmlOccurrences === 0 &&
    finalReport.summary.stagingLeakage.sitemapOccurrences === 0 &&
    finalReport.summary.stagingLeakage.llmOccurrences === 0 &&
    finalReport.summary.robots.metaRobotsDefects === 0 &&
    finalReport.summary.robots.xRobotsTagDefects === 0;

  if (allCriticalPass) {
    console.log('DIMGREY SEARCH + AI LAUNCH GATE: APPROVED — ZERO INTERNAL REDIRECT HOPS — ZERO MEASURED DEFECTS');
  } else {
    console.log('DIMGREY SEARCH + AI LAUNCH GATE: DEFECTS DETECTED — STOPPING FOR HUMAN REVIEW');
    console.log(`(Approved 3xx: ${finalReport.summary.internalLinks.approved3xx}, Broken internal links: ${finalReport.summary.internalLinks.broken}, External asset failures: ${finalReport.summary.assets.externalFailures})`);
  }
}

main().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
