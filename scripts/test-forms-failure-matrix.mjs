const BASE = "https://www.dgeniussolutions.com";
const ENDPOINT = `${BASE}/api/forms/submit`;

const validForm3Fields = {
  "names[first_name]": "QA",
  "names[last_name]": "Test",
  "email": "qa@example.com",
  "input_text": "QA Company",
  "url": "https://example.com",
  "phone": "+919999999999",
  "dropdown": "SEO",
  "dropdown_1": "Google Search"
};

const tests = [
  {
    name: "1. Missing required field (Form 3 without email)",
    payload: {
      fluentFormId: 3,
      route: "/services/seo-services-in-mumbai/",
      fields: (() => {
        const f = { ...validForm3Fields };
        delete f.email;
        return f;
      })(),
      captchaToken: "test"
    },
    expectedStatus: 422,
    expectedErrorField: "email"
  },
  {
    name: "2. Invalid email (Form 3 with bad email)",
    payload: {
      fluentFormId: 3,
      route: "/services/seo-services-in-mumbai/",
      fields: {
        ...validForm3Fields,
        email: "not-an-email"
      },
      captchaToken: "test"
    },
    expectedStatus: 422,
    expectedErrorField: "email"
  },
  {
    name: "3. Invalid URL where URL required (Form 3 with bad url)",
    payload: {
      fluentFormId: 3,
      route: "/services/seo-services-in-mumbai/",
      fields: {
        ...validForm3Fields,
        url: "httptypo"
      },
      captchaToken: "test"
    },
    expectedStatus: 422,
    expectedErrorField: "url"
  },
  {
    name: "4. Invalid select option (Form 3 with tampered dropdown)",
    payload: {
      fluentFormId: 3,
      route: "/services/seo-services-in-mumbai/",
      fields: {
        ...validForm3Fields,
        dropdown: "INVALID_TAMPERED_SERVICE"
      },
      captchaToken: "test"
    },
    expectedStatus: 422,
    expectedErrorField: "dropdown"
  },
  {
    name: "5. Invalid checkbox value (Form 26 with tampered business_confirmation[])",
    payload: {
      fluentFormId: 26,
      route: "/services/performance-marketing/",
      fields: {
        "full_name[first_name]": "QA",
        "full_name[last_name]": "Test",
        "email": "qa@example.com",
        "phone": "+919999999999",
        "input_text": "QA Co",
        "company_website": "https://example.com",
        "role": "Founder / Owner / CEO",
        "budget": "₹1 lakh to ₹3 lakh",
        "start_timeline": "Immediately",
        "requirement": "QA requirement text testing checkboxes",
        "contact_consent": "1",
        "business_confirmation[]": "INVALID_INVENTED_CHECKBOX_VALUE"
      },
      captchaToken: "test"
    },
    expectedStatus: 422,
    expectedErrorField: "business_confirmation[]"
  },
  {
    name: "6. Missing required checkbox (Form 26 without contact_consent)",
    payload: {
      fluentFormId: 26,
      route: "/services/performance-marketing/",
      fields: {
        "full_name[first_name]": "QA",
        "full_name[last_name]": "Test",
        "email": "qa@example.com",
        "phone": "+919999999999",
        "input_text": "QA Co",
        "company_website": "https://example.com",
        "role": "Founder / Owner / CEO",
        "budget": "₹1 lakh to ₹3 lakh",
        "start_timeline": "Immediately",
        "requirement": "QA requirement text testing checkboxes",
        "business_confirmation[]": "I confirm this is a business enquiry for a company or brand, not a job application, internship request, freelancer pitch or personal enquiry."
      },
      captchaToken: "test"
    },
    expectedStatus: 422,
    expectedErrorField: "contact_consent"
  },
  {
    name: "7. Missing CAPTCHA (Form 3 without captchaToken)",
    payload: {
      fluentFormId: 3,
      route: "/services/seo-services-in-mumbai/",
      fields: validForm3Fields
    },
    expectedStatus: 422,
    expectedErrorField: "captcha"
  },
  {
    name: "8. Fake CAPTCHA (Form 3 with invalid token evaluated server-side)",
    payload: {
      fluentFormId: 3,
      route: "/services/seo-services-in-mumbai/",
      fields: validForm3Fields,
      captchaToken: "invalid-fake-recaptcha-token-12345"
    },
    expectedStatus: 422,
    expectedErrorField: "captcha"
  },
  {
    name: "9. Unknown field (Form 3 with arbitrary client field)",
    payload: {
      fluentFormId: 3,
      route: "/services/seo-services-in-mumbai/",
      fields: {
        ...validForm3Fields,
        unauthorized_custom_field: "injected_value"
      },
      captchaToken: "test"
    },
    expectedStatus: 400
  },
  {
    name: "10. Attempted hidden-field override (Form 3 with client-supplied hidden field)",
    payload: {
      fluentFormId: 3,
      route: "/services/seo-services-in-mumbai/",
      fields: {
        ...validForm3Fields,
        hidden: "Client Tampered SEO Page Context"
      },
      captchaToken: "test"
    },
    expectedStatus: 400
  },
  {
    name: "11. Privileged field rejection (Form 1 with password/cookie key)",
    payload: {
      fluentFormId: 1,
      route: "/",
      fields: {
        "names[first_name]": "QA",
        "email": "qa@example.com",
        "phone": "+919999999999",
        "password": "secret_attempt"
      }
    },
    expectedStatus: 400
  },
  {
    name: "12. Invalid JSON / payload structure",
    rawBody: "NOT_VALID_JSON",
    expectedStatus: 400
  }
];

async function run() {
  console.log("=== SECTION 16: FAILURE TEST MATRIX AUDIT ===\n");
  let allPass = true;

  for (const t of tests) {
    const isRaw = typeof t.rawBody === "string";
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: isRaw ? t.rawBody : JSON.stringify(t.payload)
    });

    const status = res.status;
    let data = {};
    try {
      data = await res.json();
    } catch {}

    const statusMatches = status === t.expectedStatus;
    let fieldMatches = true;
    if (t.expectedErrorField) {
      fieldMatches = Boolean(data.fieldErrors && data.fieldErrors[t.expectedErrorField]);
    }

    const testPass = statusMatches && fieldMatches;
    if (!testPass) allPass = false;

    console.log(`Test: ${t.name}`);
    console.log(`  Expected HTTP: ${t.expectedStatus} | Actual: ${status}`);
    console.log(`  Response message: ${data.message || ""}`);
    if (t.expectedErrorField) {
      console.log(`  Expected error on field '${t.expectedErrorField}': ${Boolean(data.fieldErrors?.[t.expectedErrorField])}`);
    }
    console.log(`  Result: ${testPass ? "PASS" : "FAIL"}\n`);
  }

  console.log(`\nFAILURE TEST MATRIX OVERALL: ${allPass ? "ALL PASS" : "SOME FAILED"}`);
  if (!allPass) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
