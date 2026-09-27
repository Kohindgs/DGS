import fs from "fs";
import mysql from "mysql2/promise";

function loadEnvFile(filepath) {
  if (!fs.existsSync(filepath)) return;
  const lines = fs.readFileSync(filepath, "utf8").split("\n");
  for (const l of lines) {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      const k = trimmed.slice(0, idx).trim();
      let v = trimmed.slice(idx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[k] = v;
    }
  }
}

loadEnvFile("/home/u188101251/production-app/shared/.env.production");
loadEnvFile("/home/u188101251/production-app/current/.env.production");

const pool = process.env.DGS_DATABASE_URL
  ? mysql.createPool(process.env.DGS_DATABASE_URL)
  : mysql.createPool({
      host: process.env.DGS_MYSQL_HOST || "127.0.0.1",
      port: Number(process.env.DGS_MYSQL_PORT || 3306),
      user: process.env.DGS_MYSQL_USER,
      password: process.env.DGS_MYSQL_PASSWORD || "",
      database: process.env.DGS_MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 5,
    });

const targetPaths = [
  "/services/ai-video-production-agency/",
  "/services/dubai-seo/",
  "/aeo-dubai/",
  "/services/aeo-services-in-mumbai/",
  "/services/geo/",
  "/services/llm-seo-service/",
];

console.log("=== STRATEGIC PAGES GSC 28-DAY PERFORMANCE & RANKINGS ===");

for (const p of targetPaths) {
  const fullUrl = `https://www.dgeniussolutions.com${p}`;
  console.log(`\n------------------------------------------------------------`);
  console.log(`PAGE: ${p}`);

  try {
    const [pageRows] = await pool.query(
      `SELECT page_url, clicks, impressions, ctr, position, prev_position, prev_clicks, prev_impressions, period_type, updated_at
       FROM gsc_page_metrics
       WHERE page_url = ? OR page_url = ?
       ORDER BY updated_at DESC
       LIMIT 1`,
      [fullUrl, fullUrl.replace(/\/$/, "")]
    );

    if (pageRows.length > 0) {
      const kpi = pageRows[0];
      console.log(`  28-Day Clicks:      ${kpi.clicks ?? 0} (Prev: ${kpi.prev_clicks ?? "N/A"})`);
      console.log(`  28-Day Impressions: ${kpi.impressions ?? 0} (Prev: ${kpi.prev_impressions ?? "N/A"})`);
      console.log(`  Average CTR:        ${kpi.ctr ? (Number(kpi.ctr) * 100).toFixed(2) + "%" : "0.00%"}`);
      console.log(`  Average Position:   ${kpi.position ? Number(kpi.position).toFixed(1) : "N/A"} (Prev: ${kpi.prev_position ? Number(kpi.prev_position).toFixed(1) : "N/A"})`);
      console.log(`  Period Type:        ${kpi.period_type} (Last Synced: ${kpi.updated_at})`);
    } else {
      console.log(`  28-Day Telemetry:   No synced GSC record in gsc_page_metrics.`);
    }
  } catch (err) {
    console.log(`  Page query error: ${err.message}`);
  }

  try {
    const [queryRows] = await pool.query(
      `SELECT query_text, clicks, impressions, ctr, position, prev_position
       FROM gsc_page_query_metrics
       WHERE page_url = ? OR page_url = ?
       ORDER BY impressions DESC
       LIMIT 5`,
      [fullUrl, fullUrl.replace(/\/$/, "")]
    );
    if (queryRows.length > 0) {
      console.log(`  Top 5 Indexed Queries by Impressions:`);
      queryRows.forEach((q, idx) => {
        console.log(`    [${idx + 1}] "${q.query_text}" — Imp: ${q.impressions}, Clicks: ${q.clicks}, Pos: ${Number(q.position).toFixed(1)} (Prev Pos: ${q.prev_position ? Number(q.prev_position).toFixed(1) : "N/A"})`);
      });
    } else {
      console.log(`  Top Queries: None recorded in gsc_page_query_metrics.`);
    }
  } catch (err) {
    console.log(`  Query error: ${err.message}`);
  }
}

await pool.end();
console.log("\nQuery complete.");
