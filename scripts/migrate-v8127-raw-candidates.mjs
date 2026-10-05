import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

/**
 * DGS V8.12.7 Schema Migration:
 *  - Creates off_page_raw_candidates staging table to isolate raw provider candidates from off_page_opportunities
 *  - Adds default quota settings for live search providers (web_search, brave_search)
 */
async function main() {
  console.log("DGS V8.12.7 OFF-PAGE RAW CANDIDATES & LIVE ACQUISITION — SCHEMA MIGRATION");

  let envText = "";
  for (const p of [
    path.join(process.cwd(), ".env.production"),
    "/home/u188101251/production-app/current/.env.production",
    "/home/u188101251/production-app/shared/.env.production",
  ]) {
    try {
      envText = await fs.readFile(p, "utf8");
      if (envText) break;
    } catch {}
  }
  const env = {};
  for (const line of envText.split("\n")) {
    const i = line.indexOf("=");
    if (i > 0) {
      let v = line.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      env[line.slice(0, i).trim()] = v;
    }
  }
  const user = env.DGS_MYSQL_USER || process.env.DGS_MYSQL_USER;
  const database = env.DGS_MYSQL_DATABASE || process.env.DGS_MYSQL_DATABASE;
  if (!user || !database) {
    console.log("[MIGRATE] No DB credentials found, skipping.");
    return;
  }
  const conn = await mysql.createConnection({
    host: env.DGS_MYSQL_HOST || process.env.DGS_MYSQL_HOST || "127.0.0.1",
    port: Number(env.DGS_MYSQL_PORT || 3306),
    user,
    password: env.DGS_MYSQL_PASSWORD || process.env.DGS_MYSQL_PASSWORD,
    database,
    charset: "UTF8MB4_UNICODE_CI",
  });

  console.log("Checking off_page_raw_candidates staging table...");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS off_page_raw_candidates (
      id VARCHAR(64) PRIMARY KEY,
      run_id VARCHAR(64) NOT NULL,
      provider VARCHAR(64) NOT NULL,
      query VARCHAR(500) NOT NULL,
      lane VARCHAR(64) NULL,
      url VARCHAR(2048) NOT NULL,
      domain VARCHAR(255) NOT NULL,
      title VARCHAR(500) NULL,
      snippet TEXT NULL,
      region VARCHAR(32) DEFAULT 'GLOBAL',
      http_status INT NULL,
      fetched_at DATETIME NULL,
      validation_status VARCHAR(64) DEFAULT 'PENDING',
      qualification_status VARCHAR(64) DEFAULT 'UNQUALIFIED',
      qualification_reasons TEXT NULL,
      opportunity_id VARCHAR(64) NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_raw_run_id (run_id),
      INDEX idx_raw_domain (domain),
      INDEX idx_raw_lane (lane),
      INDEX idx_raw_provider (provider),
      INDEX idx_raw_qualification_status (qualification_status),
      INDEX idx_raw_opportunity_id (opportunity_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✓ off_page_raw_candidates staging table ready");

  // Ensure quota settings exist
  const [settings] = await conn.query("SELECT key_name FROM off_page_settings");
  const existingKeys = new Set(settings.map((s) => s.key_name));

  const defaultSettings = [
    {
      id: "set_web_search_daily_quota",
      key_name: "web_search_daily_quota",
      key_value: "100",
      description: "Maximum live web search queries allowed per day (quota guard)",
    },
    {
      id: "set_brave_search_daily_quota",
      key_name: "brave_search_daily_quota",
      key_value: "60",
      description: "Maximum Brave Search API queries allowed per day (quota guard)",
    },
    {
      id: "set_general_search_provider",
      key_name: "general_search_provider",
      key_value: "web_search",
      description: "Active general search provider (web_search or brave_search)",
    },
  ];

  for (const s of defaultSettings) {
    if (!existingKeys.has(s.key_name)) {
      await conn.query(
        "INSERT INTO off_page_settings (id, key_name, key_value, description, updated_at) VALUES (?, ?, ?, ?, NOW())",
        [s.id, s.key_name, s.key_value, s.description]
      );
      console.log(`  + Setting: ${s.key_name}`);
    } else {
      console.log(`  = Setting exists: ${s.key_name}`);
    }
  }

  await conn.end();
  console.log("V8.12.7 migration complete.");
}

main().catch((e) => {
  console.error("V8.12.7 migration failed:", e);
  process.exit(1);
});
