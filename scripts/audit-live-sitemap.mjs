async function main() {
  const res = await fetch('https://www.dgeniussolutions.com/sitemap.xml');
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log('Auditing ' + urls.length + ' URLs...');
  const results = [];
  for (const url of urls) {
    try {
      const resp = await fetch(url, { redirect: 'manual' });
      const status = resp.status;
      const location = resp.headers.get('location') || '';
      let canonical = null;
      let robots = null;
      if (status === 200) {
        const html = await resp.text();
        const canMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
        canonical = canMatch ? canMatch[1] : null;
        const robMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
        robots = robMatch ? robMatch[1] : null;
      }
      results.push({ url, status, location, canonical, robots });
    } catch (e) {
      results.push({ url, status: 'ERROR', error: e.message });
    }
  }
  const redirects = results.filter(r => r.status >= 300 && r.status < 400);
  const notFounds = results.filter(r => r.status === 404);
  const non200 = results.filter(r => r.status !== 200);
  const canonicalMismatch = results.filter(r => r.status === 200 && r.canonical && r.canonical.replace(/\/$/, '') !== r.url.replace(/\/$/, ''));
  const noindex = results.filter(r => r.robots && r.robots.includes('noindex'));
  console.log('Total URLs audited:', results.length);
  console.log('Redirects (' + redirects.length + '):', JSON.stringify(redirects, null, 2));
  console.log('404s (' + notFounds.length + '):', JSON.stringify(notFounds, null, 2));
  console.log('Non-200s (' + non200.length + '):', JSON.stringify(non200, null, 2));
  console.log('Canonical Mismatches (' + canonicalMismatch.length + '):', JSON.stringify(canonicalMismatch, null, 2));
  console.log('Noindex (' + noindex.length + '):', JSON.stringify(noindex, null, 2));
  
  const fs = await import('fs/promises');
  await fs.writeFile('data/audit/live/live-sitemap-audit-v893.json', JSON.stringify(results, null, 2));
  console.log('Audit saved to data/audit/live/live-sitemap-audit-v893.json');
}
main();
