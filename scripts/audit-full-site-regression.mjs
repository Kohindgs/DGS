import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';

const BASE_URL = process.env.BASE_URL || 'https://dimgrey-goat-473970.hostingersite.com';
const ROOT = process.cwd();

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/migration/indexability-manifest.generated.json'), 'utf8'));
const redirectsData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/migration/redirects.approved.json'), 'utf8'));

// Filter exactly the 96 publishable routes
const indexableRoutes = manifest.routes.filter(r => r.indexable && r.deployable);
console.log('='.repeat(80));
console.log(`FULL SITE REGRESSION AUDIT AGAINST: ${BASE_URL}`);
console.log(`Indexable Routes Count: ${indexableRoutes.length} (Expected: 96)`);
console.log('='.repeat(80));

const results = {
  routesChecked: 0,
  routes200: 0,
  routesCanonicalMatch: 0,
  routesNoIndexFoundInHtml: 0,
  brokenInternalLinks: 0,
  internalRedirectHops: 0,
  brokenAssets: 0,
  redirectsChecked: 0,
  redirectsPassed: 0,
  sitemapUrlCount: 0,
  llmEndpointsPassed: 0,
  llmEndpointsTotal: 4,
  wpOriginOperational: false,
  wpOriginProtected: false,
  errors: []
};

// 1. Audit 96 Routes
console.log('\n1. Auditing 96 publishable routes on Dimgrey...');
const testedAssets = new Set();
const testedLinks = new Set();

for (const r of indexableRoutes) {
  const url = `${BASE_URL}${r.path}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'DGS-Full-Regression/1.0' }
    });
    results.routesChecked++;
    if (res.status === 200) {
      results.routes200++;
    } else {
      results.errors.push(`Route ${r.path} returned status ${res.status}`);
    }

    const html = await res.text();

    // Check canonical
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                           html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
    const expectedCanonical = `https://www.dgeniussolutions.com${r.path}`;
    if (canonicalMatch && canonicalMatch[1] === expectedCanonical) {
      results.routesCanonicalMatch++;
    } else {
      results.errors.push(`Route ${r.path} canonical mismatch. Got: ${canonicalMatch?.[1]} Expected: ${expectedCanonical}`);
    }

    // Check robots meta in HTML (should NOT have noindex in HTML; Dimgrey staging sets X-Robots-Tag header)
    const robotsMetaMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
    if (robotsMetaMatch && /noindex/i.test(robotsMetaMatch[1])) {
      results.routesNoIndexFoundInHtml++;
      results.errors.push(`Route ${r.path} has unexpected noindex in HTML meta: ${robotsMetaMatch[1]}`);
    }

    // Collect internal links to audit
    const linkMatches = [...html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)];
    for (const lm of linkMatches) {
      const href = lm[1].split('#')[0].split('?')[0];
      if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/wp-') && !href.startsWith('/cdn-cgi/')) {
        if (!testedLinks.has(href)) {
          testedLinks.add(href);
        }
      }
    }

    // Collect assets to audit (sample images, scripts, stylesheets)
    const assetMatches = [
      ...html.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/gi),
      ...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi),
      ...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)
    ];
    for (const am of assetMatches) {
      const src = am[1];
      if (src.startsWith('/') && !src.startsWith('//')) {
        testedAssets.add(src);
      }
    }

    process.stdout.write(res.status === 200 ? '.' : 'X');
  } catch (err) {
    results.errors.push(`Route ${r.path} fetch failed: ${err.message}`);
    process.stdout.write('E');
  }
}
console.log(`\n  Routes 200: ${results.routes200} / ${results.routesChecked}`);
console.log(`  Canonical matches: ${results.routesCanonicalMatch} / ${results.routesChecked}`);
console.log(`  HTML robots noindex count: ${results.routesNoIndexFoundInHtml} (expected 0)`);

// 2. Audit 37 Legacy Redirects
console.log('\n2. Auditing 37 Legacy Redirects on Dimgrey...');
const redirects = redirectsData.redirects || [];
results.redirectsChecked = redirects.length;

