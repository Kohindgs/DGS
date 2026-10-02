async function main() {
  const urls = [
    'https://www.dgeniussolutions.com/blogs/aeo-in-2026/',
    'https://www.dgeniussolutions.com/blogs/google-ads-ai-max-2026/',
    'https://www.dgeniussolutions.com/blogs/google-august-2026-spam-update/',
    'https://www.dgeniussolutions.com/blogs/seo-company-in-mumbai/'
  ];
  for (const u of urls) {
    const res = await fetch(u);
    const html = await res.text();
    const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const schemas = [];
    for (const s of scripts) {
      try {
        schemas.push(JSON.parse(s[1]));
      } catch (e) {
        schemas.push({ error: e.message, raw: s[1].slice(0, 100) });
      }
    }
    const types = [];
    for (const sc of schemas) {
      if (sc['@type']) types.push(sc['@type']);
      if (sc['@graph'] && Array.isArray(sc['@graph'])) {
        types.push(...sc['@graph'].map(g => g['@type']));
      }
    }
    console.log(u, '=> Valid Schema Blocks:', scripts.length, 'Schema Types:', types.join(', '));
  }
}
main();
