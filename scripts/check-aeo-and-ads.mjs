import fs from "node:fs";
import mysql from "mysql2/promise";

const ROOT = process.cwd();
const envCandidates = [
  ROOT + "/.env.production",
  "/home/u188101251/production-app/current/.env.production"
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

async function main() {
  const pool = mysql.createPool(process.env.DGS_DATABASE_URL || {
    host: process.env.DGS_MYSQL_HOST,
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD,
    database: process.env.DGS_MYSQL_DATABASE,
  });

  const urls = [
    '/services/ai-video-production-agency/'
  ];

  for (const u of urls) {
    console.log("=== " + u + " ===");
    const [cols] = await pool.query("DESCRIBE blog_posts");
    console.log("blog_posts columns:", cols.map(c => `${c.Field} (${c.Type})`));
    await pool.end();
    return;

    const [pq] = await pool.query(
      "SELECT * FROM gsc_page_query_metrics WHERE page_url LIKE ? OR page_url LIKE ?",
      [`%${u}`, `%${u.replace(/\/$/, '')}`]
    );
    console.log("page_query_metrics:", pq);

    const [snaps] = await pool.query(
      "SELECT * FROM gsc_ranking_snapshots WHERE page_url LIKE ? OR identifier LIKE ?",
      [`%${u}`, `%${u}`]
    );
    console.log("ranking_snapshots count:", snaps.length);
    if (snaps.length > 0) {
      console.log("ranking_snapshots sample:", snaps.slice(0, 3));
    }

    const slug = u.replace(/^\/blogs\/|\/$/g, "");
    const [bp] = await pool.query("SELECT id, slug, title, status FROM blog_posts WHERE slug = ?", [slug]);
    console.log("blog_posts record:", bp);
  }

  await pool.end();
}

main().catch(console.error);
