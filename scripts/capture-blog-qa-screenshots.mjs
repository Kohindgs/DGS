import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.AUDIT_BASE_URL || 'https://dimgrey-goat-473970.hostingersite.com';
const OUT_DIR = path.resolve('data/audit/blog_qa_screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const registry = JSON.parse(fs.readFileSync('data/migration/nextjs-route-registry.generated.json', 'utf8'));
const blogArticleRoutes = registry.routes.filter(r => r.path.startsWith('/blogs/') && r.path !== '/blogs/');

const allBlogRoutes = [
  { slug: 'blog-archive', path: '/blogs/' },
  ...blogArticleRoutes.map(r => ({
    slug: r.slug || r.path.replace(/^\/blogs\/|\/$/g, ''),
    path: r.path
  }))
];

console.log('='.repeat(80));
console.log(`CAPTURING ALL 124 VISUAL QA SCREENSHOTS (62 ROUTES × 2 VIEWPORTS)`);
console.log(`Target: ${BASE_URL}`);
console.log(`Total Routes: ${allBlogRoutes.length}`);
console.log('='.repeat(80));

const manifest = [];

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (let i = 0; i < allBlogRoutes.length; i++) {
    const route = allBlogRoutes[i];
    const cleanSlug = route.slug.replace(/[^a-z0-9_-]/gi, '-');
    const desktopFilename = `${cleanSlug}-desktop-1440.png`;
    const mobileFilename = `${cleanSlug}-mobile-390.png`;

    process.stdout.write(`[${i + 1}/${allBlogRoutes.length}] ${route.path} ... `);

    const result = {
      route: route.path,
      desktopScreenshot: desktopFilename,
      mobileScreenshot: mobileFilename,
      horizontalOverflowDesktop: false,
      horizontalOverflowMobile: false,
      brokenImages: 0,
      missingH1: false,
      visualWarnings: []
    };

    // 1. Desktop Viewport (1440 x 900)
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });
    const desktopPage = await desktopCtx.newPage();

    try {
      await desktopPage.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 35000 });
      await desktopPage.waitForTimeout(600);

      const desktopChecks = await desktopPage.evaluate((isArchive) => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const horizontalOverflow = docWidth > winWidth;

        const h1 = document.querySelector('h1');
        const missingH1 = !h1 || !h1.textContent.trim();

        // Broken images
        const imgs = Array.from(document.querySelectorAll('img'));
        let brokenImages = 0;
        for (const img of imgs) {
          if (img.complete && img.naturalWidth === 0 && img.src && !img.src.startsWith('data:')) {
            brokenImages++;
          }
        }

        // Body content check
        let emptyBody = false;
        if (!isArchive) {
          const prose = document.querySelector('div[class*="prose"]');
          emptyBody = !prose || prose.textContent.trim().length < 100;
        }

        // Table & video overflow
        const tables = Array.from(document.querySelectorAll('table'));
        let tableOverflow = false;
        for (const tbl of tables) {
          if (tbl.offsetWidth > winWidth) tableOverflow = true;
        }

        const iframes = Array.from(document.querySelectorAll('iframe, video'));
        let iframeOverflow = false;
        for (const ifr of iframes) {
          if (ifr.offsetWidth > winWidth) iframeOverflow = true;
        }

        return {
          horizontalOverflow,
          missingH1,
          brokenImages,
          emptyBody,
          tableOverflow,
          iframeOverflow
        };
      }, route.path === '/blogs/');

      result.horizontalOverflowDesktop = desktopChecks.horizontalOverflow;
      result.brokenImages += desktopChecks.brokenImages;
      if (desktopChecks.missingH1) result.missingH1 = true;
      if (desktopChecks.emptyBody) result.visualWarnings.push('Empty or truncated body on desktop');
      if (desktopChecks.tableOverflow) result.visualWarnings.push('Table overflow detected on desktop');
      if (desktopChecks.iframeOverflow) result.visualWarnings.push('Iframe/video overflow detected on desktop');

      await desktopPage.screenshot({
        path: path.join(OUT_DIR, desktopFilename),
        fullPage: false
      });
    } catch (err) {
      result.visualWarnings.push(`Desktop capture error: ${err.message}`);
    } finally {
      await desktopCtx.close();
    }

    // 2. Mobile Viewport (390 x 844)
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    });
    const mobilePage = await mobileCtx.newPage();

    try {
      await mobilePage.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 35000 });
      await mobilePage.waitForTimeout(600);

      const mobileChecks = await mobilePage.evaluate((isArchive) => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const horizontalOverflow = docWidth > winWidth;

        const h1 = document.querySelector('h1');
        const missingH1 = !h1 || !h1.textContent.trim();

        const imgs = Array.from(document.querySelectorAll('img'));
        let brokenImages = 0;
        for (const img of imgs) {
          if (img.complete && img.naturalWidth === 0 && img.src && !img.src.startsWith('data:')) {
            brokenImages++;
          }
        }

        let emptyBody = false;
        if (!isArchive) {
          const prose = document.querySelector('div[class*="prose"]');
          emptyBody = !prose || prose.textContent.trim().length < 100;
        }

        return {
          horizontalOverflow,
          missingH1,
          brokenImages,
          emptyBody
        };
      }, route.path === '/blogs/');

      result.horizontalOverflowMobile = mobileChecks.horizontalOverflow;
      result.brokenImages += mobileChecks.brokenImages;
      if (mobileChecks.missingH1) result.missingH1 = true;
      if (mobileChecks.emptyBody) result.visualWarnings.push('Empty or truncated body on mobile');

      await mobilePage.screenshot({
        path: path.join(OUT_DIR, mobileFilename),
        fullPage: false
      });
    } catch (err) {
      result.visualWarnings.push(`Mobile capture error: ${err.message}`);
    } finally {
      await mobileCtx.close();
    }

    manifest.push(result);
    console.log(`OK (D-overflow: ${result.horizontalOverflowDesktop}, M-overflow: ${result.horizontalOverflowMobile})`);
  }

  await browser.close();

  fs.writeFileSync('data/audit/blog_visual_qa_manifest.json', JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\n='.repeat(80));
  console.log('ALL 124 SCREENSHOTS CAPTURED AND MANIFEST GENERATED');
  console.log(`Total Manifest Entries: ${manifest.length}`);
  console.log(`Desktop Overflow Count: ${manifest.filter(m => m.horizontalOverflowDesktop).length}`);
  console.log(`Mobile Overflow Count: ${manifest.filter(m => m.horizontalOverflowMobile).length}`);
  console.log(`Broken Images Count: ${manifest.reduce((acc, m) => acc + m.brokenImages, 0)}`);
  console.log(`Missing H1 Count: ${manifest.filter(m => m.missingH1).length}`);
  console.log(`Total Warnings: ${manifest.reduce((acc, m) => acc + m.visualWarnings.length, 0)}`);
  console.log('='.repeat(80));
}

run().catch(console.error);
