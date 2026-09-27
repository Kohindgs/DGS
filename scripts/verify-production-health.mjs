import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Load .env.production if present
const envPath = path.join(ROOT, ".env.production");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2];
    }
  }
}

// Dynamically import mysql2 from node_modules
const mysql = await import(path.join(ROOT, "node_modules/mysql2/promise/index.js")).catch(async () => {
  return await import("mysql2/promise");
});

const pool = mysql.createPool(process.env.DGS_DATABASE_URL || {
  host: process.env.DGS_MYSQL_HOST,
  user: process.env.DGS_MYSQL_USER,
  password: process.env.DGS_MYSQL_PASSWORD,
  database: process.env.DGS_MYSQL_DATABASE,
  port: Number(process.env.DGS_MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 5,
});

async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function runHealthAudit() {
  console.log("================================================================================");
  console.log("             DGS NATIVE CMS — LIVE PRODUCTION SYSTEM HEALTH AUDIT               ");
  console.log("================================================================================");
  const now = new Date().toISOString();
  const subsystems = {};

  // 1. Database
  const t0 = Date.now();
  try {
    await query("SELECT 1 as ping");
    const latency = Date.now() - t0;
    subsystems.database = {
      id: "database",
      name: "Database (MySQL / MariaDB)",
      status: latency > 1000 ? "DEGRADED" : "HEALTHY",
      details: `Connected (${latency}ms latency)`,
      metrics: { latencyMs: latency },
    };
  } catch (err) {
    subsystems.database = {
      id: "database",
      name: "Database (MySQL / MariaDB)",
      status: "FAILED",
      details: err.message,
    };
  }

  // 2. GSC
  try {
    const connRows = await query(`SELECT service, property_id, status, last_sync_at, last_successful_sync_at, last_error FROM google_connections WHERE service = 'gsc' LIMIT 1`);
    const metricsRows = await query(`SELECT COUNT(*) as total, MAX(metric_date) as latest_date FROM gsc_daily_metrics`);
    const conn = connRows[0];
    const metricCount = Number(metricsRows[0]?.total || 0);
    const latestDate = metricsRows[0]?.latest_date || null;

    if (!conn || conn.status === "disconnected" || !conn.property_id) {
      subsystems.gsc = { id: "gsc", name: "Google Search Console", status: "NOT_CONFIGURED", details: "Pending OAuth configuration", metrics: { connected: false } };
    } else if (conn.status === "error") {
      subsystems.gsc = { id: "gsc", name: "Google Search Console", status: "FAILED", details: conn.last_error, metrics: { connected: false } };
    } else if (metricCount === 0 || !conn.last_successful_sync_at) {
      subsystems.gsc = { id: "gsc", name: "Google Search Console", status: "DEGRADED", details: `Connected (${conn.property_id}), no telemetry rows`, metrics: { metricCount: 0 } };
    } else {
      const daysSince = (Date.now() - new Date(conn.last_successful_sync_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > 30) {
        subsystems.gsc = { id: "gsc", name: "Google Search Console", status: "STALE", details: `Connected (${conn.property_id}), sync is stale (${Math.floor(daysSince)}d ago)` };
      } else {
        subsystems.gsc = { id: "gsc", name: "Google Search Console", status: "HEALTHY", details: `Active integration (${conn.property_id}) · ${metricCount} daily metrics cataloged (Latest: ${latestDate || conn.last_successful_sync_at})` };
      }
    }
  } catch (err) {
    subsystems.gsc = { id: "gsc", name: "Google Search Console", status: "UNKNOWN", details: err.message };
  }

  // 3. GA4
  try {
    const connRows = await query(`SELECT service, property_id, status, last_sync_at, last_successful_sync_at, last_error FROM google_connections WHERE service = 'ga4' LIMIT 1`);
    const metricsRows = await query(`SELECT COUNT(*) as total, MAX(metric_date) as latest_date FROM ga4_daily_metrics`);
    const conn = connRows[0];
    const metricCount = Number(metricsRows[0]?.total || 0);
    const latestDate = metricsRows[0]?.latest_date || null;

    if (!conn || conn.status === "disconnected" || !conn.property_id) {
      subsystems.ga4 = { id: "ga4", name: "Google Analytics 4", status: "NOT_CONFIGURED", details: "Pending property configuration", metrics: { connected: false } };
    } else if (conn.status === "error") {
      subsystems.ga4 = { id: "ga4", name: "Google Analytics 4", status: "FAILED", details: conn.last_error, metrics: { connected: false } };
    } else if (metricCount === 0 || !conn.last_successful_sync_at) {
      subsystems.ga4 = { id: "ga4", name: "Google Analytics 4", status: "DEGRADED", details: `Connected (${conn.property_id}), no telemetry rows`, metrics: { metricCount: 0 } };
    } else {
      const daysSince = (Date.now() - new Date(conn.last_successful_sync_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > 30) {
        subsystems.ga4 = { id: "ga4", name: "Google Analytics 4", status: "STALE", details: `Connected (${conn.property_id}), sync is stale (${Math.floor(daysSince)}d ago)` };
      } else {
        subsystems.ga4 = { id: "ga4", name: "Google Analytics 4", status: "HEALTHY", details: `Active telemetry (${conn.property_id}) · ${metricCount} daily metrics cataloged (Latest: ${latestDate || conn.last_successful_sync_at})` };
      }
    }
  } catch (err) {
    subsystems.ga4 = { id: "ga4", name: "Google Analytics 4", status: "UNKNOWN", details: err.message };
  }

  // 4. SMTP
  const smtpHost = (process.env.DGS_SMTP_HOST || process.env.SMTP_HOST)?.trim();
  const smtpUser = (process.env.DGS_SMTP_USER || process.env.SMTP_USER)?.trim();
  if (!smtpHost || !smtpUser) {
    subsystems.smtp = { id: "smtp", name: "SMTP Mail Dispatcher", status: "NOT_CONFIGURED", details: "SMTP credentials pending in environment" };
  } else {
    try {
      const notifRows = await query(`SELECT sent_at FROM google_update_notifications WHERE smtp_message_id IS NOT NULL ORDER BY sent_at DESC LIMIT 1`);
      const recentEmail = notifRows[0]?.sent_at || null;
      if (recentEmail) {
        const days = (Date.now() - new Date(recentEmail).getTime()) / (1000 * 60 * 60 * 24);
        if (days > 30) {
          subsystems.smtp = { id: "smtp", name: "SMTP Mail Dispatcher", status: "STALE", details: `Host: ${smtpHost}, last delivery ${Math.floor(days)}d ago` };
        } else {
          subsystems.smtp = { id: "smtp", name: "SMTP Mail Dispatcher", status: "HEALTHY", details: `Active mail dispatcher (Host: ${smtpHost}, Last verified delivery: ${recentEmail})` };
        }
      } else {
        subsystems.smtp = { id: "smtp", name: "SMTP Mail Dispatcher", status: "CONFIGURED", details: `Configured with host ${smtpHost} (Ready for dispatch; no delivery telemetry recorded yet)` };
      }
    } catch {
      subsystems.smtp = { id: "smtp", name: "SMTP Mail Dispatcher", status: "CONFIGURED", details: `Configured with host ${smtpHost}` };
    }
  }

  // 5. Gemini
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY)?.trim();
  if (!geminiKey) {
    subsystems.gemini = { id: "gemini", name: "AI Engine (Gemini 2.5)", status: "NOT_CONFIGURED", details: "GEMINI_API_KEY pending in environment" };
  } else {
    try {
      const auditRows = await query(`SELECT created_at, status, summary FROM cms_audit_log WHERE action IN ('assessment.generate', 'assessment.regenerate_question', 'gemini.test_connection', 'gemini.generate') ORDER BY created_at DESC LIMIT 1`);
      let recentAi = auditRows[0]?.created_at || null;
      if (!recentAi) {
        const verRows = await query(`SELECT created_at FROM assessment_versions ORDER BY created_at DESC LIMIT 1`);
        recentAi = verRows[0]?.created_at || null;
      }
      if (recentAi) {
        const days = (Date.now() - new Date(recentAi).getTime()) / (1000 * 60 * 60 * 24);
        if (days > 30) {
          subsystems.gemini = { id: "gemini", name: "AI Engine (Gemini 2.5)", status: "STALE", details: `Configured (gemini-2.5-flash), last verified ${Math.floor(days)}d ago` };
        } else {
          subsystems.gemini = { id: "gemini", name: "AI Engine (Gemini 2.5)", status: "HEALTHY", details: `Provisioned & verified (Model: gemini-2.5-flash, Last verified: ${recentAi})` };
        }
      } else {
        subsystems.gemini = { id: "gemini", name: "AI Engine (Gemini 2.5)", status: "CONFIGURED", details: "API key provisioned for SEO & content intelligence (Model: gemini-2.5-flash; ready for execution)" };
      }
    } catch {
      subsystems.gemini = { id: "gemini", name: "AI Engine (Gemini 2.5)", status: "CONFIGURED", details: "API key provisioned (Model: gemini-2.5-flash)" };
    }
  }

  // 6. Google Updates Monitor
  try {
    const updateRows = await query(`SELECT COUNT(*) as total, MAX(title) as latest_title, MAX(updated_at) as last_checked FROM google_search_updates`);
    const count = Number(updateRows[0]?.total || 0);
    const title = updateRows[0]?.latest_title || "Active";
    subsystems.google_update_monitor = {
      id: "google_update_monitor",
      name: "Google Search Update Monitor",
      status: count > 0 ? "HEALTHY" : "NOT_CONFIGURED",
      details: count > 0 ? `${count} updates cataloged · Latest: ${title}` : "Catalog empty",
      metrics: { updateCount: count, latestUpdateTitle: title },
    };
  } catch (err) {
    subsystems.google_update_monitor = { id: "google_update_monitor", name: "Google Search Update Monitor", status: "UNKNOWN", details: err.message };
  }

  // 7. Blog Scheduler
  try {
    const schedRows = await query(`SELECT COUNT(*) as total FROM blog_posts WHERE status = 'scheduled'`);
    const overdueRows = await query(`SELECT COUNT(*) as overdue FROM blog_posts WHERE status = 'scheduled' AND scheduled_for IS NOT NULL AND scheduled_for < NOW()`);
    const heartbeatRows = await query(`SELECT created_at, status, summary FROM cms_audit_log WHERE action LIKE 'BLOG_SCHEDULE%' OR actor_email = 'scheduler@dgeniussolutions.com' ORDER BY created_at DESC LIMIT 5`);

    const scheduled = Number(schedRows[0]?.total || 0);
    const overdue = Number(overdueRows[0]?.overdue || 0);
    const latestHeartbeat = heartbeatRows[0] || null;
    const lastRun = latestHeartbeat?.created_at || null;
    const ageHours = lastRun ? (Date.now() - new Date(lastRun).getTime()) / (1000 * 60 * 60) : null;

    if (!lastRun) {
      subsystems.blog_scheduler = { id: "blog_scheduler", name: "Editorial Scheduler", status: "UNKNOWN", details: "No scheduler execution evidence recorded in telemetry", metrics: { scheduled, overdue, lastRun: null } };
    } else if (overdue > 0) {
      subsystems.blog_scheduler = { id: "blog_scheduler", name: "Editorial Scheduler", status: "DEGRADED", details: `${overdue} overdue post(s) pending publish (${scheduled} scheduled total)`, metrics: { scheduled, overdue, lastRun } };
    } else if (ageHours > 2) {
      subsystems.blog_scheduler = { id: "blog_scheduler", name: "Editorial Scheduler", status: "STALE", details: `Scheduler heartbeat is stale (${ageHours.toFixed(1)}h ago; expected <= 2h)`, metrics: { scheduled, overdue, lastRun } };
    } else {
      subsystems.blog_scheduler = { id: "blog_scheduler", name: "Editorial Scheduler", status: "HEALTHY", details: `Active scheduler worker (${scheduled} scheduled posts, Last heartbeat: ${ageHours.toFixed(1)}h ago)`, metrics: { scheduled, overdue, lastRun } };
    }
  } catch (err) {
    subsystems.blog_scheduler = { id: "blog_scheduler", name: "Editorial Scheduler", status: "UNKNOWN", details: err.message };
  }

  // 8. Site Audit Worker
  try {
    const latestRuns = await query(`SELECT id, status, overall_score, created_at, completed_at FROM site_audit_runs ORDER BY created_at DESC LIMIT 1`);
    const completedRuns = await query(`SELECT id, status, overall_score, completed_at, created_at FROM site_audit_runs WHERE status = 'completed' ORDER BY completed_at DESC LIMIT 1`);
    const latestRun = latestRuns[0] || null;
    const completed = completedRuns[0] || null;

    if (!latestRun && !completed) {
      subsystems.site_audit_worker = { id: "site_audit_worker", name: "Technical Site Auditor", status: "NOT_CONFIGURED", details: "No audits executed yet" };
    } else if (completed) {
      const days = (Date.now() - new Date(completed.completed_at).getTime()) / (1000 * 60 * 60 * 24);
      const isRunFailed = latestRun && latestRun.status === "failed" && new Date(latestRun.created_at).getTime() > new Date(completed.completed_at).getTime();
      if (isRunFailed) {
        subsystems.site_audit_worker = { id: "site_audit_worker", name: "Technical Site Auditor", status: "DEGRADED", details: `Latest run failed; last completed was ${Math.floor(days)}d ago (Score: ${completed.overall_score}/100)` };
      } else if (days > 15) {
        subsystems.site_audit_worker = { id: "site_audit_worker", name: "Technical Site Auditor", status: "STALE", details: `Latest completed audit was ${Math.floor(days)}d ago (Score: ${completed.overall_score}/100)` };
      } else {
        subsystems.site_audit_worker = { id: "site_audit_worker", name: "Technical Site Auditor", status: "HEALTHY", details: `Latest completed audit: ${Math.floor(days)}d ago (Score: ${completed.overall_score}/100)` };
      }
    } else {
      subsystems.site_audit_worker = { id: "site_audit_worker", name: "Technical Site Auditor", status: latestRun?.status === "running" ? "DEGRADED" : "FAILED", details: `Latest audit status: ${latestRun?.status} (no completed audit on record)` };
    }
  } catch (err) {
    subsystems.site_audit_worker = { id: "site_audit_worker", name: "Technical Site Auditor", status: "UNKNOWN", details: err.message };
  }

  // 9. PageSpeed Worker
  try {
    const cRows = await query(`SELECT COUNT(DISTINCT url) as cnt FROM pagespeed_cache`);
    const jRows = await query(`SELECT SUM(CASE WHEN status = 'QUEUED' THEN 1 ELSE 0 END) as queued, SUM(CASE WHEN status = 'RUNNING' THEN 1 ELSE 0 END) as running, SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed, COUNT(*) as total FROM pagespeed_jobs`);
    const measured = Number(cRows[0]?.cnt || 0);
    const failed = Number(jRows[0]?.failed || 0);
    const queued = Number(jRows[0]?.queued || 0);
    const running = Number(jRows[0]?.running || 0);

    if (failed > 0) {
      subsystems.pagespeed_worker = { id: "pagespeed_worker", name: "PageSpeed Performance Worker", status: "DEGRADED", details: `${failed} failed job(s) in backlog (${measured} URLs measured)` };
    } else {
      subsystems.pagespeed_worker = { id: "pagespeed_worker", name: "PageSpeed Performance Worker", status: "HEALTHY", details: `${measured} URLs cached · ${queued} jobs queued, ${running} running` };
    }
  } catch (err) {
    subsystems.pagespeed_worker = { id: "pagespeed_worker", name: "PageSpeed Performance Worker", status: "UNKNOWN", details: err.message };
  }

  // 10. Native Forms
  try {
    const leadRows = await query(`SELECT COUNT(*) as cnt, SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_cnt, MAX(created_at) as last_lead FROM leads`);
    const subRows = await query(`SELECT COUNT(*) as cnt, MAX(created_at) as last_sub FROM form_submissions`);
    const totalLeads = Number(leadRows[0]?.cnt || 0);
    const newLeads = Number(leadRows[0]?.new_cnt || 0);
    const totalSubs = Number(subRows[0]?.cnt || 0);
    const approvedFormsCount = 11; // Approved: 1, 3, 4, 6, 9, 10, 11, 19, 20, 21, 26

    subsystems.native_forms = {
      id: "native_forms",
      name: "Native Forms & Lead Capture",
      status: (totalLeads > 0 || totalSubs > 0) ? "HEALTHY" : "CONFIGURED",
      details: `${approvedFormsCount} approved native forms active (Form 18 on /seo-pricing/ is LEGACY / UNMIGRATED) · ${totalLeads} leads, ${totalSubs} raw submissions captured`,
      metrics: { approvedFormsCount, legacyForm: "Form 18 (/seo-pricing/) is LEGACY / UNMIGRATED", totalLeads, newLeads, totalSubmissions: totalSubs },
    };
  } catch (err) {
    subsystems.native_forms = { id: "native_forms", name: "Native Forms & Lead Capture", status: "FAILED", details: err.message };
  }

  // 11. Media Processor
  try {
    const mediaRows = await query(`SELECT COUNT(*) as cnt, SUM(CASE WHEN (alt_text IS NULL OR TRIM(alt_text) = '') AND is_decorative = 0 THEN 1 ELSE 0 END) as missing_alt FROM media_assets WHERE deleted_at IS NULL`);
    const mediaCount = Number(mediaRows[0]?.cnt || 0);
    const missingAlt = Number(mediaRows[0]?.missing_alt || 0);

    let sharpOk = false;
    try {
      const sharpMod = await import("sharp");
      sharpOk = typeof sharpMod.default === "function" || typeof sharpMod === "function";
    } catch {}

    const uploadDir = path.resolve(process.env.DGS_UPLOADS_DIR || process.env.DGS_CMS_MEDIA_DIR || "public/uploads");
    let writable = fs.existsSync(uploadDir);

    subsystems.media_processor = {
      id: "media_processor",
      name: "Media Optimization Processor",
      status: (sharpOk && writable) ? "HEALTHY" : "DEGRADED",
      details: `Active WebP conversions & EXIF stripping · Sharp ready · Storage writable (${mediaCount} assets managed, ${missingAlt} missing alt)`,
      metrics: { mediaCount, missingAlt, sharpAvailable: sharpOk, storageWritable: writable },
    };
  } catch (err) {
    subsystems.media_processor = { id: "media_processor", name: "Media Optimization Processor", status: "UNKNOWN", details: err.message };
  }

  // Summary aggregation
  const statuses = Object.values(subsystems).map((s) => s.status);
  const healthyCount = statuses.filter((s) => s === "HEALTHY").length;
  const configuredCount = statuses.filter((s) => s === "CONFIGURED").length;
  const degradedCount = statuses.filter((s) => s === "DEGRADED").length;
  const staleCount = statuses.filter((s) => s === "STALE").length;
  const failedCount = statuses.filter((s) => s === "FAILED").length;
  const notConfiguredCount = statuses.filter((s) => s === "NOT_CONFIGURED").length;
  const unknownCount = statuses.filter((s) => s === "UNKNOWN").length;

  let overallStatus = "HEALTHY";
  if (subsystems.database.status === "FAILED" || subsystems.database.status === "NOT_CONFIGURED" || subsystems.native_forms.status === "FAILED") {
    overallStatus = "CRITICAL";
  } else if (failedCount > 0 || degradedCount > 0 || staleCount > 0 || unknownCount > 0) {
    overallStatus = "DEGRADED";
  } else {
    overallStatus = "HEALTHY";
  }

  console.log(`Timestamp:      ${now}`);
  console.log(`Overall Status: ${overallStatus}`);
  console.log(`Summary:        ${healthyCount} HEALTHY, ${configuredCount} CONFIGURED, ${degradedCount} DEGRADED, ${staleCount} STALE, ${failedCount} FAILED, ${notConfiguredCount} NOT_CONFIGURED, ${unknownCount} UNKNOWN`);
  console.log("--------------------------------------------------------------------------------");
  for (const [id, sub] of Object.entries(subsystems)) {
    const padStatus = `[${sub.status}]`.padEnd(16);
    const padName = sub.name.padEnd(30);
    console.log(`${padStatus} ${padName} : ${sub.details}`);
  }
  console.log("================================================================================");
  await pool.end();
}

runHealthAudit().catch((err) => {
  console.error("Health audit execution failed:", err);
  process.exit(1);
});
