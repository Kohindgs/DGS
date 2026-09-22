import fs from "fs";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";

const envContent = fs.readFileSync("/home/u188101251/production-app/shared/.env.production", "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2];
}

const defs = JSON.parse(fs.readFileSync("/home/u188101251/production-app/current/data/forms/definitions.approved.json", "utf8")).forms;

// Import cms leads & email
const { createCmsLead, createCmsSubmission } = await import("/home/u188101251/production-app/current/lib/cms/leads.ts");
const { sendNativeFormNotification } = await import("/home/u188101251/production-app/current/lib/notifications/form-email.ts");

const db = await mysql.createConnection(env.DGS_DATABASE_URL || {
  host: env.DGS_MYSQL_HOST,
  port: Number(env.DGS_MYSQL_PORT || 3306),
  user: env.DGS_MYSQL_USER,
  password: env.DGS_MYSQL_PASSWORD,
  database: env.DGS_MYSQL_DATABASE
});

console.log("=== STEP 9: MINIMUM CONTROLLED QA SUBMISSIONS ===");

// 1. Textarea Form: Form 1 (Homepage / Contact Form)
const form1Def = defs.find(f => f.fluentFormId === 1);
const form1Fields = {
  "names[first_name]": "DGS QA",
  "email": "test.qa.form1@dgeniussolutions.com",
  "phone": "+919999999999",
  "input_text": "DGS QA Testing Home",
  "dropdown_1": "Google Search",
  "subject": "QA Test Subject",
  "dropdown": "Search Engine Optimization",
  "message": "This is a controlled QA message testing textarea native submission.",
  "Home_Page": "Home Page",
  "Home_Page_form": "Home Page Form"
};

console.log("\n--- Testing Form 1 (Textarea + Select + Text) ---");
const lead1Id = await createCmsLead({
  formKey: form1Def.key,
  route: "/contact-us/",
  name: "DGS QA Lead",
  email: form1Fields.email,
  phone: form1Fields.phone,
  company: form1Fields.input_text,
  payload: {
    fluentFormId: 1,
    formTitle: form1Def.title,
    route: "/contact-us/",
    fields: form1Fields
  }
});
const sub1Id = await createCmsSubmission({
  formKey: form1Def.key,
  route: "/contact-us/",
  payload: {
    fluentFormId: 1,
    formTitle: form1Def.title,
    route: "/contact-us/",
    fields: form1Fields
  },
  leadId: lead1Id,
  provider: "native"
});
const mail1 = await sendNativeFormNotification({
  definition: form1Def,
  route: "/contact-us/",
  fields: form1Fields
});

console.log("Form 1 Lead ID:", lead1Id, "Submission ID:", sub1Id, "Email sent:", mail1.sent);

// 2. Checkbox Form: Form 26 (Performance Marketing)
const form26Def = defs.find(f => f.fluentFormId === 26);
const form26Fields = {
  "full_name[first_name]": "DGS QA",
  "full_name[last_name]": "Performance Lead",
  "email": "test.qa.form26@dgeniussolutions.com",
  "phone": "+919999999999",
  "input_text": "DGS QA Performance Ltd",
  "company_website": "https://www.dgeniussolutions.com",
  "role": "Founder / Owner / CEO",
  "budget": "₹1 lakh to ₹3 lakh",
  "start_timeline": "Immediately",
  "requirement": "Controlled QA testing of Form 26 native submission with checkboxes.",
  "contact_consent": "1",
  "business_confirmation[]": "I confirm this is a business enquiry for a company or brand, not a job application, internship request, freelancer pitch or personal enquiry.",
  "service_name": "Performance Marketing",
  "lead_source": "Website"
};

console.log("\n--- Testing Form 26 (Checkbox + Textarea + Selects) ---");
const lead26Id = await createCmsLead({
  formKey: form26Def.key,
  route: "/services/performance-marketing/",
  name: "DGS QA Performance Lead",
  email: form26Fields.email,
  phone: form26Fields.phone,
  company: form26Fields.input_text,
  payload: {
    fluentFormId: 26,
    formTitle: form26Def.title,
    route: "/services/performance-marketing/",
    fields: form26Fields
  }
});
const sub26Id = await createCmsSubmission({
  formKey: form26Def.key,
  route: "/services/performance-marketing/",
  payload: {
    fluentFormId: 26,
    formTitle: form26Def.title,
    route: "/services/performance-marketing/",
    fields: form26Fields
  },
  leadId: lead26Id,
  provider: "native"
});
const mail26 = await sendNativeFormNotification({
  definition: form26Def,
  route: "/services/performance-marketing/",
  fields: form26Fields
});

console.log("Form 26 Lead ID:", lead26Id, "Submission ID:", sub26Id, "Email sent:", mail26.sent);

// Verify in DB
console.log("\n--- DB & WP VERIFICATION ---");
const [leads] = await db.query("SELECT id, source_form_key, source_route, name, email FROM leads WHERE id IN (?, ?)", [lead1Id, lead26Id]);
console.log("Leads in DB:", leads);

const [subs] = await db.query("SELECT id, form_key, source_route, provider FROM form_submissions WHERE id IN (?, ?)", [sub1Id, sub26Id]);
console.log("Submissions in DB (all native):", subs);

const [wpCheck] = await db.query("SELECT count(*) as c FROM wpcl_fluentform_submissions WHERE created_at > STR_TO_DATE('2026-09-20', '%Y-%m-%d')");
console.log("WP submissions since Sept 20 (must be 0):", wpCheck[0].c);

// Verify in Admin leads
const creds = fs.readFileSync(process.env.HOME + "/.dgs_admin_credentials", "utf8");
let adminEmail = "", adminPass = "";
for (const line of creds.split("\n")) {
  if (line.startsWith("DGS_ADMIN_EMAIL=")) adminEmail = line.split("=")[1].trim();
  if (line.startsWith("DGS_ADMIN_PASSWORD=")) adminPass = line.split("=")[1].trim();
}

const loginRes = await fetch("https://www.dgeniussolutions.com/api/admin/session", {
  method: "POST",
  body: new URLSearchParams({ email: adminEmail, password: adminPass }).toString(),
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  redirect: "manual"
});
const sessionCookie = loginRes.headers.get("set-cookie").split(";")[0];

const adminLeadsRes = await fetch("https://www.dgeniussolutions.com/admin/leads/", {
  headers: { Cookie: sessionCookie }
});
const adminHtml = await adminLeadsRes.text();
console.log("Form 1 lead in /admin/leads/:", adminHtml.includes("test.qa.form1@dgeniussolutions.com"));
console.log("Form 26 lead in /admin/leads/:", adminHtml.includes("test.qa.form26@dgeniussolutions.com"));

await db.end();
console.log("\n=== STEP 9 CONTROLLED SUBMISSIONS COMPLETE ===");
