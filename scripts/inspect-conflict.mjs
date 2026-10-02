async function inspectConflict() {
  const url = process.argv[2] || 'https://www.dgeniussolutions.com/blogs/aeo-in-2026/';
  const html = await (await fetch(url)).text();
  const schemaMatches = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  console.log('URL:', url);
  console.log('Total JSON-LD scripts on page:', schemaMatches.length);
  schemaMatches.forEach((m, idx) => {
    try {
      const parsed = JSON.parse(m[1]);
      console.log('=== SCRIPT #' + (idx + 1) + ' ===');
      const findOrg = (ent) => {
        if (!ent || typeof ent !== 'object') return;
        if (Array.isArray(ent)) ent.forEach(findOrg);
        else {
          if (ent['@id'] && ent['@id'].includes('organization')) {
            console.log(JSON.stringify(ent, null, 2));
          }
          for (const v of Object.values(ent)) {
            findOrg(v);
          }
        }
      };
      findOrg(parsed);
    } catch (e) {
      console.log('Script #' + (idx + 1) + ' parse error:', e.message);
    }
  });
}
inspectConflict();
