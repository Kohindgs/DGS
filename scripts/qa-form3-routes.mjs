import { chromium } from "playwright";

const routes = [
  "/services/seo-services-in-mumbai/",
  "/services/seo-service-in-banglore/",
  "/services/seo-service-in-gurugram/",
  "/services/seo-service-pune/",
  "/services/seo-services-in-hyderabad/"
];

const BASE = "https://www.dgeniussolutions.com";

const expectedServices = [
  "SEO",
  "Advance SEO(GEO,AEO,LLM SEO)"
];

const expectedReferrals = [
  "Google Ads",
  "Google Search",
  "Friend / Colleague",
  "Twitter",
  "Youtube",
  "Instagram",
  "Facebook",
  "LinkedIn",
  "Podcast",
  "Blog / Article",
  "Other"
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  console.log("=== STEP 10: FORM 3 UI & PARITY QA ACROSS 5 PRODUCTION ROUTES ===");

  let allPassed = true;

  for (const route of routes) {
    const url = `${BASE}${route}`;
    console.log(`\n-----------------------------------------`);
    console.log(`Testing Route: ${route}`);

    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const pageErrors = [];
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    await page.goto(url, { waitUntil: "networkidle" });

    // Check console/hydration errors
    const hydrationErrors = consoleErrors.filter(e => e.toLowerCase().includes("hydration") || e.toLowerCase().includes("minified react error #418") || e.toLowerCase().includes("minified react error #423"));
    console.log(`- Hydration errors: ${hydrationErrors.length === 0 ? "NONE (PASS)" : hydrationErrors.join(", ")}`);
    console.log(`- General console errors: ${consoleErrors.length === 0 ? "NONE (PASS)" : consoleErrors.slice(0, 3).join(", ")}`);

    // Check forms count
    const formCount = await page.locator("form#fluentform_3").count();
    const totalForms = await page.locator("form").count();
    console.log(`- Total forms on page: ${totalForms}, fluentform_3 count: ${formCount}`);
    if (formCount !== 1) {
      console.error(`  FAIL: Expected exactly 1 fluentform_3, found ${formCount}`);
      allPassed = false;
    }

    // Check fields presence
    const expectedFields = [
      "names[first_name]",
      "names[last_name]",
      "email",
      "input_text",
      "url",
      "phone",
      "dropdown",
      "dropdown_1"
    ];

    let missingFields = 0;
    for (const name of expectedFields) {
      const exists = await page.locator(`form#fluentform_3 [name="${name}"]`).count();
      if (exists === 0) {
        console.error(`  FAIL: Field ${name} missing`);
        missingFields++;
        allPassed = false;
      }
    }
    console.log(`- Expected fields present: ${missingFields === 0 ? "ALL 8 PRESENT (PASS)" : `MISSING ${missingFields}`}`);

    // Check Service dropdown options
    const serviceOptions = await page.locator(`form#fluentform_3 select[name="dropdown"] option`).evaluateAll(opts => 
      opts.map(o => o.value).filter(Boolean)
    );
    const serviceMatch = JSON.stringify(serviceOptions) === JSON.stringify(expectedServices);
    console.log(`- Service dropdown options: ${serviceMatch ? "EXACT MATCH (PASS)" : `MISMATCH: ${JSON.stringify(serviceOptions)}`}`);
    if (!serviceMatch) allPassed = false;

    // Check Referral dropdown options
    const referralOptions = await page.locator(`form#fluentform_3 select[name="dropdown_1"] option`).evaluateAll(opts => 
      opts.map(o => o.value).filter(Boolean)
    );
    const referralMatch = JSON.stringify(referralOptions) === JSON.stringify(expectedReferrals);
    console.log(`- Referral dropdown options: ${referralMatch ? "EXACT MATCH (PASS)" : `MISMATCH: ${JSON.stringify(referralOptions)}`}`);
    if (!referralMatch) allPassed = false;

    // Check reCAPTCHA container
    const recaptchaBox = await page.locator(`form#fluentform_3 [data-dgs-recaptcha-widget], form#fluentform_3 .g-recaptcha, form#fluentform_3 .ff-el-recaptcha`).count();
    console.log(`- reCAPTCHA widget container: ${recaptchaBox > 0 ? "PRESENT (PASS)" : "MISSING"}`);
    if (recaptchaBox === 0) allPassed = false;

    // Check Mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    const isMobileVisible = await page.locator(`form#fluentform_3`).isVisible();
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    console.log(`- Mobile (375px) check: form visible=${isMobileVisible}, body scrollWidth=${bodyScrollWidth}px (<=380px: ${bodyScrollWidth <= 380 ? "PASS" : "OVERFLOW"})`);

    await context.close();
  }

  await browser.close();

  console.log(`\n=========================================`);
  console.log(`STEP 10 QA OVERALL: ${allPassed ? "PASS" : "FAIL"}`);
  console.log(`=========================================`);
})();
