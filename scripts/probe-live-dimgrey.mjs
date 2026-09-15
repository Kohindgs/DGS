import https from 'node:https';

const endpoints = [
  '/',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/llms-full.txt',
  '/llms.md',
  '/llms-full.md',
  '/services/seo-services-in-mumbai/',
  '/services/aeo-services-in-mumbai/',
  '/services/geo/',
  '/services/llm-seo-service/',
  '/services/ai-video-production-agency/',
  '/portfolio/',
  '/blogs/ai-content-optimization/'
];

function checkEndpoint(ep) {
  return new Promise((resolve) => {
    const req = https.get(`https://dimgrey-goat-473970.hostingersite.com${ep}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 DGS-LiveAudit/1.0',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let metaRobots = null;
        const metaMatch = body.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
        if (metaMatch) metaRobots = metaMatch[1];
        resolve({
          endpoint: ep,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          xRobotsTag: res.headers['x-robots-tag'] || 'NONE',
          cacheStatus: res.headers['x-hcdn-cache-status'] || 'NONE',
          cacheControl: res.headers['cache-control'] || 'NONE',
          metaRobots: metaRobots || 'NONE',
          bodySnippet: body.slice(0, 120).replace(/\s+/g, ' ')
        });
      });
    });
    req.on('error', err => resolve({ endpoint: ep, error: err.message }));
  });
}

async function main() {
  console.log('='.repeat(80));
  console.log('LIVE DIMGREY STAGING PROBE REPORT');
  console.log('Target: https://dimgrey-goat-473970.hostingersite.com');
  console.log('='.repeat(80));

  for (const ep of endpoints) {
    const res = await checkEndpoint(ep);
    console.log(`\nEndpoint: ${res.endpoint}`);
    console.log(`  HTTP Status:      ${res.statusCode}`);
    console.log(`  Content-Type:     ${res.contentType}`);
    console.log(`  X-Robots-Tag:     ${res.xRobotsTag}`);
    console.log(`  Cache-Control:    ${res.cacheControl}`);
    console.log(`  HCDN Status:      ${res.cacheStatus}`);
    console.log(`  Meta Robots:      ${res.metaRobots}`);
    console.log(`  Snippet:          ${res.bodySnippet}`);
  }
}

main();
