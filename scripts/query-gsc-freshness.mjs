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

  console.log("Connected to MySQL successfully.");

  // Check tables related to GSC
  const [tables] = await conn.query("SHOW TABLES LIKE '%gsc%'");
  console.log("GSC Tables:", tables.map(t => Object.values(t)[0]));

  // Check latest date in gsc_daily_metrics
  const [dateRange] = await conn.query(`
    SELECT 
      MIN(metric_date) as min_date,
      MAX(metric_date) as max_date,
      COUNT(DISTINCT metric_date) as days_count,
      COUNT(*) as total_rows
    FROM gsc_daily_metrics
  `);
  console.log("Date Range in gsc_daily_metrics:", dateRange[0]);

  // Check sync log or integrations
  const [syncTables] = await conn.query("SHOW TABLES LIKE '%sync%'");
  console.log("Sync Tables:", syncTables.map(t => Object.values(t)[0]));

  // Check google_integrations or similar
  const [googleTables] = await conn.query("SHOW TABLES LIKE '%google%'");
  console.log("Google Tables:", googleTables.map(t => Object.values(t)[0]));

  for (const t of googleTables.map(t => Object.values(t)[0])) {
    const [rows] = await conn.query(`SELECT * FROM \`${t}\` LIMIT 3`);
    console.log(`Table ${t} rows:`, rows);
  }

  await conn.end();
}

main().catch(console.error);
