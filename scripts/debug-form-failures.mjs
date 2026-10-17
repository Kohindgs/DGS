import { chromium } from "playwright";

async function debugForm(route, formSelector, formId) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let postReq = null;
  let postRes = null;
  page.on("request", (req) => {
    if (req.url().includes("/api/forms/submit")) {
      postReq = JSON.parse(req.postData() || "{}");
    }
  });
  page.on("response", async (res) => {
    if (res.url().includes("/api/forms/submit")) {
      try {
        postRes = await res.json();
      } catch {
        postRes = await res.text();
      }
    }
  });

  console.log(`\n=== Debugging ${route} (Form ${formId}) ===`);
  await page.goto(`https://www.dgeniussolutions.com${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.__DGS_QA_CAPTCHA_TOKEN__ = "dgs_p0_service_qa_verification_2026";
  });

  const form = page.locator(formSelector).first();
  await form.scrollIntoViewIfNeeded();

  // Fill like verify script
  if (formId === 50) {
    await form.locator("input[name='name']").fill("QA_TEST_50 FullName");
    await form.locator("input[name='email']").fill("qa_test_50@dgeniussolutions.com");
    await form.locator("input[name='phone']").fill("+919987922901");
    await form.locator("input[name='company']").fill("QA US Corp");
    await form.locator("input[name='website']").fill("https://www.qauscorp.com");
    await form.locator("select[name='service']").selectOption({ index: 1 });
    await form.locator("textarea[name='message']").fill("Testing Form 50");
  } else {
    // Form 22 / 24 / 26
    await form.locator("input[name='full_name[first_name]']").fill("QA_TEST");
    await form.locator("input[name='full_name[last_name]']").fill("ADS");
    await form.locator("input[name='email']").fill("qa_ads_test@dgeniussolutions.com");
    await form.locator("input[name='phone']").fill("+919987922901");
    await form.locator("input[name='input_text']").fill("QA Ads Corp");
    await form.locator("input[name='company_website']").fill("https://www.qaadscorp.com");
    await form.locator("select[name='role']").selectOption({ index: 1 });
    await form.locator("select[name='budget']").selectOption({ index: 1 });
    await form.locator("select[name='start_timeline']").selectOption({ index: 1 });
    await form.locator("textarea[name='requirement']").fill("Performance ads test");
    await form.locator("input[name='contact_consent']").check({ force: true });
    await form.locator("input[name='business_confirmation[]']").check({ force: true });
  }

  const submitBtn = form.locator("button[type='submit'], button.submit, button.ff-btn-submit").first();
  await submitBtn.click();
  await page.waitForTimeout(4000);

  console.log("Post Request Fields:", postReq?.fields);
  console.log("Post Response:", postRes);

  await browser.close();
}

async function main() {
  await debugForm("/us-landing-page/", "#lead-form form, .lead-form form", 50);
  await debugForm("/seo-services-mumbai-google-ads-landing-page/", "#fluentform_22", 22);
}

main().catch(console.error);
