const fs = require("fs");
const mysql = require("mysql2/promise");

const envContent = fs.readFileSync("/home/u188101251/production-app/shared/.env.production", "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2];
}

const markerEmailArg = process.argv[2];

(async () => {
  const db = await mysql.createConnection(env.DGS_DATABASE_URL || {
    host: env.DGS_MYSQL_HOST,
    port: Number(env.DGS_MYSQL_PORT || 3306),
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE
  });

  let leadRows = [];
  if (markerEmailArg && !markerEmailArg.startsWith("--")) {
    [leadRows] = await db.query("SELECT * FROM leads WHERE email = ? ORDER BY id DESC LIMIT 1", [markerEmailArg]);
  } else {
    [leadRows] = await db.query("SELECT * FROM leads WHERE source_form_key = 'fluentform-3' ORDER BY id DESC LIMIT 1");
  }

  if (leadRows.length === 0) {
    console.log("No Form 3 lead found in leads table yet.");
    await db.end();
    return;
  }
  const lead = leadRows[0];
  const markerEmail = lead.email;
  console.log("=== VERIFYING STEP 8 DB & CMS RECORDS FOR:", markerEmail, "===");
  console.log("E. Lead row created: true (ID: " + lead.id + ")");
  console.log("   Lead ID:", lead.id);
  console.log("   H. source_form_key:", lead.source_form_key);
  console.log("   I. source route:", lead.source_route);
  console.log("   J & K. Name stored:", lead.name);
  console.log("   L. Email stored:", lead.email);
  console.log("   M. Phone stored:", lead.phone);
  console.log("   N. Company stored:", lead.company);

  const payload = typeof lead.payload === "string" ? JSON.parse(lead.payload) : lead.payload;
  console.log("   O. Website URL stored in payload:", payload.fields?.url);
  console.log("   P. Service selection stored:", payload.fields?.dropdown);
  console.log("   Q. Referral selection stored:", payload.fields?.dropdown_1);
  console.log("   R. Server-owned hidden field contains SEO Page:", payload.fields?.hidden === "SEO Page");

  // F & G: Verify row in form_submissions
  const [subRows] = await db.query("SELECT * FROM form_submissions WHERE lead_id = ? ORDER BY id DESC LIMIT 1", [lead.id]);
  console.log("F. form_submissions row created:", subRows.length > 0);
  const sub = subRows[0];
  console.log("   G. provider:", sub?.provider);
  console.log("   Submission ID:", sub?.id);

  // D: Confirm NO new row in wpcl_fluentform_submissions
  const [wpRows] = await db.query("SELECT COUNT(*) as count FROM wpcl_fluentform_submissions WHERE response LIKE ?", [`%${markerEmail}%`]);
  console.log("D. No WordPress submission used (count in wpcl_fluentform_submissions):", wpRows[0].count === 0);

  // T: Check Admin leads page
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
  console.log("T. Lead appears in /admin/leads/:", adminHtml.includes(markerEmail) || adminHtml.includes("DGS QA"));

  await db.end();
  console.log("=== VERIFICATION SCRIPT FINISHED ===");
})();
