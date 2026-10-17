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

  const [runs] = await conn.execute("SELECT id, status, total_pages, crawled_pages, overall_score, started_at FROM site_audit_runs ORDER BY started_at DESC LIMIT 5");
  console.log("Site Audit Runs:", runs);

  if (runs.length > 0) {
    const [issues] = await conn.execute("SELECT severity, category, issue_code, title, COUNT(*) as count FROM site_audit_issues WHERE audit_run_id = ? GROUP BY severity, category, issue_code, title", [runs[0].id]);
    console.log("Issues in latest run:", issues);

    const [specificIssues] = await conn.execute("SELECT url, severity, issue_code, title FROM site_audit_issues WHERE url LIKE '%seo%' OR url LIKE '%website-development%'");
    console.log("Issues on SEO/Web pages:", specificIssues);
  }

  await conn.end();
}

main().catch(console.error);
