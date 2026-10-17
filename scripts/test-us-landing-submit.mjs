import { chromium } from "playwright";

async function main() {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();

  let postReq = null;
  let postRes = null;
  p.on("request", (req) => {
    if (req.url().includes("/api/forms/submit")) {
      postReq = { url: req.url(), method: req.method(), data: req.postData() };
      console.log("[Network POST Request]:", postReq);
    }
  });
  p.on("response", async (res) => {
    if (res.url().includes("/api/forms/submit")) {
      const text = await res.text();
      postRes = { status: res.status(), body: text };
      console.log(`[Network Response] ${res.status()}:`, text);
    }
  });

  console.log("Navigating to https://www.dgeniussolutions.com/us-landing-page/?utm_source=qa&utm_medium=service_form_test&utm_campaign=p0_form_validation");
  await p.goto("https://www.dgeniussolutions.com/us-landing-page/?utm_source=qa&utm_medium=service_form_test&utm_campaign=p0_form_validation");
  await p.waitForTimeout(1000);

  const form = p.locator("#fluentform_50, #lead-form form").first();
  await form.locator("input[name='name']").fill("QA_SERVICE_F50_US");
  await form.locator("input[name='company']").fill("QA US Growth Corp");
  await form.locator("input[name='email']").fill("qa_test_us@dgeniussolutions.com");
  await form.locator("input[name='phone']").fill("+1 555 123 4567");
  await form.locator("input[name='website']").fill("https://www.qausgrowth.com");
  
  const select = form.locator("select[name='service']");
  if (await select.count() > 0) {
    await select.selectOption({ index: 1 });
  }
  await form.locator("textarea[name='message']").fill("Automated live test of Form 50 US Landing Page");

  console.log("Submitting form...");
  const btn = form.locator("button[type='submit'], button.submit").first();
  await btn.click();

  await p.waitForTimeout(4000);

  const feedback = await form.locator("[data-form-feedback-host]").innerText().catch(() => "no feedback");
  console.log("Feedback after submit:", feedback);
  console.log("Network status:", postRes);

  await b.close();
}

main().catch(console.error);
