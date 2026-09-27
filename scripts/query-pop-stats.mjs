import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const ROOT = process.cwd();
const envCandidates = [
  path.join(ROOT, ".env.production"),
  "/home/u188101251/production-app/.env.production",
  path.join(ROOT, ".env.local"),
  path.join(ROOT, ".env"),
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
      page_url,
      SUM(clicks) as cur_clicks,
      SUM(prev_clicks) as prev_clicks,
      SUM(impressions) as cur_impressions,
      SUM(prev_impressions) as prev_impressions,
      ROUND(SUM(position * impressions) / NULLIF(SUM(impressions), 0), 2) as cur_pos,
      ROUND(SUM(prev_position * prev_impressions) / NULLIF(SUM(prev_impressions), 0), 2) as prev_pos
    FROM gsc_page_query_metrics
    WHERE period_type = '28d'
    GROUP BY page_url
    HAVING cur_impressions > 50 OR prev_impressions > 50
    ORDER BY cur_impressions DESC
    LIMIT 20
  `);
  console.log("TOP PAGES PERIOD OVER PERIOD (28d):");
  console.table(rows);

  // Check the 4 blogs specifically
  const targetBlogs = [
    "https://www.dgeniussolutions.com/blogs/ai-overview-ranking/",
    "https://www.dgeniussolutions.com/blogs/generative-engine-optimization/",
    "https://www.dgeniussolutions.com/blogs/ai-tools-marketing-agencies/",
    "https://www.dgeniussolutions.com/blogs/ai-generated-summaries-in-search-ads/",
    "https://www.dgeniussolutions.com/services/ai-video-production-agency/"
  ];

  const [blogRows] = await pool.query(`
    SELECT
      page_url,
      SUM(clicks) as cur_clicks,
      SUM(prev_clicks) as prev_clicks,
      SUM(impressions) as cur_impressions,
      SUM(prev_impressions) as prev_impressions,
      ROUND(SUM(position * impressions) / NULLIF(SUM(impressions), 0), 2) as cur_pos,
      ROUND(SUM(prev_position * prev_impressions) / NULLIF(SUM(prev_impressions), 0), 2) as prev_pos
    FROM gsc_page_query_metrics
    WHERE period_type = '28d' AND page_url IN (?)
    GROUP BY page_url
  `, [targetBlogs]);
  console.log("TARGET FOCUS PAGES PERIOD OVER PERIOD:");
  console.table(blogRows);

  await pool.end();
}

run().catch(console.error);
