import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const APPROVED_FORM_IDS = [1, 3, 4, 6, 9, 10, 11, 19, 20, 21, 26];

console.log("==================================================");
console.log("DGS NATIVE-ONLY SUBMISSION REGRESSION TEST");
console.log("==================================================");

// 1. Static AST / Source Code Verification
console.log("\n1. Verifying app/api/forms/submit/route.ts static architecture...");
const routeContent = fs.readFileSync(path.resolve("app/api/forms/submit/route.ts"), "utf8");

assert.ok(
  !routeContent.includes("forwardToFluentForms"),
  "REGRESSION: app/api/forms/submit/route.ts must NOT reference forwardToFluentForms",
);
assert.ok(
  !routeContent.includes("fetchFormContext"),
  "REGRESSION: app/api/forms/submit/route.ts must NOT reference fetchFormContext",
);
assert.ok(
  !routeContent.includes("admin-ajax.php"),
  "REGRESSION: app/api/forms/submit/route.ts must NOT reference admin-ajax.php",
);
assert.ok(
  routeContent.includes('provider: "native"'),
  "REGRESSION: app/api/forms/submit/route.ts must return provider: 'native'",
);
assert.ok(
  routeContent.includes("submitNativeLeadForm"),
  "REGRESSION: app/api/forms/submit/route.ts must invoke submitNativeLeadForm",
);
console.log("   [PASS] Static route verification passed. Zero WordPress dependencies in live submit route.");

// 2. Dynamic isNativeFormEnabled Verification for all 11 approved IDs
console.log("\n2. Verifying isNativeFormEnabled across all approved form IDs...");
const { isNativeFormEnabled } = await import("../lib/forms/native/submit.ts");

for (const formId of APPROVED_FORM_IDS) {
  const enabled = isNativeFormEnabled(formId);
  assert.equal(enabled, true, `Form ${formId} must have isNativeFormEnabled === true`);
  console.log(`   [PASS] Form ${formId}: isNativeFormEnabled === true`);
}

// 3. Contact Normalization Verification for all 11 forms
console.log("\n3. Verifying extractLeadContactFields for all approved form definitions...");
const definitionsData = JSON.parse(fs.readFileSync(path.resolve("data/forms/definitions.approved.json"), "utf8"));
const { extractLeadContactFields } = await import("../lib/forms/contact-fields.ts");

for (const formId of APPROVED_FORM_IDS) {
  const def = definitionsData.forms.find((f) => Number(f.fluentFormId) === formId);
  assert.ok(def, `Definition for Form ${formId} must exist`);

  let mockFields = {};
  if (formId === 1) {
    mockFields = {
      "names[first_name]": "Test Form1 User",
      email: "test.form1@dgeniussolutions.com",
      phone: "+919987922901",
      input_text: "Test Form1 Company",
    };
  } else if ([3, 4, 6, 19, 20, 21].includes(formId)) {
    mockFields = {
      "names[first_name]": "Test",
      "names[last_name]": `Lead Form${formId}`,
      email: `test.form${formId}@dgeniussolutions.com`,
      phone: "+919987922901",
      input_text: `Test Company ${formId}`,
      url: "https://www.dgeniussolutions.com",
    };
  } else if (formId === 9) {
    // Form 9 has Brand Name in input_text, Phone/Mobile in input_text_1
    mockFields = {
      "names[first_name]": "Video",
      "names[last_name]": "Production Lead",
      email: "test.form9@dgeniussolutions.com",
      input_text: "AI Studio Brand",
      input_text_1: "+919987922901",
    };
  } else if (formId === 10 || formId === 11) {
    // Form 10/11 has Full Name in input_text_1, Company Name in url, Phone in phone
    mockFields = {
      input_text_1: `Branding Lead Form${formId}`,
      email: `test.form${formId}@dgeniussolutions.com`,
      url: `Branding Agency ${formId}`,
      phone: "+919987922901",
    };
  } else if (formId === 26) {
    // Form 26 has full_name[first_name], full_name[last_name], phone, input_text, company_website
    mockFields = {
      "full_name[first_name]": "Performance",
      "full_name[last_name]": "Marketing Lead",
      email: "test.form26@dgeniussolutions.com",
      phone: "+919987922901",
      input_text: "Growth Partner Corp",
      company_website: "https://www.dgeniussolutions.com",
    };
  }

  const contact = extractLeadContactFields(def, mockFields);
  assert.ok(contact.name && contact.name.length > 0, `Form ${formId} failed name extraction`);
  assert.ok(contact.email && contact.email.includes("@"), `Form ${formId} failed email extraction`);
  assert.ok(contact.phone && contact.phone.includes("9987922901"), `Form ${formId} failed phone extraction: got "${contact.phone}"`);
  assert.ok(contact.company && contact.company.length > 0, `Form ${formId} failed company extraction: got "${contact.company}"`);

  console.log(`   [PASS] Form ${formId} (${def.key}): name="${contact.name}", email="${contact.email}", phone="${contact.phone}", company="${contact.company}"`);
}

// 4. Form 9 Specific Safety Assertions
console.log("\n4. Verifying Form 9 specific safety...");
const form9Def = definitionsData.forms.find((f) => f.fluentFormId === 9);
const form9Contact = extractLeadContactFields(form9Def, {
  "names[first_name]": "Live Incident",
  "names[last_name]": "Tester",
  email: "live.incident.form9@dgeniussolutions.com",
  input_text: "DGS Production Brand",
  input_text_1: "+919987922901",
});
assert.equal(form9Contact.phone, "+919987922901", "Form 9 must correctly map input_text_1 to phone");
assert.equal(form9Contact.company, "DGS Production Brand", "Form 9 must correctly map input_text to company/brand");
console.log("   [PASS] Form 9 legacy input_text_1 phone mapping verified.");

console.log("\n==================================================");
console.log("NATIVE-ONLY REGRESSION TEST: ALL PASS");
console.log("==================================================");
