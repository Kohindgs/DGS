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

  const [dates] = await conn.query(`
    SELECT 
      DATE_FORMAT(metric_date, '%Y-%m-%d') as date, 
      SUM(clicks) as clicks, 
      SUM(impressions) as impressions, 
      ROUND(AVG(ctr) * 100, 2) as avg_ctr_pct,
      ROUND(AVG(position), 1) as avg_pos, 
      COUNT(*) as query_count 
    FROM gsc_daily_metrics 
    GROUP BY metric_date 
    ORDER BY metric_date DESC 
    LIMIT 20
  `);
  console.table(dates);

  const [runs] = await conn.query(`
    SELECT id, status, clicks, impressions, ROUND(ctr * 100, 2) as ctr_pct, ROUND(position, 1) as pos, 
           DATE_FORMAT(window_start, '%Y-%m-%d') as w_start, 
           DATE_FORMAT(window_end, '%Y-%m-%d') as w_end, 
           rows_fetched, rows_stored, started_at 
    FROM gsc_sync_runs 
    ORDER BY started_at DESC 
    LIMIT 5
  `);
  console.log("Recent Sync Runs:");
  console.table(runs);

  await conn.end();
}

main().catch(console.error);
