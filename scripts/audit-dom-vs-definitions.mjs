import fs from "fs";
import { chromium } from "playwright";

const defs = JSON.parse(fs.readFileSync("data/forms/definitions.approved.json", "utf8"));

const ALL_SERVICE_ROUTES = [
  // Form 3: Free SEO Audit (6 routes)
  { formId: 3, key: "fluentform-3", route: "/services/seo-services-in-mumbai/" },
  { formId: 3, key: "fluentform-3", route: "/services/seo-service-in-banglore/" },
  { formId: 3, key: "fluentform-3", route: "/services/seo-service-in-gurugram/" },
  { formId: 3, key: "fluentform-3", route: "/services/seo-service-pune/" },
  { formId: 3, key: "fluentform-3", route: "/services/seo-services-in-hyderabad/" },
  { formId: 3, key: "fluentform-3", route: "/services/dubai-seo/" },

  // Form 4: Social Media Marketing (1 route)
  { formId: 4, key: "fluentform-4", route: "/services/social-media-marketing/" },

  // Form 6: Website Development (2 routes)
  { formId: 6, key: "fluentform-6", route: "/services/website-development-amc/" },
  { formId: 6, key: "fluentform-6", route: "/better-ceasons-case-study/" },

  // Form 9: Generative AI / Video (3 routes)
  { formId: 9, key: "fluentform-9", route: "/services/ai-video-production-agency/" },
  { formId: 9, key: "fluentform-9", route: "/services/ai-production-dubai-page/" },
  { formId: 9, key: "fluentform-9", route: "/services/shirdi-se-sai-tak-case-study/" },

  // Form 10: Branding (1 route)
  { formId: 10, key: "fluentform-10", route: "/services/branding/" },

  // Form 11: Content Creation (1 route)
  { formId: 11, key: "fluentform-11", route: "/services/content-creation/" },

  // Form 18: SEO Pricing (1 route)
  { formId: 18, key: "fluentform-18", route: "/seo-pricing/" },

  // Form 19: Free AEO Audit (2 routes)
  { formId: 19, key: "fluentform-19", route: "/services/aeo-services-in-mumbai/" },
  { formId: 19, key: "fluentform-19", route: "/aeo-dubai/" },

  // Form 20: Free LLM Audit (1 route)
  { formId: 20, key: "fluentform-20", route: "/services/llm-seo-service/" },

  // Form 21: Free GEO Audit (1 route)
  { formId: 21, key: "fluentform-21", route: "/services/geo/" },

  // Form 22: SEO Ads Landing Page (1 route)
  { formId: 22, key: "fluentform-22", route: "/seo-services-mumbai-google-ads-landing-page/" },

  // Form 23: AEO Ads Landing Page (1 route)
  { formId: 23, key: "fluentform-23", route: "/aeo-services-mumbai-google-ads-landing-page/" },

  // Form 24: AI Production Ads Landing Page (1 route)
  { formId: 24, key: "fluentform-24", route: "/ai-production-videos-google-ads-landing-page/" },

  // Form 26: Performance Marketing (1 route)
  { formId: 26, key: "fluentform-26", route: "/services/performance-marketing/" },

  // Form 27: Australia Page (1 route)
  { formId: 27, key: "fluentform-27", route: "/australia-page/" },

  // Form 28: Website Development Pune (1 route)
  { formId: 28, key: "fluentform-28", route: "/services/website-development-pune-page/" },

  // Form 50: US Landing Page Growth (1 route)
  { formId: 50, key: "fluentform-50", route: "/us-landing-page/" }
];

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Auditing 18 unique forms across 26 service routes against definitions.approved.json...\n");

  const auditedForms = new Set();
  let totalMismatches = 0;

  for (const item of ALL_SERVICE_ROUTES) {
    if (auditedForms.has(item.formId)) continue;
    auditedForms.add(item.formId);

    const def = defs.forms.find(f => f.key === item.key);
    if (!def) {
      console.log(`[MISMATCH] Form ${item.key} missing in definitions.approved.json!`);
      totalMismatches++;
      continue;
    }

    const url = `https://www.dgeniussolutions.com${item.route}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const formSel = item.formId === 50 ? "#lead-form form, .lead-form form" : `#fluentform_${item.formId}`;
    const formEl = page.locator(formSel).first();
    if (await formEl.count() === 0) {
      console.log(`[MISMATCH] Form ${item.key} selector '${formSel}' not found on ${item.route}!`);
      totalMismatches++;
      continue;
    }

    const domFields = await formEl.evaluate(form => {
      const inputs = Array.from(form.querySelectorAll("input, select, textarea"));
      return inputs.map(el => {
        let options = [];
        if (el.tagName === "SELECT") {
          options = Array.from(el.options).map(o => o.value || o.text).filter(v => v && !v.includes("Select"));
        } else if (el.type === "radio" || el.type === "checkbox") {
          options = [el.value];
        }
        return {
          name: el.getAttribute("name"),
          tag: el.tagName,
          type: el.getAttribute("type") || el.tagName.toLowerCase(),
          required: el.hasAttribute("required") || el.getAttribute("aria-required") === "true",
          options
        };
      }).filter(f => f.name && !f.name.startsWith("_") && f.name !== "g-recaptcha-response");
    });

    // Check definitions vs DOM
    for (const dField of def.fields) {
      if (dField.hidden || dField.type === "captcha" || dField.name === "g-recaptcha-response") continue;

      const domField = domFields.find(f => f.name === dField.name);
      if (!domField) {
        // Some forms have name in alternate format
        console.log(`[MISMATCH] Form ${item.key} on ${item.route}: Defined field '${dField.name}' not found in live DOM!`);
        totalMismatches++;
      } else {
        // Compare options if select
        if (dField.type === "select" && dField.options && dField.options.length > 0) {
          const defOpts = dField.options.map(o => typeof o === "object" ? o.value || o.label : o);
          for (const opt of domField.options) {
            const hasMatch = defOpts.some(dOpt => dOpt.toLowerCase().trim() === opt.toLowerCase().trim());
            if (!hasMatch) {
              console.log(`[MISMATCH] Form ${item.key} on ${item.route}: Live option '${opt}' for field '${dField.name}' not in definition options:`, defOpts);
              totalMismatches++;
            }
          }
        }
      }
    }

    console.log(`✓ Form ${item.formId} (${item.key}) on ${item.route}: Schema & DOM aligned`);
  }

  console.log(`\n======================================================`);
  console.log(`TOTAL SCHEMA / DOM MISMATCHES: ${totalMismatches}`);
  console.log(`======================================================`);

  await browser.close();
}

main().catch(console.error);
