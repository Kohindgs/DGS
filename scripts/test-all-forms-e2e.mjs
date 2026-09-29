import fs from "fs";

const BASE_URL = process.env.TEST_BASE_URL || "https://www.dgeniussolutions.com";

console.log(`\n==================================================`);
console.log(`DGS V8.8.9 — SITE-WIDE FORM FUNCTIONALITY AUDIT & QA`);
console.log(`Target: ${BASE_URL}`);
console.log(`==================================================\n`);

async function testRouteStatus(route, expectedStatus = 200) {
  const url = `${BASE_URL}${route}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "DGS-Form-QA/8.8.9" } });
    const text = await res.text();
    const ok = res.status === expectedStatus;
    console.log(`[ROUTE CHECK] ${route.padEnd(45)} -> HTTP ${res.status} (expected ${expectedStatus}) : ${ok ? "PASS" : "FAIL"}`);
    return { ok, status: res.status, text };
  } catch (err) {
    console.log(`[ROUTE CHECK] ${route.padEnd(45)} -> ERROR: ${err.message}`);
    return { ok: false, error: err.message };
  }
}

async function testSubmit(formId, route, fields, expectedOk = true) {
  const url = `${BASE_URL}/api/forms/submit/`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "DGS-Form-QA/8.8.9",
        Accept: "application/json",
      },
      body: JSON.stringify({
        fluentFormId: formId,
        route,
        fields,
      }),
    });

    const data = await res.json().catch(() => ({}));
    const pass = expectedOk ? res.ok && data.ok : !res.ok;
    console.log(
      `[FORM SUBMIT] Form #${String(formId).padEnd(2)} on ${route.padEnd(40)} -> HTTP ${res.status} | ok: ${data.ok} | msg: ${(data.message || "").slice(0, 45)} : ${pass ? "PASS" : "FAIL"}`,
    );
    return { pass, status: res.status, data };
  } catch (err) {
    console.log(`[FORM SUBMIT] Form #${formId} on ${route} -> ERROR: ${err.message}`);
    return { pass: false, error: err.message };
  }
}

