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
    const existingColNames = new Set((existingCols).map((r) => r.COLUMN_NAME));

    const columnsToAdd = [
      { name: "deleted_at", definition: "DATETIME NULL DEFAULT NULL AFTER scheduled_for" },
      { name: "deleted_by", definition: "VARCHAR(64) NULL DEFAULT NULL AFTER deleted_at" },
      { name: "author_name", definition: "VARCHAR(255) NULL DEFAULT NULL AFTER author_id" },
      { name: "featured_image_alt", definition: "VARCHAR(512) NULL DEFAULT NULL AFTER featured_image_url" },
      { name: "canonical_url", definition: "VARCHAR(512) NULL DEFAULT NULL AFTER focus_keyword" },
      { name: "redirect_url", definition: "VARCHAR(512) NULL DEFAULT NULL AFTER canonical_url" },
      { name: "redirect_status_code", definition: "INT NULL DEFAULT 301 AFTER redirect_url" },
      { name: "category", definition: "VARCHAR(100) NULL DEFAULT NULL AFTER focus_keyword" },
    ];

    for (const col of columnsToAdd) {
      if (!existingColNames.has(col.name)) {
        console.log(`Adding column \`${col.name}\` to \`blog_posts\`...`);
        await pool.query(`ALTER TABLE blog_posts ADD COLUMN ${col.name} ${col.definition}`);
        console.log(`✓ Column \`${col.name}\` added.`);
      } else {
        console.log(`• Column \`${col.name}\` already exists.`);
      }
    }

    // Check indexes
    console.log("Checking indexes on `blog_posts`...");
    const [indexes] = await pool.query(
      `SHOW INDEX FROM blog_posts WHERE Key_name = 'idx_blog_lifecycle'`
    );
    if ((indexes).length === 0) {
      console.log("Adding index `idx_blog_lifecycle` on (status, deleted_at, published_at)...");
      try {
        await pool.query(
          `CREATE INDEX idx_blog_lifecycle ON blog_posts (status, deleted_at, published_at)`
        );
        console.log("✓ Index `idx_blog_lifecycle` created.");
      } catch (idxErr) {
        console.warn("Notice on index creation:", idxErr.message);
      }
    } else {
      console.log("• Index `idx_blog_lifecycle` already exists.");
    }

    // Ensure status enum / varchar accommodates 'trashed'
    console.log("Verifying status field accommodates 'trashed'...");
    const [statusCol] = await pool.query(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'blog_posts' AND COLUMN_NAME = 'status'`,
      [database]
    );
    const colType = statusCol[0]?.COLUMN_TYPE || "";
    console.log(`Current \`status\` column type: ${colType}`);
    if (colType.toLowerCase().startsWith("enum") && !colType.includes("'trashed'")) {
      console.log("Expanding status column enum to include 'trashed'...");
      await pool.query(
        `ALTER TABLE blog_posts MODIFY COLUMN status ENUM('draft', 'review', 'scheduled', 'published', 'trashed') NOT NULL DEFAULT 'draft'`
      );
      console.log("✓ Status enum expanded.");
    }

    // Verify existing data integrity
    const [rows] = await pool.query(
      `SELECT id, slug, title, status, published_at, updated_at, deleted_at FROM blog_posts ORDER BY created_at DESC`
    );
    console.log(`\nMigration completed successfully! Total blogs in database: ${rows.length}`);
    rows.forEach((r) => {
      console.log(`- [${r.status}] ${r.slug} | published_at: ${r.published_at} | deleted_at: ${r.deleted_at}`);
    });
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);
