import { chromium } from "playwright";

async function main() {
  console.log("==================================================================");
  console.log("  VERIFYING REPAIRED BLOG IMAGES ON LIVE PRODUCTION");
  console.log("==================================================================");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const urls = [
    {
      type: "Card on Archive",
      url: "https://www.dgeniussolutions.com/blogs/",
      selector: "article:has(a[href*='google-september-2026-spam-update']) img",
    },
    {
      type: "Card on Archive",
      url: "https://www.dgeniussolutions.com/blogs/",
      selector: "article:has(a[href*='google-ads-for-b2b-lead-generation']) img",
    },
    {
      type: "Single Post Hero",
      url: "https://www.dgeniussolutions.com/blogs/google-september-2026-spam-update-what-website-owners-should-know/",
      selector: "article img, .blog-hero img, main img",
    },
    {
      type: "Single Post Hero",
      url: "https://www.dgeniussolutions.com/blogs/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads/",
      selector: "article img, .blog-hero img, main img",
    },
  ];

  const results = [];

  for (const item of urls) {
    await page.goto(item.url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const imgStats = await page.evaluate((sel) => {
      const img = document.querySelector(sel);
      if (!img) return { found: false };
      img.scrollIntoView();
      return {
        found: true,
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
      };
    }, item.selector);

    const pass = imgStats.found && imgStats.complete && imgStats.naturalWidth > 0;
    results.push({
      type: item.type,
      url: item.url.replace("https://www.dgeniussolutions.com", ""),
      found: imgStats.found,
      naturalWidth: imgStats.naturalWidth || 0,
      naturalHeight: imgStats.naturalHeight || 0,
      src: imgStats.src || "none",
      status: pass ? "PASS" : "FAIL",
    });
  }

  await browser.close();

  console.table(results);
}

main().catch(console.error);
