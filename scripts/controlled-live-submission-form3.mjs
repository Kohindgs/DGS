import { chromium } from "playwright";

console.log("=== STEP 8: LAUNCHING BROWSER FOR CONTROLLED LIVE SUBMISSION ===");

const browser = await chromium.launch({
  headless: false,
  args: ["--start-maximized"]
});

const context = await browser.newContext({
  viewport: null
});

const page = await context.newPage();

// Intercept network response for /api/forms/submit/
let submitResponseData = null;
page.on("response", async (response) => {
  if (response.url().includes("/api/forms/submit")) {
    try {
      submitResponseData = {
        status: response.status(),
        body: await response.json()
      };
      console.log("Captured /api/forms/submit response:", JSON.stringify(submitResponseData));
    } catch (e) {
      console.log("Could not parse /api/forms/submit response as JSON", e);
    }
  }
});

await page.goto("https://www.dgeniussolutions.com/services/seo-services-in-mumbai/", {
  waitUntil: "networkidle"
});

const form = page.locator("form[data-migration-form]");
await form.scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);

// Fill in dummy DGS QA information
console.log("Filling form fields...");
await page.locator("input[name='names[first_name]']").fill("DGS QA");
await page.locator("input[name='names[last_name]']").fill("Test Lead");
await page.locator("input[name='email']").fill("test.qa.form3@dgeniussolutions.com");
await page.locator("input[name='input_text']").fill("DGS QA Testing Ltd");
await page.locator("input[name='url']").fill("https://www.dgeniussolutions.com");
await page.locator("input[name='phone']").fill("+919999999999");
await page.locator("select[name='dropdown']").selectOption("SEO");
await page.locator("select[name='dropdown_1']").selectOption("Google Search");

console.log("Form filled. Waiting for reCAPTCHA resolution...");
console.log("Please tick the reCAPTCHA checkbox in the open browser window if not automatically ticked.");

// Try clicking anchor if available
const anchorFrame = page.frames().find(f => f.url().includes("recaptcha/api2/anchor"));
if (anchorFrame) {
  try {
    await anchorFrame.locator("#recaptcha-anchor").click({ timeout: 3000 });
  } catch {}
}

// Wait for token to become available in grecaptcha (wait up to 120 seconds for human solve if challenge appears)
const startTime = Date.now();
let token = "";
while (Date.now() - startTime < 120000) {
  token = await page.evaluate(() => {
    return window.grecaptcha?.getResponse() || "";
  });
  if (token && token.length > 0) {
    console.log("reCAPTCHA resolved! Token length:", token.length);
    break;
  }
  await page.waitForTimeout(1000);
}

if (!token) {
  console.error("reCAPTCHA timed out without resolution.");
  await browser.close();
  process.exit(1);
}

// Click Submit button on the form
console.log("Clicking Submit Form button...");
const submitBtn = form.locator("button[type='submit']");
await submitBtn.click();

// Wait for network response
await page.waitForTimeout(5000);

console.log("Submission completed. Result:", submitResponseData);

await browser.close();