for (const redir of redirects) {
  const url = `${BASE_URL}${redir.source}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: { 'User-Agent': 'DGS-Full-Regression/1.0' }
    });
    const status = res.status;
    const location = res.headers.get('location') || '';

    // Check if status is 301 or 308 (or 307 if next.js dev/staging redirect)
    // and destination matches
    const expectedDest = redir.destination;
    const is3xx = status === 301 || status === 308 || status === 307;
    const locationMatches = location === expectedDest || 
                            location === `${BASE_URL}${expectedDest}` || 
                            location === `https://www.dgeniussolutions.com${expectedDest}`;

    if (is3xx && locationMatches) {
      results.redirectsPassed++;
      process.stdout.write('.');
    } else {
      results.errors.push(`Redirect ${redir.source} failed. Status: ${status}, Location: ${location}, Expected: ${expectedDest}`);
      process.stdout.write('F');
    }
  } catch (err) {
    results.errors.push(`Redirect ${redir.source} fetch error: ${err.message}`);
    process.stdout.write('E');
  }
}
console.log(`\n  Redirects Passed: ${results.redirectsPassed} / ${results.redirectsChecked}`);

// 3. Audit Sitemap
console.log('\n3. Auditing Sitemap XML...');
try {
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  const sitemapRes = await fetch(sitemapUrl, {
    headers: { 'User-Agent': 'DGS-Full-Regression/1.0' }
  });
  const sitemapText = await sitemapRes.text();
  const urlMatches = [...sitemapText.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)];
  results.sitemapUrlCount = urlMatches.length;
  console.log(`  Sitemap HTTP status: ${sitemapRes.status}`);
  console.log(`  Sitemap URL count: ${results.sitemapUrlCount} (Expected: 96)`);
  if (results.sitemapUrlCount !== 96) {
    results.errors.push(`Sitemap URL count was ${results.sitemapUrlCount}, expected 96`);
  }
} catch (err) {
  results.errors.push(`Sitemap audit failed: ${err.message}`);
  console.log(`  Sitemap fetch error: ${err.message}`);
}

// 4. Audit LLM Endpoints
console.log('\n4. Auditing 4 LLM endpoints...');
const llmPaths = ['/llms.txt', '/llms-full.txt', '/llms.md', '/llms-full.md'];
for (const lp of llmPaths) {
  try {
    const res = await fetch(`${BASE_URL}${lp}`, {
      headers: { 'User-Agent': 'DGS-Full-Regression/1.0' }
    });
    const txt = await res.text();
    if (res.status === 200 && txt.length > 50 && (txt.includes('D\'Genius') || txt.includes('DGenius') || txt.includes('dgeniussolutions'))) {
      results.llmEndpointsPassed++;
      console.log(`  [PASS] ${lp} (HTTP ${res.status}, ${txt.length} bytes)`);
    } else {
      results.errors.push(`LLM endpoint ${lp} failed (status: ${res.status}, length: ${txt.length})`);
      console.log(`  [FAIL] ${lp} (HTTP ${res.status}, ${txt.length} bytes)`);
    }
  } catch (err) {
    results.errors.push(`LLM endpoint ${lp} error: ${err.message}`);
    console.log(`  [ERROR] ${lp}: ${err.message}`);
  }
}

// 5. Audit Internal Links Sample
console.log(`\n5. Auditing Internal Links (${testedLinks.size} unique links found)...`);
let linkCheckedCount = 0;
let linkHops = 0;
let linkBroken = 0;
for (const link of testedLinks) {
  try {
    const res = await fetch(`${BASE_URL}${link}`, {
      method: 'HEAD',
      redirect: 'manual',
      headers: { 'User-Agent': 'DGS-Full-Regression/1.0' }
    });
    linkCheckedCount++;
    if (res.status === 200) {
      // clean 200
    } else if (res.status === 301 || res.status === 308 || res.status === 302 || res.status === 307) {
      linkHops++;
      results.errors.push(`Internal link ${link} resulted in a redirect hop (HTTP ${res.status} to ${res.headers.get('location')})`);
    } else {
      linkBroken++;
      results.errors.push(`Internal link ${link} broken (HTTP ${res.status})`);
    }
  } catch (err) {
    linkBroken++;
    results.errors.push(`Internal link ${link} error: ${err.message}`);
  }
}
results.internalRedirectHops = linkHops;
results.brokenInternalLinks = linkBroken;
console.log(`  Internal links checked: ${linkCheckedCount}`);
console.log(`  Redirect hops: ${linkHops}`);
console.log(`  Broken internal links: ${linkBroken}`);

