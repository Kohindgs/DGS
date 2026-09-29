import mysql from "mysql2/promise";
import fs from "node:fs";

for (const envFile of [
  "/home/u188101251/production-app/shared/.env.production",
  "/home/u188101251/production-app/current/.env.production",
  ".env.production",
  ".env.local",
  ".env"
]) {
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
      const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim().replace(/^['"](.*)['"]$/, "$1");
      }
    }
  }
}

async function main() {
  const pool = mysql.createPool({
    host: process.env.DGS_MYSQL_HOST || "127.0.0.1",
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD,
    database: process.env.DGS_MYSQL_DATABASE,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
  });

  const [cols] = await pool.query("DESCRIBE blog_revisions");
  console.log("blog_revisions cols:", cols.map(c => c.Field));

  const [revRows] = await pool.query("SELECT * FROM blog_revisions LIMIT 5");
  console.log(`Total rev rows fetched: ${revRows.length}`);
  for (const r of revRows) {
    const copy = { ...r };
    delete copy.content;
    delete copy.snapshot;
    console.log("REV:", JSON.stringify(copy));
  }

  const [auditRows] = await pool.query("SELECT id, user_id, action, entity_type, entity_id, created_at FROM audit_logs WHERE entity_type = 'blog_post' OR action LIKE '%blog%' ORDER BY created_at DESC");
  console.log(`TOTAL_BLOG_AUDIT_LOGS: ${auditRows.length}`);
  for (const a of auditRows) {
    console.log("AUDIT:", JSON.stringify(a));
  }

  await pool.end();
}

main().catch(console.error);
