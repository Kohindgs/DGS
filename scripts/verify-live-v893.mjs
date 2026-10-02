async function main() {
  const urls = [
    'https://www.dgeniussolutions.com/blogs/aeo-in-2026/',
    'https://www.dgeniussolutions.com/blogs/google-ads-ai-max-2026/',
    'https://www.dgeniussolutions.com/blogs/google-august-2026-spam-update/',
    'https://www.dgeniussolutions.com/blogs/seo-company-in-mumbai/',
    'https://www.dgeniussolutions.com/services/website-development/',
    'https://www.dgeniussolutions.com/services/website-development-amc/',
    'https://www.dgeniussolutions.com/blogs/dgs-cms-scheduled-cron-qa/'
  ];
  for (const u of urls) {
    const r = await fetch(u, { redirect: 'manual' });
    const status = r.status;
    const loc = r.headers.get('location') || '';
    let canonical = null;
    let robots = null;
    if (status === 200) {
      const html = await r.text();
      const can = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
      canonical = can ? can[1] : null;
      const rob = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
      robots = rob ? rob[1] : null;
    }
    console.log(u, '=> Status:', status, loc ? 'Redirect to: ' + loc : '', canonical ? 'Canonical: ' + canonical : '', robots ? 'Robots: ' + robots : '');
  }
}
main();