async function main() {
  console.log("--- PHASE A: VERIFY CRITICAL ROUTES AND PLACEHOLDER REMOVAL ---");
  const pricingCheck = await testRouteStatus("/seo-pricing/", 200);
  if (pricingCheck.text) {
    const hasPlaceholder = pricingCheck.text.includes("Replace with your Fluent Form shortcode");
    console.log(`  -> Placeholder "Replace with your Fluent Form shortcode" on /seo-pricing/: ${hasPlaceholder ? "FOUND (FAIL)" : "CLEAN (PASS)"}`);
  }

  const usLandingCheck = await testRouteStatus("/us-landing-page/", 200);
  const homeCheck = await testRouteStatus("/", 200);
  const contactCheck = await testRouteStatus("/contact-us/", 200);
  const careerCheck = await testRouteStatus("/career/", 200);

  console.log("\n--- PHASE B: FORM VALIDATION NEGATIVE TESTS (Empty/Invalid Fields) ---");
  // Test empty fields on Form 1
  await testSubmit(1, "/", {}, false);
  // Test invalid email on Form 3
  await testSubmit(3, "/services/seo-services-in-mumbai/", { email: "not-an-email" }, false);
  // Test missing route on Form 18
  await testSubmit(18, "/invalid-route/", { email: "business@dgeniussolutions.com" }, false);

  console.log("\n--- PHASE C: SYNTHETIC POSITIVE SUBMISSIONS (DGS FORM QA) ---");

  const commonQaData = {
    names: "DGS FORM QA",
    "names[first_name]": "DGS FORM QA",
    "names[last_name]": "TEST",
    "full_name[first_name]": "DGS FORM QA",
    "full_name[last_name]": "TEST",
    name: "DGS FORM QA",
    input_text_1: "DGS FORM QA",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    company: "DGS INTERNAL QA",
    url: "https://www.dgeniussolutions.com",
    website: "https://www.dgeniussolutions.com",
    company_website: "https://www.dgeniussolutions.com",
    message: "Automated production form QA test submission — safe to ignore",
    requirement: "Automated production form QA test submission — safe to ignore",
    dropdown_1: "Google Search",
    subject: "QA Test Subject",
    dropdown: "Search Engine Optimization",
    role: "Internal Tester",
    budget: "₹50,000 - ₹1,00,000",
    start_timeline: "Immediately",
    contact_consent: "1",
    "business_confirmation[]": "1",
    service: "SEO services in the US",
    consent: "1",
    source: "DGS_FORM_QA",
    qa_test: "true",
  };

  // 1. Form 1: Home
  await testSubmit(1, "/", {
    "names[first_name]": "DGS FORM QA",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    dropdown_1: "Google Search",
    subject: "QA Form 1 Test",
    dropdown: "Search Engine Optimization",
    message: "Automated production form QA — safe to ignore",
  });

  // 2. Form 1: Contact Us
  await testSubmit(1, "/contact-us/", {
    "names[first_name]": "DGS FORM QA",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    dropdown_1: "Google Search",
    subject: "QA Form 1 Contact Test",
    dropdown: "Search Engine Optimization",
    message: "Automated production form QA — safe to ignore",
  });

  // 3. Form 3: Mumbai SEO
  await testSubmit(3, "/services/seo-services-in-mumbai/", {
    "names[first_name]": "DGS FORM QA",
    "names[last_name]": "TEST",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    url: "https://www.dgeniussolutions.com",
  });

  // 4. Form 3: Dubai SEO
  await testSubmit(3, "/services/dubai-seo/", {
    "names[first_name]": "DGS FORM QA",
    "names[last_name]": "TEST",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    url: "https://www.dgeniussolutions.com",
  });

  // 5. Form 4: Social Media
  await testSubmit(4, "/services/social-media-marketing/", {
    "names[first_name]": "DGS FORM QA",
    "names[last_name]": "TEST",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    url: "https://www.dgeniussolutions.com",
  });

  // 6. Form 6: Website Development
  await testSubmit(6, "/services/website-development-amc/", {
    "names[first_name]": "DGS FORM QA",
    "names[last_name]": "TEST",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    url: "https://www.dgeniussolutions.com",
  });

  // 7. Form 9: AI Video Production
  await testSubmit(9, "/services/ai-video-production-agency/", {
    "names[first_name]": "DGS FORM QA",
    "names[last_name]": "TEST",
    email: "business@dgeniussolutions.com",
    input_text: "DGS INTERNAL QA",
    input_text_1: "+91 99879 22901",
  });

  // 8. Form 10: Branding
  await testSubmit(10, "/services/branding/", {
    input_text_1: "DGS FORM QA",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    url: "DGS INTERNAL QA",
  });

  // 9. Form 11: Content Creation
  await testSubmit(11, "/services/content-creation/", {
    input_text_1: "DGS FORM QA",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    url: "DGS INTERNAL QA",
  });

  // 10. Form 18: SEO Pricing
  await testSubmit(18, "/seo-pricing/", {
    "names[first_name]": "DGS FORM QA",
    "names[last_name]": "TEST",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    url: "https://www.dgeniussolutions.com",
    dropdown_2: "Monthly",
    dropdown: "Silver",
    dropdown_3: "Gold",
    dropdown_1: "Google Search",
    "checkbox[]": "1",
  });

  // 11. Form 19: AEO Mumbai
  await testSubmit(19, "/services/aeo-services-in-mumbai/", {
    "names[first_name]": "DGS FORM QA",
    "names[last_name]": "TEST",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    url: "https://www.dgeniussolutions.com",
  });

  // 12. Form 20: LLM SEO
  await testSubmit(20, "/services/llm-seo-service/", {
    "names[first_name]": "DGS FORM QA",
    "names[last_name]": "TEST",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    url: "https://www.dgeniussolutions.com",
  });

  // 13. Form 21: GEO
  await testSubmit(21, "/services/geo/", {
    "names[first_name]": "DGS FORM QA",
    "names[last_name]": "TEST",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    url: "https://www.dgeniussolutions.com",
  });

  // 14. Form 26: Performance Marketing
  await testSubmit(26, "/services/performance-marketing/", {
    "full_name[first_name]": "DGS FORM QA",
    "full_name[last_name]": "TEST",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    company_website: "https://www.dgeniussolutions.com",
    role: "Marketing Head",
    budget: "₹50,000 - ₹1,00,000",
    start_timeline: "Immediately",
    requirement: "Automated QA test submission",
    contact_consent: "1",
    "business_confirmation[]": "1",
  });

  // 15. Form 27: Australia Page
  await testSubmit(27, "/australia-page/", {
    "names[first_name]": "DGS FORM QA",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    dropdown_1: "Google Search",
    subject: "QA Form 27 Australia Test",
    dropdown: "Search Engine Optimization",
    message: "Automated production form QA — safe to ignore",
  });

  // 16. Form 28: Website Development Pune
  await testSubmit(28, "/services/website-development-pune-page/", {
    "full_name[first_name]": "DGS FORM QA",
    "full_name[last_name]": "TEST",
    email: "business@dgeniussolutions.com",
    phone: "+91 99879 22901",
    input_text: "DGS INTERNAL QA",
    company_website: "https://www.dgeniussolutions.com",
    role: "Founder",
    budget: "₹1,00,000+",
    start_timeline: "Immediately",
    requirement: "Pune Web Dev QA Test",
    contact_consent: "1",
    "business_confirmation[]": "1",
  });

  // 17. Form 50: US Landing Page
  await testSubmit(50, "/us-landing-page/", {
    name: "DGS FORM QA",
    company: "DGS INTERNAL QA",
    email: "business@dgeniussolutions.com",
    phone: "+1 555 000 0000",
    website: "https://www.dgeniussolutions.com",
    service: "SEO services in the US",
    message: "Automated US Landing Page QA Test",
  });

  console.log("\n--- PHASE D: CAREER APPLICATION ENDPOINT QA ---");
  // Test career multipart application
  try {
    const formData = new FormData();
    formData.append("firstName", "DGS FORM QA");
    formData.append("lastName", "TEST");
    formData.append("email", "business@dgeniussolutions.com");
    formData.append("phone", "+91 99879 22901");
    formData.append("position", "General Application");
    formData.append("location", "Mumbai");
    formData.append("experience", "2 Years");
    formData.append("consent", "yes");

    // Mock PDF resume
    const mockPdf = Buffer.from("%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF");
    const resumeBlob = new Blob([mockPdf], { type: "application/pdf" });
    formData.append("resume", resumeBlob, "dgs-form-qa-resume.pdf");

    const careerRes = await fetch(`${BASE_URL}/api/career/apply`, {
      method: "POST",
      headers: { "User-Agent": "DGS-Form-QA/8.8.9" },
      body: formData,
    });
    const careerData = await careerRes.json().catch(() => ({}));
    console.log(`[CAREER APPLY] /api/career/apply -> HTTP ${careerRes.status} | ok: ${careerData.ok} | msg: ${(careerData.message || "").slice(0, 45)} : ${careerRes.ok && careerData.ok ? "PASS" : "FAIL"}`);
  } catch (err) {
    console.log(`[CAREER APPLY] ERROR: ${err.message}`);
  }

  console.log("\n==================================================");
  console.log("COMPLETED E2E TEST RUN");
  console.log("==================================================");
}

main().catch(console.error);
