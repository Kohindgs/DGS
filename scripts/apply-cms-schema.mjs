import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

function loadEnvFile(file) {
  return fs.readFile(file,"utf8").then((text)=>{
    for (const raw of text.split(/\r?\n/)) {
      const match=raw.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if(match && !process.env[match[1]]) process.env[match[1]]=match[2];
    }
  }).catch(()=>{});
}

await loadEnvFile(path.join(process.cwd(),".env.production"));
await loadEnvFile(path.join(process.cwd(),".env.local"));

function connectionOptions() {
  const uri=process.env.DGS_DATABASE_URL||process.env.DATABASE_URL;
  if(uri) {
    const url=new URL(uri);
    return {
      host:url.hostname,
      port:Number(url.port||3306),
      user:decodeURIComponent(url.username),
      password:decodeURIComponent(url.password),
      database:url.pathname.replace(/^\//,""),
      ssl:url.searchParams.get("ssl")==="true" ? {} : undefined,
      multipleStatements:true,
    };
  }

  if(!process.env.DGS_MYSQL_HOST||!process.env.DGS_MYSQL_USER||!process.env.DGS_MYSQL_DATABASE) {
    throw new Error("CMS database configuration is missing");
  }
  return {
    host:process.env.DGS_MYSQL_HOST,
    port:Number(process.env.DGS_MYSQL_PORT||3306),
    user:process.env.DGS_MYSQL_USER,
    password:process.env.DGS_MYSQL_PASSWORD||"",
    database:process.env.DGS_MYSQL_DATABASE,
    multipleStatements:true,
  };
}

const schema=await fs.readFile(path.join(process.cwd(),"db","schema.sql"),"utf8");
const connection=await mysql.createConnection(connectionOptions());
try {
  await connection.query(schema);

  // Column migration for blog_posts
  const [cols] = await connection.query("DESCRIBE blog_posts");
  const existingCols = new Set(cols.map((c) => c.Field));

  const migrations = [
    { col: "scheduled_for", sql: "ALTER TABLE blog_posts ADD COLUMN scheduled_for DATETIME NULL" },
    { col: "featured_image_url", sql: "ALTER TABLE blog_posts ADD COLUMN featured_image_url VARCHAR(512) NULL" },
    { col: "seo_title", sql: "ALTER TABLE blog_posts ADD COLUMN seo_title VARCHAR(255) NULL" },
    { col: "seo_description", sql: "ALTER TABLE blog_posts ADD COLUMN seo_description TEXT NULL" },
    { col: "focus_keyword", sql: "ALTER TABLE blog_posts ADD COLUMN focus_keyword VARCHAR(255) NULL" },
    { col: "word_count", sql: "ALTER TABLE blog_posts ADD COLUMN word_count INT NOT NULL DEFAULT 0" },
    { col: "reading_time_minutes", sql: "ALTER TABLE blog_posts ADD COLUMN reading_time_minutes INT NOT NULL DEFAULT 3" },
    { col: "needs_review", sql: "ALTER TABLE blog_posts ADD COLUMN needs_review BOOLEAN NOT NULL DEFAULT TRUE" },
  ];

  for (const m of migrations) {
    if (!existingCols.has(m.col)) {
      await connection.query(m.sql);
      console.log(`Applied column migration: ${m.col}`);
    }
  }

  // Column migration for career_jobs
  const [careerCols] = await connection.query("DESCRIBE career_jobs");
  const careerExistingCols = new Set(careerCols.map((c) => c.Field));
  if (!careerExistingCols.has("creative_requirements")) {
    await connection.query("ALTER TABLE career_jobs ADD COLUMN creative_requirements JSON NULL");
    console.log("Applied column migration: career_jobs.creative_requirements");
  }

  // Column migration for google_search_updates
  const [gsuCols] = await connection.query("DESCRIBE google_search_updates");
  const gsuExistingCols = new Set(gsuCols.map((c) => c.Field));
  const gsuMigrations = [
    { col: "assessment_status", sql: "ALTER TABLE google_search_updates ADD COLUMN assessment_status VARCHAR(50) NOT NULL DEFAULT 'NOT ASSESSED'" },
    { col: "assessment_date", sql: "ALTER TABLE google_search_updates ADD COLUMN assessment_date DATETIME NULL" },
    { col: "evidence", sql: "ALTER TABLE google_search_updates ADD COLUMN evidence TEXT NULL" },
    { col: "affected_pages", sql: "ALTER TABLE google_search_updates ADD COLUMN affected_pages JSON NULL" },
    { col: "checks_performed", sql: "ALTER TABLE google_search_updates ADD COLUMN checks_performed JSON NULL" },
    { col: "issues_found", sql: "ALTER TABLE google_search_updates ADD COLUMN issues_found JSON NULL" },
    { col: "recommendations", sql: "ALTER TABLE google_search_updates ADD COLUMN recommendations JSON NULL" },
    { col: "assessed_by", sql: "ALTER TABLE google_search_updates ADD COLUMN assessed_by VARCHAR(255) NULL" },
    { col: "assessment_mode", sql: "ALTER TABLE google_search_updates ADD COLUMN assessment_mode VARCHAR(50) DEFAULT 'automated'" },
    { col: "confidence", sql: "ALTER TABLE google_search_updates ADD COLUMN confidence DECIMAL(5,2) NULL" },
    { col: "external_status", sql: "ALTER TABLE google_search_updates ADD COLUMN external_status VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN'" },
    { col: "incident_begin", sql: "ALTER TABLE google_search_updates ADD COLUMN incident_begin DATETIME NULL" },
    { col: "incident_end", sql: "ALTER TABLE google_search_updates ADD COLUMN incident_end DATETIME NULL" },
    { col: "raw_details", sql: "ALTER TABLE google_search_updates ADD COLUMN raw_details JSON NULL" },
  ];

  for (const m of gsuMigrations) {
    if (!gsuExistingCols.has(m.col)) {
      await connection.query(m.sql);
      console.log(`Applied column migration: google_search_updates.${m.col}`);
    }
  }

  try {
    await connection.query("ALTER TABLE google_search_updates ADD INDEX idx_gsu_external_status (external_status)");
  } catch {}


  // Column migration for site_audit_missing_alts
  try {
    const [samaCols] = await connection.query("DESCRIBE site_audit_missing_alts");
    const samaExistingCols = new Set(samaCols.map((c) => c.Field));
    const samaMigrations = [
      { col: "source_type", sql: "ALTER TABLE site_audit_missing_alts ADD COLUMN source_type VARCHAR(50) NOT NULL DEFAULT 'MIRRORED PAGE HTML'" },
      { col: "source_identifier", sql: "ALTER TABLE site_audit_missing_alts ADD COLUMN source_identifier VARCHAR(255) NULL" },
      { col: "source_location", sql: "ALTER TABLE site_audit_missing_alts ADD COLUMN source_location TEXT NULL" },
      { col: "recommendation", sql: "ALTER TABLE site_audit_missing_alts ADD COLUMN recommendation TEXT NULL" },
      { col: "source_hash", sql: "ALTER TABLE site_audit_missing_alts ADD COLUMN source_hash VARCHAR(64) NULL" },
    ];
    for (const m of samaMigrations) {
      if (!samaExistingCols.has(m.col)) {
        await connection.query(m.sql);
        console.log(`Applied column migration: site_audit_missing_alts.${m.col}`);
      }
    }

    try {
      await connection.query("ALTER TABLE site_audit_missing_alts ADD INDEX idx_sama_source_hash (source_hash)");
    } catch {}
    try {
      await connection.query("ALTER TABLE site_audit_missing_alts ADD INDEX idx_sama_run_page (audit_run_id, page_url(255))");
    } catch {}
  } catch {}

  // Column migration for media_assets
  try {
    const [mediaCols] = await connection.query("DESCRIBE media_assets");
    const mediaExistingCols = new Set(mediaCols.map((c) => c.Field));
    if (!mediaExistingCols.has("alt_source")) {
      await connection.query("ALTER TABLE media_assets ADD COLUMN alt_source VARCHAR(50) NOT NULL DEFAULT 'MANUAL'");
      console.log("Applied column migration: media_assets.alt_source");
    }
  } catch (err) {
    console.warn("media_assets migration notice:", err.message);
  }

  // Column migration for site_audit_runs
  try {
    const [auditCols] = await connection.query("DESCRIBE site_audit_runs");
    const auditExistingCols = new Set(auditCols.map((c) => c.Field));
    const auditMigrations = [
      { col: "discovered_url_count", sql: "ALTER TABLE site_audit_runs ADD COLUMN discovered_url_count INT NOT NULL DEFAULT 0" },
      { col: "crawled_url_count", sql: "ALTER TABLE site_audit_runs ADD COLUMN crawled_url_count INT NOT NULL DEFAULT 0" },
      { col: "failed_url_count", sql: "ALTER TABLE site_audit_runs ADD COLUMN failed_url_count INT NOT NULL DEFAULT 0" },
      { col: "sitemap_error", sql: "ALTER TABLE site_audit_runs ADD COLUMN sitemap_error TEXT NULL" },
    ];
    for (const m of auditMigrations) {
      if (!auditExistingCols.has(m.col)) {
        await connection.query(m.sql);
        console.log(`Applied column migration: site_audit_runs.${m.col}`);
      }
    }
  } catch (err) {
    console.warn("site_audit_runs migration notice:", err.message);
  }

  // Column migrations for GSC metrics (historical comparison)
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gsc_ranking_snapshots (
        id VARCHAR(64) PRIMARY KEY,
        snapshot_date DATE NOT NULL,
        entity_type VARCHAR(32) NOT NULL,
        identifier VARCHAR(512) NOT NULL,
        page_url VARCHAR(512) NULL,
        query_text VARCHAR(512) NULL,
        period_type VARCHAR(50) DEFAULT '28d',
        clicks INT DEFAULT 0,
        impressions INT DEFAULT 0,
        ctr DECIMAL(5,4) DEFAULT 0,
        position DECIMAL(5,2) DEFAULT 0,
        created_at DATETIME NOT NULL,
        INDEX idx_snap_entity (entity_type, identifier(255)),
        INDEX idx_snap_date (snapshot_date),
        INDEX idx_snap_period (period_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // gsc_query_metrics
    const [qmCols] = await connection.query("DESCRIBE gsc_query_metrics");
    const qmExistingCols = new Set(qmCols.map((c) => c.Field));
    if (!qmExistingCols.has("prev_position")) {
      await connection.query("ALTER TABLE gsc_query_metrics ADD COLUMN prev_position DECIMAL(5,2) NULL, ADD COLUMN prev_clicks INT DEFAULT 0, ADD COLUMN prev_impressions INT DEFAULT 0");
      console.log("Applied column migration: gsc_query_metrics.prev_position");
    }

    // gsc_page_metrics
    const [pmCols] = await connection.query("DESCRIBE gsc_page_metrics");
    const pmExistingCols = new Set(pmCols.map((c) => c.Field));
    if (!pmExistingCols.has("prev_position")) {
      await connection.query("ALTER TABLE gsc_page_metrics ADD COLUMN prev_position DECIMAL(5,2) NULL, ADD COLUMN prev_clicks INT DEFAULT 0, ADD COLUMN prev_impressions INT DEFAULT 0");
      console.log("Applied column migration: gsc_page_metrics.prev_position");
    }

    // gsc_page_query_metrics
    const [pqCols] = await connection.query("DESCRIBE gsc_page_query_metrics");
    const pqExistingCols = new Set(pqCols.map((c) => c.Field));
    if (!pqExistingCols.has("prev_position")) {
      await connection.query("ALTER TABLE gsc_page_query_metrics ADD COLUMN prev_position DECIMAL(5,2) NULL, ADD COLUMN prev_clicks INT DEFAULT 0, ADD COLUMN prev_impressions INT DEFAULT 0");
      console.log("Applied column migration: gsc_page_query_metrics.prev_position");
    }
    if (!pqExistingCols.has("canonical_page_key")) {
      await connection.query("ALTER TABLE gsc_page_query_metrics ADD COLUMN canonical_page_key VARCHAR(512) NULL, ADD INDEX idx_gsc_pq_canon (canonical_page_key(255))");
      console.log("Applied column migration: gsc_page_query_metrics.canonical_page_key");
    }
    if (!pqExistingCols.has("query_text_normalized")) {
      await connection.query("ALTER TABLE gsc_page_query_metrics ADD COLUMN query_text_normalized VARCHAR(512) NULL, ADD INDEX idx_gsc_pq_norm (query_text_normalized(255))");
      console.log("Applied column migration: gsc_page_query_metrics.query_text_normalized");
    }

    // gsc_sync_runs columns
    const [srCols] = await connection.query("DESCRIBE gsc_sync_runs");
    const srExistingCols = new Set(srCols.map((c) => c.Field));
    if (!srExistingCols.has("window_start")) {
      await connection.query("ALTER TABLE gsc_sync_runs ADD COLUMN window_start DATE NULL, ADD COLUMN window_end DATE NULL, ADD COLUMN rows_fetched INT DEFAULT 0, ADD COLUMN rows_stored INT DEFAULT 0, ADD COLUMN is_truncated BOOLEAN DEFAULT FALSE");
      console.log("Applied column migration: gsc_sync_runs.window_start & pagination");
    }

    // ga4_sync_runs columns
    const [gaSrCols] = await connection.query("DESCRIBE ga4_sync_runs");
    const gaSrExistingCols = new Set(gaSrCols.map((c) => c.Field));
    if (!gaSrExistingCols.has("active_users")) {
      await connection.query("ALTER TABLE ga4_sync_runs ADD COLUMN active_users INT DEFAULT 0, ADD COLUMN sessions INT DEFAULT 0, ADD COLUMN engaged_sessions INT DEFAULT 0, ADD COLUMN engagement_rate DECIMAL(5,4) DEFAULT 0, ADD COLUMN views INT DEFAULT 0, ADD COLUMN key_events INT DEFAULT 0, ADD COLUMN window_start DATE NULL, ADD COLUMN window_end DATE NULL");
      console.log("Applied column migration: ga4_sync_runs.active_users & window");
    }

    // ga4_page_metrics columns
    const [gaPmCols] = await connection.query("DESCRIBE ga4_page_metrics");
    const gaPmExistingCols = new Set(gaPmCols.map((c) => c.Field));
    if (!gaPmExistingCols.has("canonical_page_key")) {
      await connection.query("ALTER TABLE ga4_page_metrics ADD COLUMN canonical_page_key VARCHAR(512) NULL, ADD INDEX idx_ga4_pm_canon (canonical_page_key(255))");
      console.log("Applied column migration: ga4_page_metrics.canonical_page_key");
    }
  } catch (err) {
    console.warn("GSC historical comparison migration notice:", err.message);
  }

  // Ensure pagespeed_jobs exists
  await connection.query(`
    CREATE TABLE IF NOT EXISTS pagespeed_jobs (
      id VARCHAR(64) PRIMARY KEY,
      audit_run_id VARCHAR(64) NULL,
      url VARCHAR(512) NOT NULL,
      strategy VARCHAR(20) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'QUEUED',
      attempt_count INT NOT NULL DEFAULT 0,
      last_error TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME NULL,
      completed_at DATETIME NULL,
      INDEX idx_psj_audit (audit_run_id),
      INDEX idx_psj_status (status),
      INDEX idx_psj_url (url(255))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Ensure seo_change_requests exists
  await connection.query(`
    CREATE TABLE IF NOT EXISTS seo_change_requests (
      id VARCHAR(64) PRIMARY KEY,
      source_type VARCHAR(64) NOT NULL,
      source_id VARCHAR(64) NULL,
      page_url VARCHAR(512) NOT NULL,
      keyword VARCHAR(255) NULL,
      issue_code VARCHAR(100) NULL,
      change_type VARCHAR(64) NOT NULL,
      risk_level VARCHAR(30) NOT NULL,
      protected_page BOOLEAN NOT NULL DEFAULT FALSE,
      before_state JSON NULL,
      proposed_state JSON NOT NULL,
      diff_json JSON NULL,
      reason TEXT NOT NULL,
      evidence JSON NULL,
      implementation_plan JSON NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
      created_by VARCHAR(255) NOT NULL,
      approved_by VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME NULL,
      applied_at DATETIME NULL,
      verified_at DATETIME NULL,
      failed_at DATETIME NULL,
      rolled_back_at DATETIME NULL,
      error_message TEXT NULL,
      INDEX idx_scr_status (status),
      INDEX idx_scr_page (page_url(255)),
      INDEX idx_scr_created (created_at DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const expectedTables = [
    "assessment_assignments",
    "assessment_attempts",
    "authors",
    "blog_post_categories",
    "blog_post_tags",
    "blog_posts",
    "blog_revisions",
    "career_jobs",
    "categories",
    "form_submissions",
    "google_search_updates",
    "google_update_monitor_runs",
    "google_update_notifications",
    "google_update_source_cursors",
    "gsc_page_query_metrics",
    "leads",
    "media_assets",
    "media_usage",
    "pagespeed_cache",
    "pagespeed_jobs",
    "portfolio_items",
    "seo_change_requests",
    "seo_metadata",
    "site_audit_issues",
    "site_audit_missing_alts",
    "site_audit_pages",
    "site_audit_runs",
    "tags",
    "target_keywords"
  ];

  const [rows]=await connection.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN (${expectedTables.map(() => "?").join(",")}) ORDER BY TABLE_NAME`,
    expectedTables
  );
  const names=rows.map((row)=>row.TABLE_NAME);
  console.log(JSON.stringify({ok:true,tables:names,count:names.length},null,2));
  if(names.length!==expectedTables.length) {
    const missing = expectedTables.filter(t => !names.includes(t));
    throw new Error(`CMS schema verification failed. Missing: ${missing.join(", ")}`);
  }
} finally {
  await connection.end();
}
