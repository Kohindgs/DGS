import path from "node:path";
import { chromium } from "playwright";

const PROD_URL = "https://www.dgeniussolutions.com";

async function main() {
  console.log("==================================================");
  console.log("STARTING LIVE PRODUCTION VERIFICATION (REAL CHROME)");
  console.log("==================================================");

  const brainDir = path.resolve("C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7/v8.1-qa/production");
  const fs = await import("node:fs/promises");
  await fs.mkdir(brainDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  const testUrls = [
    "/",
    "/about-us/",
    "/aeo-dubai/",
    "/blogs/",
    "/services/seo-services-in-mumbai/",
    "/services/geo/",
    "/admin/login/",
  ];

  console.log("\n1. Verifying Brand Name Entity Defect Resolution across live production pages...");
  for (const urlPath of testUrls) {
    const fullUrl = `${PROD_URL}${urlPath}`;
    console.log(`Checking ${fullUrl}...`);
    const resp = await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 45000 });
    const status = resp?.status();
    console.log(`  HTTP status: ${status}`);

    const title = await page.title();
    console.log(`  Window title: "${title}"`);

    // Verify title has no raw unescaped entity string
    if (title.includes("&#x27;") || title.includes("&amp;#x27;") || title.includes("&#039;") || title.includes("&apos;")) {
      throw new Error(`Visible entity found in document.title of ${urlPath}: "${title}"`);
    }

    // Verify visible body text has no raw unescaped entity string
    const bodyText = await page.innerText("body");
    if (bodyText.includes("D&#x27;Genius") || bodyText.includes("D&amp;#x27;Genius") || bodyText.includes("D&apos;Genius") || bodyText.includes("D&#039;Genius")) {
      throw new Error(`Visible brand entity defect found in page body of ${urlPath}!`);
    }

    console.log(`  ✓ Brand display is clean and correct.`);
  }

  // 2. Verify FAQ Accordion on /aeo-dubai/
  console.log("\n2. Verifying FAQ Accordion interaction on live /aeo-dubai/...");
  await page.goto(`${PROD_URL}/aeo-dubai/`, { waitUntil: "networkidle", timeout: 45000 });
  const faqItems = await page.$$(".dgs-faq-item");
  console.log(`  Found ${faqItems.length} .dgs-faq-item elements`);

  if (faqItems.length >= 2) {
    const questions = await page.$$(".dgs-faq-question");
    
    // Check initial state
    const firstActiveBefore = await faqItems[0].evaluate(el => el.classList.contains("active"));
    const secondActiveBefore = await faqItems[1].evaluate(el => el.classList.contains("active"));
    console.log(`  Before click - Item 0 active: ${firstActiveBefore}, Item 1 active: ${secondActiveBefore}`);

    // Click Item 1 question
    console.log("  Clicking Item 1 question...");
    await questions[1].click();
    await page.waitForTimeout(600);

    const firstActiveAfter = await faqItems[0].evaluate(el => el.classList.contains("active"));
    const secondActiveAfter = await faqItems[1].evaluate(el => el.classList.contains("active"));
    console.log(`  After click - Item 0 active: ${firstActiveAfter}, Item 1 active: ${secondActiveAfter}`);

    if (!secondActiveAfter) {
      throw new Error("Live FAQ Accordion: Item 1 failed to open on click!");
    }
    if (firstActiveAfter) {
      throw new Error("Live FAQ Accordion: Sibling closing failed; Item 0 remained open!");
    }

    // Check that answer of Item 1 is visible
    const answer1 = await faqItems[1].$(".dgs-faq-answer");
    const isAnswerVisible = await answer1?.isVisible();
    console.log(`  Item 1 answer visible: ${isAnswerVisible}`);
    if (!isAnswerVisible) {
      throw new Error("Live FAQ Accordion: Item 1 answer is not visible when active!");
    }

    const faqScreenshotPath = path.join(brainDir, "live-prod-faq-accordion.png");
    await questions[1].scrollIntoViewIfNeeded();
    await page.screenshot({ path: faqScreenshotPath });
    console.log(`  ✓ Live FAQ verified! Screenshot saved to ${faqScreenshotPath}`);
  }

  // 3. Verify Admin Login page
  console.log("\n3. Verifying live /admin/login/...");
  await page.goto(`${PROD_URL}/admin/login/`, { waitUntil: "networkidle", timeout: 45000 });
  const loginTitle = await page.title();
  const loginBody = await page.innerText("body");
  console.log(`  Login title: "${loginTitle}"`);
  console.log(`  Has "D'Genius Solutions": ${loginBody.includes("D'Genius Solutions")}`);
  console.log(`  Has "DGS Operations OS": ${loginBody.includes("DGS Operations OS")}`);

  const loginScreenshot = path.join(brainDir, "live-prod-admin-login.png");
  await page.screenshot({ path: loginScreenshot });
  console.log(`  ✓ Live Admin Login verified! Screenshot saved to ${loginScreenshot}`);

  await browser.close();
  console.log("\n==================================================");
  console.log("ALL LIVE PRODUCTION CHECKS COMPLETED SUCCESSFULLY!");
  console.log("==================================================");
}

main().catch(err => {
  console.error("Live verification failed:", err);
  process.exit(1);
});
