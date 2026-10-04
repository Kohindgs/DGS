const mysql = require('mysql2/promise');
const fs = require('fs');

for (const envFile of [
  "/home/u188101251/production-app/shared/.env.production",
  "/home/u188101251/production-app/current/.env.production",
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
  const conn = await mysql.createConnection({
    host: process.env.DGS_MYSQL_HOST || "127.0.0.1",
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD,
    database: process.env.DGS_MYSQL_DATABASE,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
  });

  const [runs] = await conn.execute("SELECT id, status, total_pages, crawled_pages, overall_score, created_at, completed_at FROM site_audit_runs ORDER BY created_at DESC LIMIT 3");
  console.log("=== SITE AUDIT RUNS ===");
  console.log(JSON.stringify(runs, null, 2));

  const [updates] = await conn.execute("SELECT id, title, assessment_status, site_policy_compliance, checks_performed, assessment_date FROM google_search_updates WHERE id = '7c962b96-e229-40b5-839a-51893cf2db36'");
  console.log("=== SPAM UPDATE RECORD ===");
  console.log(JSON.stringify(updates, null, 2));

  await conn.end();
}

main().catch(console.error);
