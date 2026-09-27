import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const ROOT = process.cwd();
const envCandidates = [
  path.join(ROOT, ".env.production"),
  "/home/u188101251/production-app/.env.production",
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

  const [rows] = await pool.query(`
    SELECT
      query_text,
      page_url,
      clicks,
      prev_clicks,
      impressions,
      prev_impressions,
      position,
      prev_position,
      (clicks - prev_clicks) as click_delta,
      (impressions - prev_impressions) as impression_delta,
      (position - prev_position) as position_delta
    FROM gsc_page_query_metrics
    WHERE period_type = '28d' AND (prev_impressions >= 5 OR impressions >= 5)
  `);

  console.log(`Fetched ${rows.length} candidate query rows with volume >= 5`);

  // Top lost: worst impression loss or click loss or severe position drop
  const lost = [...rows]
    .filter(r => r.click_delta < 0 || r.impression_delta < 0 || r.position_delta >= 3)
    .sort((a, b) => {
      const scoreA = (a.click_delta * 20) + a.impression_delta + (a.position_delta > 0 ? a.position_delta * -2 : 0);
      const scoreB = (b.click_delta * 20) + b.impression_delta + (b.position_delta > 0 ? b.position_delta * -2 : 0);
      return scoreA - scoreB;
    })
    .slice(0, 25);

  console.log("TOP 5 LOST QUERIES SAMPLE:");
  console.table(lost.slice(0, 5).map(r => ({
    query: r.query_text,
    clicks: `${r.prev_clicks} -> ${r.clicks} (${r.click_delta})`,
    impr: `${r.prev_impressions} -> ${r.impressions} (${r.impression_delta})`,
    pos: `${r.prev_position} -> ${r.position} (${r.position_delta > 0 ? '+' : ''}${Number(r.position_delta).toFixed(1)})`
  })));

  // Top gained
  const gained = [...rows]
    .filter(r => r.click_delta > 0 || r.impression_delta > 0 || r.position_delta <= -2)
    .sort((a, b) => {
      const scoreA = (a.click_delta * 20) + a.impression_delta + (a.position_delta < 0 ? Math.abs(a.position_delta) * 2 : 0);
      const scoreB = (b.click_delta * 20) + b.impression_delta + (b.position_delta < 0 ? Math.abs(b.position_delta) * 2 : 0);
      return scoreB - scoreA;
    })
    .slice(0, 25);

  console.log("TOP 5 GAINED QUERIES SAMPLE:");
  console.table(gained.slice(0, 5).map(r => ({
    query: r.query_text,
    clicks: `${r.prev_clicks} -> ${r.clicks} (+${r.click_delta})`,
    impr: `${r.prev_impressions} -> ${r.impressions} (+${r.impression_delta})`,
    pos: `${r.prev_position} -> ${r.position} (${Number(r.position_delta).toFixed(1)})`
  })));

  await pool.end();
}

run().catch(console.error);
