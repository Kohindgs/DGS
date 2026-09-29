import mysql from "mysql2/promise";
import fs from "node:fs";

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

async function main() {
  const pool = mysql.createPool({
    host: process.env.DGS_MYSQL_HOST || "127.0.0.1",
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD,
    database: process.env.DGS_MYSQL_DATABASE,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
  });

  const [blogs] = await pool.query(`
    SELECT id, title, slug, status, created_at, updated_at, published_at, scheduled_for, deleted_at, redirect_url, author_name, category
    FROM blog_posts
    ORDER BY created_at DESC
  `);
  console.log(`TOTAL_BLOG_POSTS: ${blogs.length}`);
  for (const b of blogs) {
    console.log("BLOG_ROW:" + JSON.stringify(b));
  }

  try {
    const [revs] = await pool.query(`
      SELECT id, blog_id, revision_number, title, slug, status, created_at, created_by
      FROM blog_revisions
      ORDER BY created_at DESC
    `);
    console.log(`TOTAL_BLOG_REVISIONS: ${revs.length}`);
    for (const r of revs) {
      console.log("REV_ROW:" + JSON.stringify(r));
    }
  } catch (e) {
    console.log("REVISIONS_ERROR:" + e.message);
  }

  // Also check if any other blog tables exist
  const [blogTables] = await pool.query("SHOW TABLES LIKE '%blog%'");
  console.log("BLOG_TABLES:" + JSON.stringify(blogTables.map(t => Object.values(t)[0])));

  await pool.end();
}

main().catch(console.error);
