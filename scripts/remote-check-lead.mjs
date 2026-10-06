import fs from "node:fs";
import mysql from "mysql2/promise";

async function main() {
  const leadId = process.argv[2];
  const submissionId = process.argv[3];
  const markSpam = process.argv[4] === "spam";

  let envPath = "/home/u188101251/production-app/current/.env.production";
  if (!fs.existsSync(envPath)) {
    envPath = ".env.production";
  }
  const env = fs.readFileSync(envPath, "utf8");
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

  let lead = null;
  if (leadId) {
    const [rows] = await conn.query(
      "SELECT id, source_form_key, source_route, name, email, phone, company, status, created_at, payload FROM leads WHERE id = ?",
      [leadId]
    );
    lead = rows[0] || null;
  }

  let sub = null;
  if (submissionId) {
    const [rows] = await conn.query(
      "SELECT id, form_key, source_route, lead_id, provider, notification_status, notification_recipient, notification_message_id, notification_error, created_at, payload FROM form_submissions WHERE id = ?",
      [submissionId]
    );
    sub = rows[0] || null;
  }

  if (markSpam && leadId) {
    await conn.query("UPDATE leads SET status = 'spam' WHERE id = ?", [leadId]);
    console.log(`[CLEANUP] Marked lead ${leadId} as SPAM`);
  }

  console.log(JSON.stringify({ lead, sub }, null, 2));
  await conn.end();
}

main().catch(err => {
  console.error("Error in remote-check-lead:", err);
  process.exit(1);
});
