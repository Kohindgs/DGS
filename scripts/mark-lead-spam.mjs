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

  await conn.query("UPDATE leads SET status = 'spam' WHERE name LIKE 'QA_%'");
  const [res] = await conn.query("SELECT COUNT(*) as non_spam FROM leads WHERE name LIKE 'QA_%' AND status != 'spam'");
  console.log("Non-spam QA leads remaining:", res[0].non_spam);

  const [leads] = await conn.query("SELECT id, name, email, status FROM leads WHERE name LIKE 'QA_%'");
  console.log("All QA Leads Status in DB:", JSON.stringify(leads, null, 2));

  await conn.end();
}

main().catch((err) => {
  console.error("Clean error:", err);
  process.exit(1);
});
