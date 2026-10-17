import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery, isCmsDatabaseConfigured } from "./db";

declare global {
  var __dgsCronHistoryTableEnsured: boolean | undefined;
}

export type CronJobName =
  | "scheduled-blog-publisher"
  | "google-search-update-monitor"
  | "off-page-seo-daily-monitor"
  | "buyer-intent-lead-monitor";

export type CronRunStatus = "RUNNING" | "SUCCESS" | "PARTIAL" | "FAILED";

export type CronRunRecord = {
  id: string;
  job_name: CronJobName | string;
  endpoint: string;
  trigger_source: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number;
  status: CronRunStatus;
  http_status: number;
  records_checked: number;
  records_processed: number;
  records_failed: number;
  error_code: string | null;
  error_summary: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
};

export type CronJobDefinition = {
  jobName: CronJobName;
  displayName: string;
  workflowName: string;
  workflowFile: string;
  scheduleCron: string;
  scheduleHuman: string;
  triggerSource: string;
  endpoint: string;
  authMethod: string;
  databaseDependency: string;
  externalNetworkDependency: string;
  staleThresholdMinutes: number;
};

export const DGS_SCHEDULED_JOBS_REGISTRY: CronJobDefinition[] = [
  {
    jobName: "scheduled-blog-publisher",
    displayName: "Scheduled Blog Automated Publisher",
    workflowName: "DGS Scheduled Blog Automated Publisher",
    workflowFile: ".github/workflows/scheduled-blog-publisher.yml",
    scheduleCron: "*/30 * * * *",
    scheduleHuman: "Every 30 minutes",
    triggerSource: "GitHub Actions (schedule / workflow_dispatch)",
    endpoint: "/api/internal/blogs/publish-scheduled",
    authMethod: "Bearer DGS_CRON_SECRET",
    databaseDependency: "MariaDB (blog_posts, seo_metadata, cms_audit_log, cron_run_history)",
    externalNetworkDependency: "None (internal DB & Next.js cache revalidation only)",
    staleThresholdMinutes: 75, // > 75 minutes without success => STALE
  },
  {
    jobName: "google-search-update-monitor",
    displayName: "Google Search Update Automated Monitor",
    workflowName: "DGS Google Search Update Automated Monitor",
    workflowFile: ".github/workflows/google-search-monitor.yml",
    scheduleCron: "17 */3 * * *",
    scheduleHuman: "Every 3 hours at minute 17 UTC",
    triggerSource: "GitHub Actions (schedule / workflow_dispatch)",
    endpoint: "/api/internal/google-updates/check",
    authMethod: "Bearer DGS_CRON_SECRET",
    databaseDependency: "MariaDB (google_search_updates, google_update_monitor_runs, google_update_source_cursors, cron_run_history)",
    externalNetworkDependency: "Google Search Status Dashboard JSON, Search Central Blog RSS, Search Docs Updates RSS, SMTP (conditional)",
    staleThresholdMinutes: 420, // > 7 hours (420m) without success => STALE
  },
  {
    jobName: "off-page-seo-daily-monitor",
    displayName: "Off-Page SEO Daily Monitor & Discovery",
    workflowName: "DGS Off-Page SEO Daily Monitor & Discovery",
    workflowFile: ".github/workflows/off-page-monitor.yml",
    scheduleCron: "30 3 * * *",
    scheduleHuman: "Daily at 03:30 UTC",
    triggerSource: "GitHub Actions (schedule / workflow_dispatch)",
    endpoint: "/api/internal/off-page/check",
    authMethod: "Bearer DGS_CRON_SECRET",
    databaseDependency: "MariaDB (off_page_automation_runs, off_page_opportunities, off_page_backlinks, cron_run_history)",
    externalNetworkDependency: "External backlink source URLs, Opportunity discovery feeds, TurboVec local daemon",
    staleThresholdMinutes: 1560, // > 26 hours (1560m) without success => STALE
  },
  {
    jobName: "buyer-intent-lead-monitor",
    displayName: "Buyer-Intent & LinkedIn/Web Lead Discovery",
    workflowName: "DGS Buyer-Intent Lead Discovery Monitor",
    workflowFile: ".github/workflows/intent-leads-monitor.yml",
    scheduleCron: "*/30 * * * *",
    scheduleHuman: "Every 30 minutes",
    triggerSource: "GitHub Actions (schedule / workflow_dispatch)",
    endpoint: "/api/internal/intent-leads/check",
    authMethod: "Bearer DGS_CRON_SECRET",
    databaseDependency: "MariaDB (intent_lead_signals, intent_lead_discovery_runs, cron_run_history)",
    externalNetworkDependency: "Public LinkedIn / Web SERPs, Reddit API, Gemini 2.5 Flash qualification, SMTP digest",
    staleThresholdMinutes: 75, // > 75 minutes without success => STALE
  },
];

