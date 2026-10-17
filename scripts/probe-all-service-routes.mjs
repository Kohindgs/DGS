import fs from "fs";

const definitions = JSON.parse(fs.readFileSync("data/forms/definitions.approved.json", "utf8"));
const formsByKey = new Map(definitions.forms.map(f => [f.key, f]));

const ROUTES_TO_TEST = [
  { formId: 3, key: "fluentform-3", route: "/services/seo-services-in-mumbai/" },
  { formId: 3, key: "fluentform-3", route: "/services/seo-service-in-banglore/" },
  { formId: 3, key: "fluentform-3", route: "/services/seo-service-in-gurugram/" },
  { formId: 3, key: "fluentform-3", route: "/services/seo-service-pune/" },
  { formId: 3, key: "fluentform-3", route: "/services/seo-services-in-hyderabad/" },
  { formId: 3, key: "fluentform-3", route: "/services/dubai-seo/" },
  { formId: 4, key: "fluentform-4", route: "/services/social-media-marketing/" },
  { formId: 6, key: "fluentform-6", route: "/services/website-development-amc/" },
  { formId: 6, key: "fluentform-6", route: "/better-ceasons-case-study/" },
  { formId: 9, key: "fluentform-9", route: "/services/ai-video-production-agency/" },
  { formId: 9, key: "fluentform-9", route: "/services/ai-production-dubai-page/" },
  { formId: 9, key: "fluentform-9", route: "/services/shirdi-se-sai-tak-case-study/" },
  { formId: 10, key: "fluentform-10", route: "/services/branding/" },
  { formId: 11, key: "fluentform-11", route: "/services/content-creation/" },
  { formId: 18, key: "fluentform-18", route: "/seo-pricing/" },
  { formId: 19, key: "fluentform-19", route: "/services/aeo-services-in-mumbai/" },
  { formId: 19, key: "fluentform-19", route: "/aeo-dubai/" },
  { formId: 20, key: "fluentform-20", route: "/services/llm-seo-service/" },
  { formId: 21, key: "fluentform-21", route: "/services/geo/" },
  { formId: 22, key: "fluentform-22", route: "/seo-services-mumbai-google-ads-landing-page/" },
  { formId: 23, key: "fluentform-23", route: "/aeo-services-mumbai-google-ads-landing-page/" },
  { formId: 24, key: "fluentform-24", route: "/ai-production-videos-google-ads-landing-page/" },
  { formId: 26, key: "fluentform-26", route: "/services/performance-marketing/" },
  { formId: 27, key: "fluentform-27", route: "/australia-page/" },
  { formId: 28, key: "fluentform-28", route: "/services/website-development-pune-page/" },
  { formId: 50, key: "fluentform-50", route: "/us-landing-page/" }
];

async function checkRoute(entry) {
  const url = `https://www.dgeniussolutions.com${entry.route}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "DGS-Form-Tester/1.0" } });
    const text = await res.text();
    const hasForm = text.includes(`<form`);
    let expectedFormFound = false;
    if (entry.formId === 50) {
      expectedFormFound = text.includes('id="lead-form"') || text.includes('class="lead-form"');
    } else {
      expectedFormFound = text.includes(`id="fluentform_${entry.formId}"`) || text.includes(`data-form_id="${entry.formId}"`);
    }

    const def = formsByKey.get(entry.key);

    return {
      route: entry.route,
      formId: entry.formId,
      key: entry.key,
      title: def?.title || entry.key,
      status: res.status,
      hasForm,
      expectedFormFound,
      fieldCount: def?.fields?.length || 0,
      requiredFields: def?.fields?.filter(f => f.required).map(f => f.name) || []
    };
  } catch (err) {
    return {
      route: entry.route,
      formId: entry.formId,
      key: entry.key,
      error: err.message
    };
  }
}

async function run() {
  console.log(`Checking ${ROUTES_TO_TEST.length} routes...`);
  const results = [];
  for (const item of ROUTES_TO_TEST) {
    const res = await checkRoute(item);
    results.push(res);
    console.log(`[HTTP ${res.status}] Form ${res.formId} (${res.key}) at ${res.route}: FormFound=${res.expectedFormFound} ReqFields=[${res.requiredFields?.join(", ")}]`);
  }
  
  const all200 = results.every(r => r.status === 200);
  const allFound = results.every(r => r.expectedFormFound);
  console.log(`\nSummary: 200 OK=${all200 ? "100%" : "FAIL"}, Forms Found=${allFound ? "100%" : "FAIL"}`);
}

run().catch(console.error);
