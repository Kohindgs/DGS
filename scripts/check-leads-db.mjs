import mysql from "mysql2/promise";
import fs from "node:fs";

async function main() {
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

  const [subs] = await conn.query(
    "SELECT id, form_key, source_route, notification_status, notification_recipient, notification_message_id, created_at FROM form_submissions ORDER BY created_at DESC LIMIT 6"
  );
  console.log("Latest Form Submissions with Notification Tracking:");
  console.log(JSON.stringify(subs, null, 2));

  const [leads] = await conn.query(
    "SELECT id, name, email, status, created_at FROM leads WHERE name LIKE 'QA_%' ORDER BY created_at DESC"
  );
  console.log("QA Test Leads in Database (Hygiene Check):");
  console.log(JSON.stringify(leads, null, 2));

  await conn.end();
}

main().catch((err) => {
  console.error("Check leads error:", err);
  process.exit(1);
});
