import fs from "node:fs";
import mysql from "mysql2/promise";

for (const envFile of [
  "/home/u188101251/production-app/shared/.env.production",
  "/home/u188101251/production-app/current/.env.production",
  ".env.production",
  ".env.local",
  ".env",
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

async function runMigration() {
  const host = process.env.DGS_MYSQL_HOST || "127.0.0.1";
  const user = process.env.DGS_MYSQL_USER;
  const password = process.env.DGS_MYSQL_PASSWORD;
  const database = process.env.DGS_MYSQL_DATABASE;
  const port = Number(process.env.DGS_MYSQL_PORT || 3306);

  if (!user || !database) {
    console.error("Missing DGS_MYSQL_USER or DGS_MYSQL_DATABASE environment variables.");
    process.exit(1);
  }

  console.log(`Connecting to MySQL database "${database}" on ${host}:${port}...`);
  const pool = mysql.createPool({ host, user, password, database, port });

  try {
    console.log("Updating column defaults in `blog_posts` table to prevent auto-claiming ownership...");

    // 1. Alter defaults
    await pool.query(`
      ALTER TABLE blog_posts 
        MODIFY COLUMN content_owner VARCHAR(255) NULL DEFAULT NULL,
        MODIFY COLUMN reviewer VARCHAR(255) NULL DEFAULT NULL,
        MODIFY COLUMN review_date DATETIME NULL DEFAULT NULL,
        MODIFY COLUMN review_status VARCHAR(50) NOT NULL DEFAULT 'REVIEW_REQUIRED',
        MODIFY COLUMN source_type VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED'
    `);
    console.log("✓ Column defaults updated to unverified/review-required.");

    // 2. Reset automated baseline rows where first-party ownership was auto-claimed without human review
    const [updateResult] = await pool.query(`
      UPDATE blog_posts 
      SET 
        content_owner = NULL,
        reviewer = NULL,
        review_date = NULL,
        review_status = 'REVIEW_REQUIRED',
        source_type = 'UNVERIFIED'
      WHERE reviewer = 'DGS Technical Lead' OR source_type = 'FIRST_PARTY_ORIGINAL'
    `);
    console.log(`✓ Reset auto-claimed governance metadata: ${updateResult.affectedRows} rows reset to UNVERIFIED.`);

    // 3. Distribution summary
    const [stats] = await pool.query(`
      SELECT status, review_status, source_type, COUNT(*) as count 
      FROM blog_posts 
      GROUP BY status, review_status, source_type
    `);
    console.log("=== V8.9.3 BLOG POSTS GOVERNANCE DISTRIBUTION ===");
    console.table(stats);

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);
