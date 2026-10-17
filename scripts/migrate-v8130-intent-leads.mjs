import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

/**
 * DGS V8.13.0 Additive Schema Migration:
 * - Creates intent_lead_signals table for LinkedIn Feed, Public LinkedIn, Reddit, X, Web Forum, and Google Search buyer-intent leads
 * - Creates intent_lead_discovery_runs table for tracking automated & manual discovery runs
 * - Creates intent_lead_settings table for storing browser companion ingest token & notification preferences
 */
async function main() {
  console.log("=== DGS V8.13.0 BUYER-INTENT & LINKEDIN LEAD DISCOVERY MIGRATION ===");

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
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i > 0) {
      let v = trimmed.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[trimmed.slice(0, i).trim()] = v;
    }
  }

  const user = env.DGS_MYSQL_USER || process.env.DGS_MYSQL_USER;
  const database = env.DGS_MYSQL_DATABASE || process.env.DGS_MYSQL_DATABASE;
  if (!user || !database) {
    console.log("[MIGRATE V8.13.0] No DB credentials found, skipping.");
    return;
  }

  const conn = await mysql.createConnection({
    host: env.DGS_MYSQL_HOST || process.env.DGS_MYSQL_HOST || "127.0.0.1",
    port: Number(env.DGS_MYSQL_PORT || process.env.DGS_MYSQL_PORT || 3306),
    user,
    password: env.DGS_MYSQL_PASSWORD || process.env.DGS_MYSQL_PASSWORD,
    database,
    charset: "UTF8MB4_UNICODE_CI",
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS intent_lead_signals (
      id VARCHAR(64) PRIMARY KEY,
      url_hash VARCHAR(64) NOT NULL UNIQUE,
      source_platform VARCHAR(40) NOT NULL DEFAULT 'LINKEDIN_PUBLIC',
      post_url TEXT NOT NULL,
      post_title VARCHAR(500) NULL,
      post_text TEXT NOT NULL,
      author_name VARCHAR(255) NULL,
      author_role VARCHAR(255) NULL,
      author_profile_url VARCHAR(500) NULL,
      company_name VARCHAR(255) NULL,
      contact_hint VARCHAR(255) NULL,
      service_category VARCHAR(64) NOT NULL DEFAULT 'SEO',
      target_region VARCHAR(40) NOT NULL DEFAULT 'GLOBAL',
      discovery_query VARCHAR(500) NULL,
      intent_classification VARCHAR(64) NOT NULL DEFAULT 'BUYER_SEEKING_SERVICE',
      intent_score INT NOT NULL DEFAULT 70,
      urgency_level VARCHAR(24) NOT NULL DEFAULT 'MEDIUM',
      ai_reasoning TEXT NULL,
      suggested_reply TEXT NULL,
      suggested_dm TEXT NULL,
      recommended_dgs_url VARCHAR(500) NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'NEW',
      crm_lead_id VARCHAR(64) NULL,
      notified_at DATETIME NULL,
      published_at DATETIME NULL,
      age_hours INT NULL,
      freshness_tier VARCHAR(24) NOT NULL DEFAULT '24H',
      discovered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_ils_status_score (status, intent_score DESC, discovered_at DESC),
      INDEX idx_ils_platform (source_platform, discovered_at DESC),
      INDEX idx_ils_service (service_category, status),
      INDEX idx_ils_classification (intent_classification, intent_score DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✓ Table intent_lead_signals verified.");

  for (const colSql of [
    "ALTER TABLE intent_lead_signals ADD COLUMN age_hours INT NULL AFTER published_at",
    "ALTER TABLE intent_lead_signals ADD COLUMN freshness_tier VARCHAR(24) NOT NULL DEFAULT '24H' AFTER age_hours",
  ]) {
    try {
      await conn.query(colSql);
    } catch {}
  }

  await conn.query(`
    CREATE TABLE IF NOT EXISTS intent_lead_discovery_runs (
      id VARCHAR(64) PRIMARY KEY,
      run_type VARCHAR(32) NOT NULL DEFAULT 'CRON',
      started_at DATETIME NOT NULL,
      completed_at DATETIME NULL,
      duration_ms INT NOT NULL DEFAULT 0,
      status VARCHAR(32) NOT NULL DEFAULT 'RUNNING',
      queries_executed INT NOT NULL DEFAULT 0,
      raw_candidates_found INT NOT NULL DEFAULT 0,
      qualified_leads_added INT NOT NULL DEFAULT 0,
      rejected_noise_count INT NOT NULL DEFAULT 0,
      emails_sent INT NOT NULL DEFAULT 0,
      summary_text TEXT NULL,
      error_message TEXT NULL,
      metadata_json JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ildr_started (started_at DESC),
      INDEX idx_ildr_status (status, started_at DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✓ Table intent_lead_discovery_runs verified.");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS intent_lead_settings (
      setting_key VARCHAR(64) PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✓ Table intent_lead_settings verified.");

  await conn.end();
  console.log("✓ V8.13.0 migration complete.");
}

main().catch((e) => {
  console.error("V8.13.0 migration error:", e);
  process.exit(1);
});
