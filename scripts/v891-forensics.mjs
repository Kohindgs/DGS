import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const ROOT = process.cwd();
const envFile = path.join(ROOT, ".env.production");
if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }
}

async function main() {
  const pool = mysql.createPool(process.env.DGS_DATABASE_URL || {
    host: process.env.DGS_MYSQL_HOST,
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD,
    database: process.env.DGS_MYSQL_DATABASE,
  });

  const [pm] = await pool.query("SELECT * FROM gsc_page_metrics WHERE page_url LIKE '%cmsmasters%'");
  console.log("gsc_page_metrics matching cmsmasters:", pm);

  const [pq] = await pool.query("SELECT * FROM gsc_page_query_metrics WHERE page_url LIKE '%cmsmasters%'");
  console.log("gsc_page_query_metrics matching cmsmasters:", pq);

  // Check our-services metrics
  const [osPm] = await pool.query("SELECT * FROM gsc_page_metrics WHERE page_url LIKE '%/our-services/%' OR page_url LIKE '%/services/%'");
  console.log("our-services and services metrics:", osPm);

  await pool.end();
}

main().catch(console.error);
