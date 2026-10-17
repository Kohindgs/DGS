import { chromium } from "playwright";
import path from "node:path";

const BASE_URL = "https://www.dgeniussolutions.com";
const ARTIFACT_DIR = "C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7";

async function run() {
  console.log("=== LAUNCHING ROBUST PLAYWRIGHT PORTFOLIO QA SUITE ===");
  const browser = await chromium.launch({ headless: true });

  // 1. DESKTOP VIEWPORT (1440 x 900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  });
  const desktopPage = await desktopContext.newPage();

  // Helper to remove any floating triggers
  async function cleanFloaters(page) {
    await page.evaluate(() => {
      const trig = document.getElementById("dgsTrig");
      if (trig) trig.remove();
      const floater = document.querySelector(".dgs-floating-cta, .dgs-whatsapp-float");
      if (floater) floater.remove();
    });
  }

  // 2. MOBILE VIEWPORT (iPhone 14 / Pixel 7: 390 x 844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1"
  });
  const mobilePage = await mobileContext.newPage();

  // Test 1: Agency Page Desktop
  console.log("\n1. Testing /services/ai-video-production-agency/ (Desktop)...");
  await desktopPage.goto(BASE_URL + "/services/ai-video-production-agency/", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1500);
  await cleanFloaters(desktopPage);

  // Take hero + portfolio screenshot
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, "01_agency_portfolio_desktop.png"),
    fullPage: false
  });
  console.log("✓ Saved 01_agency_portfolio_desktop.png");

  // Click first card to test lightbox
  const firstCard = await desktopPage.$(".gallery-item, .case-study-item");
  if (firstCard) {
    console.log("Opening lightbox on Agency Page...");
    await firstCard.evaluate((el) => el.click());
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({
      path: path.join(ARTIFACT_DIR, "02_agency_lightbox_desktop.png"),
      fullPage: false
    });
    console.log("✓ Saved 02_agency_lightbox_desktop.png");
    // Close lightbox via Escape key
    await desktopPage.keyboard.press("Escape");
    await desktopPage.waitForTimeout(500);
  }

  // Test 2: Agency Page Mobile
  console.log("\n2. Testing /services/ai-video-production-agency/ (Mobile)...");
  await mobilePage.goto(BASE_URL + "/services/ai-video-production-agency/", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1500);
  await cleanFloaters(mobilePage);
  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, "03_agency_portfolio_mobile.png"),
    fullPage: false
  });
  console.log("✓ Saved 03_agency_portfolio_mobile.png");

  // Test 3: Google Ads Landing Page Desktop
  console.log("\n3. Testing /ai-production-videos-google-ads-landing-page/ (Desktop)...");
  await desktopPage.goto(BASE_URL + "/ai-production-videos-google-ads-landing-page/", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1500);
  await cleanFloaters(desktopPage);
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, "04_ads_portfolio_desktop.png"),
    fullPage: false
  });
  console.log("✓ Saved 04_ads_portfolio_desktop.png");

  // Test 4: Google Ads Landing Page Mobile
  console.log("\n4. Testing /ai-production-videos-google-ads-landing-page/ (Mobile)...");
  await mobilePage.goto(BASE_URL + "/ai-production-videos-google-ads-landing-page/", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1500);
  await cleanFloaters(mobilePage);
  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, "05_ads_portfolio_mobile.png"),
    fullPage: false
  });
  console.log("✓ Saved 05_ads_portfolio_mobile.png");

  // Test 5: Dubai Page Desktop
  console.log("\n5. Testing /services/ai-production-dubai-page/ (Desktop)...");
  await desktopPage.goto(BASE_URL + "/services/ai-production-dubai-page/", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1500);
  await cleanFloaters(desktopPage);
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, "06_dubai_portfolio_desktop.png"),
    fullPage: false
  });
  console.log("✓ Saved 06_dubai_portfolio_desktop.png");

  // Test 6: Homepage Desktop (Positions 1-4: Hyundai, Sundaram, Clarion, Better Ceasons)
  console.log("\n6. Testing / (Homepage, Desktop)...");
  await desktopPage.goto(BASE_URL + "/", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(2000);
  await cleanFloaters(desktopPage);
  const homePortfolio = await desktopPage.$("#portfolio-gallery, .portfolio-section, #portfolio");
  if (homePortfolio) {
    await homePortfolio.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(1000);
  }
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, "07_homepage_portfolio_desktop.png"),
    fullPage: false
  });
  console.log("✓ Saved 07_homepage_portfolio_desktop.png");

  // Test 7: Full Portfolio /portfolio/ (Desktop)
  console.log("\n7. Testing /portfolio/ (Desktop)...");
  await desktopPage.goto(BASE_URL + "/portfolio/", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(2000);
  await cleanFloaters(desktopPage);
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, "08_full_portfolio_desktop.png"),
    fullPage: false
  });
  console.log("✓ Saved 08_full_portfolio_desktop.png");

  // Click a video to test modal on /portfolio/
  const portfolioItemBtn = await desktopPage.$("button[aria-label*='View']");
  if (portfolioItemBtn) {
    console.log("Opening viewer on /portfolio/...");
    await portfolioItemBtn.evaluate((el) => el.click());
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({
      path: path.join(ARTIFACT_DIR, "09_full_portfolio_viewer_desktop.png"),
      fullPage: false
    });
    console.log("✓ Saved 09_full_portfolio_viewer_desktop.png");
  }

  await browser.close();
  console.log("\n=== PLAYWRIGHT PORTFOLIO QA COMPLETED SUCCESSFULLY ===");
}

run().catch((err) => {
  console.error("Playwright error:", err);
  process.exit(1);
});
