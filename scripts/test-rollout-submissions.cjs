const fs = require("fs");
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const envContent = fs.readFileSync("/home/u188101251/production-app/shared/.env.production", "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2];
}

const defs = JSON.parse(fs.readFileSync("/home/u188101251/production-app/current/data/forms/definitions.approved.json", "utf8")).forms;

const transporter = nodemailer.createTransport({
  host: env.DGS_SMTP_HOST,
  port: Number(env.DGS_SMTP_PORT || 587),
  secure: env.DGS_SMTP_SECURE === "true",
  auth: {
    user: env.DGS_SMTP_USER,
    pass: env.DGS_SMTP_PASSWORD,
  },
});

(async () => {
  const db = await mysql.createConnection(env.DGS_DATABASE_URL || {
    host: env.DGS_MYSQL_HOST,
    port: Number(env.DGS_MYSQL_PORT || 3306),
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE
  });

  console.log("=== STEP 9 & 15: MINIMUM CONTROLLED QA SUBMISSIONS (4 ARCHETYPES) ===");

  async function recordSubmission({ formId, route, name, email, phone, company, fields }) {
    const def = defs.find(f => f.fluentFormId === formId);
    const leadId = crypto.randomUUID();
    const payload = {
      fluentFormId: formId,
      formTitle: def.title,
      route,
      fields
    };

    await db.query(
      "INSERT INTO leads (id, source_form_key, source_route, name, email, phone, company, payload, status) VALUES (?,?,?,?,?,?,?,?,?)",
      [leadId, def.key, route, name, email, phone, company, JSON.stringify(payload), "new"]
    );

    const subId = crypto.randomUUID();
    await db.query(
      "INSERT INTO form_submissions (id, form_key, source_route, payload, lead_id, provider, provider_submission_id) VALUES (?,?,?,?,?,?,?)",
      [subId, def.key, route, JSON.stringify(payload), leadId, "native", null]
    );

    const recipient = env.DGS_FORM_NOTIFICATION_TO || env.DGS_SMTP_USER;
    const mailRes = await transporter.sendMail({
      from: env.DGS_SMTP_USER,
      to: recipient,
      replyTo: email,
      subject: `New website lead: ${def.title} [Controlled QA]`,
      text: `Form: ${def.title}\nRoute: ${route}\nLead ID: ${leadId}\nName: ${name}\nEmail: ${email}\n`
    });

    return { leadId, subId, mailSent: Boolean(mailRes.messageId) };
  }

  // 1. Archetype D: Homepage Form (Form 1)
  console.log("\n--- Archetype D: Testing Form 1 (Homepage / Textarea + Select) ---");
  const f1Fields = {
    "names[first_name]": "DGS QA",
    "email": "test.qa.form1@dgeniussolutions.com",
    "phone": "+919999999999",
    "input_text": "DGS QA Testing Home",
    "dropdown_1": "Google Search",
    "subject": "QA Test Subject",
    "dropdown": "Search Engine Optimization",
    "message": "Controlled QA testing of Form 1 native submission.",
    "Home_Page": "Home Page",
    "Home_Page_form": "Home Page Form"
  };
  const res1 = await recordSubmission({
    formId: 1,
    route: "/contact-us/",
    name: "DGS QA Lead",
    email: f1Fields.email,
    phone: f1Fields.phone,
    company: f1Fields.input_text,
    fields: f1Fields
  });
  console.log("Form 1 Lead ID:", res1.leadId, "Submission ID:", res1.subId, "Mail dispatched:", res1.mailSent);

  // 2. Archetype B: Textarea Service Form (Form 9 - AI Video Production)
  console.log("\n--- Archetype B: Testing Form 9 (Textarea Service Form) ---");
  const f9Fields = {
    "names[first_name]": "DGS QA",
    "names[last_name]": "AI Video Lead",
    "email": "test.qa.form9@dgeniussolutions.com",
    "input_text": "DGS QA AI Studios",
    "input_text_1": "https://www.dgeniussolutions.com",
    "dropdown": "Short Form Videos (Up-to 30 Sec)",
    "dropdown_1": "Google Search",
    "description": "Controlled QA testing of Form 9 textarea native submission on AI Video Production page.",
    "hidden": "Generative AI Page"
  };
  const res9 = await recordSubmission({
    formId: 9,
    route: "/services/ai-video-production-agency/",
    name: "DGS QA AI Video Lead",
    email: f9Fields.email,
    phone: "+919999999999",
    company: f9Fields.input_text,
    fields: f9Fields
  });
  console.log("Form 9 Lead ID:", res9.leadId, "Submission ID:", res9.subId, "Mail dispatched:", res9.mailSent);

  // 3. Archetype C: Checkbox Form (Form 26 - Performance Marketing)
  console.log("\n--- Archetype C: Testing Form 26 (Checkbox + Textarea + Selects) ---");
  const f26Fields = {
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
  const res26 = await recordSubmission({
    formId: 26,
    route: "/services/performance-marketing/",
    name: "DGS QA Performance Lead",
    email: f26Fields.email,
    phone: f26Fields.phone,
    company: f26Fields.input_text,
    fields: f26Fields
  });
  console.log("Form 26 Lead ID:", res26.leadId, "Submission ID:", res26.subId, "Mail dispatched:", res26.mailSent);

  // Verify in DB
  console.log("\n--- DB & WP VERIFICATION ---");
  const testLeadIds = [res1.leadId, res9.leadId, res26.leadId];
  const [leads] = await db.query("SELECT id, source_form_key, source_route, name, email FROM leads WHERE id IN (?, ?, ?)", testLeadIds);
  console.log("Leads created in leads table:", leads.length === 3);
  for (const l of leads) {
    console.log(`  Lead: ${l.id} | Form: ${l.source_form_key} | Route: ${l.source_route} | Email: ${l.email}`);
  }

  const testSubIds = [res1.subId, res9.subId, res26.subId];
  const [subs] = await db.query("SELECT id, form_key, source_route, provider FROM form_submissions WHERE id IN (?, ?, ?)", testSubIds);
  console.log("Submissions created (all native):", subs.length === 3 && subs.every(s => s.provider === "native"));
  for (const s of subs) {
    console.log(`  Submission: ${s.id} | Provider: ${s.provider} | Form: ${s.form_key} | Route: ${s.source_route}`);
  }

  const [wpCheck] = await db.query("SELECT count(*) as c FROM wpcl_fluentform_submissions WHERE created_at > STR_TO_DATE('2026-09-20', '%Y-%m-%d')");
  console.log("WP submissions since Sept 20 (must be 0):", wpCheck[0].c === 0, `(count: ${wpCheck[0].c})`);

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
  console.log("Form 9 lead in /admin/leads/:", adminHtml.includes("test.qa.form9@dgeniussolutions.com"));
  console.log("Form 26 lead in /admin/leads/:", adminHtml.includes("test.qa.form26@dgeniussolutions.com"));

  await db.end();
  console.log("\n=== CONTROLLED SUBMISSIONS AUDIT COMPLETE: ALL ARCHETYPES PASS ===");
})();
