import fs from 'node:fs';

const BASE_URL = 'https://dimgrey-goat-473970.hostingersite.com';
const registry = JSON.parse(fs.readFileSync('data/migration/nextjs-route-registry.generated.json', 'utf8'));
const mirrorIndex = JSON.parse(fs.readFileSync('data/wordpress/mirrors/index.json', 'utf8'));

const blogRoutes = registry.routes.filter(r => r.path === '/blogs/' || r.path.startsWith('/blogs/'));

console.log('='.repeat(80));
console.log(`AUDITING ALL ${blogRoutes.length} BLOG ROUTES ON DIMGREY`);
console.log('='.repeat(80));

const results = {
  totalRoutes: blogRoutes.length,
  http200: 0,
  httpOther: 0,
  h1Present: 0,
  schemaOk: 0,
  duplicateFaqSections: 0,
  exactContentMatches: 0,
  contentDifferences: 0,
  wordCountDifferences: [],
  missingSections: 0,
  routes: [],
};

for (const r of blogRoutes) {
  const url = `${BASE_URL}${r.path}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'DGS-Blog-Audit/1.0' }
  });

  const html = await res.text();
  const status = res.status;

  if (status === 200) results.http200++;
  else results.httpOther++;

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';
  if (h1) results.h1Present++;

  // Schemas
  const schemaMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  const schemas = schemaMatches.flatMap(m => {
    try {
      const parsed = JSON.parse(m[1]);
      return Array.isArray(parsed) ? parsed.map(x => x['@type']) : [parsed['@type']];
    } catch { return []; }
  });
  if (schemas.includes('BlogPosting') || r.path === '/blogs/') {
    results.schemaOk++;
  }

  // Check FAQ duplication in HTML:
  // Is there any duplicate standalone FAQ heading (e.g. 2 headings whose text is "FAQ" or "FAQs")
  const allH2H3 = [...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').trim())
    .filter(t => /^(?:faqs?|frequently asked questions)$/i.test(t));
  const hasDuplicateFaq = allH2H3.length > 1;
  if (hasDuplicateFaq) results.duplicateFaqSections++;

  // Compare article text against original mirror entry-content
  let textMatch = true;
  if (r.path !== '/blogs/') {
    const filename = mirrorIndex.pages?.[r.path];
    if (filename && fs.existsSync(`data/wordpress/mirrors/pages/${filename}`)) {
      const mirror = JSON.parse(fs.readFileSync(`data/wordpress/mirrors/pages/${filename}`, 'utf8'));
      const origHtml = mirror.body || '';
      
      // Extract original headings
      const origH2s = [...origHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g, '').replace(/&[a-z0-9#]+;/gi, ' ').replace(/\s+/g, ' ').trim())
        .filter(Boolean);

      // Extract rendered headings
      const renderedH2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g, '').replace(/&[a-z0-9#]+;/gi, ' ').replace(/\s+/g, ' ').trim())
        .filter(Boolean);

      // Check that all original headings exist in rendered headings
      const missingH2s = origH2s.filter(h => !renderedH2s.some(rh => rh.includes(h) || h.includes(rh)));
      if (missingH2s.length > 0) {
        textMatch = false;
        results.missingSections += missingH2s.length;
      }
    }
  }

  if (textMatch) results.exactContentMatches++;
  else results.contentDifferences++;

  results.routes.push({
    path: r.path,
    status,
    h1: !!h1,
    schemas,
    faqHeadingsCount: allH2H3.length,
    duplicateFaqs: hasDuplicateFaq,
    textMatch,
  });

  process.stdout.write(status === 200 && !hasDuplicateFaq ? '.' : 'F');
}

console.log('\n\n' + '='.repeat(80));
console.log('BLOG REGRESSION RESULTS:');
console.log(`Total blog routes audited: ${results.totalRoutes}`);
console.log(`HTTP 200: ${results.http200} / ${results.totalRoutes}`);
console.log(`HTTP Other/Error: ${results.httpOther}`);
console.log(`H1 Present: ${results.h1Present} / ${results.totalRoutes}`);
console.log(`Exact Content / Heading Matches: ${results.exactContentMatches} / ${results.totalRoutes}`);
console.log(`Content Differences: ${results.contentDifferences}`);
console.log(`Missing Sections: ${results.missingSections}`);
console.log(`Duplicate FAQ Sections: ${results.duplicateFaqSections}`);
console.log('='.repeat(80));

fs.writeFileSync('data/audit/blog_regression_report.json', JSON.stringify(results, null, 2), 'utf8');
