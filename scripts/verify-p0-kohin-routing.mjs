import mysql from "mysql2/promise";
import fs from "node:fs";

async function main() {
  console.log("=============================================================");
  console.log("=== DGS P0 NOTIFICATION ROUTING — LIVE VERIFICATION SUITE ===");
  console.log("=============================================================\n");

  const env = fs.readFileSync(".env.production", "utf8");
  const cfg = {};
  for (const line of env.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      cfg[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }

  const conn = await mysql.createConnection({
    host: cfg.DGS_MYSQL_HOST || "127.0.0.1",
    user: cfg.DGS_MYSQL_USER,
    password: cfg.DGS_MYSQL_PASSWORD,
    database: cfg.DGS_MYSQL_DATABASE,
  });

  console.log("Connected to MariaDB production database.");

  // TEST 1: REJECTION OF FORBIDDEN CLIENT KEYS (to, cc, bcc, recipient)
  console.log("\n--- TEST 1: Security Guard — Reject Client-Supplied Recipient Overrides ---");
  const forbiddenPayload = {
    fluentFormId: 1,
    route: "/",
    fields: {
      "names[first_name]": "Attacker",
      "email": "attacker@evil.com",
      "phone": "+919876543210",
      "to": "victim@somewhere.com",
    },
  };
  const secRes = await fetch("https://www.dgeniussolutions.com/api/forms/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(forbiddenPayload),
  });
  const secJson = await secRes.json();
  console.log(`Forbidden 'to' injection response HTTP ${secRes.status}:`, secJson);
  if (secRes.status !== 400 || !secJson.message.includes("Unexpected")) {
    throw new Error(`SECURITY VULNERABILITY: Client was able to supply 'to' parameter! HTTP ${secRes.status}`);
  }
  console.log("✓ PASSED: Server strictly rejected client-supplied 'to' recipient override with HTTP 400");

  // TEST 2: CONTROLLED "LET'S TALK" SUBMISSION
  console.log("\n--- TEST 2: Controlled 'Let's Talk' Form Submission ---");
  const letstalkPayload = {
    fluentFormId: 1,
    route: "/",
    fields: {
      "names[first_name]": "QA_TEST_LETS_TALK",
      "email": "qa_test_letstalk@dgeniussolutions.com",
      "phone": "+919987922901",
      "input_text": "QA Let's Talk Corp",
      "dropdown_1": "Google Search",
      "subject": "Let's Talk — P0 Verification",
      "dropdown": "Search Engine Optimization",
      "message": "Testing automated single-recipient routing to kohin@dgeniussolutions.com",
    },
    pageUrl: "https://www.dgeniussolutions.com/#lets-talk-form",
    utm: { source: "qa_verification", medium: "test", campaign: "p0_kohin_routing" },
  };

  const ltRes = await fetch("https://www.dgeniussolutions.com/api/forms/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(letstalkPayload),
  });
  const ltJson = await ltRes.json();
  console.log("Let's Talk API Response:", ltJson);
  if (!ltJson.ok || !ltJson.submissionId || !ltJson.leadId) {
    throw new Error(`Let's Talk submission failed: ${JSON.stringify(ltJson)}`);
  }

  // TEST 3: CONTROLLED "CONTACT US" SUBMISSION
  console.log("\n--- TEST 3: Controlled 'Contact Us' Form Submission ---");
  const contactPayload = {
    fluentFormId: 1,
    route: "/contact-us/",
    fields: {
      "names[first_name]": "QA_TEST_CONTACT",
      "email": "qa_test_contact@dgeniussolutions.com",
      "phone": "+919987922901",
      "input_text": "QA Contact Us Corp",
      "dropdown_1": "Word of Mouth",
      "subject": "Contact Form — P0 Verification",
      "dropdown": "Branding",
      "message": "Testing automated single-recipient routing to kohin@dgeniussolutions.com from Contact Us page",
    },
    pageUrl: "https://www.dgeniussolutions.com/contact-us/",
    utm: { source: "qa_contact", medium: "organic", campaign: "p0_kohin_routing" },
  };

  const ctRes = await fetch("https://www.dgeniussolutions.com/api/forms/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactPayload),
  });
  const ctJson = await ctRes.json();
  console.log("Contact Us API Response:", ctJson);
  if (!ctJson.ok || !ctJson.submissionId || !ctJson.leadId) {
    throw new Error(`Contact Us submission failed: ${JSON.stringify(ctJson)}`);
  }

  // TEST 4: CONTROLLED SERVICE AUDIT SUBMISSION (Form 3)
  console.log("\n--- TEST 4: Controlled Service Audit (Form 3) Submission ---");
  const servicePayload = {
    fluentFormId: 3,
    route: "/services/dubai-seo/",
    fields: {
      "names[first_name]": "QA_TEST_SERVICE",
      "names[last_name]": "AUDIT",
      "email": "qa_test_service@dgeniussolutions.com",
      "phone": "+919987922901",
      "input_text": "QA Dubai SEO Corp",
      "message": "Testing automated single-recipient routing for Free SEO Audit Form",
    },
    pageUrl: "https://www.dgeniussolutions.com/services/dubai-seo/",
  };

  const srvRes = await fetch("https://www.dgeniussolutions.com/api/forms/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(servicePayload),
  });
  const srvJson = await srvRes.json();
  console.log("Service Form API Response:", srvJson);
  if (!srvJson.ok || !srvJson.submissionId || !srvJson.leadId) {
    throw new Error(`Service form submission failed: ${JSON.stringify(srvJson)}`);
  }

  // TEST 5: CONTROLLED CAREERS / JOB APPLICATION SUBMISSION
  console.log("\n--- TEST 5: Controlled Career Application Submission ---");
  const fakeCvPdf = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n");
  const formData = new FormData();
  formData.append("name", "QA_TEST_CAREER");
  formData.append("email", "qa_test_career@dgeniussolutions.com");
  formData.append("phone", "+919987922901");
  formData.append("position", "Generative AI Artist");
  formData.append("location", "Mumbai");
  formData.append("experience", "3 Years");
  formData.append("company", "QA Test Studios");
  formData.append("currentSalary", "80,000");
  formData.append("expectedSalary", "1,00,000");
  formData.append("noticePeriod", "Immediate");
  formData.append("portfolioUrl", "https://dgeniussolutions.com/portfolio");
  formData.append("consent", "true");
  formData.append("resume", new Blob([fakeCvPdf], { type: "application/pdf" }), "QA_Candidate_CV.pdf");

  const carRes = await fetch("https://www.dgeniussolutions.com/api/career/apply", {
    method: "POST",
    body: formData,
  });
  const carJson = await carRes.json();
  console.log("Career Application API Response:", carJson);
  if (!carJson.ok || !carJson.submissionId || !carJson.leadId) {
    throw new Error(`Career application submission failed: ${JSON.stringify(carJson)}`);
  }

  // VERIFY DATABASE RECORDS & NOTIFICATION TRACKING
  console.log("\n--- VERIFYING MARIADB SUBMISSION RECORDS & NOTIFICATION STATUS ---");
  const submissionIds = [ltJson.submissionId, ctJson.submissionId, srvJson.submissionId, carJson.submissionId];
  const leadIds = [ltJson.leadId, ctJson.leadId, srvJson.leadId, carJson.leadId];

  for (let i = 0; i < submissionIds.length; i++) {
    const subId = submissionIds[i];
    const [subRows] = await conn.query("SELECT * FROM form_submissions WHERE id = ?", [subId]);
    const sub = subRows[0];
    console.log(`\nSubmission ${i + 1} (${sub.form_key} from ${sub.source_route}):`);
    console.log(`  - ID: ${sub.id}`);
    console.log(`  - Lead ID: ${sub.lead_id}`);
    console.log(`  - Provider: ${sub.provider}`);
    console.log(`  - Notification Status: ${sub.notification_status}`);
    console.log(`  - Notification Recipient: ${sub.notification_recipient}`);
    console.log(`  - Notification Message ID: ${sub.notification_message_id}`);
    console.log(`  - Notification Error: ${sub.notification_error || "None"}`);

    if (sub.notification_recipient !== "kohin@dgeniussolutions.com") {
      throw new Error(`RECIPIENT VIOLATION: Expected kohin@dgeniussolutions.com, got ${sub.notification_recipient}`);
    }
  }

  // CLEAN UP TEST LEADS FOR REPORTING HYGIENE
  console.log("\n--- CLEANING UP TEST LEADS (Marking status = 'spam' for reporting hygiene) ---");
  for (const leadId of leadIds) {
    await conn.query("UPDATE leads SET status = 'spam' WHERE id = ?", [leadId]);
    console.log(`Marked test lead ${leadId} as SPAM`);
  }

  await conn.end();
  console.log("\n=======================================================");
  console.log("✓ ALL P0 NOTIFICATION ROUTING CHECKS PASSED PERFECTLY!");
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("VERIFICATION FAILED:", err);
  process.exit(1);
});