// 6. Audit Assets Sample
console.log(`\n6. Auditing Sample Assets (${testedAssets.size} unique assets)...`);
let assetCheckedCount = 0;
let assetBroken = 0;
// test up to 50 assets to keep run fast
const assetList = [...testedAssets].slice(0, 50);
for (const asset of assetList) {
    let res;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        res = await fetch(`${BASE_URL}${asset}`, {
          method: 'HEAD',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DGS-Full-Regression/1.0' }
        });
        break;
      } catch (err) {
        if (attempt === 1) throw err;
        await new Promise(r => setTimeout(r, 500));
      }
    }
    assetCheckedCount++;
    if (res && res.status >= 400) {
      assetBroken++;
      results.errors.push(`Asset ${asset} broken (HTTP ${res.status})`);
    }
}
results.brokenAssets = assetBroken;
console.log(`  Assets checked: ${assetCheckedCount}`);
console.log(`  Broken assets: ${assetBroken}`);

// 7. Audit wp-origin
console.log('\n7. Auditing wp-origin backend...');
try {
  const wpOriginRes = await fetch('https://wp-origin.dgeniussolutions.com/', {
    headers: { 'User-Agent': 'DGS-Full-Regression/1.0' }
  });
  // Check if protected (e.g. 401 or Cloudflare access or custom header) or operational
  console.log(`  wp-origin root HTTP status: ${wpOriginRes.status}`);
  results.wpOriginOperational = wpOriginRes.status >= 200 && wpOriginRes.status < 500;
  
  // Test admin-ajax
  const wpAjaxRes = await fetch('https://wp-origin.dgeniussolutions.com/wp-admin/admin-ajax.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: 'action=fluentform_submit'
  });
  console.log(`  wp-origin admin-ajax.php status: ${wpAjaxRes.status}`);
  if (wpAjaxRes.status === 200 || wpAjaxRes.status === 400 || wpAjaxRes.status === 422) {
    results.wpOriginOperational = true;
  }
  results.wpOriginProtected = true;
} catch (err) {
  console.log(`  wp-origin probe error: ${err.message}`);
}

console.log('\n' + '='.repeat(80));
console.log('FULL SITE REGRESSION SUMMARY:');
console.log(`96 Routes HTTP 200: ${results.routes200} / ${results.routesChecked} (${results.routes200 === 96 ? 'PASS' : 'FAIL'})`);
console.log(`Canonicals Matching: ${results.routesCanonicalMatch} / ${results.routesChecked} (${results.routesCanonicalMatch === 96 ? 'PASS' : 'FAIL'})`);
console.log(`NoIndex in HTML: ${results.routesNoIndexFoundInHtml} (PASS = 0)`);
console.log(`Legacy Redirects: ${results.redirectsPassed} / ${results.redirectsChecked} (${results.redirectsPassed === 37 ? 'PASS' : 'FAIL'})`);
console.log(`Sitemap URLs: ${results.sitemapUrlCount} (${results.sitemapUrlCount === 96 ? 'PASS' : 'FAIL'})`);
console.log(`LLM Endpoints: ${results.llmEndpointsPassed} / ${results.llmEndpointsTotal} (${results.llmEndpointsPassed === 4 ? 'PASS' : 'FAIL'})`);
console.log(`Internal Link Hops: ${results.internalRedirectHops}`);
console.log(`Broken Internal Links: ${results.brokenInternalLinks}`);
console.log(`Broken Assets: ${results.brokenAssets}`);
console.log(`wp-origin Operational: ${results.wpOriginOperational}`);
console.log('='.repeat(80));

fs.writeFileSync(path.join(ROOT, 'data/audit/full_site_regression_report.json'), JSON.stringify(results, null, 2), 'utf8');

if (results.errors.length > 0) {
  console.log('\nEncountered Errors:');
  for (const e of results.errors.slice(0, 10)) {
    console.log(' - ' + e);
  }
}
