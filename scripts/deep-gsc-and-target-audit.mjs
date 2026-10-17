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

  const [topPages] = await conn.execute(`
    SELECT page_url, 
           COUNT(DISTINCT query_text) as queries,
           SUM(clicks) as clicks,
           SUM(impressions) as impr,
           ROUND(AVG(position), 1) as avg_pos
    FROM gsc_page_query_metrics
    GROUP BY page_url
    ORDER BY impr DESC
    LIMIT 30
  `);

  const [allServicePages] = await conn.execute(`
    SELECT page_url, 
           COUNT(DISTINCT query_text) as queries,
           SUM(clicks) as clicks,
           SUM(impressions) as impr,
           ROUND(AVG(position), 1) as avg_pos
    FROM gsc_page_query_metrics
    WHERE page_url LIKE '%/services/%' 
       OR page_url LIKE '%website-development%'
       OR page_url LIKE '%seo%'
    GROUP BY page_url
    ORDER BY impr DESC
  `);

  const [seoQueries] = await conn.execute(`
    SELECT query_text, page_url, clicks, impressions, ctr, position
    FROM gsc_page_query_metrics
    WHERE query_text LIKE '%seo%' OR page_url LIKE '%seo%'
    ORDER BY impressions DESC
    LIMIT 50
  `);

  const [webQueries] = await conn.execute(`
    SELECT query_text, page_url, clicks, impressions, ctr, position
    FROM gsc_page_query_metrics
    WHERE query_text LIKE '%web%' OR page_url LIKE '%web%'
    ORDER BY impressions DESC
    LIMIT 50
  `);

  const [targetPages] = await conn.execute(`
    SELECT page_url, page_title, target_page_type, primary_focus, priority_tier, status
    FROM off_page_target_pages
  `);

  const [targetKws] = await conn.execute(`
    SELECT page_url, keyword, keyword_group
    FROM target_keywords
    ORDER BY page_url
  `);

  const output = {
    topPages,
    allServicePages,
    seoQueries,
    webQueries,
    targetPages,
    targetKws,
  };

  fs.writeFileSync("/home/u188101251/production-app/current/scripts/_gsc_audit_results.json", JSON.stringify(output, null, 2));
  console.log("SUCCESS: Output written to scripts/_gsc_audit_results.json");
  await conn.end();
}

main().catch(console.error);
