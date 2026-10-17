import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log("Navigating to https://www.dgeniussolutions.com/contact-us/...");
  await page.goto("https://www.dgeniussolutions.com/contact-us/", { waitUntil: "networkidle" });
  
  const forms = await page.locator("form").all();
  console.log(`Found ${forms.length} forms on /contact-us/`);
  
  for (let i = 0; i < forms.length; i++) {
    const f = forms[i];
    const id = await f.getAttribute("id");
    const cls = await f.getAttribute("class");
    const disabled = await f.getAttribute("data-submission");
    console.log(`Form ${i}: id="${id}", data-submission="${disabled}", class="${cls}"`);
    const submitBtn = f.locator("button[type='submit']");
    if (await submitBtn.count() > 0) {
      console.log(`  Submit button disabled: ${await submitBtn.first().isDisabled()}, text: "${await submitBtn.first().innerText()}"`);
    }
  }

  await browser.close();
}

main().catch(console.error);
