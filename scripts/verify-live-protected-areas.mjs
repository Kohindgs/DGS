import { chromium } from "playwright";

async function verifyProtected() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Navigating to https://www.dgeniussolutions.com/services/website-development-amc/ ...");
  await page.goto("https://www.dgeniussolutions.com/services/website-development-amc/", { waitUntil: "networkidle" });

  const rows = await page.locator("#dgs-webdev-page .work-project-row").all();
  console.log(`Found ${rows.length} work project rows`);

  for (let i = 0; i < rows.length; i++) {
    const title = await rows[i].locator("h3, h4, .w-info, a").first().textContent();
    const imgSrc = await rows[i].locator(".live-preview-image").getAttribute("src");
    console.log(`Row ${i + 1}: ${title?.trim()} -> ${imgSrc}`);
  }

  // FAQ check
  const faqs = await page.locator("#dgs-webdev-page .dgs-faq-item, .faq-accordion .faq-item, [class*='faq']").count();
  console.log(`FAQ elements count: ${faqs}`);

  // Form 6 check
  const form6 = await page.locator("form[data-form-id='6'], form#fluentform_6, form.fluent_form_6, input[name='form_id'][value='6']").count();
  console.log(`Form 6 instances found: ${form6}`);

  // Check AI Production Dubai page
  console.log("Checking AI production Dubai page...");
  await page.goto("https://www.dgeniussolutions.com/services/ai-production-dubai-page/", { waitUntil: "networkidle" });
  const videoCards = await page.locator(".portfolio-item, .video-card, [data-video], .portfolio-grid-item, video").count();
  console.log(`AI Production items found: ${videoCards}`);

  await browser.close();
}

verifyProtected().catch(console.error);
