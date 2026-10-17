import { chromium } from "playwright";

const PAGES = [
  { name: "AI Video Production Agency", path: "/services/ai-video-production-agency/" },
  { name: "Dubai AI Production", path: "/services/ai-production-dubai-page/" },
  { name: "Homepage", path: "/" },
  { name: "Portfolio", path: "/portfolio/" },
  { name: "Website Development & AMC", path: "/services/website-development-amc/" },
];

async function checkLocalRoute(browser, { name, path }) {
  const url = `http://localhost:3012${path}`;
  console.log(`\n======================================================`);
  console.log(`CHECKING LOCAL DOM: ${name} (${url})`);
  console.log(`======================================================`);

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const scripts = await page.evaluate(() => {
    const el = document.querySelectorAll('script[type="application/ld+json"]');
    return Array.from(el).map((s, idx) => ({ id: s.id, text: s.textContent }));
  });

  console.log(`Total ld+json script tags: ${scripts.length}`);

  let totalEntities = 0;
  let videoCount = 0;
  let missingUploadDate = 0;
  let reviewCount = 0;
  let dubiaAddressCount = 0;
  const entityTypes = [];
  const sampleVideos = [];

  scripts.forEach((s, idx) => {
    console.log(`  Script tag #${idx + 1} (id: ${s.id}):`);
    try {
      const data = JSON.parse(s.text.trim());
      const items = Array.isArray(data) ? data : (data["@graph"] ? data["@graph"] : [data]);
      totalEntities += items.length;
      items.forEach((item) => {
        entityTypes.push(item["@type"]);
        if (item["@type"] === "Review") {
          reviewCount++;
        }
        if (item["@type"] === "VideoObject") {
          videoCount++;
          if (!item.uploadDate) {
            missingUploadDate++;
          }
          if (sampleVideos.length < 3) {
            sampleVideos.push({
              name: item.name,
              uploadDate: item.uploadDate,
              thumbnailUrl: item.thumbnailUrl,
              contentUrl: item.contentUrl,
              id: item["@id"],
              publisher: item.publisher,
            });
          }
        }
        if (JSON.stringify(item).includes('"addressLocality":"Dubai"')) {
          dubiaAddressCount++;
        }
      });
    } catch (e) {
      console.log(`  JSON Parse error on script #${idx + 1}:`, e.message);
    }
  });

  console.log(`  Total entities: ${totalEntities}`);
  console.log(`  Entity types: ${[...new Set(entityTypes)].join(", ")}`);
  console.log(`  Review objects: ${reviewCount}`);
  console.log(`  VideoObject entities: ${videoCount}`);
  console.log(`  Missing uploadDate count: ${missingUploadDate}`);
  console.log(`  Dubai PostalAddress count: ${dubiaAddressCount}`);
  if (sampleVideos.length > 0) {
    console.log(`  Sample Videos:`, JSON.stringify(sampleVideos, null, 2));
  }

  // Microdata check
  const microdata = await page.evaluate(() => {
    return {
      reviews: document.querySelectorAll('[itemtype*="Review"]').length,
      videos: document.querySelectorAll('[itemtype*="VideoObject"]').length,
    };
  });
  console.log(`  Microdata Reviews in DOM: ${microdata.reviews}`);
  console.log(`  Microdata Videos in DOM: ${microdata.videos}`);

  await page.close();
  return {
    name,
    path,
    scriptsCount: scripts.length,
    totalEntities,
    reviewCount,
    videoCount,
    missingUploadDate,
    dubiaAddressCount,
    microdataReviews: microdata.reviews,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const pageConfig of PAGES) {
    results.push(await checkLocalRoute(browser, pageConfig));
  }
  await browser.close();

  console.log("\n======================================================");
  console.log("LOCAL AUDIT SUMMARY");
  console.log("======================================================");
  console.table(results);
}

main().catch(console.error);
