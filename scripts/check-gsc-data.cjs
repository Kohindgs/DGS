const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  const envContent = fs.readFileSync('/home/u188101251/production-app/.env.production', 'utf8');
  const env = {};
  for (const l of envContent.split('\n')) {
    const idx = l.indexOf('=');
    if (idx > -1) {
      let val = l.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[l.slice(0, idx).trim()] = val;
    }
  }

  const conn = await mysql.createConnection({
    host: env.DGS_MYSQL_HOST || '127.0.0.1',
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE,
  });

  const [countRows] = await conn.execute("SELECT COUNT(*) as cnt, MIN(metric_date) as min_d, MAX(metric_date) as max_d FROM gsc_daily_metrics");
  console.log("gsc_daily_metrics stats:", countRows);

  const [allRows] = await conn.execute("SELECT metric_date, clicks, impressions, ctr, position FROM gsc_daily_metrics ORDER BY metric_date DESC");
  console.log("Total daily rows:", allRows.length);
  console.log("Recent 5 rows:", allRows.slice(0, 5));

  await conn.end();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
