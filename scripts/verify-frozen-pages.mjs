async function main() {
  const pages = [
    { url: 'https://www.dgeniussolutions.com/services/ai-video-production-agency/' },
    { url: 'https://www.dgeniussolutions.com/services/llm-seo-service/' },
    { url: 'https://www.dgeniussolutions.com/services/geo/' }
  ];
  for (const p of pages) {
    const res = await fetch(p.url);
    const html = await res.text();
    const tMatch = html.match(/<title>([^<]+)<\/title>/i);
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const canMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
    const robMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
    console.log(p.url);
    console.log('  Status:', res.status);
    console.log('  Title:', tMatch ? tMatch[1] : 'NONE');
    console.log('  H1:', h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'NONE');
    console.log('  Canonical:', canMatch ? canMatch[1] : 'NONE');
    console.log('  Robots:', robMatch ? robMatch[1] : 'NONE');
  }
}
main();
