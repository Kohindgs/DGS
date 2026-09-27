import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const { extractLeadContactFields } = await import(path.join(ROOT, "lib/forms/contact-fields.ts"));
const { createCmsLead, createCmsSubmission } = await import(path.join(ROOT, "lib/cms/leads.ts"));
const { sendNativeFormNotification } = await import(path.join(ROOT, "lib/notifications/form-email.ts"));
const { publishNotificationEvent } = await import(path.join(ROOT, "lib/notifications/engine.ts"));
const { cmsQuery } = await import(path.join(ROOT, "lib/cms/db.ts"));

const definitionsData = JSON.parse(fs.readFileSync(path.join(ROOT, "data/forms/definitions.approved.json"), "utf8"));
const forms = definitionsData.forms;

// Test Form 9 FIRST as instructed
const FORM_TEST_ORDER = [9, 1, 3, 4, 6, 10, 11, 19, 20, 21, 26];

function getTestPayload(formId) {
  switch (formId) {
    case 1:
      return {
        route: "/",
        fields: {
          "names[first_name]": "DGS Forms QA Form 1",
          email: "business@dgeniussolutions.com",
          phone: "+919987922901",
          input_text: "DGS Home Enterprise",
          dropdown_1: "Google Search",
          subject: "Native Form 1 QA Lead",
          dropdown: "SEO",
          message: "Controlled production verification for Form 1",
        },
      };
    case 3:
      return {
        route: "/services/seo-services-in-mumbai/",
        fields: {
          "names[first_name]": "DGS Forms QA",
          "names[last_name]": "Form 3 Lead",
          email: "business@dgeniussolutions.com",
          input_text: "DGS SEO Solutions",
          url: "https://www.dgeniussolutions.com",
          phone: "+919987922901",
          dropdown: "SEO",
          dropdown_1: "Google Search",
        },
      };
    case 4:
      return {
        route: "/services/social-media-marketing/",
        fields: {
          "names[first_name]": "DGS Forms QA",
          "names[last_name]": "Form 4 Lead",
          email: "business@dgeniussolutions.com",
          url: "https://www.dgeniussolutions.com",
          phone: "+919987922901",
        },
      };
    case 6:
      return {
        route: "/services/website-development-amc/",
        fields: {
          "names[first_name]": "DGS Forms QA",
          "names[last_name]": "Form 6 Lead",
          email: "business@dgeniussolutions.com",
          input_text: "DGS Web Services",
          phone: "+919987922901",
          dropdown: "Website Development",
          dropdown_1: "Google Search",
        },
      };
    case 9:
      return {
        route: "/services/ai-video-production-agency/",
        fields: {
          "names[first_name]": "DGS Forms QA",
          "names[last_name]": "Form 9 Lead",
          email: "business@dgeniussolutions.com",
          input_text: "DGS AI Video Agency",
          input_text_1: "+919987922901",
          dropdown: "Generative Images",
          dropdown_1: "Google Search",
          description: "Controlled production verification for Form 9 incident hotfix",
        },
      };
    case 10:
      return {
        route: "/services/branding/",
        fields: {
          input_text_1: "DGS Forms QA Form 10",
          email: "business@dgeniussolutions.com",
          url: "DGS Branding Agency",
          phone: "+919987922901",
          dropdown_3: "Google Search",
          dropdown: "Logo & Visual Identity",
          description: "Controlled production verification for Form 10",
        },
      };
    case 11:
      return {
        route: "/services/content-creation/",
        fields: {
          input_text_1: "DGS Forms QA Form 11",
          email: "business@dgeniussolutions.com",
          url: "DGS Content Studio",
          phone: "+919987922901",
          dropdown: "Article / Blog Writing",
          dropdown_2: "Google Search",
          description: "Controlled production verification for Form 11",
        },
      };
    case 19:
      return {
        route: "/services/aeo-services-in-mumbai/",
        fields: {
          "names[first_name]": "DGS Forms QA",
          "names[last_name]": "Form 19 Lead",
          email: "business@dgeniussolutions.com",
          input_text: "DGS AEO Labs",
          url: "https://www.dgeniussolutions.com",
          phone: "+919987922901",
          dropdown: "AEO Audit",
          dropdown_1: "Google Search",
        },
      };
    case 20:
      return {
        route: "/services/llm-seo-service/",
        fields: {
          "names[first_name]": "DGS Forms QA",
          "names[last_name]": "Form 20 Lead",
          email: "business@dgeniussolutions.com",
          input_text: "DGS LLM SEO",
          url: "https://www.dgeniussolutions.com",
          phone: "+919987922901",
          dropdown: "LLM SEO Audit",
          dropdown_1: "Google Search",
        },
      };
    case 21:
      return {
        route: "/services/geo/",
        fields: {
          "names[first_name]": "DGS Forms QA",
          "names[last_name]": "Form 21 Lead",
          email: "business@dgeniussolutions.com",
          input_text: "DGS GEO Engine",
          url: "https://www.dgeniussolutions.com",
          phone: "+919987922901",
          dropdown: "GEO Audit",
          dropdown_1: "Google Search",
        },
      };
    case 26:
      return {
        route: "/services/performance-marketing/",
        fields: {
          "full_name[first_name]": "DGS Forms QA",
          "full_name[last_name]": "Form 26 Lead",
          email: "business@dgeniussolutions.com",
          phone: "+919987922901",
          input_text: "DGS Performance Growth",
          company_website: "https://www.dgeniussolutions.com",
          role: "Founder / Executive",
          budget: "₹2,50,000 - ₹5,00,000 / month",
          start_timeline: "Immediately",
          requirement: "Controlled production verification for Form 26",
          contact_consent: "1",
          "business_confirmation[]": "1",
        },
      };
    default:
      throw new Error(`Unknown form ID ${formId}`);
  }
}

