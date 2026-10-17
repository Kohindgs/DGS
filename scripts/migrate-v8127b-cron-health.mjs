import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

/**
 * DGS V8.12.7B Additive Schema Migration:
 * - Creates cron_run_history table for structured scheduled job logging and stale-job detection
 * - Ensures index on blog_posts(status, scheduled_for) for fast scheduled blog publishing queries
 */
async function main() {
  console.log("=== DGS V8.12.7B CRON RUN HISTORY & SCHEDULER INDEX MIGRATION ===");

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
    console.log("[MIGRATE V8.12.7B] No DB credentials found, skipping.");
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
    CREATE TABLE IF NOT EXISTS cron_run_history (
      id VARCHAR(64) PRIMARY KEY,
      job_name VARCHAR(100) NOT NULL,
      endpoint VARCHAR(255) NOT NULL,
      trigger_source VARCHAR(64) NOT NULL DEFAULT 'github_actions',
      started_at DATETIME NOT NULL,
      completed_at DATETIME NULL,
      duration_ms INT NOT NULL DEFAULT 0,
      status VARCHAR(32) NOT NULL DEFAULT 'RUNNING',
      http_status INT NOT NULL DEFAULT 200,
      records_checked INT NOT NULL DEFAULT 0,
      records_processed INT NOT NULL DEFAULT 0,
      records_failed INT NOT NULL DEFAULT 0,
      error_code VARCHAR(100) NULL,
      error_summary TEXT NULL,
      metadata_json JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_crh_job_started (job_name, started_at DESC),
      INDEX idx_crh_status_started (status, started_at DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✓ Table cron_run_history verified.");

  try {
    const [idxRows] = await conn.query(
      "SHOW INDEX FROM blog_posts WHERE Key_name = 'idx_blog_posts_scheduled_due'"
    );
    if (!idxRows || idxRows.length === 0) {
      await conn.query(
        "CREATE INDEX idx_blog_posts_scheduled_due ON blog_posts (status, scheduled_for)"
      );
      console.log("  + Added index idx_blog_posts_scheduled_due on blog_posts(status, scheduled_for)");
    } else {
      console.log("  = Index idx_blog_posts_scheduled_due already exists on blog_posts");
    }
  } catch (err) {
    console.warn("  ! Notice checking blog_posts index:", err.message);
  }

  await conn.end();
  console.log("✓ V8.12.7B migration complete.");
}

main().catch((e) => {
  console.error("V8.12.7B migration error:", e);
  process.exit(1);
});
