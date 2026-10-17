import fs from "node:fs";
import mysql from "mysql2/promise";

async function main() {
  const env = fs.readFileSync("/home/u188101251/production-app/current/.env.production", "utf8");
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

  // Clean any active QA leads
  await conn.query(
    "UPDATE leads SET status = 'spam' WHERE status != 'spam' AND (email LIKE 'qa_%' OR name LIKE 'QA_%')"
  );

  const [[{ activeQaLeads }]] = await conn.query(
    "SELECT COUNT(*) as activeQaLeads FROM leads WHERE status != 'spam' AND (email LIKE 'qa_%' OR name LIKE 'QA_%')"
  );

  const [[{ totalQaLeads }]] = await conn.query(
    "SELECT COUNT(*) as totalQaLeads FROM leads WHERE email LIKE 'qa_%' OR name LIKE 'QA_%'"
  );

  const [[{ spamQaLeads }]] = await conn.query(
    "SELECT COUNT(*) as spamQaLeads FROM leads WHERE status = 'spam' AND (email LIKE 'qa_%' OR name LIKE 'QA_%')"
  );

  console.log(JSON.stringify({ activeQaLeads, totalQaLeads, spamQaLeads }));
  await conn.end();
}

main().catch((err) => {
  console.error("Hygiene check error:", err);
  process.exit(1);
});
