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

const candidatePaths = [
  "/motion-graphics/",
  "/seo-pricing/",
  "/ai-motion-graphic-designer/",
  "/indriya-test/",
  "/social-media-executive/",
  "/seo-executive-assessment/",
  "/seo-manager-assessment/",
  "/wp-file-download-search/",
  "/aeo-services-mumbai-google-ads-landing-page/",
  "/ai-production-videos-google-ads-landing-page/",
  "/seo-services-mumbai-google-ads-landing-page/",
  "/website-development-services-in-mumbai-dgenius-solutions/",
];

console.log("=== CHECKING CANDIDATE ROUTES GSC TELEMETRY & TRAFFIC ===");

for (const p of candidatePaths) {
  const fullUrl = `https://www.dgeniussolutions.com${p}`;
  const fullUrlNoSlash = fullUrl.replace(/\/$/, "");

  const [pageRows] = await pool.query(
    `SELECT page_url, clicks, impressions, ctr, position, period_type, updated_at
     FROM gsc_page_metrics
     WHERE page_url = ? OR page_url = ?
     ORDER BY updated_at DESC LIMIT 1`,
    [fullUrl, fullUrlNoSlash]
  );

  const [queryRows] = await pool.query(
    `SELECT query_text, clicks, impressions, position
     FROM gsc_page_query_metrics
     WHERE page_url = ? OR page_url = ?
     ORDER BY impressions DESC LIMIT 5`,
    [fullUrl, fullUrlNoSlash]
  );

  console.log(`\nRoute: ${p}`);
  if (pageRows.length > 0) {
    const k = pageRows[0];
    console.log(`  28d Clicks: ${k.clicks}, Impressions: ${k.impressions}, CTR: ${k.ctr}, Pos: ${k.position}`);
  } else {
    console.log(`  28d Telemetry: ZERO recorded page metrics in GSC.`);
  }

  if (queryRows.length > 0) {
    console.log(`  Top queries:`);
    queryRows.forEach(q => console.log(`    - "${q.query_text}": Imp ${q.impressions}, Clicks ${q.clicks}, Pos ${q.position}`));
  } else {
    console.log(`  Top queries: NONE`);
  }
}

await pool.end();
