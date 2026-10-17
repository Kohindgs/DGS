import { chromium } from "playwright";

async function main() {
  const b = await chromium.launch();
  const p = await b.newPage();
  let postData = null;
  let resp = null;
  p.on("request", r => { if (r.url().includes("/api/forms/submit")) postData = r.postData(); });
  p.on("response", async r => { if (r.url().includes("/api/forms/submit")) resp = await r.text(); });

  await p.goto("https://www.dgeniussolutions.com/us-landing-page/");
  const form = p.locator("#lead-form form, .lead-form form").first();
  await form.locator("input[name='name']").fill("QA_SERVICE_F50_US QA_TESTER");
  await form.locator("input[name='email']").fill("qa_test_50_25@dgeniussolutions.com");
  await form.locator("input[name='phone']").fill("+919987922901");
  await form.locator("input[name='company']").fill("QA_SERVICE_F50_US Corp");
  await form.locator("input[name='website']").fill("https://www.qaservicecorp.com");
  await form.locator("textarea[name='message']").fill("Test message");

  // Select service
  const el = form.locator("select[name='service']").first();
  const opts = await el.locator("option").all();
  for (const opt of opts) {
    const txt = await opt.innerText();
    const val = await opt.getAttribute("value");
    console.log(`Option: txt="${txt}", val="${val}"`);
  }
  const val = await el.selectOption({ index: 1 });
  console.log("Selected val:", val);

  await form.locator("button[type='submit'], button.submit").first().click();
  await p.waitForTimeout(3000);
  console.log("Post data:", postData);
  console.log("Response:", resp);
  await b.close();
}

main().catch(console.error);
