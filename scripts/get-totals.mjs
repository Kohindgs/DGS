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

  async function getTotals(start, end) {
    const [rows] = await conn.query(
      "SELECT SUM(clicks) as clicks, SUM(impressions) as impressions, AVG(position) as avg_position, SUM(clicks) / NULLIF(SUM(impressions), 0) as ctr FROM gsc_daily_metrics WHERE metric_date BETWEEN ? AND ?",
      [start, end]
    );
    return {
      clicks: Number(rows[0].clicks || 0),
      impressions: Number(rows[0].impressions || 0),
      avgPosition: Number(Number(rows[0].avg_position || 0).toFixed(1)),
      ctr: Number(rows[0].ctr || 0),
    };
  }

  const maxDate = "2026-09-28";
  const endDate = new Date(maxDate);

  function getRange(days, offsetDays = 0) {
    const end = new Date(endDate);
    end.setDate(end.getDate() - offsetDays);
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    return {
      startStr: start.toISOString().slice(0, 10),
      endStr: end.toISOString().slice(0, 10),
    };
  }

  const w7_c = getRange(7, 0);
  const w7_p = getRange(7, 7);
  const w15_c = getRange(15, 0);
  const w15_p = getRange(15, 15);
  const w28_c = getRange(28, 0);
  const w28_p = getRange(28, 28);

  console.log("=== 7 DAYS ===");
  console.log("Current:", w7_c, await getTotals(w7_c.startStr, w7_c.endStr));
  console.log("Previous:", w7_p, await getTotals(w7_p.startStr, w7_p.endStr));

  console.log("\n=== 15 DAYS ===");
  console.log("Current:", w15_c, await getTotals(w15_c.startStr, w15_c.endStr));
  console.log("Previous:", w15_p, await getTotals(w15_p.startStr, w15_p.endStr));

  console.log("\n=== 28 DAYS ===");
  console.log("Current:", w28_c, await getTotals(w28_c.startStr, w28_c.endStr));
  console.log("Previous:", w28_p, await getTotals(w28_p.startStr, w28_p.endStr));

  await conn.end();
}

main().catch(console.error);
