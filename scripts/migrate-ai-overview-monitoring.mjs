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

async function run() {
  const host = process.env.DGS_MYSQL_HOST || "127.0.0.1";
  const user = process.env.DGS_MYSQL_USER;
  const password = process.env.DGS_MYSQL_PASSWORD;
  const database = process.env.DGS_MYSQL_DATABASE;
  const port = Number(process.env.DGS_MYSQL_PORT || 3306);

  if (!user || !database) {
    console.error("Missing database environment variables");
    process.exit(1);
  }

  console.log(`Connecting to ${database} on ${host}:${port}...`);
  const pool = mysql.createPool({ host, user, password, database, port });

  try {
    console.log("Checking if `ai_overview_monitoring` table exists...");
    const [tables] = await pool.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'ai_overview_monitoring'`,
      [database]
    );

    if (tables.length === 0) {
      console.log("Creating `ai_overview_monitoring` table...");
      await pool.query(`
        CREATE TABLE ai_overview_monitoring (
          id VARCHAR(36) NOT NULL PRIMARY KEY,
          query VARCHAR(255) NOT NULL,
          country VARCHAR(10) NOT NULL DEFAULT 'AE',
          device VARCHAR(20) NOT NULL DEFAULT 'desktop',
          ai_overview_present TINYINT(1) NOT NULL DEFAULT 0,
          dgs_cited TINYINT(1) NOT NULL DEFAULT 0,
          dgs_url_cited VARCHAR(512) NULL DEFAULT NULL,
          date_checked DATETIME NOT NULL,
          previous_state JSON NULL DEFAULT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_aio_query_geo (query, country, device)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log("✓ Table `ai_overview_monitoring` created successfully.");
    } else {
      console.log("• Table `ai_overview_monitoring` already exists.");
    }
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run().catch(console.error);
