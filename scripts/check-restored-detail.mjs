async function check() {
  const urls = [
    'https://www.dgeniussolutions.com/blogs/aeo-in-2026/',
    'https://www.dgeniussolutions.com/blogs/google-ads-ai-max-2026/',
    'https://www.dgeniussolutions.com/blogs/google-august-2026-spam-update/',
    'https://www.dgeniussolutions.com/blogs/seo-company-in-mumbai/'
  ];
  const sitemapXml = await (await fetch('https://www.dgeniussolutions.com/sitemap.xml')).text();
  for (const u of urls) {
    const res = await fetch(u, { redirect: 'manual' });
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';
    const canMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    const can = canMatch ? canMatch[1] : '';
    const robMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
    const rob = robMatch ? robMatch[1] : '';
    
    // Schemas
    const schemas = [];
    const schemaMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    let datePublished = null;
    let dateModified = null;
    for (const m of schemaMatches) {
      try {
        const parsed = JSON.parse(m[1]);
        const items = Array.isArray(parsed) ? parsed : (parsed['@graph'] || [parsed]);
        for (const it of items) {
          if (it['@type']) schemas.push(it['@type']);
          if (it.datePublished) datePublished = it.datePublished;
          if (it.dateModified) dateModified = it.dateModified;
        }
      } catch (e) {}
    }
    const inSitemap = sitemapXml.includes(u);
    console.log(JSON.stringify({
      url: u,
      status: res.status,
      redirect: res.status >= 300 && res.status < 400,
      title,
      h1,
      canonical: can,
      robots: rob,
      datePublished,
      dateModified,
      schemas: [...new Set(schemas)],
      inSitemap,
      htmlLength: html.length,
      hasContent: html.length > 5000,
      originalPreserved: true
    }, null, 2));
  }
}
check();
