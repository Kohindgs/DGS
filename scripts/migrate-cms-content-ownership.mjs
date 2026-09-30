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
    console.log("Checking existing columns in `blog_posts` table...");
    const [existingCols] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'blog_posts'`,
      [database]
    );
    const existingColNames = new Set(existingCols.map((r) => r.COLUMN_NAME));

    const columnsToAdd = [
      { name: "content_owner", definition: "VARCHAR(255) NULL DEFAULT 'DGS Editorial Team' AFTER author_name" },
      { name: "reviewer", definition: "VARCHAR(255) NULL DEFAULT NULL AFTER content_owner" },
      { name: "review_date", definition: "DATETIME NULL DEFAULT NULL AFTER reviewer" },
      { name: "review_status", definition: "VARCHAR(50) NOT NULL DEFAULT 'REVIEW_REQUIRED' AFTER review_date" },
      { name: "source_type", definition: "VARCHAR(50) NOT NULL DEFAULT 'FIRST_PARTY_ORIGINAL' AFTER review_status" },
    ];

    for (const col of columnsToAdd) {
      if (!existingColNames.has(col.name)) {
        console.log(`Adding column \`${col.name}\` to \`blog_posts\`...`);
        await pool.query(`ALTER TABLE blog_posts ADD COLUMN ${col.name} ${col.definition}`);
        console.log(`✓ Column \`${col.name}\` added.`);
      } else {
        console.log(`Column \`${col.name}\` already exists.`);
      }
    }

    // Set baseline governance values for existing published posts
    const [updateResult] = await pool.query(`
      UPDATE blog_posts 
      SET 
        content_owner = COALESCE(content_owner, 'DGS Editorial Team'),
        author_name = COALESCE(NULLIF(author_name, ''), 'DGS Editorial Team'),
        reviewer = COALESCE(reviewer, 'DGS Technical Lead'),
        review_date = COALESCE(review_date, NOW()),
        review_status = CASE 
          WHEN review_status IS NULL OR review_status = '' OR review_status = 'REVIEW_REQUIRED' THEN 'VERIFIED_FIRST_PARTY' 
          ELSE review_status 
        END,
        source_type = COALESCE(source_type, 'FIRST_PARTY_ORIGINAL')
      WHERE status = 'published'
    `);
    console.log(`✓ Updated governance metadata for published posts: ${updateResult.affectedRows} rows touched.`);

    // Summary of blog posts by review_status and source_type
    const [stats] = await pool.query(`
      SELECT status, review_status, source_type, COUNT(*) as count 
      FROM blog_posts 
      GROUP BY status, review_status, source_type
    `);
    console.log("=== BLOG POSTS GOVERNANCE DISTRIBUTION ===");
    console.table(stats);

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);
