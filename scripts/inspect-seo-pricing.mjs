import { chromium } from "playwright";

async function main() {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto("https://www.dgeniussolutions.com/seo-pricing/");
  
  // 1. Click real user-facing CTA
  const ctaBtn = p.locator("button.b1, button:has-text('Get Started'), [onclick*='openForm']").first();
  console.log("Clicking user-facing CTA...");
  await ctaBtn.click();
  await p.waitForTimeout(600);

  const modal = p.locator("#m-fm");
  console.log("Modal visible after CTA click:", await modal.isVisible());

  const form = p.locator("#fluentform_18");
  console.log("Form 18 visible:", await form.isVisible());

  // 2. Blank submit validation check
  const submitBtn = form.locator("button[type='submit'], button.ff-btn-submit").first();
  await submitBtn.click();
  await p.waitForTimeout(600);
  const errorsCount = await form.locator(".dgs-inline-error, .ff-el-is-error").count();
  const feedback = await form.locator("[data-form-feedback-host]").innerText().catch(() => "");
  console.log(`Blank submit validation: errors=${errorsCount}, feedback="${feedback}"`);

  // 3. Inject QA token for CAPTCHA bypass
  await p.evaluate(() => {
    window.__DGS_QA_CAPTCHA_TOKEN__ = "dgs_p0_service_qa_verification_2026";
  });

  // 4. Fill Form 18 fields
  await form.locator("input[name='names[first_name]']").fill("QA_SERVICE_F18");
  await form.locator("input[name='names[last_name]']").fill("QA_TESTER");
  await form.locator("input[name='email']").fill("qa_test_18@dgeniussolutions.com");
  await form.locator("input[name='phone']").fill("+919987922901");
  await form.locator("input[name='input_text']").fill("QA Pricing Corp");
  await form.locator("input[name='url']").fill("https://www.qapricingcorp.com");
  
  // Dropdowns
  await form.locator("select[name='dropdown_2']").selectOption("Monthly");
  await form.locator("select[name='dropdown']").selectOption("Starter - INR 25000");
  await form.locator("select[name='dropdown_1']").selectOption("Google Search");

  // Checkbox
  const cb = form.locator("input[name='checkbox[]']").first();
  if (await cb.count() > 0) {
    await cb.evaluate(el => {
      el.checked = true;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  let networkResp = null;
  p.on("response", async (res) => {
    if (res.url().includes("/api/forms/submit")) {
      try {
        networkResp = { status: res.status(), body: await res.json() };
      } catch (e) {
        networkResp = { status: res.status(), text: await res.text() };
      }
    }
  });

  console.log("Submitting Form 18...");
  await submitBtn.click();

  for (let i = 0; i < 15; i++) {
    await p.waitForTimeout(1000);
    if (networkResp) break;
  }

  console.log("Form 18 Network Response:", JSON.stringify(networkResp, null, 2));

  await b.close();
}

main().catch(console.error);
