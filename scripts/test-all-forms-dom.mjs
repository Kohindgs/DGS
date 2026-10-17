import { chromium } from "playwright";

const TEST_ROUTES = [
  { formId: 3, route: "/services/seo-services-in-mumbai/" },
  { formId: 4, route: "/services/social-media-marketing/" },
  { formId: 6, route: "/services/website-development-amc/" },
  { formId: 9, route: "/services/ai-video-production-agency/" },
  { formId: 10, route: "/services/branding/" },
  { formId: 11, route: "/services/content-creation/" },
  { formId: 18, route: "/seo-pricing/" },
  { formId: 19, route: "/services/aeo-services-in-mumbai/" },
  { formId: 20, route: "/services/llm-seo-service/" },
  { formId: 21, route: "/services/geo/" },
  { formId: 22, route: "/seo-services-mumbai-google-ads-landing-page/" },
  { formId: 23, route: "/aeo-services-mumbai-google-ads-landing-page/" },
  { formId: 24, route: "/ai-production-videos-google-ads-landing-page/" },
  { formId: 26, route: "/services/performance-marketing/" },
  { formId: 27, route: "/australia-page/" },
  { formId: 28, route: "/services/website-development-pune-page/" },
  { formId: 50, route: "/us-landing-page/" }
];

async function checkForms() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const item of TEST_ROUTES) {
    const url = `https://www.dgeniussolutions.com${item.route}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const selector = item.formId === 50 ? "#lead-form form, .lead-form form" : `#fluentform_${item.formId}`;
    const formEl = page.locator(selector).first();
    const count = await formEl.count();
    if (count === 0) {
      console.log(`[FAIL] ${item.route}: Form ${selector} NOT found!`);
      continue;
    }

    const fieldNames = await formEl.evaluate((form) => {
      const inputs = form.querySelectorAll("input, select, textarea");
      return Array.from(inputs).map(i => ({ tag: i.tagName, name: i.name, type: i.type, id: i.id })).filter(i => i.name);
    });

    console.log(`[OK] Form ${item.formId} at ${item.route}: Found ${fieldNames.length} named fields`);
  }

  await browser.close();
}

checkForms().catch(console.error);
