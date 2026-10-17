import fs from "node:fs";
import mysql from "mysql2/promise";

async function main() {
  const env = fs.readFileSync("/home/u188101251/production-app/current/.env.production", "utf8");
  const cfg = {};
  for (const line of env.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      cfg[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }

  const conn = await mysql.createConnection({
    host: cfg.DGS_MYSQL_HOST || "127.0.0.1",
    user: cfg.DGS_MYSQL_USER,
    password: cfg.DGS_MYSQL_PASSWORD,
    database: cfg.DGS_MYSQL_DATABASE,
  });

  console.log("==================================================================");
  console.log("  1. TOP 25 PAGES BY GSC IMPRESSIONS ACROSS ENTIRE WEBSITE");
  console.log("==================================================================");
  const [topPages] = await conn.execute(`
    SELECT page_url, 
           COUNT(DISTINCT query_text) as total_queries,
           SUM(clicks) as total_clicks,
           SUM(impressions) as total_impressions,
           ROUND(AVG(position), 1) as avg_position,
           ROUND(SUM(clicks) / NULLIF(SUM(impressions), 0) * 100, 2) as ctr_pct
    FROM gsc_page_query_metrics
    GROUP BY page_url
    ORDER BY total_impressions DESC
    LIMIT 25
  `);
  console.table(topPages);

  console.log("\n==================================================================");
  console.log("  2. ALL SERVICE PAGES IN GSC (ORDERED BY IMPRESSIONS)");
  console.log("==================================================================");
  const [servicePages] = await conn.execute(`
    SELECT page_url, 
           COUNT(DISTINCT query_text) as total_queries,
           SUM(clicks) as total_clicks,
           SUM(impressions) as total_impressions,
           ROUND(AVG(position), 1) as avg_position
    FROM gsc_page_query_metrics
    WHERE page_url LIKE '%/services/%' 
       OR page_url LIKE '%website-development%'
       OR page_url LIKE '%seo%'
    GROUP BY page_url
    ORDER BY total_impressions DESC
  `);
  console.table(servicePages);

  console.log("\n==================================================================");
  console.log("  3. SPECIFIC QUERIES MATCHING 'SEO' + 'MUMBAI'");
  console.log("==================================================================");
  const [seoQueries] = await conn.execute(`
    SELECT query_text, page_url, clicks, impressions, ctr, position
    FROM gsc_page_query_metrics
    WHERE query_text LIKE '%seo%' AND query_text LIKE '%mumbai%'
    ORDER BY impressions DESC
    LIMIT 30
  `);
  console.table(seoQueries);

  console.log("\n==================================================================");
  console.log("  4. SPECIFIC QUERIES MATCHING 'WEB' OR 'DEVELOPMENT' + 'MUMBAI'");
  console.log("==================================================================");
  const [webQueries] = await conn.execute(`
    SELECT query_text, page_url, clicks, impressions, ctr, position
    FROM gsc_page_query_metrics
    WHERE (query_text LIKE '%web%' OR query_text LIKE '%website%') AND query_text LIKE '%mumbai%'
    ORDER BY impressions DESC
    LIMIT 30
  `);
  console.table(webQueries);

  console.log("\n==================================================================");
  console.log("  5. SEO CHANGE REQUESTS & TARGET KEYWORDS FROM CMS DB");
  console.log("==================================================================");
  try {
    const [targetKws] = await conn.execute(`
      SELECT keyword, target_url, priority, target_position, current_position, search_volume
      FROM target_keywords
      WHERE keyword LIKE '%seo%' OR keyword LIKE '%web%' OR keyword LIKE '%mumbai%'
      LIMIT 20
    `);
    console.log("Target Keywords Count:", targetKws.length);
    console.table(targetKws);
  } catch (e) {
    console.log("target_keywords error or table empty:", e.message);
  }

  try {
    const [seoMeta] = await conn.execute(`
      SELECT route, title, meta_description, canonical_url, robots, indexing_status
      FROM seo_metadata
      WHERE route LIKE '%seo%' OR route LIKE '%web%'
      LIMIT 20
    `);
    console.log("SEO Metadata records:", seoMeta.length);
    console.table(seoMeta);
  } catch (e) {
    console.log("seo_metadata error or empty:", e.message);
  }

  await conn.end();
}

main().catch(console.error);
