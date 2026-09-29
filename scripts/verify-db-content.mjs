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
    SELECT id, title, slug, status, published_at, LENGTH(content) AS content_bytes, LENGTH(excerpt) AS excerpt_bytes
    FROM blog_posts
    ORDER BY created_at DESC
  `);
  console.log(JSON.stringify(blogs, null, 2));

  await pool.end();
}

main().catch(console.error);
