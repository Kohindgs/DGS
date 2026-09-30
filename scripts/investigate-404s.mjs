import fs from "node:fs";
import mysql from "mysql2/promise";

const ROOT = process.cwd();
const envCandidates = [
  pathJoin(ROOT, ".env.production"),
  "/home/u188101251/production-app/current/.env.production"
];

function pathJoin(...args) {
  return args.join("/");
}

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

async function main() {
  const pool = mysql.createPool(process.env.DGS_DATABASE_URL || {
    host: process.env.DGS_MYSQL_HOST,
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD,
    database: process.env.DGS_MYSQL_DATABASE,
  });

  const urls404 = [
    '/blogs/aeo-in-2026/',
    '/blogs/google-ads-ai-max-2026/',
    '/blogs/google-august-2026-spam-update/',
    '/blogs/seo-company-in-mumbai/'
  ];

  console.log("=== 404 HISTORICAL BLOG FORENSICS ===");

  for (const u of urls404) {
    console.log(`\n--------------------------------------------------`);
    console.log(`URL: ${u}`);
    console.log(`--------------------------------------------------`);

    // 1. GSC Page metrics
    const [pm] = await pool.query(
      "SELECT * FROM gsc_page_metrics WHERE page_url LIKE ? OR page_url LIKE ?",
      [`%${u}`, `%${u.replace(/\/$/, '')}`]
    );
    console.log("gsc_page_metrics:", pm);

    // 2. GSC Query metrics
    const [pq] = await pool.query(
      "SELECT query_text, clicks, impressions, position, prev_clicks, prev_impressions, prev_position, metric_date FROM gsc_page_query_metrics WHERE page_url LIKE ? OR page_url LIKE ?",
      [`%${u}`, `%${u.replace(/\/$/, '')}`]
    );
    console.log("gsc_page_query_metrics:", pq);

    // 3. Rank Math historical
    const [rm] = await pool.query(
      "SELECT query, page, clicks, impressions, position, ctr, created FROM wpcl_rank_math_analytics_gsc WHERE page LIKE ? OR page LIKE ?",
      [`%${u}%`, `%${u.replace(/\/$/, '')}%`]
    );
    console.log("Rank Math historical records:", rm.length, rm.slice(0, 3));

    // 4. Snapshots
    const [snaps] = await pool.query(
      "SELECT snapshot_date, entity_type, clicks, impressions, position, query_text FROM gsc_ranking_snapshots WHERE page_url LIKE ? OR identifier LIKE ?",
      [`%${u}`, `%${u}`]
    );
    console.log("gsc_ranking_snapshots:", snaps);

    // 5. blog_posts in MySQL
    const slug = u.replace(/^\/blogs\/|\/$/g, "");
    const [bp] = await pool.query("SELECT id, slug, title, status, redirect_url, redirect_status_code FROM blog_posts WHERE slug = ?", [slug]);
    console.log("blog_posts record:", bp);
  }

  await pool.end();
}

main().catch(console.error);