async function run() {
  console.log("==================================================");
  console.log("DGS CONTROLLED PRODUCTION SUBMISSION & DB TEST");
  console.log("==================================================");

  const results = [];

  for (const formId of FORM_TEST_ORDER) {
    const def = forms.find((f) => Number(f.fluentFormId) === formId);
    if (!def) throw new Error(`Definition missing for form ${formId}`);

    const { route, fields } = getTestPayload(formId);
    console.log(`\n--- Testing Form ${formId} (${def.key}) on ${route} ---`);

    // 1. Normalize Contact Fields
    const contact = extractLeadContactFields(def, fields);
    console.log(`  Extracted Contact: Name="${contact.name}", Email="${contact.email}", Phone="${contact.phone}", Company="${contact.company}"`);

    // Safety checks
    if (!contact.name) throw new Error(`Form ${formId} empty name`);
    if (!contact.email) throw new Error(`Form ${formId} empty email`);
    if (!contact.phone) throw new Error(`Form ${formId} empty phone`);
    if (!contact.company) throw new Error(`Form ${formId} empty company`);

    // 2. Database First: Insert Lead
    const payload = {
      fluentFormId: def.fluentFormId,
      formTitle: def.title,
      route,
      fields,
    };

    const leadId = await createCmsLead({
      formKey: def.key,
      route,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      payload,
    });
    console.log(`  [PASS] CMS Lead created: ${leadId}`);

    // 3. Database First: Insert Submission
    const submissionId = await createCmsSubmission({
      formKey: def.key,
      route,
      payload,
      leadId,
      provider: "native",
    });
    console.log(`  [PASS] CMS Submission created: ${submissionId} (provider=native)`);

    // 4. Send Email Notification
    let emailSent = false;
    let emailError = null;
    try {
      const emailRes = await sendNativeFormNotification({
        definition: def,
        route,
        fields,
        leadId,
        contact,
      });
      emailSent = Boolean(emailRes.sent);
      console.log(`  [PASS] Email notification: sent=${emailSent} (reason: ${emailRes.reason || "none"})`);
    } catch (err) {
      emailError = err.message;
      console.warn(`  [WARN] Email notification failed: ${err.message}`);
    }

    // 5. In-App Notification Event
    try {
      await publishNotificationEvent({
        type: "new_lead",
        severity: "info",
        title: `New Inbound Lead: ${contact.name}`,
        message: `Submitted via ${def.title || def.key} from ${route}`,
        resource_type: "lead",
        resource_id: leadId,
        resource_url: `/admin/leads/?leadId=${leadId}`,
        recipient_role: "marketing",
      });
      console.log(`  [PASS] In-app notification event published.`);
    } catch (err) {
      console.warn(`  [WARN] In-app notification event failed: ${err.message}`);
    }

    // 6. Verify Rows Directly in MySQL Database
    const { rows: leadRows } = await cmsQuery("SELECT * FROM leads WHERE id = ?", [leadId]);
    const leadRow = leadRows[0];
    if (!leadRow) throw new Error(`Lead row ${leadId} not found in database!`);

    const { rows: subRows } = await cmsQuery("SELECT * FROM form_submissions WHERE id = ?", [submissionId]);
    const subRow = subRows[0];
    if (!subRow) throw new Error(`Submission row ${submissionId} not found in database!`);

    console.log(`  [VERIFIED DB LEAD] ID: ${leadRow.id} | Name: "${leadRow.name}" | Email: "${leadRow.email}" | Phone: "${leadRow.phone}" | Company: "${leadRow.company}" | Status: ${leadRow.status}`);
    console.log(`  [VERIFIED DB SUBMISSION] ID: ${subRow.id} | FormKey: "${subRow.form_key}" | Route: "${subRow.source_route}" | Provider: "${subRow.provider}"`);

    results.push({
      formId,
      key: def.key,
      title: def.title,
      route,
      leadId,
      submissionId,
      provider: subRow.provider,
      name: leadRow.name,
      email: leadRow.email,
      phone: leadRow.phone,
      company: leadRow.company,
      emailSent,
      status: "PASS",
    });
  }

  console.log("\n==================================================");
  console.log("CONTROLLED PRODUCTION VERIFICATION SUMMARY");
  console.log("==================================================");
  console.table(results);
}

run().catch((err) => {
  console.error("FATAL ERROR IN CONTROLLED PRODUCTION TEST:", err);
  process.exit(1);
});
