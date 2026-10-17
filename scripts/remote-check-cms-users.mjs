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

  const [users] = await conn.query("SELECT id, email, display_name, role, is_active FROM cms_users");
  console.log("CMS USERS:", JSON.stringify(users, null, 2));

  const [sessions] = await conn.query("SELECT id, user_id, expires_at FROM cms_sessions WHERE expires_at > NOW()");
  console.log("ACTIVE SESSIONS COUNT:", sessions.length);

  await conn.end();
}

main().catch(console.error);
