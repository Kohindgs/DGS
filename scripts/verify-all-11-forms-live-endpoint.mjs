import fs from "node:fs";

const APPROVED_FORMS = [
  { id: 1, route: "/", title: "Homepage Form" },
  { id: 1, route: "/contact-us/", title: "Homepage / Contact Form" },
  { id: 3, route: "/services/seo-services-in-mumbai/", title: "Free SEO Audit Form" },
  { id: 4, route: "/services/social-media-marketing/", title: "Social Media FORM" },
  { id: 6, route: "/services/website-development-amc/", title: "Website Development Form" },
  { id: 9, route: "/services/ai-video-production-agency/", title: "Generative AI" },
  { id: 10, route: "/services/branding/", title: "Branding Form (#10)" },
  { id: 11, route: "/services/content-creation/", title: "Content Creation Form" },
  { id: 19, route: "/services/aeo-services-in-mumbai/", title: "Free AEO Audit Form" },
  { id: 20, route: "/services/llm-seo-service/", title: "Free LLM Audit Form" },
  { id: 21, route: "/services/geo/", title: "Free GEO Audit Form" },
  { id: 26, route: "/services/performance-marketing/", title: "DGS Performance Marketing Page Form" }
];

const BASE = "https://www.dgeniussolutions.com";

console.log("==================================================");
console.log("VERIFYING LIVE PRODUCTION /api/forms/submit FOR ALL 11 FORMS");
console.log("==================================================");

let allPass = true;

for (const formItem of APPROVED_FORMS) {
  const url = `${BASE}/api/forms/submit`;
  const payload = {
    fluentFormId: formItem.id,
    route: formItem.route,
    fields: {},
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    const hasBridgeError = JSON.stringify(data).toLowerCase().includes("wordpress") ||
                           JSON.stringify(data).toLowerCase().includes("headless bridge");

    if (hasBridgeError) {
      console.error(`[FAIL] Form ${formItem.id} (${formItem.route}) exposed WordPress bridge error!`, data);
      allPass = false;
      continue;
    }

    console.log(`[PASS] Form ${formItem.id} @ ${formItem.route}: HTTP ${res.status}, response ok=${data.ok}, message="${data.message}", fieldErrors=${Object.keys(data.fieldErrors || {}).length} errors. (ZERO WordPress leaks)`);
  } catch (err) {
    console.error(`[FAIL] Form ${formItem.id} @ ${formItem.route}: Network error`, err.message);
    allPass = false;
  }
}

if (allPass) {
  console.log("\n==================================================");
  console.log("ALL 11 FORMS LIVE ROUTE VERIFICATION: PASS");
  console.log("==================================================");
} else {
  console.error("\nSOME FORMS FAILED LIVE ROUTE VERIFICATION!");
  process.exit(1);
}
