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

  const [[{ total }]] = await conn.query("SELECT COUNT(*) as total FROM blog_posts");
  const [[{ active }]] = await conn.query("SELECT COUNT(*) as active FROM blog_posts WHERE status != 'trashed'");
  const [[{ published }]] = await conn.query("SELECT COUNT(*) as published FROM blog_posts WHERE status = 'published'");
  const [[{ draft }]] = await conn.query("SELECT COUNT(*) as draft FROM blog_posts WHERE status = 'draft'");
  const [[{ review }]] = await conn.query("SELECT COUNT(*) as review FROM blog_posts WHERE status = 'review'");
  const [[{ scheduled }]] = await conn.query("SELECT COUNT(*) as scheduled FROM blog_posts WHERE status = 'scheduled'");
  const [[{ trashed }]] = await conn.query("SELECT COUNT(*) as trashed FROM blog_posts WHERE status = 'trashed'");

  console.log("=== LIVE BLOG TABLE COUNTS ===");
  console.log(`TOTAL BLOG ROWS = ${total}`);
  console.log(`ACTIVE BLOGS    = ${active}`);
  console.log(`PUBLISHED       = ${published}`);
  console.log(`DRAFT           = ${draft}`);
  console.log(`REVIEW          = ${review}`);
  console.log(`SCHEDULED       = ${scheduled}`);
  console.log(`TRASHED         = ${trashed}`);

  const [trashedRows] = await conn.query(
    "SELECT id, title, slug, status, deleted_at, published_at FROM blog_posts WHERE status = 'trashed' ORDER BY deleted_at DESC"
  );

  console.log("\n=== TRASHED RECORDS ===");
  console.log(JSON.stringify(trashedRows, null, 2));

  // Check inbound links for trashed blogs if any
  for (const r of trashedRows) {
    const [links] = await conn.query(
      "SELECT id, title, slug FROM blog_posts WHERE content LIKE ? AND id != ?",
      [`%${r.slug}%`, r.id]
    );
    console.log(`Trashed blog "${r.slug}" inbound links count: ${links.length}`);
  }

  // Also inspect table schemas related to blog_posts
  const [tables] = await conn.query("SHOW TABLES LIKE 'blog_%'");
  console.log("\n=== BLOG TABLES IN DB ===");
  console.log(tables.map(t => Object.values(t)[0]));

  const [fks] = await conn.query(`
    SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_NAME = 'blog_posts' AND TABLE_SCHEMA = ?
  `, [cfg.DGS_MYSQL_DATABASE]);
  console.log("\n=== FOREIGN KEYS REFERENCING blog_posts ===");
  console.log(JSON.stringify(fks, null, 2));

  await conn.end();
}

main().catch((err) => {
  console.error("Audit error:", err);
  process.exit(1);
});
