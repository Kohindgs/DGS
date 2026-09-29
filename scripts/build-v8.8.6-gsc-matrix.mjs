import fs from "node:fs";
import mysql from "mysql2/promise";

for (const envFile of [
  "/home/u188101251/production-app/shared/.env.production",
  "/home/u188101251/production-app/current/.env.production",
  ".env.production",
]) {
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
      const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim().replace(/^['"](.*)['"]$/, "$1");
      }
    }
  }
}

async function run() {
  const pool = mysql.createPool(
    process.env.DGS_DATABASE_URL || {
      host: process.env.DGS_MYSQL_HOST,
      user: process.env.DGS_MYSQL_USER,
      password: process.env.DGS_MYSQL_PASSWORD,
      database: process.env.DGS_MYSQL_DATABASE,
      port: Number(process.env.DGS_MYSQL_PORT || 3306),
    }
  );

  const targetPages = [
    "https://www.dgeniussolutions.com/",
    "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
    "https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/",
    "https://www.dgeniussolutions.com/services/geo/",
    "https://www.dgeniussolutions.com/services/llm-seo-service/",
    "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
    "https://www.dgeniussolutions.com/services/ai-production-dubai-page/",
    "https://www.dgeniussolutions.com/services/dubai-seo/",
    "https://www.dgeniussolutions.com/aeo-dubai/",
    "https://www.dgeniussolutions.com/services/social-media-marketing/",
    "https://www.dgeniussolutions.com/services/performance-marketing/",
    "https://www.dgeniussolutions.com/services/website-development/",
    "https://www.dgeniussolutions.com/services/website-development-pune-page/",
    "https://www.dgeniussolutions.com/services/branding/",
    "https://www.dgeniussolutions.com/services/content-creation/",
    "https://www.dgeniussolutions.com/services/",
    "https://www.dgeniussolutions.com/our-services/",
  ];

  console.log("=== 1. PAGE LEVEL 28-DAY METRICS ===");
  const [pageMetrics] = await pool.query(
    "SELECT page_url, impressions, clicks, position, prev_position, period_type, updated_at FROM gsc_page_metrics WHERE period_type = '28d' ORDER BY impressions DESC"
  );
  
  const pageMetricsMap = new Map();
  for (const pm of pageMetrics) {
    if (!pageMetricsMap.has(pm.page_url)) {
      pageMetricsMap.set(pm.page_url, pm);
    }
  }

  for (const p of targetPages) {
    const m = pageMetricsMap.get(p);
    if (m) {
      console.log(`[PAGE] ${p} | Clicks: ${m.clicks} | Imp: ${m.impressions} | Pos: ${Number(m.position).toFixed(1)} (Prev: ${m.prev_position ? Number(m.prev_position).toFixed(1) : "N/A"})`);
    } else {
      console.log(`[PAGE] ${p} | No 28d page-level metrics recorded`);
    }
  }

  console.log("\n=== 2. QUERY LEVEL OWNERSHIP & METRICS ===");
  const [allQueries] = await pool.query(
    "SELECT page_url, query_text, impressions, clicks, position, prev_position, updated_at FROM gsc_page_query_metrics WHERE period_type = '28d' ORDER BY impressions DESC"
  );

  // Group queries by query_text to detect any internal cannibalization / competing URLs
  const queryToUrls = new Map();
  for (const q of allQueries) {
    const qNorm = q.query_text.trim().toLowerCase();
    if (!queryToUrls.has(qNorm)) queryToUrls.set(qNorm, []);
    queryToUrls.get(qNorm).push(q);
  }

  // Filter queries relevant to our target pages or key terms
  const targetTerms = ["ai video", "ai production", "video production", "dubai", "seo", "aeo", "geo", "llm", "performance", "branding", "social", "website", "content"];
  const matrix = [];

  for (const [qText, records] of queryToUrls.entries()) {
    const isTarget = targetTerms.some((t) => qText.includes(t)) || records.some((r) => targetPages.includes(r.page_url));
    if (!isTarget) continue;

    records.sort((a, b) => b.impressions - a.impressions);
    const topRecord = records[0];
    const competing = records.slice(1).map((r) => `${r.page_url} (Imp: ${r.impressions}, Pos: ${r.position})`);

    matrix.push({
      query: qText,
      topUrl: topRecord.page_url,
      clicks: topRecord.clicks,
      impressions: topRecord.impressions,
      position: Number(topRecord.position).toFixed(1),
      prevPosition: topRecord.prev_position ? Number(topRecord.prev_position).toFixed(1) : "N/A",
      competingUrls: competing,
      ownershipStatus: competing.length > 0 ? "Shared / Competing" : "Clear Owner",
    });
  }

  // Sort by impressions descending
  matrix.sort((a, b) => b.impressions - a.impressions);
  console.log(`Total target queries analyzed: ${matrix.length}`);
  console.log(JSON.stringify(matrix.slice(0, 100), null, 2));

  // Also write full matrix to json file
  fs.writeFileSync("data/audit/v8.8.6-gsc-ownership-matrix.json", JSON.stringify({ pageMetrics: Array.from(pageMetricsMap.values()), queryMatrix: matrix }, null, 2));
  console.log("\nFull matrix written to data/audit/v8.8.6-gsc-ownership-matrix.json");

  await pool.end();
}

run().catch(console.error);
