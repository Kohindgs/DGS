import { chromium } from "playwright";
import fs from "node:fs";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log("=== CHECKING /blogs/ ARCHIVE ===");
  const badResponses = [];
  page.on("response", (r) => {
    if (r.status() >= 400 && /image|jpg|png|webp|avif|jpeg|gif|uploads|media/.test(r.url())) {
      badResponses.push({ status: r.status(), url: r.url() });
    }
  });

  await page.goto("https://www.dgeniussolutions.com/blogs/", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);

  // Scroll to trigger lazy loading
  for (let i = 0; i < 20; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 600);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(2000);

  const images = await page.evaluate(() => {
    return [...document.images].map((im, idx) => ({
      index: idx,
      alt: im.alt,
      src: im.src,
      currentSrc: im.currentSrc,
      complete: im.complete,
      naturalWidth: im.naturalWidth,
      naturalHeight: im.naturalHeight,
      visible: im.getBoundingClientRect().width > 0 && im.getBoundingClientRect().height > 0,
      article: im.closest("article")?.querySelector("a[href]")?.getAttribute("href"),
    }));
  });

  const broken = images.filter((x) => x.visible && x.complete && x.naturalWidth === 0);
  console.log(`Total images on /blogs/: ${images.length}`);
  console.log(`Broken images on /blogs/: ${broken.length}`);
  if (broken.length > 0) {
    console.error("BROKEN IMAGES:", JSON.stringify(broken, null, 2));
  } else {
    console.log("ZERO broken images on /blogs/! PASS!");
  }

  // Check specifically for our two blog posts
  const post1Img = images.find((x) => x.article?.includes("google-september-2026-spam-update"));
  const post2Img = images.find((x) => x.article?.includes("google-ads-for-b2b-lead-generation"));

  console.log("\nPost 1 Card Image:", JSON.stringify(post1Img, null, 2));
  console.log("\nPost 2 Card Image:", JSON.stringify(post2Img, null, 2));

  // Take screenshot of the blog grid containing these posts
  await page.screenshot({ path: "scripts/blogs_grid_live.png", fullPage: false });

  // Test individual blog pages
  const singlePages = [
    "/blogs/google-september-2026-spam-update-what-website-owners-should-know/",
    "/blogs/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads/",
  ];

  for (const sp of singlePages) {
    console.log(`\n=== CHECKING ${sp} ===`);
    await page.goto("https://www.dgeniussolutions.com" + sp, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(2500);

    const singleImgs = await page.evaluate(() => {
      return [...document.images].map((im) => ({
        alt: im.alt,
        src: im.src,
        naturalWidth: im.naturalWidth,
        naturalHeight: im.naturalHeight,
        complete: im.complete,
        visible: im.getBoundingClientRect().width > 0,
      }));
    });

    const singleBroken = singleImgs.filter((x) => x.visible && x.complete && x.naturalWidth === 0);
    console.log(`Images on page: ${singleImgs.length}, broken: ${singleBroken.length}`);
    const featured = singleImgs.find((x) => x.src.includes("cms-media/uploads/"));
    console.log("Featured image:", JSON.stringify(featured, null, 2));
  }

  await browser.close();
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
