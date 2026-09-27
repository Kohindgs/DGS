import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const ROOT = process.cwd();
const envCandidates = [
  path.join(ROOT, ".env.production"),
  "/home/u188101251/production-app/.env.production",
  path.join(ROOT, ".env.local"),
  path.join(ROOT, ".env"),
];
for (const envFile of envCandidates) {
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim().replace(/^['"](.*)['"]$/, "$1");
      }
    }
  }
}

async function run() {
  const pool = mysql.createPool({
    host: process.env.DGS_MYSQL_HOST,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD,
    database: process.env.DGS_MYSQL_DATABASE
  });

  const [cols] = await pool.query("SHOW COLUMNS FROM gsc_page_query_metrics");
  console.log("COLUMNS:", cols.map((c) => c.Field));

  const [periods] = await pool.query(
    "SELECT DISTINCT period_type, COUNT(*) as cnt FROM gsc_page_query_metrics GROUP BY period_type"
  );
  console.log("PERIOD TYPES:", periods);

  const [sample] = await pool.query(
    "SELECT page_url, query_text, clicks, impressions, position, prev_clicks, prev_impressions, prev_position, period_type FROM gsc_page_query_metrics LIMIT 5"
  );
  console.log("SAMPLE ROWS:\n", JSON.stringify(sample, null, 2));

  // Check how many have non-null/non-zero previous metrics
  const [prevStats] = await pool.query(`
    SELECT
      COUNT(*) as total_rows,
      SUM(CASE WHEN prev_impressions IS NOT NULL AND prev_impressions > 0 THEN 1 ELSE 0 END) as rows_with_prev_impressions,
      SUM(CASE WHEN prev_clicks IS NOT NULL AND prev_clicks > 0 THEN 1 ELSE 0 END) as rows_with_prev_clicks,
      SUM(CASE WHEN prev_position IS NOT NULL AND prev_position > 0 THEN 1 ELSE 0 END) as rows_with_prev_position
    FROM gsc_page_query_metrics
    WHERE period_type = '28d'
  `);
  console.log("PREVIOUS METRICS STATS (28d):", prevStats);

  // Check daily metrics table
  const [dailyStats] = await pool.query(`
    SELECT COUNT(*) as days_count, MIN(metric_date) as min_date, MAX(metric_date) as max_date, SUM(clicks) as total_clicks, SUM(impressions) as total_impressions
    FROM gsc_daily_metrics
  `);
  console.log("DAILY METRICS STATS:", dailyStats);

  await pool.end();
}

run().catch(console.error);
