import { chromium } from "playwright";
import fs from "fs";

const definitionsData = JSON.parse(fs.readFileSync("./data/forms/definitions.approved.json", "utf8"));
const forms = definitionsData.forms;

const routesToTest = [
  { formId: 1, route: "/" },
  { formId: 1, route: "/contact-us/" },
  { formId: 3, route: "/services/seo-services-in-mumbai/" },
  { formId: 3, route: "/services/seo-service-in-banglore/" },
  { formId: 3, route: "/services/seo-service-in-gurugram/" },
  { formId: 3, route: "/services/seo-service-pune/" },
  { formId: 3, route: "/services/seo-services-in-hyderabad/" },
  { formId: 4, route: "/services/social-media-marketing/" },
  { formId: 6, route: "/services/website-development-amc/" },
  { formId: 9, route: "/services/ai-video-production-agency/" },
  { formId: 10, route: "/services/branding/" },
  { formId: 11, route: "/services/content-creation/" },
  { formId: 19, route: "/services/aeo-services-in-mumbai/" },
  { formId: 20, route: "/services/llm-seo-service/" },
  { formId: 21, route: "/services/geo/" },
  { formId: 26, route: "/services/performance-marketing/" }
];

const BASE = "https://www.dgeniussolutions.com";

(async () => {
  const browser = await chromium.launch({ headless: true });
  console.log("=== STEP 7: UI QA FOR ALL 11 FORMS ACROSS 16 ROUTES ===");

  const results = [];

  for (const item of routesToTest) {
    const def = forms.find(f => Number(f.fluentFormId) === item.formId);
    const url = `${BASE}${item.route}`;
    console.log(`\nTesting Form ${item.formId} on ${item.route}...`);

    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto(url, { waitUntil: "networkidle" });

    // 1. Hydration & Console errors
    const hydrationErrors = consoleErrors.filter(e => 
      e.toLowerCase().includes("hydration") || 
      e.toLowerCase().includes("minified react error #418") || 
      e.toLowerCase().includes("minified react error #423")
    );

    // 2. Exactly one intended form
    const formSelector = `form#fluentform_${item.formId}`;
    const formCount = await page.locator(formSelector).count();
    const totalForms = await page.locator("form").count();

    // 3. Check expected visible fields
    const visibleDefFields = def.fields.filter(f => !f.hidden && f.type !== "captcha");
    let missingFieldCount = 0;
    const missingFieldList = [];
    for (const f of visibleDefFields) {
      let count = await page.locator(`${formSelector} [name="${f.name}"]`).count();
      if (count === 0 && !f.name.endsWith("[]")) {
        count = await page.locator(`${formSelector} [name="${f.name}[]"]`).count();
      }
      if (count === 0) {
        missingFieldCount++;
        missingFieldList.push(f.name);
      }
    }

    // 4. Check dropdowns
    const selectFields = def.fields.filter(f => f.type === "select");
    let dropdownMatch = true;
    for (const sel of selectFields) {
      const selectLoc = page.locator(`${formSelector} select[name="${sel.name}"]`);
      if (await selectLoc.count() > 0) {
        const pageOptions = await selectLoc.evaluate(el => 
          Array.from(el.querySelectorAll("option")).map(o => o.value).filter(Boolean)
        );
        const expectedOptions = sel.options.map(o => o.value);
        if (item.route === "/" && sel.name === "dropdown") {
          const homepageExpected = ["SEO", "AEO", "GEO", "AI Video Production", "Website Development"];
          if (JSON.stringify(pageOptions) !== JSON.stringify(homepageExpected)) {
            dropdownMatch = false;
          }
        } else if (JSON.stringify(pageOptions) !== JSON.stringify(expectedOptions)) {
          dropdownMatch = false;
        }
      } else {
        dropdownMatch = false;
      }
    }

    // 5. Hidden field
    const hiddenDef = def.fields.find(f => f.hidden || f.name === "hidden");
    let hiddenMatch = true;
    if (hiddenDef) {
      const hiddenLoc = page.locator(`${formSelector} input[name="${hiddenDef.name}"]`);
      if (await hiddenLoc.count() > 0) {
        const hiddenVal = (await hiddenLoc.first().getAttribute("value")) || "";
        const expectedVal = hiddenDef.defaultValue || "";
        if (hiddenVal !== expectedVal) {
          hiddenMatch = false;
        }
      }
    }

    // 6. CAPTCHA present
    const captchaCount = await page.locator(`${formSelector} [data-dgs-recaptcha-widget], ${formSelector} .g-recaptcha, ${formSelector} .ff-el-recaptcha, ${formSelector} .cf-turnstile`).count();

    // 7. Mobile layout & overflow
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(400);
    const formVisible = await page.locator(formSelector).isVisible();
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const mobilePass = formVisible && bodyScrollWidth <= 380;

    const rowPass = (
      hydrationErrors.length === 0 &&
      formCount === 1 &&
      missingFieldCount === 0 &&
      dropdownMatch &&
      hiddenMatch &&
      captchaCount > 0 &&
      mobilePass
    );

    results.push({
      formId: item.formId,
      formTitle: def.title,
      route: item.route,
      formCount,
      totalForms,
      missingFields: missingFieldCount,
      missingFieldList,
      dropdownMatch,
      hiddenMatch,
      captchaCount,
      hydrationErrors: hydrationErrors.length,
      mobilePass,
      bodyScrollWidth,
      pass: rowPass
    });

    console.log(`  -> formCount: ${formCount}, missingFields: ${missingFieldCount}, dropdownMatch: ${dropdownMatch}, captcha: ${captchaCount > 0}, mobile: ${mobilePass} (${bodyScrollWidth}px) | STATUS: ${rowPass ? "PASS" : "FAIL"}`);

    await context.close();
  }

  await browser.close();

  console.log("\n=== SUMMARY OF ALL 16 ROUTED PLACEMENTS ===");
  const passed = results.filter(r => r.pass);
  const failed = results.filter(r => !r.pass);
  console.log(`TOTAL PASSED: ${passed.length}/${results.length}`);
  if (failed.length > 0) {
    console.error("FAILED ROUTES:", failed.map(f => `${f.formId} (${f.route}): missing=[${f.missingFieldList.join(",")}], dropdown=${f.dropdownMatch}, hidden=${f.hiddenMatch}, captcha=${f.captchaCount}`));
  }
})();
