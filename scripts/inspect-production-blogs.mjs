import mysql from "mysql2/promise";
import fs from "node:fs";

async function main() {
  const envContent = fs.readFileSync("/home/u188101251/production-app/current/.env.production", "utf8");
  const cfg = {};
  for (const line of envContent.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      cfg[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }

  const conn = await mysql.createConnection({
    host: cfg.DGS_MYSQL_HOST || "127.0.0.1",
    port: parseInt(cfg.DGS_MYSQL_PORT || "3306"),
    user: cfg.DGS_MYSQL_USER,
    password: cfg.DGS_MYSQL_PASSWORD,
    database: cfg.DGS_MYSQL_DATABASE,
  });

  console.log("=== LATEST 10 BLOG POSTS IN PRODUCTION DB ===");
  const [rows] = await conn.execute(
    "SELECT id, title, slug, status, needs_review, featured_image_url, published_at, deleted_at, created_at, updated_at FROM blog_posts ORDER BY id DESC LIMIT 10"
  );
  console.log(JSON.stringify(rows, null, 2));

  console.log("\n=== MEDIA ASSETS COLUMNS & RECORDS ===");
  const [cols] = await conn.execute("SHOW COLUMNS FROM media_assets");
  console.log("COLUMNS:", cols.map(c => c.Field));
  const [media] = await conn.execute("SELECT * FROM media_assets ORDER BY id DESC LIMIT 5");
  console.log(JSON.stringify(media, null, 2));

  await conn.end();
}

main().catch(err => {
  console.error("Error inspecting blogs:", err);
  process.exit(1);
});
