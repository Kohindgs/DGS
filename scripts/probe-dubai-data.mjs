import fs from "node:fs";
import mysql from "mysql2/promise";

for (const envFile of [
  "/home/u188101251/production-app/shared/.env.production",
  "/home/u188101251/production-app/current/.env.production",
  ".env.production",
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

async function run() {
  const pool = mysql.createPool(
    process.env.DGS_DATABASE_URL || {
      host: process.env.DGS_MYSQL_HOST,
      user: process.env.DGS_MYSQL_USER,
      password: process.env.DGS_MYSQL_PASSWORD,
      database: process.env.DGS_MYSQL_DATABASE,
      port: Number(process.env.DGS_MYSQL_PORT || 3306),
    }
  );

  const [queryRows] = await pool.query(
    "SELECT page_url, query_text, impressions, clicks, position, prev_position FROM gsc_page_query_metrics WHERE query_text LIKE '%dubai%' OR page_url LIKE '%dubai%'"
  );
  console.log("=== DUBAI QUERY ROWS (" + queryRows.length + ") ===");
  for (const r of queryRows) {
    console.log(`[QUERY] ${r.page_url} | "${r.query_text}" | Imp: ${r.impressions} | Pos: ${r.position} (Prev: ${r.prev_position})`);
  }

  const [pageRows] = await pool.query(
    "SELECT page_url, impressions, clicks, position, prev_position, period_type FROM gsc_page_metrics WHERE page_url LIKE '%dubai%'"
  );
  console.log("\n=== DUBAI PAGE ROWS (" + pageRows.length + ") ===");
  for (const r of pageRows) {
    console.log(`[PAGE] ${r.page_url} | Imp: ${r.impressions} | Clicks: ${r.clicks} | Pos: ${r.position} (Prev: ${r.prev_position}) [${r.period_type}]`);
  }

  await pool.end();
}

run().catch(console.error);
