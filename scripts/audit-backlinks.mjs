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

  console.log("=== BACKLINKS GROUPED BY TARGET URL ===");
  const [backlinks] = await conn.execute(`
    SELECT target_url, 
           COUNT(*) as backlink_count, 
           SUM(dofollow) as dofollow_count, 
           ROUND(AVG(authority_score), 1) as avg_auth
    FROM off_page_backlinks 
    GROUP BY target_url 
    ORDER BY backlink_count DESC
  `);
  console.table(backlinks);

  console.log("\n=== SPECIFIC BACKLINKS FOR SEO OR WEB PAGES ===");
  const [specific] = await conn.execute(`
    SELECT source_domain, target_url, anchor_text, dofollow, authority_score, status
    FROM off_page_backlinks
    WHERE target_url LIKE '%seo%' OR target_url LIKE '%web%'
    LIMIT 30
  `);
  console.table(specific);

  await conn.end();
}

main().catch(console.error);
