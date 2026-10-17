import { chromium } from "playwright";

async function testSubmit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on("console", (msg) => console.log(`[Browser Console ${msg.type()}]:`, msg.text()));
  page.on("request", (req) => {
    if (req.url().includes("/api/forms/submit")) {
      console.log(`[Network Request] ${req.method()} ${req.url()}`);
      console.log("PostData:", req.postData());
    }
  });
  let networkResponse = null;
  page.on("response", async (res) => {
    if (res.url().includes("/api/forms/submit")) {
      const body = await res.text();
      networkResponse = { status: res.status(), body };
      console.log(`[Network Response] ${res.status()}:`, body);
    }
  });

  const url = "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/?utm_source=qa&utm_medium=service_form_test&utm_campaign=p0_form_validation";
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "networkidle" });

  // Inject QA test token for Playwright automated verification
  await page.evaluate(() => {
    window.__DGS_QA_CAPTCHA_TOKEN__ = "dgs_p0_service_qa_verification_2026";
  });

  const form = page.locator("#fluentform_3");
  await form.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // Fill all required fields
  await form.locator("input[name='names[first_name]']").fill("QA_SERVICE_F3_MUMBAI");
  await form.locator("input[name='names[last_name]']").fill("Tester");
  await form.locator("input[name='email']").fill("qa_test_mumbai@dgeniussolutions.com");
  await form.locator("input[name='input_text']").fill("QA Mumbai SEO Corp");
  await form.locator("input[name='url']").fill("https://www.qamumbaiseo.com");
  await form.locator("input[name='phone']").fill("+919987922901");
  
  // Select dropdowns
  const serviceDropdown = form.locator("select[name='dropdown']");
  if (await serviceDropdown.count() > 0) {
    const opts = await serviceDropdown.locator("option").all();
    if (opts.length > 1) {
      const val = await opts[1].getAttribute("value");
      if (val) await serviceDropdown.selectOption(val);
    }
  }

  const heardDropdown = form.locator("select[name='dropdown_1']");
  if (await heardDropdown.count() > 0) {
    const opts = await heardDropdown.locator("option").all();
    if (opts.length > 1) {
      const val = await opts[1].getAttribute("value");
      if (val) await heardDropdown.selectOption(val);
    }
  }

  console.log("Fields filled. Submitting form...");
  const submitBtn = form.locator("button.ff-btn-submit, button[type='submit']").first();
  await submitBtn.click();

  // Wait 6 seconds for network and UI feedback
  await page.waitForTimeout(6000);

  const feedback = form.locator("[data-form-feedback-host]");
  console.log(`Feedback after submit: "${await feedback.innerText()}"`);
  console.log(`Form status: "${await form.getAttribute("data-form-status")}"`);
  console.log("Network response:", networkResponse);

  await browser.close();
}

testSubmit().catch(console.error);
