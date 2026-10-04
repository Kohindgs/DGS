import mysql from "mysql2/promise";
import fs from "node:fs";

function loadEnv() {
  const content = fs.readFileSync(".env.production", "utf8");
  const config = {};
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      config[m[1]] = val;
    }
  }
  return config;
}

const env = loadEnv();

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE,
  });

  console.log("==================================================");
  console.log("GSC DATA FRESHNESS & DAILY METRICS");
  console.log("==================================================");

  const [dateSummary] = await conn.query(`
    SELECT 
      MIN(metric_date) as min_date,
      MAX(metric_date) as max_date,
      COUNT(DISTINCT metric_date) as days_count
    FROM gsc_daily_metrics
  `);
  console.log("Date summary:", dateSummary[0]);

  const [daily] = await conn.query(`
    SELECT metric_date, clicks, impressions, ctr, position 
    FROM gsc_daily_metrics 
    ORDER BY metric_date DESC 
    LIMIT 20
  `);
  console.log("\nRecent Daily Metrics:");
  console.table(
    daily.map((d) => ({
      date: new Date(d.metric_date).toISOString().slice(0, 10),
      clicks: d.clicks,
      impressions: d.impressions,
      ctr: (d.ctr * 100).toFixed(2) + "%",
      position: Number(d.position).toFixed(1),
    }))
  );

  const [syncRuns] = await conn.query(`
    SELECT id, status, clicks, impressions, window_start, window_end, rows_fetched, started_at, completed_at 
    FROM gsc_sync_runs 
    ORDER BY started_at DESC 
    LIMIT 3
  `);
  console.log("\nRecent Sync Runs:");
  console.log(JSON.stringify(syncRuns, null, 2));

  // Check gsc_page_query_metrics date range if any
  const [pqCols] = await conn.query("DESCRIBE gsc_page_query_metrics");
  console.log("\ngsc_page_query_metrics columns:", pqCols.map((c) => c.Field));

  const [pqSummary] = await conn.query(`
    SELECT 
      MIN(metric_date) as min_date,
      MAX(metric_date) as max_date,
      COUNT(DISTINCT metric_date) as days_count,
      COUNT(*) as total_rows
    FROM gsc_page_query_metrics
  `);
  console.log("gsc_page_query_metrics date summary:", pqSummary[0]);

  await conn.end();
}

main().catch(console.error);
