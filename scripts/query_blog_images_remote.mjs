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

  const [rows] = await conn.query(
    "SELECT id, slug, featured_image_url, content FROM blog_posts WHERE slug IN (?, ?)",
    [
      "google-september-2026-spam-update-what-website-owners-should-know",
      "google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads"
    ]
  );

  for (const r of rows) {
    console.log("=== BLOG:", r.slug);
    console.log("featured_image_url:", r.featured_image_url);
    const content = typeof r.content === "string" ? JSON.parse(r.content) : r.content;
    const arr = Array.isArray(content) ? content : [content];
    console.log("Content images:", JSON.stringify(arr[0]?.images || []));
    console.log("Featured image alt:", r.featured_image_alt);
  }

  await conn.end();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
