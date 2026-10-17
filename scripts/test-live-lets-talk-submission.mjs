import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleMessages = [];
  const networkEvents = [];
  
  page.on("console", (msg) => consoleMessages.push(`${msg.type()}: ${msg.text()}`));
  page.on("pageerror", (err) => consoleMessages.push(`PAGE_ERROR: ${err.message}`));
  page.on("request", (req) => {
    networkEvents.push({ type: "REQ", method: req.method(), url: req.url(), postData: req.postData() });
  });
  page.on("response", async (res) => {
    if (res.url().includes("/api/") || res.request().method() === "POST") {
      let body = "";
      try { body = await res.text(); } catch {}
      networkEvents.push({ type: "RES", status: res.status(), url: res.url(), body: body.slice(0, 500) });
    }
  });

  console.log("Navigating to https://www.dgeniussolutions.com...");
  await page.goto("https://www.dgeniussolutions.com", { waitUntil: "networkidle" });

  // Click Let's Talk CTA
  const trigger = page.locator("#dgsPill, .dgs-talk-trigger, button:has-text('LET\\'S TALK'), a:has-text('LET\\'S TALK')").first();
  console.log("Clicking Let's Talk trigger...");
  await trigger.click();
  await page.waitForTimeout(1000);

  // Inspect form fields inside #lets-talk-form
  const form = page.locator("#lets-talk-form");
  const isFormVis = await form.isVisible();
  console.log("Is #lets-talk-form visible?", isFormVis);

  const inputs = await form.locator("input, textarea, select, button").all();
  console.log(`Found ${inputs.length} elements inside #lets-talk-form:`);
  for (const input of inputs) {
    const tag = await input.evaluate((e) => e.tagName);
    const type = await input.getAttribute("type");
    const name = await input.getAttribute("name");
    const id = await input.getAttribute("id");
    const placeholder = await input.getAttribute("placeholder");
    const req = await input.getAttribute("required");
    const disabled = await input.getAttribute("disabled");
    const isVis = await input.isVisible();
    console.log(`- Tag: ${tag}, Type: ${type}, Name: ${name}, Id: ${id}, Req: ${req !== null}, Disabled: ${disabled !== null}, Visible: ${isVis}, Placeholder: "${placeholder}"`);
  }

  // Attempt to fill form
  console.log("\nFilling form fields with QA test data...");
  const nameInput = form.locator("input[name='fullName'], input[name='name'], input[placeholder*='Name' i]").first();
  if (await nameInput.isVisible()) {
    await nameInput.fill("QA_TEST_LETS_TALK");
    console.log("Filled Name");
  }

  const emailInput = form.locator("input[name='email'], input[type='email'], input[placeholder*='Email' i]").first();
  if (await emailInput.isVisible()) {
    await emailInput.fill("qa_test_letstalk@dgeniussolutions.com");
    console.log("Filled Email");
  }

  const phoneInput = form.locator("input[name='phone'], input[type='tel'], input[placeholder*='Phone' i]").first();
  if (await phoneInput.isVisible()) {
    await phoneInput.fill("+919876543210");
    console.log("Filled Phone");
  }

  const companyInput = form.locator("input[name='company'], input[placeholder*='Company' i]").first();
  if (await companyInput.isVisible()) {
    await companyInput.fill("QA Test Agency");
    console.log("Filled Company");
  }

  const messageInput = form.locator("textarea[name='message'], textarea, textarea[placeholder*='Message' i], textarea[placeholder*='Tell us' i]").first();
  if (await messageInput.isVisible()) {
    await messageInput.fill("QA Test verification of Let's Talk form functionality.");
    console.log("Filled Message");
  }

  // Service selector / pills if present
  const servicePill = form.locator("button, label, span").filter({ hasText: /SEO|Development|Marketing/i }).first();
  if (await servicePill.isVisible()) {
    try {
      await servicePill.click();
      console.log("Clicked service pill");
    } catch {}
  }

  // Find Submit button
  const submitBtn = form.locator("button[type='submit'], button:has-text('Send'), button:has-text('Submit'), button:has-text('Talk')").first();
  console.log("Submit button text:", await submitBtn.innerText());
  console.log("Submit button disabled:", await submitBtn.isDisabled());

  console.log("Clicking submit...");
  await submitBtn.click();
  await page.waitForTimeout(3000);

  console.log("\n--- Network Events ---");
  console.log(JSON.stringify(networkEvents, null, 2));

  console.log("\n--- Console Messages ---");
  console.log(consoleMessages);

  // Check form state after submit
  const formHtmlAfter = await form.innerHTML();
  console.log("\nForm text after submit:", (await form.innerText()).slice(0, 300));

  await browser.close();
}

main().catch(console.error);
