import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log("Navigating to blogs archive...");
  await page.goto("https://www.dgeniussolutions.com/blogs/?bust=" + Date.now(), { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3000);
  
  // Locate the two cards
  const card1 = page.locator('article:has(a[href*="google-september-2026-spam-update-what-website-owners-should-know"])');
  if (await card1.count() > 0) {
    await card1.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await card1.screenshot({ path: "C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7/blog_card_1_spam_update.png" });
    console.log("Captured card 1");
  } else {
    console.warn("Card 1 not found on page 1 of blogs archive");
  }
  
  const card2 = page.locator('article:has(a[href*="google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads"])');
  if (await card2.count() > 0) {
    await card2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await card2.screenshot({ path: "C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7/blog_card_2_google_ads_b2b.png" });
    console.log("Captured card 2");
  } else {
    console.warn("Card 2 not found on page 1 of blogs archive");
  }

  // Single post 1
  console.log("Navigating to single post 1...");
  await page.goto("https://www.dgeniussolutions.com/blogs/google-september-2026-spam-update-what-website-owners-should-know/?bust=" + Date.now(), { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7/blog_single_1_spam_update.png", clip: { x: 0, y: 0, width: 1440, height: 800 } });
  console.log("Captured single post 1 hero");

  // Single post 2
  console.log("Navigating to single post 2...");
  await page.goto("https://www.dgeniussolutions.com/blogs/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads/?bust=" + Date.now(), { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7/blog_single_2_google_ads_b2b.png", clip: { x: 0, y: 0, width: 1440, height: 800 } });
  console.log("Captured single post 2 hero");

  await browser.close();
  console.log("All blog screenshots captured successfully!");
}

run().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