export async function ensureCronRunHistoryTable(): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;
  if (global.__dgsCronHistoryTableEnsured) return;

  await cmsExecute(
    `CREATE TABLE IF NOT EXISTS cron_run_history (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    [],
    { endpoint: "cron-logger", operation: "ENSURE_CRON_HISTORY_TABLE" }
  );

  global.__dgsCronHistoryTableEnsured = true;
}

function toMysqlUtcDatetime(date: Date = new Date()): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function sanitizeErrorSummary(summary?: string | null): string | null {
  if (!summary) return null;
  return String(summary)
    .replace(/mysql:\/\/[^\s'"]+/gi, "mysql://[REDACTED]")
    .replace(/Bearer\s+[^\s'"]+/gi, "Bearer [REDACTED]")
    .slice(0, 2000);
}

export async function recordCronRun(input: {
  id?: string;
  jobName: CronJobName | string;
  endpoint: string;
  triggerSource?: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  status: CronRunStatus;
  httpStatus: number;
  recordsChecked?: number;
  recordsProcessed?: number;
  recordsFailed?: number;
  errorCode?: string | null;
  errorSummary?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<string | null> {
  if (!isCmsDatabaseConfigured()) return null;
  const runId = input.id || `cron_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const completedDate = input.completedAt || new Date();
  const durationMs =
    input.durationMs ?? Math.max(0, completedDate.getTime() - input.startedAt.getTime());

  try {
    await ensureCronRunHistoryTable();
    await cmsExecute(
      `INSERT INTO cron_run_history (
        id, job_name, endpoint, trigger_source, started_at, completed_at,
        duration_ms, status, http_status, records_checked, records_processed,
        records_failed, error_code, error_summary, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        runId,
        input.jobName,
        input.endpoint,
        input.triggerSource || "github_actions",
        toMysqlUtcDatetime(input.startedAt),
        toMysqlUtcDatetime(completedDate),
        durationMs,
        input.status,
        input.httpStatus,
        Number(input.recordsChecked ?? 0),
        Number(input.recordsProcessed ?? 0),
        Number(input.recordsFailed ?? 0),
        input.errorCode || null,
        sanitizeErrorSummary(input.errorSummary),
        input.metadata ? JSON.stringify(input.metadata) : null,
      ],
      { endpoint: input.endpoint, operation: "INSERT_CRON_RUN_HISTORY" }
    );
    return runId;
  } catch (err: any) {
    console.error("[cron-logger] Failed to record cron_run_history entry:", err?.message || err);
    return null;
  }
}

function mapCronRow(row: Record<string, any>): CronRunRecord {
  let metadata: Record<string, unknown> | null = null;
  if (row.metadata_json) {
    try {
      metadata =
        typeof row.metadata_json === "string"
          ? JSON.parse(row.metadata_json)
          : row.metadata_json;
    } catch {
      metadata = null;
    }
  }
  return {
    id: String(row.id),
    job_name: String(row.job_name),
    endpoint: String(row.endpoint),
    trigger_source: String(row.trigger_source || "github_actions"),
    started_at: String(row.started_at),
    completed_at: row.completed_at ? String(row.completed_at) : null,
    duration_ms: Number(row.duration_ms || 0),
    status: String(row.status || "SUCCESS") as CronRunStatus,
    http_status: Number(row.http_status || 200),
    records_checked: Number(row.records_checked || 0),
    records_processed: Number(row.records_processed || 0),
    records_failed: Number(row.records_failed || 0),
    error_code: row.error_code ? String(row.error_code) : null,
    error_summary: row.error_summary ? String(row.error_summary) : null,
    metadata_json: metadata,
    created_at: String(row.created_at || row.started_at),
  };
}

export type CronJobHealthStatus = {
  job: CronJobDefinition;
  currentStatus: "HEALTHY" | "DEGRADED" | "STALE" | "FAILED" | "AWAITING_FIRST_RUN";
  isStale: boolean;
  minutesSinceLastSuccess: number | null;
  lastRun: CronRunRecord | null;
  lastSuccess: CronRunRecord | null;
  lastFailure: CronRunRecord | null;
  recentRunsCount24h: number;
  failedRunsCount24h: number;
};

export async function getCronHealthSummary(limitHistory = 40): Promise<{
  timestamp: string;
  overallStatus: "HEALTHY" | "DEGRADED" | "STALE" | "FAILED";
  jobs: CronJobHealthStatus[];
  recentHistory: CronRunRecord[];
}> {
  const now = new Date();
  if (!isCmsDatabaseConfigured()) {
    return {
      timestamp: now.toISOString(),
      overallStatus: "FAILED",
      jobs: DGS_SCHEDULED_JOBS_REGISTRY.map((job) => ({
        job,
        currentStatus: "FAILED",
        isStale: true,
        minutesSinceLastSuccess: null,
        lastRun: null,
        lastSuccess: null,
        lastFailure: null,
        recentRunsCount24h: 0,
        failedRunsCount24h: 0,
      })),
      recentHistory: [],
    };
  }

  await ensureCronRunHistoryTable();

  const { rows: historyRows } = await cmsQuery<Record<string, any>>(
    `SELECT * FROM cron_run_history ORDER BY started_at DESC LIMIT ?`,
    [Math.min(Math.max(limitHistory, 10), 200)],
    { endpoint: "cron-health", operation: "LIST_CRON_HISTORY" }
  );

  const recentHistory = historyRows.map(mapCronRow);

  // Also query legacy/subsystem tables for fallback historical evidence if cron_run_history has no entry yet for a job
  const [blogHeartbeatRes, googleMonitorRes, offPageRunRes] = await Promise.all([
    cmsQuery<Record<string, any>>(
      `SELECT id, created_at, status, summary, after_state FROM cms_audit_log
       WHERE action = 'BLOG_SCHEDULE_HEARTBEAT' ORDER BY created_at DESC LIMIT 5`
    ).catch(() => ({ rows: [] })),
    cmsQuery<Record<string, any>>(
      `SELECT id, run_type, started_at, completed_at, status, updates_detected, new_updates_count, updated_items_count, last_error
       FROM google_update_monitor_runs ORDER BY started_at DESC LIMIT 5`
    ).catch(() => ({ rows: [] })),
    cmsQuery<Record<string, any>>(
      `SELECT id, run_type, started_at, completed_at, status, error_message
       FROM off_page_automation_runs ORDER BY started_at DESC LIMIT 5`
    ).catch(() => ({ rows: [] })),
  ]);

  const jobs: CronJobHealthStatus[] = [];

  for (const job of DGS_SCHEDULED_JOBS_REGISTRY) {
    const jobRuns = recentHistory.filter((r) => r.job_name === job.jobName);
    let lastRun = jobRuns[0] || null;
    let lastSuccess =
      jobRuns.find((r) => r.status === "SUCCESS" || r.status === "PARTIAL") || null;
    let lastFailure = jobRuns.find((r) => r.status === "FAILED") || null;

    // Fallback to subsystem tables if cron_run_history was just created
    if (!lastRun && job.jobName === "scheduled-blog-publisher" && blogHeartbeatRes.rows[0]) {
      const hb = blogHeartbeatRes.rows[0];
      const fallbackRecord: CronRunRecord = {
        id: String(hb.id),
        job_name: job.jobName,
        endpoint: job.endpoint,
        trigger_source: "audit_log_fallback",
        started_at: String(hb.created_at),
        completed_at: String(hb.created_at),
        duration_ms: 0,
        status: hb.status === "failure" ? "FAILED" : "SUCCESS",
        http_status: hb.status === "failure" ? 500 : 200,
        records_checked: 0,
        records_processed: 0,
        records_failed: hb.status === "failure" ? 1 : 0,
        error_code: null,
        error_summary: hb.status === "failure" ? String(hb.summary) : null,
        metadata_json: null,
        created_at: String(hb.created_at),
      };
      lastRun = fallbackRecord;
      if (fallbackRecord.status === "SUCCESS") lastSuccess = fallbackRecord;
      else lastFailure = fallbackRecord;
    } else if (!lastRun && job.jobName === "google-search-update-monitor" && googleMonitorRes.rows[0]) {
      const gm = googleMonitorRes.rows[0];
      const fallbackRecord: CronRunRecord = {
        id: String(gm.id),
        job_name: job.jobName,
        endpoint: job.endpoint,
        trigger_source: String(gm.run_type || "cron"),
        started_at: String(gm.started_at),
        completed_at: gm.completed_at ? String(gm.completed_at) : null,
        duration_ms: 0,
        status: (gm.status as CronRunStatus) || "SUCCESS",
        http_status: gm.status === "FAILED" ? 500 : 200,
        records_checked: 3,
        records_processed: Number(gm.updates_detected || 0),
        records_failed: gm.status === "FAILED" ? 3 : 0,
        error_code: null,
        error_summary: gm.last_error ? String(gm.last_error) : null,
        metadata_json: null,
        created_at: String(gm.started_at),
      };
      lastRun = fallbackRecord;
      if (fallbackRecord.status === "SUCCESS" || fallbackRecord.status === "PARTIAL") {
        lastSuccess = fallbackRecord;
      } else {
        lastFailure = fallbackRecord;
      }
    } else if (!lastRun && job.jobName === "off-page-seo-daily-monitor" && offPageRunRes.rows[0]) {
      const op = offPageRunRes.rows[0];
      const fallbackRecord: CronRunRecord = {
        id: String(op.id),
        job_name: job.jobName,
        endpoint: job.endpoint,
        trigger_source: String(op.run_type || "cron"),
        started_at: String(op.started_at),
        completed_at: op.completed_at ? String(op.completed_at) : null,
        duration_ms: 0,
        status: op.status === "FAILED" ? "FAILED" : "SUCCESS",
        http_status: op.status === "FAILED" ? 500 : 200,
        records_checked: 0,
        records_processed: 0,
        records_failed: op.status === "FAILED" ? 1 : 0,
        error_code: null,
        error_summary: op.error_message ? String(op.error_message) : null,
        metadata_json: null,
        created_at: String(op.started_at),
      };
      lastRun = fallbackRecord;
      if (fallbackRecord.status === "SUCCESS") lastSuccess = fallbackRecord;
      else lastFailure = fallbackRecord;
    }

    const cutoff24h = now.getTime() - 24 * 60 * 60 * 1000;
    const runs24h = jobRuns.filter((r) => {
      const t = new Date(r.started_at.replace(" ", "T") + "Z").getTime();
      return !isNaN(t) && t >= cutoff24h;
    });
    const failed24h = runs24h.filter((r) => r.status === "FAILED");

    let minutesSinceLastSuccess: number | null = null;
    if (lastSuccess?.started_at) {
      const ts = new Date(lastSuccess.started_at.replace(" ", "T") + "Z").getTime();
      if (!isNaN(ts)) {
        minutesSinceLastSuccess = Math.max(0, Math.round((now.getTime() - ts) / 60000));
      }
    }

    const isStale =
      minutesSinceLastSuccess === null || minutesSinceLastSuccess > job.staleThresholdMinutes;

    let currentStatus: CronJobHealthStatus["currentStatus"] = "HEALTHY";
    if (!lastRun) {
      currentStatus = "AWAITING_FIRST_RUN";
    } else if (lastRun.status === "FAILED") {
      currentStatus = "FAILED";
    } else if (isStale) {
      currentStatus = "STALE";
    } else if (lastRun.status === "PARTIAL") {
      currentStatus = "DEGRADED";
    } else {
      currentStatus = "HEALTHY";
    }

    jobs.push({
      job,
      currentStatus,
      isStale,
      minutesSinceLastSuccess,
      lastRun,
      lastSuccess,
      lastFailure,
      recentRunsCount24h: runs24h.length,
      failedRunsCount24h: failed24h.length,
    });
  }

  let overallStatus: "HEALTHY" | "DEGRADED" | "STALE" | "FAILED" = "HEALTHY";
  if (jobs.some((j) => j.currentStatus === "FAILED")) {
    overallStatus = "FAILED";
  } else if (
    jobs.some(
      (j) =>
        (j.job.jobName === "scheduled-blog-publisher" ||
          j.job.jobName === "google-search-update-monitor") &&
        j.currentStatus === "STALE"
    )
  ) {
    overallStatus = "STALE";
  } else if (jobs.some((j) => j.currentStatus === "DEGRADED" || j.currentStatus === "STALE")) {
    overallStatus = "DEGRADED";
  }

  return {
    timestamp: now.toISOString(),
    overallStatus,
    jobs,
    recentHistory,
  };
}
