import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

async function main() {
  console.log("==================================================");
  console.log("DGS V8.12.3 DISCOVERY RUNS & OPPORTUNITY COLUMNS MIGRATION");
  console.log("==================================================");

  let envText = "";
  const envPaths = [
    path.join(process.cwd(), ".env.production"),
    "/home/u188101251/production-app/current/.env.production",
    "/home/u188101251/production-app/shared/.env.production",
  ];

  for (const p of envPaths) {
    try {
      envText = await fs.readFile(p, "utf8");
      if (envText) break;
    } catch {}
  }

  const env = {};
  for (const line of envText.split("\n")) {
    const p = line.indexOf("=");
    if (p > 0) {
      let v = line.slice(p + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[line.slice(0, p).trim()] = v;
    }
  }

  const host = env.DGS_MYSQL_HOST || process.env.DGS_MYSQL_HOST || "127.0.0.1";
  const user = env.DGS_MYSQL_USER || process.env.DGS_MYSQL_USER;
  const password = env.DGS_MYSQL_PASSWORD || process.env.DGS_MYSQL_PASSWORD;
  const database = env.DGS_MYSQL_DATABASE || process.env.DGS_MYSQL_DATABASE;

  if (!user || !database) {
    console.log("[MIGRATE] No DB credentials found, skipping direct migration.");
    return;
  }

  const conn = await mysql.createConnection({
    host,
    user,
    password,
    database,
  });

  console.log("1. Ensuring off_page_discovery_runs table exists...");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS off_page_discovery_runs (
      run_id VARCHAR(64) PRIMARY KEY,
      provider VARCHAR(100) NOT NULL,
      started_at DATETIME NOT NULL,
      completed_at DATETIME NULL,
      queries_run INT NOT NULL DEFAULT 0,
      results_returned INT NOT NULL DEFAULT 0,
      valid_candidates INT NOT NULL DEFAULT 0,
      duplicates_rejected INT NOT NULL DEFAULT 0,
      spam_rejected INT NOT NULL DEFAULT 0,
      inserted_count INT NOT NULL DEFAULT 0,
      errors TEXT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
      details JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_opdr_started (started_at DESC),
      INDEX idx_opdr_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ off_page_discovery_runs table ready.");

  console.log("2. Checking columns on off_page_opportunities...");
  const [cols] = await conn.query(`SHOW COLUMNS FROM off_page_opportunities`);
  const colNames = new Set(cols.map((c) => c.Field));

  if (!colNames.has("discovery_provider")) {
    console.log("Adding column discovery_provider...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN discovery_provider VARCHAR(100) NULL AFTER source`);
  }
  if (!colNames.has("discovery_query")) {
    console.log("Adding column discovery_query...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN discovery_query VARCHAR(512) NULL AFTER discovery_provider`);
  }
  if (!colNames.has("http_status")) {
    console.log("Adding column http_status...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN http_status INT NULL AFTER discovery_query`);
  }
  if (!colNames.has("verification_status")) {
    console.log("Adding column verification_status...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED' AFTER http_status`);
  }
  if (!colNames.has("last_verified_at")) {
    console.log("Adding column last_verified_at...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN last_verified_at DATETIME NULL AFTER verification_status`);
  }

  console.log("✓ off_page_opportunities columns verified.");
  await conn.end();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
