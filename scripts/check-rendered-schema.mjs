import { chromium } from "playwright";

async function checkDom(url) {
  console.log(`\n======================================================`);
  console.log(`CHECKING LIVE DOM ON: ${url}`);
  console.log(`======================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  const scripts = await page.evaluate(() => {
    const el = document.querySelectorAll('script[type="application/ld+json"]');
    return Array.from(el).map((s, idx) => ({ idx, text: s.textContent }));
  });

  console.log(`Found ${scripts.length} ld+json script tags in rendered DOM.`);
  scripts.forEach((s) => {
    console.log(`\n--- Script ${s.idx + 1} ---`);
    try {
      const data = JSON.parse(s.text.trim());
      if (data["@graph"]) {
        console.log(`@graph of ${data["@graph"].length} items:`);
        data["@graph"].forEach((item) => {
          console.log(`  @type: ${item["@type"]} | name: ${item.name || item["@id"]} | uploadDate: ${item.uploadDate}`);
        });
      } else if (Array.isArray(data)) {
        console.log(`Array of ${data.length} items:`);
        data.forEach((item) => {
          console.log(`  @type: ${item["@type"]} | name: ${item.name || item["@id"]} | uploadDate: ${item.uploadDate}`);
        });
      } else {
        console.log(`Single item: @type: ${data["@type"]} | name: ${data.name || data["@id"]}`);
      }
    } catch (e) {
      console.log("Parse error:", e.message);
    }
  });

  // Check microdata in rendered DOM
  const microdata = await page.evaluate(() => {
    const reviews = document.querySelectorAll('[itemtype*="Review"]');
    const videos = document.querySelectorAll('[itemtype*="VideoObject"]');
    const allItemTypes = Array.from(document.querySelectorAll('[itemtype]')).map((el) => el.getAttribute('itemtype'));
    const allItemProps = Array.from(document.querySelectorAll('[itemprop]')).map((el) => el.getAttribute('itemprop'));
    return {
      reviewsCount: reviews.length,
      reviewsHtml: Array.from(reviews).map((r) => r.outerHTML),
      videosCount: videos.length,
      itemtypes: [...new Set(allItemTypes)],
      itemprops: [...new Set(allItemProps)],
    };
  });

  console.log("\nMicrodata in rendered DOM:");
  console.log("Reviews count:", microdata.reviewsCount);
  if (microdata.reviewsCount > 0) {
    console.log("Review elements:", microdata.reviewsHtml);
  }
  console.log("Videos count:", microdata.videosCount);
  console.log("Itemtypes:", microdata.itemtypes);

  await browser.close();
}

async function main() {
  await checkDom("https://www.dgeniussolutions.com/services/ai-video-production-agency/");
  await checkDom("https://www.dgeniussolutions.com/services/ai-production-dubai-page/");
  await checkDom("https://www.dgeniussolutions.com/portfolio/");
  await checkDom("https://www.dgeniussolutions.com/");
}

main().catch(console.error);
