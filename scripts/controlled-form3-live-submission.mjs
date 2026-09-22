import { chromium } from "playwright";
import fs from "fs";
import mysql from "mysql2/promise";

const SITE_URL = "https://www.dgeniussolutions.com";
const TARGET_ROUTE = "/services/seo-services-in-mumbai/";
const FULL_URL = `${SITE_URL}${TARGET_ROUTE}`;

// Load production environment config from shared or local
let dbConfig = null;
try {
  // Check if we can read DB config via SSH or local
  const sshCmd = "cat /home/u188101251/production-app/shared/.env.production";
} catch {}

console.log("=== STEP 8: CONTROLLED LIVE SUBMISSION FOR FORM 3 (MUMBAI SEO) ===");

let browser;
try {
  browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    args: ["--start-maximized"]
  });
} catch {
  browser = await chromium.launch({
    headless: false,
    args: ["--start-maximized"]
  });
}

const context = await browser.newContext({ viewport: null });
const page = await context.newPage();

let submitResponse = null;
page.on("response", async (response) => {
  if (response.url().includes("/api/forms/submit")) {
    try {
      submitResponse = {
        status: response.status(),
        data: await response.json()
      };
      console.log("\n>>> Intercepted /api/forms/submit response:", JSON.stringify(submitResponse, null, 2));
    } catch (e) {
      console.log("Response not JSON", e);
    }
  }
});

console.log(`Navigating to ${FULL_URL}...`);
await page.goto(FULL_URL, { waitUntil: "networkidle" });

const form = page.locator("form[data-migration-form]");
await form.scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);

const testMarker = `test.qa.form3.${Date.now()}@dgeniussolutions.com`;
console.log(`Filling form fields with test email: ${testMarker}`);

await page.locator("input[name='names[first_name]']").fill("DGS QA");
await page.locator("input[name='names[last_name]']").fill("Form3 Pilot Lead");
await page.locator("input[name='email']").fill(testMarker);
await page.locator("input[name='input_text']").fill("DGS QA Mumbai Ltd");
await page.locator("input[name='url']").fill("https://www.dgeniussolutions.com");
await page.locator("input[name='phone']").fill("+919999999999");
await page.locator("select[name='dropdown']").selectOption("SEO");
await page.locator("select[name='dropdown_1']").selectOption("Google Search");

console.log("\n=======================================================");
console.log("ACTION REQUIRED: Please check the opened Chrome window!");
console.log("Click the 'I\\'m not a robot' reCAPTCHA checkbox.");
console.log("The script will automatically detect the token and submit.");
console.log("=======================================================\n");

// Try to click checkbox automatically if feasible
const anchorFrame = page.frames().find(f => f.url().includes("recaptcha/api2/anchor"));
if (anchorFrame) {
  try {
    await anchorFrame.locator("#recaptcha-anchor").click({ timeout: 2000 });
  } catch {}
}

const startTime = Date.now();
let token = "";
while (Date.now() - startTime < 300000) { // 5 minutes wait
  token = await page.evaluate(() => window.grecaptcha?.getResponse() || "");
  if (token && token.length > 0) {
    console.log(`\nreCAPTCHA solved! Token length: ${token.length}`);
    break;
  }
  await page.waitForTimeout(1000);
}

if (!token) {
  console.error("reCAPTCHA timed out.");
  await browser.close();
  process.exit(1);
}

console.log("Submitting form via Submit button...");
const submitBtn = form.locator("button[type='submit']");
await submitBtn.click();

// Wait for submit response
for (let i = 0; i < 20; i++) {
  if (submitResponse) break;
  await page.waitForTimeout(500);
}

console.log("\nSubmit response result:", submitResponse);
await page.waitForTimeout(2000);
await browser.close();

// Output the marker so the verification step can verify DB
fs.writeFileSync("C:/Projects/DGS-Phase2-CMS/scripts/last-test-marker.json", JSON.stringify({
  email: testMarker,
  submitResponse
}, null, 2));

console.log("\nBrowser submission completed successfully!");
