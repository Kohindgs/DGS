import { chromium } from "playwright";

async function main() {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  await p.goto("https://www.dgeniussolutions.com/us-landing-page/");
  await p.waitForTimeout(1000);
  const form = p.locator("#fluentform_50, #lead-form form").first();
  const btn = form.locator("button[type='submit'], button.submit").first();
  console.log("Submit button text:", await btn.innerText());
  await btn.click();
  await p.waitForTimeout(1000);
  const feedback = await form.locator("[data-form-feedback-host]").innerText().catch(() => "no feedback");
  const errors = await form.locator(".dgs-inline-error").allInnerTexts().catch(() => []);
  console.log("Feedback:", feedback);
  console.log("Errors:", errors);
  await b.close();
}

main().catch(console.error);
