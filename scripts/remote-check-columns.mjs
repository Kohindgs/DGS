import fs from "node:fs";
import mysql from "mysql2/promise";

async function main() {
  const env = fs.readFileSync("/home/u188101251/production-app/current/.env.production", "utf8");
  const cfg = {};
  for (const line of env.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      const val = line.slice(idx + 1).trim();
      cfg[line.slice(0, idx).trim()] = val.replace(/^['"]/, "").replace(/['"]$/, "");
    }
  }

  const conn = await mysql.createConnection({
    host: cfg.DGS_MYSQL_HOST || "127.0.0.1",
    user: cfg.DGS_MYSQL_USER,
    password: cfg.DGS_MYSQL_PASSWORD,
    database: cfg.DGS_MYSQL_DATABASE,
  });

  const [tables] = await conn.query("SHOW TABLES LIKE 'off_page_automation_runs'");
  console.log("AUTOMATION TABLE:", tables);
  if (tables.length > 0) {
    const [runs] = await conn.query("SELECT * FROM off_page_automation_runs ORDER BY started_at DESC LIMIT 5");
    console.log("RECENT RUNS (" + runs.length + "):", runs);
  }

  await conn.end();
}

main().catch(console.error);
