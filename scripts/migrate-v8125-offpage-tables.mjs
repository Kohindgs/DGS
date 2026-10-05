import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

async function main() {
  console.log("==================================================");
  console.log("DGS V8.12.5 OFF-PAGE INTELLIGENCE OS SCHEMA MIGRATION");
  console.log("ACTION CENTER + SHEET SYNC + TWO-STATUS MISMATCH QUEUE");
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

  const conn = await mysql.createConnection({ host, user, password, database });

  console.log("1. Ensuring off_page_sheet_connections table exists...");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS off_page_sheet_connections (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      source_type VARCHAR(50) NOT NULL,
      sheet_url TEXT NULL,
      sheet_id VARCHAR(255) NULL,
      tab_name VARCHAR(255) NULL,
      column_mapping JSON NOT NULL,
      auto_sync_enabled TINYINT(1) NOT NULL DEFAULT 0,
      sync_interval_hours INT NOT NULL DEFAULT 24,
      last_synced_at DATETIME NULL,
      last_sync_status VARCHAR(50) NULL,
      last_sync_error TEXT NULL,
      total_rows_synced INT NOT NULL DEFAULT 0,
      auto_verify_on_sync TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_opsc_source (source_type),
      INDEX idx_opsc_auto_sync (auto_sync_enabled)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ off_page_sheet_connections table ready.");

  console.log("2. Ensuring off_page_sync_history table exists...");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS off_page_sync_history (
      id VARCHAR(64) PRIMARY KEY,
      connection_id VARCHAR(64) NULL,
      source_type VARCHAR(50) NOT NULL,
      file_name VARCHAR(255) NULL,
      tab_name VARCHAR(255) NULL,
      started_at DATETIME NOT NULL,
      completed_at DATETIME NULL,
      total_rows INT NOT NULL DEFAULT 0,
      inserted_count INT NOT NULL DEFAULT 0,
      updated_count INT NOT NULL DEFAULT 0,
      duplicates_skipped INT NOT NULL DEFAULT 0,
      invalid_rows INT NOT NULL DEFAULT 0,
      mismatches_detected INT NOT NULL DEFAULT 0,
      verified_count INT NOT NULL DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
      error_log TEXT NULL,
      created_by VARCHAR(255) NULL DEFAULT 'system',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_opsh_conn (connection_id),
      INDEX idx_opsh_started (started_at DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ off_page_sync_history table ready.");

  console.log("3. Ensuring off_page_backlink_discovery_runs table exists...");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS off_page_backlink_discovery_runs (
      run_id VARCHAR(64) PRIMARY KEY,
      provider VARCHAR(100) NOT NULL,
      started_at DATETIME NOT NULL,
      completed_at DATETIME NULL,
      queries_run INT NOT NULL DEFAULT 0,
      candidates_found INT NOT NULL DEFAULT 0,
      links_verified_live INT NOT NULL DEFAULT 0,
      duplicates_skipped INT NOT NULL DEFAULT 0,
      inserted_count INT NOT NULL DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
      errors TEXT NULL,
      details JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_opbdr_started (started_at DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ off_page_backlink_discovery_runs table ready.");

  console.log("4. Checking columns on off_page_opportunities...");
  const [oppCols] = await conn.query(`SHOW COLUMNS FROM off_page_opportunities`);
  const oppColNames = new Set(oppCols.map((c) => c.Field));

  if (!oppColNames.has("next_action")) {
    console.log("Adding column next_action...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN next_action VARCHAR(255) NULL AFTER notes`);
  }
  if (!oppColNames.has("due_date")) {
    console.log("Adding column due_date...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN due_date DATE NULL AFTER next_action`);
  }
  if (!oppColNames.has("internal_note")) {
    console.log("Adding column internal_note...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN internal_note TEXT NULL AFTER due_date`);
  }
  if (!oppColNames.has("source_type")) {
    console.log("Adding column source_type...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN source_type VARCHAR(50) NOT NULL DEFAULT 'curated' AFTER source`);
  }
  if (!oppColNames.has("rejection_reason")) {
    console.log("Adding column rejection_reason...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN rejection_reason VARCHAR(255) NULL AFTER internal_note`);
  }
  if (!oppColNames.has("snoozed_until")) {
    console.log("Adding column snoozed_until...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN snoozed_until DATE NULL AFTER rejection_reason`);
  }
  if (!oppColNames.has("proof_url")) {
    console.log("Adding column proof_url...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN proof_url VARCHAR(1024) NULL AFTER snoozed_until`);
  }
  if (!oppColNames.has("submission_date")) {
    console.log("Adding column submission_date...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN submission_date DATE NULL AFTER proof_url`);
  }
  if (!oppColNames.has("owner")) {
    console.log("Adding column owner...");
    await conn.query(`ALTER TABLE off_page_opportunities ADD COLUMN owner VARCHAR(255) NULL AFTER assigned_to`);
  }

  console.log("5. Checking columns on off_page_backlinks...");
  const [blCols] = await conn.query(`SHOW COLUMNS FROM off_page_backlinks`);
  const blColNames = new Set(blCols.map((c) => c.Field));

  if (!blColNames.has("team_status")) {
    console.log("Adding column team_status...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN team_status VARCHAR(50) NOT NULL DEFAULT 'LIVE' AFTER status`);
    // Backfill team_status from status
    await conn.query(`UPDATE off_page_backlinks SET team_status = status WHERE team_status = 'LIVE'`);
  }
  if (!blColNames.has("verified_status")) {
    console.log("Adding column verified_status...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN verified_status VARCHAR(50) NOT NULL DEFAULT 'NOT_VERIFIED' AFTER team_status`);
    // Backfill verified_status from status if verified
    await conn.query(`UPDATE off_page_backlinks SET verified_status = status WHERE last_checked_at IS NOT NULL`);
  }
  if (!blColNames.has("mismatch_status")) {
    console.log("Adding column mismatch_status...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN mismatch_status VARCHAR(50) NOT NULL DEFAULT 'MATCH' AFTER verified_status`);
  }
  if (!blColNames.has("mismatch_reason")) {
    console.log("Adding column mismatch_reason...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN mismatch_reason VARCHAR(255) NULL AFTER mismatch_status`);
  }
  if (!blColNames.has("mismatch_detected_at")) {
    console.log("Adding column mismatch_detected_at...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN mismatch_detected_at DATETIME NULL AFTER mismatch_reason`);
  }
  if (!blColNames.has("mismatch_resolved_at")) {
    console.log("Adding column mismatch_resolved_at...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN mismatch_resolved_at DATETIME NULL AFTER mismatch_detected_at`);
  }
  if (!blColNames.has("mismatch_resolution")) {
    console.log("Adding column mismatch_resolution...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN mismatch_resolution VARCHAR(50) NULL AFTER mismatch_resolved_at`);
  }

  // Detect initial mismatches safely now that all mismatch columns exist
  await conn.query(`
    UPDATE off_page_backlinks 
    SET mismatch_status = 'MISMATCH',
        mismatch_reason = CONCAT('Team status is ', team_status, ' but crawler verified status is ', verified_status),
        mismatch_detected_at = NOW()
    WHERE team_status != verified_status 
      AND verified_status != 'NOT_VERIFIED'
  `);
  if (!blColNames.has("source_type")) {
    console.log("Adding column source_type...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN source_type VARCHAR(50) NOT NULL DEFAULT 'manual' AFTER placement_type`);
  }
  if (!blColNames.has("owner")) {
    console.log("Adding column owner...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN owner VARCHAR(255) NULL AFTER notes`);
  }
  if (!blColNames.has("cost")) {
    console.log("Adding column cost...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN cost DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER owner`);
  }
  if (!blColNames.has("cost_currency")) {
    console.log("Adding column cost_currency...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN cost_currency VARCHAR(10) NOT NULL DEFAULT 'USD' AFTER cost`);
  }
  if (!blColNames.has("contact_name")) {
    console.log("Adding column contact_name...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN contact_name VARCHAR(255) NULL AFTER cost_currency`);
  }
  if (!blColNames.has("contact_email")) {
    console.log("Adding column contact_email...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN contact_email VARCHAR(255) NULL AFTER contact_name`);
  }
  if (!blColNames.has("proof_url")) {
    console.log("Adding column proof_url...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN proof_url VARCHAR(1024) NULL AFTER contact_email`);
  }
  if (!blColNames.has("submitted_date")) {
    console.log("Adding column submitted_date...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN submitted_date DATE NULL AFTER proof_url`);
  }
  if (!blColNames.has("original_sheet_row_id")) {
    console.log("Adding column original_sheet_row_id...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN original_sheet_row_id VARCHAR(128) NULL AFTER submitted_date`);
  }
  if (!blColNames.has("sheet_connection_id")) {
    console.log("Adding column sheet_connection_id...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD COLUMN sheet_connection_id VARCHAR(64) NULL AFTER original_sheet_row_id`);
  }

  // Create useful indexes if not existing
  const [indexes] = await conn.query(`SHOW INDEX FROM off_page_backlinks`);
  const indexNames = new Set(indexes.map((i) => i.Key_name));

  if (!indexNames.has("idx_opb_mismatch")) {
    console.log("Creating index idx_opb_mismatch...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD INDEX idx_opb_mismatch (mismatch_status)`);
  }
  if (!indexNames.has("idx_opb_team_status")) {
    console.log("Creating index idx_opb_team_status...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD INDEX idx_opb_team_status (team_status)`);
  }
  if (!indexNames.has("idx_opb_verified_status")) {
    console.log("Creating index idx_opb_verified_status...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD INDEX idx_opb_verified_status (verified_status)`);
  }
  if (!indexNames.has("idx_opb_owner")) {
    console.log("Creating index idx_opb_owner...");
    await conn.query(`ALTER TABLE off_page_backlinks ADD INDEX idx_opb_owner (owner)`);
  }

  console.log("==================================================");
  console.log("✓ V8.12.5 SCHEMA MIGRATION COMPLETED SUCCESSFULLY!");
  console.log("==================================================");
  await conn.end();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
