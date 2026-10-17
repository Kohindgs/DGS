import { chromium } from "playwright";

async function testBlogImg() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('https://www.dgeniussolutions.com/blogs/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const res = await page.evaluate(async () => {
    const targetSrcs = [
      "ChatGPT-Image-Jul-24-2026-03_25_52-PM-1.png.webp",
      "ChatGPT-Image-Jul-22-2026-02_53_19-PM.png.webp"
    ];
    const out = [];
    for (const needle of targetSrcs) {
      const img = Array.from(document.querySelectorAll('img')).find(i => (i.src || '').includes(needle));
      if (!img) {
        out.push({ needle, found: false });
        continue;
      }
      
      // Scroll to image
      img.scrollIntoView({ behavior: 'instant', block: 'center' });
      
      // If loading="lazy", wait for decode or load event
      if (!img.complete || img.naturalWidth === 0) {
        try {
          await img.decode();
        } catch (e) {}
      }

      out.push({
        needle,
        found: true,
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
    }
    return out;
  });

  console.log("Blog image test with img.decode():", res);
  await browser.close();
}

testBlogImg().catch(console.error);
