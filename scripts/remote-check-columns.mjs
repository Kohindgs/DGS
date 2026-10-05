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

  const [rows] = await conn.query("SELECT id, source_url, status, http_status, notes FROM off_page_backlinks");
  console.log("BACKLINK NOTES:", rows);
  await conn.end();
}

main().catch(console.error);
