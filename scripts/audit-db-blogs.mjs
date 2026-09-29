import fs from "node:fs";
import mysql from "mysql2/promise";

for (const envFile of [
  "/home/u188101251/production-app/shared/.env.production",
  "/home/u188101251/production-app/current/.env.production",
  ".env.production",
  ".env.local",
  ".env"
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
  const pool = mysql.createPool({
    host: process.env.DGS_MYSQL_HOST || "127.0.0.1",
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD,
    database: process.env.DGS_MYSQL_DATABASE,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
  });

  console.log("=== BLOG POSTS TABLE SCHEMA ===");
  const [cols] = await pool.query("DESCRIBE blog_posts");
  cols.forEach(c => console.log(`  ${c.Field}: ${c.Type} | Null: ${c.Null} | Default: ${c.Default}`));

  console.log("\n=== BLOG POSTS IN PRODUCTION DATABASE ===");
  const [rows] = await pool.query(
    "SELECT id, slug, title, status, published_at, updated_at, created_at FROM blog_posts ORDER BY created_at DESC"
  );
  console.log(`Total blogs in database: ${rows.length}`);
  rows.forEach(r => console.log(JSON.stringify(r)));

  console.log("\n=== SEO METADATA FOR BLOGS ===");
  const [seoRows] = await pool.query(
    "SELECT id, entity_id, title, canonical_url, robots_index, updated_at FROM seo_metadata WHERE entity_type = 'blog_post'"
  );
  console.log(`Total seo_metadata records for blogs: ${seoRows.length}`);
  seoRows.forEach(r => console.log(JSON.stringify(r)));

  await pool.end();
}

run().catch(console.error);
