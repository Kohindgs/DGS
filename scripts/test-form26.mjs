import { chromium } from "playwright";

async function main() {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();

  let postReq = null;
  let postRes = null;
  p.on("request", (req) => {
    if (req.url().includes("/api/forms/submit")) {
      postReq = JSON.parse(req.postData() || "{}");
    }
  });
  p.on("response", async (res) => {
    if (res.url().includes("/api/forms/submit")) {
      try {
        postRes = await res.json();
      } catch {
        postRes = await res.text();
      }
    }
  });

  console.log("Navigating to https://www.dgeniussolutions.com/services/performance-marketing/");
  await p.goto("https://www.dgeniussolutions.com/services/performance-marketing/", { waitUntil: "networkidle" });
  await p.evaluate(() => {
    window.__DGS_QA_CAPTCHA_TOKEN__ = "dgs_p0_service_qa_verification_2026";
  });

  const form = p.locator("#fluentform_26").first();
  await form.scrollIntoViewIfNeeded();

  await form.locator("input[name='full_name[first_name]']").fill("QA_PERF");
  await form.locator("input[name='full_name[last_name]']").fill("MARKETING");
  await form.locator("input[name='email']").fill("qa_perf@dgeniussolutions.com");
  await form.locator("input[name='phone']").fill("+919987922901");
  await form.locator("input[name='input_text']").fill("QA Perf Corp");
  await form.locator("input[name='company_website']").fill("https://www.qaperfcorp.com");
  await form.locator("select[name='role']").selectOption({ index: 1 });
  await form.locator("select[name='budget']").selectOption({ index: 1 });
  await form.locator("select[name='start_timeline']").selectOption({ index: 1 });
  await form.locator("textarea[name='requirement']").fill("Performance marketing test");
  
  await form.locator("input[name='contact_consent']").evaluate(el => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
  await form.locator("input[name='business_confirmation[]']").evaluate(el => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });

  const btn = form.locator("button[type='submit'], button.ff-btn-submit").first();
  console.log("Clicking submit...");
  await btn.click();
  await p.waitForTimeout(6000);

  console.log("Post Request Fields:", postReq?.fields);
  console.log("Post Response:", postRes);
  const feedback = await form.locator("[data-form-feedback-host]").innerText().catch(() => "none");
  console.log("Feedback:", feedback);

  await b.close();
}

main().catch(console.error);
