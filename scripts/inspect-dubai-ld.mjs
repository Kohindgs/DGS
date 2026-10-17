import { chromium } from "playwright";

async function inspectDubaiLd() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/ai-production-dubai-page/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => ({
      id: s.id,
      parent: s.parentElement?.tagName,
      content: s.textContent
    }));
  });

  console.log(`Found ${scripts.length} JSON-LD scripts on Dubai page:`);
  scripts.forEach((s, i) => {
    console.log(`--- Script ${i + 1} (id="${s.id}", parent=${s.parent}) ---`);
    try {
      const parsed = JSON.parse(s.content);
      if (Array.isArray(parsed)) {
        console.log(`Array of ${parsed.length} items`);
        parsed.forEach(p => {
          if (p['@type'] === 'FAQPage') {
            console.log('FAQPage mainEntity count:', p.mainEntity?.length);
            console.log('FAQ questions:', p.mainEntity?.map(q => q.name));
          }
        });
      } else {
        console.log(`Object with keys: ${Object.keys(parsed)}`);
      }
    } catch (e) {
      console.log('Parse error:', e.message);
    }
  });

  await browser.close();
}

inspectDubaiLd().catch(console.error);
