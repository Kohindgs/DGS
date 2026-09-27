import { chromium } from "playwright";

console.log("=== TESTING LIVE PRODUCTION FORM 9 VIA PLAYWRIGHT ===");

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 800 }
});

const page = await context.newPage();

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

await page.goto("https://www.dgeniussolutions.com/services/ai-video-production-agency/", {
  waitUntil: "networkidle"
});

const form = page.locator("form#fluentform_9, form[data-migration-form]");
await form.scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);

console.log("Filling Form 9 fields...");
await page.locator("form input[name='names[first_name]']").fill("DGS Forms QA");
await page.locator("form input[name='names[last_name]']").fill("Form9 Lead");
await page.locator("form input[name='email']").fill("business@dgeniussolutions.com");
await page.locator("form input[name='input_text']").fill("DGS Video Production Agency");
await page.locator("form input[name='input_text_1']").fill("+919987922901");
await page.locator("form select[name='dropdown']").selectOption("Generative Images");
await page.locator("form select[name='dropdown_1']").selectOption("Google Search");

const desc = page.locator("form textarea[name='description']");
if (await desc.count() > 0) {
  await desc.fill("Native forms production verification for Form 9");
}

console.log("Form filled. Checking for reCAPTCHA...");
const anchorFrame = page.frames().find(f => f.url().includes("recaptcha/api2/anchor"));
if (anchorFrame) {
  console.log("reCAPTCHA anchor frame found. Clicking anchor...");
  try {
    await anchorFrame.locator("#recaptcha-anchor").click({ timeout: 5000 });
  } catch (err) {
    console.log("Anchor click error:", err.message);
  }
}

// Wait up to 10 seconds for token
const startTime = Date.now();
let token = "";
while (Date.now() - startTime < 10000) {
  token = await page.evaluate(() => {
    return window.grecaptcha?.getResponse() || "";
  });
  if (token && token.length > 0) {
    console.log("reCAPTCHA resolved automatically! Token length:", token.length);
    break;
  }
  await page.waitForTimeout(1000);
}

if (token) {
  console.log("Submitting form with solved reCAPTCHA...");
  const submitBtn = form.locator("button.ff-btn-submit, button[type='submit']");
  await submitBtn.click();
  await page.waitForTimeout(5000);
  console.log("Submission result:", submitResponseData);
} else {
  console.log("reCAPTCHA required challenge (headless) - token not auto-resolved.");
}

await browser.close();
