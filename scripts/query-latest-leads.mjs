import fs from "node:fs";
import mysql from "mysql2/promise";

async function main() {
  let envPath = "/home/u188101251/production-app/current/.env.production";
  if (!fs.existsSync(envPath)) envPath = ".env.production";
  const env = fs.readFileSync(envPath, "utf8");
  const cfg = {};
  for (const line of env.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) cfg[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, "$1");
  }

  const conn = await mysql.createConnection({
    host: cfg.DGS_MYSQL_HOST || "127.0.0.1",
    user: cfg.DGS_MYSQL_USER,
    password: cfg.DGS_MYSQL_PASSWORD,
    database: cfg.DGS_MYSQL_DATABASE,
  });

  const [leads] = await conn.query("SELECT id, source_form_key, source_route, name, email, phone, company, status, created_at FROM leads ORDER BY created_at DESC LIMIT 5");
  const [subs] = await conn.query("SELECT id, form_key, source_route, lead_id, notification_status, notification_recipient, notification_message_id, notification_error, created_at FROM form_submissions ORDER BY created_at DESC LIMIT 5");

  console.log("=== LATEST LEADS ===");
  console.log(JSON.stringify(leads, null, 2));
  console.log("\n=== LATEST SUBMISSIONS ===");
  console.log(JSON.stringify(subs, null, 2));

  await conn.end();
}

main().catch(console.error);
