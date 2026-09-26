import { randomUUID, createHash } from "node:crypto";
import { cmsExecute, cmsQuery, isCmsDatabaseConfigured } from "../cms/db.ts";
import {
  sendGoogleUpdateAlertEmail,
  sendTestGoogleUpdateEmail,
  type GoogleUpdateNotificationInput,
} from "../notifications/google-update-email.ts";

export { sendTestGoogleUpdateEmail };

export type GoogleSearchUpdate = {
  id: string;
  title: string;
  source: string;
  source_url: string;
  external_id?: string | null;
  published_at: string;
  detected_at: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFORMATIONAL";
  summary: string;
  impact_analysis: string;
  recommended_actions: string[];
  affected_dgs_areas: string[];
  status: "new" | "acknowledged" | "monitoring" | "resolved";
  assessment_status: "NOT APPLICABLE" | "NOT ASSESSED" | "ASSESSING" | "COMPLIANT" | "NEEDS REVIEW" | "NON-COMPLIANT" | "INSUFFICIENT EVIDENCE";
  assessment_date?: string | null;
  evidence?: string | null;
  affected_pages?: string[];
  checks_performed?: Array<{ name: string; description: string; result: "PASS" | "FAIL" | "WARN" | "INFO"; details?: string }>;
  issues_found?: string[];
  recommendations?: string[];
  assessed_by?: string | null;
  assessment_mode?: string | null;
  confidence?: number | null;
  notified_at?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  external_status?: "ACTIVE" | "COMPLETED" | "INVESTIGATING" | "RESOLVED" | null;
  incident_begin?: string | null;
  incident_end?: string | null;
  raw_details?: string | null;
};

export type MonitorRunRecord = {
  id: string;
  run_type: string;
  started_at: string;
  completed_at: string | null;
  status: "RUNNING" | "SUCCESS" | "PARTIAL" | "FAILED";
  status_dashboard_ok: boolean;
  search_central_blog_ok: boolean;
  docs_updates_ok: boolean;
  last_status_dashboard_error?: string | null;
  last_search_central_error?: string | null;
  last_docs_error?: string | null;
  sources_checked: string[];
  updates_detected: number;
  new_updates_count: number;
  updated_items_count: number;
  active_rollouts_count: number;
  notified_count: number;
  errors: string[];
  last_error?: string | null;
  created_at: string;
};

export type SourceCursor = {
  source_id: string;
  source_name: string;
  feed_url: string;
  last_check_at: string;
  last_success_at: string | null;
  status: "HEALTHY" | "FAILED" | "STALE";
  http_status: number | null;
  last_error: string | null;
  last_seen_external_id: string | null;
  last_seen_published_at: string | null;
};

export type SourceFetchResult = {
  ok: boolean;
  source: string;
  httpStatus?: number;
  items: IncomingUpdateItem[];
  error?: string;
  checkedAt: string;
};

export type IncomingUpdateItem = {
  title: string;
  source: string;
  sourceUrl: string;
  externalId?: string;
  publishedAt: string;
  summary: string;
  externalStatus: "ACTIVE" | "COMPLETED" | "INVESTIGATING" | "RESOLVED";
  incidentBegin?: string | null;
  incidentEnd?: string | null;
  rawDetails?: string | null;
};

export async function ensureMonitorRunsTableExists(): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;

  await cmsExecute(`
    CREATE TABLE IF NOT EXISTS google_update_monitor_runs (
      id VARCHAR(64) PRIMARY KEY,
      run_type VARCHAR(32) NOT NULL DEFAULT 'cron',
      started_at DATETIME NOT NULL,
      completed_at DATETIME NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'RUNNING',
      status_dashboard_ok TINYINT(1) NOT NULL DEFAULT 1,
      search_central_blog_ok TINYINT(1) NOT NULL DEFAULT 1,
      docs_updates_ok TINYINT(1) NOT NULL DEFAULT 1,
      last_status_dashboard_error TEXT NULL,
      last_search_central_error TEXT NULL,
      last_docs_error TEXT NULL,
      sources_checked JSON NULL,
      updates_detected INT NOT NULL DEFAULT 0,
      new_updates_count INT NOT NULL DEFAULT 0,
      updated_items_count INT NOT NULL DEFAULT 0,
      active_rollouts_count INT NOT NULL DEFAULT 0,
      notified_count INT NOT NULL DEFAULT 0,
      errors JSON NULL,
      last_error TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_gumr_started (started_at DESC),
      INDEX idx_gumr_completed (completed_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await cmsExecute(`
    CREATE TABLE IF NOT EXISTS google_update_source_cursors (
      source_id VARCHAR(64) PRIMARY KEY,
      source_name VARCHAR(255) NOT NULL,
      feed_url VARCHAR(1024) NOT NULL,
      last_check_at DATETIME NOT NULL,
      last_success_at DATETIME NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'HEALTHY',
      http_status INT NULL,
      last_error TEXT NULL,
      last_seen_external_id VARCHAR(255) NULL,
      last_seen_published_at DATETIME NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_gusc_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await cmsExecute(`
    CREATE TABLE IF NOT EXISTS google_update_notifications (
      id VARCHAR(64) PRIMARY KEY,
      update_id VARCHAR(64) NOT NULL,
      notification_type VARCHAR(64) NOT NULL,
      recipient VARCHAR(255) NOT NULL,
      sent_at DATETIME NOT NULL,
      smtp_message_id VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_update_notif (update_id, notification_type),
      INDEX idx_gun_update (update_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const columnMigrations = [
    { sql: "ALTER TABLE google_search_updates ADD COLUMN external_status VARCHAR(50) NULL AFTER status;" },
    { sql: "ALTER TABLE google_search_updates ADD COLUMN external_id VARCHAR(255) NULL AFTER external_status;" },
    { sql: "ALTER TABLE google_search_updates ADD COLUMN incident_begin DATETIME NULL AFTER external_id;" },
    { sql: "ALTER TABLE google_search_updates ADD COLUMN incident_end DATETIME NULL AFTER incident_begin;" },
    { sql: "ALTER TABLE google_search_updates ADD COLUMN raw_details MEDIUMTEXT NULL AFTER incident_end;" },
    { sql: "ALTER TABLE google_update_monitor_runs ADD COLUMN status_dashboard_ok TINYINT(1) NOT NULL DEFAULT 1 AFTER status;" },
    { sql: "ALTER TABLE google_update_monitor_runs ADD COLUMN search_central_blog_ok TINYINT(1) NOT NULL DEFAULT 1 AFTER status_dashboard_ok;" },
    { sql: "ALTER TABLE google_update_monitor_runs ADD COLUMN docs_updates_ok TINYINT(1) NOT NULL DEFAULT 1 AFTER search_central_blog_ok;" },
    { sql: "ALTER TABLE google_update_monitor_runs ADD COLUMN last_status_dashboard_error TEXT NULL AFTER docs_updates_ok;" },
    { sql: "ALTER TABLE google_update_monitor_runs ADD COLUMN last_search_central_error TEXT NULL AFTER last_status_dashboard_error;" },
    { sql: "ALTER TABLE google_update_monitor_runs ADD COLUMN last_docs_error TEXT NULL AFTER last_search_central_error;" },
    { sql: "ALTER TABLE google_update_monitor_runs ADD COLUMN last_error TEXT NULL AFTER errors;" },
  ];

  for (const migration of columnMigrations) {
    try {
      await cmsExecute(migration.sql);
    } catch {
      // Column may already exist
    }
  }

  const indexes = [
    "CREATE INDEX idx_gsu_external_status ON google_search_updates(external_status);",
    "CREATE INDEX idx_gsu_external_id ON google_search_updates(external_id);",
  ];
  for (const idx of indexes) {
    try {
      await cmsExecute(idx);
    } catch {
      // Index may already exist
    }
  }
}

export async function getLatestMonitorRun(runType?: string): Promise<MonitorRunRecord | null> {
  if (!isCmsDatabaseConfigured()) return null;
  await ensureMonitorRunsTableExists();

  try {
    const whereSql = runType ? " WHERE run_type = ?" : "";
    const params = runType ? [runType] : [];
    const { rows } = await cmsQuery<Record<string, unknown>>(
      `SELECT * FROM google_update_monitor_runs${whereSql} ORDER BY started_at DESC LIMIT 1`,
      params,
    );
    if (!rows || rows.length === 0) return null;

    return mapRowToMonitorRun(rows[0]);
  } catch (err) {
    console.warn("Could not query google_update_monitor_runs:", err);
    return null;
  }
}

function mapRowToMonitorRun(row: Record<string, unknown>): MonitorRunRecord {
  let sourcesChecked: string[] = [];
  let errors: string[] = [];

  try {
    sourcesChecked = typeof row.sources_checked === "string"
      ? JSON.parse(row.sources_checked)
      : (row.sources_checked as any || []);
  } catch {
    sourcesChecked = [];
  }

  try {
    errors = typeof row.errors === "string"
      ? JSON.parse(row.errors)
      : (row.errors as any || []);
  } catch {
    errors = [];
  }

  return {
    id: String(row.id),
    run_type: String(row.run_type || "cron"),
    started_at: String(row.started_at || ""),
    completed_at: row.completed_at ? String(row.completed_at) : null,
    status: String(row.status || "SUCCESS") as any,
    status_dashboard_ok: Boolean(row.status_dashboard_ok ?? 1),
    search_central_blog_ok: Boolean(row.search_central_blog_ok ?? 1),
    docs_updates_ok: Boolean(row.docs_updates_ok ?? 1),
    last_status_dashboard_error: row.last_status_dashboard_error ? String(row.last_status_dashboard_error) : null,
    last_search_central_error: row.last_search_central_error ? String(row.last_search_central_error) : null,
    last_docs_error: row.last_docs_error ? String(row.last_docs_error) : null,
    sources_checked: sourcesChecked,
    updates_detected: Number(row.updates_detected || 0),
    new_updates_count: Number(row.new_updates_count || 0),
    updated_items_count: Number(row.updated_items_count || 0),
    active_rollouts_count: Number(row.active_rollouts_count || 0),
    notified_count: Number(row.notified_count || 0),
    errors,
    last_error: row.last_error ? String(row.last_error) : null,
    created_at: String(row.created_at || ""),
  };
}

export function calculateNextCronRun(fromTime: Date = new Date()): string {
  // Cron schedule: 17 */3 * * * (hours 0, 3, 6, 9, 12, 15, 18, 21 at minute 17 UTC)
  const scheduledHours = [0, 3, 6, 9, 12, 15, 18, 21];
  const date = new Date(fromTime);
  const currentUtcHour = date.getUTCHours();
  const currentUtcMin = date.getUTCMinutes();

  for (const h of scheduledHours) {
    if (h > currentUtcHour || (h === currentUtcHour && currentUtcMin < 17)) {
      date.setUTCHours(h, 17, 0, 0);
      return date.toISOString();
    }
  }

  // Next occurrence is tomorrow at 00:17 UTC
  date.setUTCDate(date.getUTCDate() + 1);
  date.setUTCHours(0, 17, 0, 0);
  return date.toISOString();
}

export async function getMonitorSchedulerState(): Promise<{
  isActive: boolean;
  workflowBranch: string;
  cronSchedule: string;
  nextExpectedCron: string;
  lastScheduledRun: MonitorRunRecord | null;
  lastManualRun: MonitorRunRecord | null;
  lastSuccessfulRun: MonitorRunRecord | null;
  sourceStatuses: {
    statusDashboard: { status: "HEALTHY" | "FAILED" | "STALE"; lastSuccessAt: string | null; lastError: string | null };
    searchCentral: { status: "HEALTHY" | "FAILED" | "STALE"; lastSuccessAt: string | null; lastError: string | null };
    docsUpdates: { status: "HEALTHY" | "FAILED" | "STALE"; lastSuccessAt: string | null; lastError: string | null };
  };
}> {
  if (!isCmsDatabaseConfigured()) {
    return {
      isActive: false,
      workflowBranch: "main",
      cronSchedule: "17 */3 * * *",
      nextExpectedCron: calculateNextCronRun(),
      lastScheduledRun: null,
      lastManualRun: null,
      lastSuccessfulRun: null,
      sourceStatuses: {
        statusDashboard: { status: "STALE", lastSuccessAt: null, lastError: "Database not configured" },
        searchCentral: { status: "STALE", lastSuccessAt: null, lastError: "Database not configured" },
        docsUpdates: { status: "STALE", lastSuccessAt: null, lastError: "Database not configured" },
      },
    };
  }

  await ensureMonitorRunsTableExists();

  const [scheduledRows, manualRows, successRows, cursorRows] = await Promise.all([
    cmsQuery<Record<string, unknown>>("SELECT * FROM google_update_monitor_runs WHERE run_type = 'cron' ORDER BY started_at DESC LIMIT 1"),
    cmsQuery<Record<string, unknown>>("SELECT * FROM google_update_monitor_runs WHERE run_type = 'manual' ORDER BY started_at DESC LIMIT 1"),
    cmsQuery<Record<string, unknown>>("SELECT * FROM google_update_monitor_runs WHERE status = 'SUCCESS' ORDER BY started_at DESC LIMIT 1"),
    cmsQuery<Record<string, unknown>>("SELECT * FROM google_update_source_cursors"),
  ]);

  const lastScheduled = scheduledRows.rows[0] ? mapRowToMonitorRun(scheduledRows.rows[0]) : null;
  const lastManual = manualRows.rows[0] ? mapRowToMonitorRun(manualRows.rows[0]) : null;
  const lastSuccess = successRows.rows[0] ? mapRowToMonitorRun(successRows.rows[0]) : null;

  const cursorsMap = new Map<string, Record<string, unknown>>();
  for (const c of cursorRows.rows) {
    cursorsMap.set(String(c.source_id), c);
  }

  const resolveSourceStatus = (id: string, defaultName: string) => {
    const c = cursorsMap.get(id);
    if (!c) {
      return { status: "STALE" as const, lastSuccessAt: null, lastError: "Awaiting first execution" };
    }
    const lastSuccess = c.last_success_at ? String(c.last_success_at) : null;
    const lastError = c.last_error ? String(c.last_error) : null;
    const rawStatus = String(c.status || "HEALTHY").toUpperCase();

    // Check staleness (if last success was over 6 hours ago, label STALE)
    let finalStatus: "HEALTHY" | "FAILED" | "STALE" = "HEALTHY";
    if (rawStatus === "FAILED" || (lastError && !lastSuccess)) {
      finalStatus = "FAILED";
    } else if (lastSuccess) {
      const diffMs = Date.now() - new Date(lastSuccess).getTime();
      const sixHoursMs = 6 * 60 * 60 * 1000;
      if (diffMs > sixHoursMs) {
        finalStatus = "STALE";
      } else {
        finalStatus = "HEALTHY";
      }
    } else {
      finalStatus = "STALE";
    }

    return {
      status: finalStatus,
      lastSuccessAt: lastSuccess,
      lastError,
    };
  };

  return {
    isActive: true,
    workflowBranch: "main",
    cronSchedule: "17 */3 * * *",
    nextExpectedCron: calculateNextCronRun(),
    lastScheduledRun: lastScheduled,
    lastManualRun: lastManual,
    lastSuccessfulRun: lastSuccess,
    sourceStatuses: {
      statusDashboard: resolveSourceStatus("status_dashboard", "Google Search Status Dashboard"),
      searchCentral: resolveSourceStatus("search_central_blog", "Google Search Central Blog"),
      docsUpdates: resolveSourceStatus("docs_updates", "Google Search Documentation Updates"),
    },
  };
}

export async function listGoogleSearchUpdates(options: {
  limit?: number;
  severity?: string;
  status?: string;
  assessmentStatus?: string;
} = {}): Promise<GoogleSearchUpdate[]> {
  if (!isCmsDatabaseConfigured()) return [];
  await ensureMonitorRunsTableExists();

  const limit = options.limit || 50;
  const whereClauses: string[] = [];
  const params: unknown[] = [];

  if (options.severity && options.severity !== "all") {
    whereClauses.push("severity = ?");
    params.push(options.severity.toUpperCase());
  }

  if (options.status && options.status !== "all") {
    whereClauses.push("status = ?");
    params.push(options.status);
  }

  if (options.assessmentStatus && options.assessmentStatus !== "all") {
    whereClauses.push("assessment_status = ?");
    params.push(options.assessmentStatus);
  }

  const whereSql = whereClauses.length ? ` WHERE ${whereClauses.join(" AND ")}` : "";
  params.push(limit);

  const { rows } = await cmsQuery<Record<string, unknown>>(
    `SELECT * FROM google_search_updates${whereSql} ORDER BY published_at DESC, created_at DESC LIMIT ?`,
    params,
  );

  return rows.map(mapRowToUpdate);
}

export async function getGoogleSearchUpdate(id: string): Promise<GoogleSearchUpdate | null> {
  if (!isCmsDatabaseConfigured()) return null;
  await ensureMonitorRunsTableExists();

  const { rows } = await cmsQuery<Record<string, unknown>>(
    "SELECT * FROM google_search_updates WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] ? mapRowToUpdate(rows[0]) : null;
}

export async function updateSearchUpdateStatus(
  id: string,
  status: "new" | "acknowledged" | "monitoring" | "resolved",
) {
  if (!isCmsDatabaseConfigured()) return;
  const reviewedAt = ["acknowledged", "monitoring", "resolved"].includes(status)
    ? new Date().toISOString().slice(0, 19).replace("T", " ")
    : null;

  await cmsExecute(
    "UPDATE google_search_updates SET status = ?, reviewed_at = COALESCE(reviewed_at, ?) WHERE id = ?",
    [status, reviewedAt, id],
  );
}

function mapRowToUpdate(row: Record<string, unknown>): GoogleSearchUpdate {
  let recommendedActions: string[] = [];
  let affectedAreas: string[] = [];
  let checksPerformed: any[] = [];
  let issuesFound: string[] = [];
  let recommendations: string[] = [];

  try {
    const parsed = typeof row.recommended_actions === "string"
      ? JSON.parse(row.recommended_actions)
      : row.recommended_actions;
    recommendedActions = Array.isArray(parsed) ? parsed : [];
  } catch {
    recommendedActions = [];
  }

  try {
    const parsed = typeof row.affected_dgs_areas === "string"
      ? JSON.parse(row.affected_dgs_areas)
      : row.affected_dgs_areas;
    affectedAreas = Array.isArray(parsed) ? parsed : [];
  } catch {
    affectedAreas = [];
  }

  try {
    const parsed = typeof row.checks_performed === "string"
      ? JSON.parse(row.checks_performed)
      : row.checks_performed;
    checksPerformed = Array.isArray(parsed) ? parsed : [];
  } catch {
    checksPerformed = [];
  }

  try {
    const parsed = typeof row.issues_found === "string"
      ? JSON.parse(row.issues_found)
      : row.issues_found;
    issuesFound = Array.isArray(parsed) ? parsed : [];
  } catch {
    issuesFound = [];
  }

  try {
    const parsed = typeof row.recommendations === "string"
      ? JSON.parse(row.recommendations)
      : row.recommendations;
    recommendations = Array.isArray(parsed) ? parsed : [];
  } catch {
    recommendations = [];
  }

  const title = String(row.title || "");
  const summary = String(row.summary || "");
  const category = String(row.category || "");
  const text = `${title} ${category} ${summary}`.toLowerCase();
  const isInfo = text.includes("search central live") || text.includes("conference") || text.includes("podcast") || text.includes("webinar") || text.includes("event") || text.includes("announcement");

  let rawAssessmentStatus = String(row.assessment_status || "").trim();
  let assessmentStatus: GoogleSearchUpdate["assessment_status"] = "NOT ASSESSED";

  if (isInfo) {
    assessmentStatus = "NOT APPLICABLE";
  } else if (rawAssessmentStatus === "COMPLIANT" && row.evidence) {
    assessmentStatus = "COMPLIANT";
  } else if (["NOT APPLICABLE", "NOT ASSESSED", "ASSESSING", "COMPLIANT", "NEEDS REVIEW", "NON-COMPLIANT", "INSUFFICIENT EVIDENCE"].includes(rawAssessmentStatus)) {
    assessmentStatus = rawAssessmentStatus as GoogleSearchUpdate["assessment_status"];
  } else {
    assessmentStatus = "NOT ASSESSED";
  }

  return {
    id: String(row.id),
    title,
    source: String(row.source),
    source_url: String(row.source_url),
    external_id: row.external_id ? String(row.external_id) : null,
    published_at: String(row.published_at),
    detected_at: String(row.detected_at),
    category,
    severity: String(row.severity) as GoogleSearchUpdate["severity"],
    summary,
    impact_analysis: String(row.impact_analysis),
    recommended_actions: recommendedActions,
    affected_dgs_areas: affectedAreas,
    status: String(row.status) as GoogleSearchUpdate["status"],
    assessment_status: assessmentStatus,
    assessment_date: row.assessment_date ? String(row.assessment_date) : null,
    evidence: row.evidence ? String(row.evidence) : null,
    affected_pages: affectedAreas,
    checks_performed: checksPerformed,
    issues_found: issuesFound,
    recommendations: recommendations.length > 0 ? recommendations : recommendedActions,
    assessed_by: row.assessed_by ? String(row.assessed_by) : null,
    assessment_mode: row.assessment_mode ? String(row.assessment_mode) : null,
    confidence: row.confidence != null ? Number(row.confidence) : null,
    notified_at: row.notified_at ? String(row.notified_at) : null,
    reviewed_at: row.reviewed_at ? String(row.reviewed_at) : null,
    created_at: String(row.created_at || ""),
    updated_at: String(row.updated_at || ""),
    external_status: row.external_status ? (String(row.external_status) as any) : null,
    incident_begin: row.incident_begin ? String(row.incident_begin) : null,
    incident_end: row.incident_end ? String(row.incident_end) : null,
    raw_details: row.raw_details ? String(row.raw_details) : null,
  };
}

export function classifyUpdate(
  title: string,
  summary: string,
): {
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFORMATIONAL";
} {
  const text = `${title} ${summary}`.toLowerCase();

  if (text.includes("core update") || text.includes("broad core")) {
    return { category: "Core Update", severity: "CRITICAL" };
  }
  if (text.includes("spam update") || text.includes("link spam") || text.includes("site reputation")) {
    return { category: "Spam Update", severity: "HIGH" };
  }
  if (text.includes("helpful content") || text.includes("reviews update") || text.includes("review system")) {
    return { category: "Content & Review Systems", severity: "HIGH" };
  }
  if (
    text.includes("ranking incident") ||
    text.includes("indexing issue") ||
    text.includes("serving outage") ||
    text.includes("search incident") ||
    text.includes("service disruption")
  ) {
    return { category: "Search System Incident", severity: "HIGH" };
  }
  if (
    text.includes("ai overview") ||
    text.includes("sge") ||
    text.includes("structured data") ||
    text.includes("schema") ||
    text.includes("multimodal") ||
    text.includes("search console")
  ) {
    return { category: "Search Features & Schema", severity: "MEDIUM" };
  }
  if (text.includes("guidance") || text.includes("best practice") || text.includes("search central") || text.includes("documentation")) {
    return { category: "Search Guidelines", severity: "INFORMATIONAL" };
  }

  return { category: "General Search Announcement", severity: "INFORMATIONAL" };
}

export function generateDgsImpact(
  title: string,
  category: string,
  severity: string,
): { impactAnalysis: string; affectedAreas: string[] } {
  if (severity === "CRITICAL" || category === "Core Update") {
    return {
      impactAnalysis:
        "Broad core algorithm updates re-evaluate all indexed content against holistic quality and search intent. DGS flagship service pages (/services/seo-services-in-mumbai/, /services/ai-video-production-agency/) and core blog articles may experience standard volatility during the 10-14 day rollout window. Brand queries and local Mumbai service signals remain fortified.",
      affectedAreas: [
        "/services/seo-services-in-mumbai/",
        "/services/ai-video-production-agency/",
        "/services/performance-marketing/",
        "/blogs/",
        "Organic Brand Queries",
      ],
    };
  }

  if (category === "Spam Update") {
    return {
      impactAnalysis:
        "Google is cracking down on low-effort scaled content, site reputation abuse, and expired domains. DGS adheres strictly to original editorial standards and white-hat organic practices. Competitors employing manipulative strategies may lose rankings, creating organic capture opportunities for DGS.",
      affectedAreas: [
        "Competitive SERP Visibility",
        "Backlink Quality Profiling",
        "Blog Editorial Integrity",
      ],
    };
  }

  if (category === "Search System Incident") {
    return {
      impactAnalysis:
        "Official Google Search infrastructure incident affecting crawling, indexing, or ranking serving. New blog posts or updated service schemas may take longer to reflect in Google index until the incident status returns to normal.",
      affectedAreas: [
        "New Blog Post Indexation",
        "Search Console Real-Time Reporting",
        "Server Crawl Efficiency",
      ],
    };
  }

  if (category === "Search Features & Schema") {
    return {
      impactAnalysis:
        "Google Search reporting or feature enhancement. Review Search Console performance reports and schema markup to leverage new reporting surfaces without modifying core page copy.",
      affectedAreas: [
        "Google Search Console Reporting",
        "Rich Results & Schema Validation",
        "Multimodal Query Tracking",
      ],
    };
  }

  return {
    impactAnalysis:
      "General search platform update or guideline documentation. Low risk to active ranking positions. Useful for maintaining technical alignment with Google Search Essentials.",
    affectedAreas: [
      "Technical SEO Guidelines",
      "Content Strategy Alignment",
    ],
  };
}

export function generateSafeRecommendations(
  severity: string,
  category: string,
): string[] {
  const recommendations = [
    "STRICT POLICY: Do NOT automatically alter or rewrite ranked pages, H1s, titles, or canonicals during an active Google rollout.",
    "Monitor daily search clicks, impressions, and average position in Google Search Console over the next 14 days.",
    "Verify that server response times, uptime, and SSL certificates are performing without interruption.",
  ];

  if (severity === "CRITICAL" || category === "Core Update") {
    recommendations.push(
      "Observe SERP fluctuations calmly — temporary ranking turbulence is normal during multi-day rollouts.",
      "Conduct qualitative intent checks only after Google officially confirms the rollout is complete.",
    );
  } else if (category === "Spam Update") {
    recommendations.push(
      "Audit any incoming third-party referrers or link anomalies.",
      "Ensure all blog articles feature original insights and verified authorship.",
    );
  } else if (category === "Search System Incident") {
    recommendations.push(
      "Avoid resubmitting sitemaps or requesting manual indexations until Google confirms incident resolution.",
    );
  } else if (category === "Search Features & Schema") {
    recommendations.push(
      "Inspect Google Search Console performance views for any new search appearance or multimodal dimensions.",
    );
  }

  return recommendations;
}

type RawIncident = {
  id?: string;
  number?: string;
  begin?: string;
  created?: string;
  end?: string;
  service_name?: string;
  service_key?: string;
  status_impact?: string;
  external_desc?: string;
  summary?: string;
  updates?: Array<{ when?: string; description?: string; text?: string; status?: string }>;
  most_recent_update?: { when?: string; description?: string; text?: string; status?: string };
};

function toMysqlDatetime(isoOrDateStr: string | null | undefined): string | null {
  if (!isoOrDateStr) return null;
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace("T", " ");
  } catch {
    return null;
  }
}

/**
 * Honest Source 1: Google Search Status Dashboard
 */
export async function fetchGoogleStatusDashboard(lookbackCutoff?: Date): Promise<SourceFetchResult> {
  const source = "Google Search Status Dashboard";
  const checkedAt = new Date().toISOString();

  try {
    const res = await fetch("https://status.search.google.com/incidents.json", {
      headers: { "User-Agent": "DGS-SearchMonitor/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return {
        ok: false,
        source,
        httpStatus: res.status,
        items: [],
        error: `HTTP ${res.status}: ${res.statusText}`,
        checkedAt,
      };
    }

    const data = (await res.json()) as RawIncident[];
    if (!Array.isArray(data)) {
      return {
        ok: false,
        source,
        httpStatus: res.status,
        items: [],
        error: "Invalid JSON response: expected array of incidents",
        checkedAt,
      };
    }

    const cutoffTime = lookbackCutoff ? lookbackCutoff.getTime() : 0;
    const items: IncomingUpdateItem[] = [];

    for (const inc of data) {
      const publishedAt = inc.begin || inc.created || new Date().toISOString();
      const pubDate = new Date(publishedAt);
      if (cutoffTime > 0 && !isNaN(pubDate.getTime()) && pubDate.getTime() < cutoffTime) {
        // If the incident is completed and outside lookback window, skip. If active, keep tracking!
        if (inc.end) continue;
      }

      const summary =
        inc.updates?.[0]?.text ||
        inc.updates?.[0]?.description ||
        inc.most_recent_update?.text ||
        inc.most_recent_update?.description ||
        inc.external_desc ||
        inc.summary ||
        "Google Search status incident reported.";

      const title = inc.external_desc
        ? inc.external_desc
        : inc.service_name
        ? `${inc.service_name} Incident: ${summary.slice(0, 80)}`
        : `Google Search Status Incident: ${summary.slice(0, 80)}`;

      const incidentId = inc.id || inc.service_key || "incident";
      const sourceUrl = `https://status.search.google.com/incidents/${incidentId}`;
      const isCompleted = Boolean(inc.end);
      const externalStatus: IncomingUpdateItem["externalStatus"] = isCompleted ? "COMPLETED" : "ACTIVE";

      items.push({
        title,
        source,
        sourceUrl,
        externalId: incidentId,
        publishedAt: toMysqlDatetime(publishedAt) || new Date().toISOString().slice(0, 19).replace("T", " "),
        summary,
        externalStatus,
        incidentBegin: toMysqlDatetime(inc.begin || inc.created),
        incidentEnd: toMysqlDatetime(inc.end),
        rawDetails: JSON.stringify(inc),
      });
    }

    return {
      ok: true,
      source,
      httpStatus: res.status,
      items,
      checkedAt,
    };
  } catch (err: any) {
    return {
      ok: false,
      source,
      items: [],
      error: String(err?.message || err),
      checkedAt,
    };
  }
}

/**
 * Honest Source 2: Google Search Central Blog
 */
export async function fetchGoogleSearchCentralBlog(lookbackCutoff?: Date): Promise<SourceFetchResult> {
  const source = "Google Search Central Blog";
  const checkedAt = new Date().toISOString();
  const feedUrls = [
    "https://feeds.feedburner.com/blogspot/amDG",
    "https://developers.google.com/search/blog/rss.xml",
  ];

  let lastError = "Could not fetch Search Central blog feed";
  let lastHttpStatus: number | undefined;

  for (const url of feedUrls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "DGS-SearchMonitor/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      lastHttpStatus = res.status;
      if (!res.ok) {
        lastError = `HTTP ${res.status}: ${res.statusText} from ${url}`;
        continue;
      }

      const text = await res.text();
      if (!text.includes("<rss") && !text.includes("<feed")) {
        lastError = `Invalid RSS/Atom XML from ${url}`;
        continue;
      }

      const cutoffTime = lookbackCutoff ? lookbackCutoff.getTime() : 0;
      const items: IncomingUpdateItem[] = [];

      const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];
      for (const itemXml of itemMatches) {
        const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
        const pubDateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
        const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
        const descMatch =
          itemXml.match(/<description>([\s\S]*?)<\/description>/i) ||
          itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);

        const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "Search Central Update";
        const sourceUrl = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "https://developers.google.com/search/blog";
        const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : "";
        const pubDate = new Date(pubDateStr);

        if (cutoffTime > 0 && !isNaN(pubDate.getTime()) && pubDate.getTime() < cutoffTime) {
          continue;
        }

        const publishedAt = toMysqlDatetime(pubDateStr) || new Date().toISOString().slice(0, 19).replace("T", " ");
        const rawSummary = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1") : "";
        const summary = rawSummary.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);
        const externalId = guidMatch ? guidMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : sourceUrl;

        items.push({
          title,
          source,
          sourceUrl,
          externalId,
          publishedAt,
          summary: summary || title,
          externalStatus: "COMPLETED",
          incidentBegin: publishedAt,
          incidentEnd: null,
          rawDetails: rawSummary || null,
        });
      }

      return {
        ok: true,
        source,
        httpStatus: res.status,
        items,
        checkedAt,
      };
    } catch (err: any) {
      lastError = `${err.message} (${url})`;
    }
  }

  return {
    ok: false,
    source,
    httpStatus: lastHttpStatus,
    items: [],
    error: lastError,
    checkedAt,
  };
}

/**
 * Honest Source 3: Google Search Documentation Updates RSS
 */
export async function fetchGoogleSearchDocsUpdates(lookbackCutoff?: Date): Promise<SourceFetchResult> {
  const source = "Google Search Documentation Updates";
  const checkedAt = new Date().toISOString();

  try {
    const res = await fetch("https://developers.google.com/search/updates/search_docs_updates.rss", {
      headers: { "User-Agent": "DGS-SearchMonitor/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return {
        ok: false,
        source,
        httpStatus: res.status,
        items: [],
        error: `HTTP ${res.status}: ${res.statusText}`,
        checkedAt,
      };
    }

    const text = await res.text();
    if (!text.includes("<rss") && !text.includes("<feed")) {
      return {
        ok: false,
        source,
        httpStatus: res.status,
        items: [],
        error: "Invalid RSS feed payload",
        checkedAt,
      };
    }

    const cutoffTime = lookbackCutoff ? lookbackCutoff.getTime() : 0;
    const items: IncomingUpdateItem[] = [];

    const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];
    for (const itemXml of itemMatches) {
      const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const pubDateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
      const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
      const descMatch =
        itemXml.match(/<description>([\s\S]*?)<\/description>/i) ||
        itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);

      const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "Search Documentation Update";
      // Exact official link preserved without artificial modifications
      const sourceUrl = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "https://developers.google.com/search/updates";
      const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : "";
      const pubDate = new Date(pubDateStr);

      if (cutoffTime > 0 && !isNaN(pubDate.getTime()) && pubDate.getTime() < cutoffTime) {
        continue;
      }

      const publishedAt = toMysqlDatetime(pubDateStr) || new Date().toISOString().slice(0, 19).replace("T", " ");
      const rawDesc = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1") : "";
      const summary = rawDesc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);

      // Generate stable deterministic external_id without mutating sourceUrl
      const externalId = guidMatch
        ? guidMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim()
        : createHash("sha256").update(`${sourceUrl}:${title}`).digest("hex").slice(0, 32);

      items.push({
        title,
        source,
        sourceUrl,
        externalId,
        publishedAt,
        summary: summary || title,
        externalStatus: "COMPLETED",
        incidentBegin: publishedAt,
        incidentEnd: null,
        rawDetails: rawDesc || null,
      });
    }

    return {
      ok: true,
      source,
      httpStatus: res.status,
      items,
      checkedAt,
    };
  } catch (err: any) {
    return {
      ok: false,
      source,
      items: [],
      error: String(err?.message || err),
      checkedAt,
    };
  }
}

/**
 * Deduplicated email alert dispatcher backed by google_update_notifications table.
 */
async function dispatchDeduplicatedAlert(params: {
  updateId: string;
  notificationType: "NEW_CRITICAL_UPDATE" | "NEW_HIGH_UPDATE" | "ROLLOUT_COMPLETE" | "MATERIAL_STATUS_CHANGE";
  payload: GoogleUpdateNotificationInput;
}): Promise<boolean> {
  if (!isCmsDatabaseConfigured()) return false;

  try {
    // 1. Strict deduplication check
    const { rows: existingNotifs } = await cmsQuery<{ id: string }>(
      "SELECT id FROM google_update_notifications WHERE update_id = ? AND notification_type = ? LIMIT 1",
      [params.updateId, params.notificationType],
    );

    if (existingNotifs.length > 0) {
      return false; // Already dispatched
    }

    // 2. Dispatch email via nodemailer
    const emailResult = await sendGoogleUpdateAlertEmail(params.payload);
    if (!emailResult.sent) return false;

    // 3. Record in google_update_notifications table with unique constraint
    const notifId = randomUUID();
    const sentAt = new Date().toISOString().slice(0, 19).replace("T", " ");
    const recipient = emailResult.recipient || "ankur.vishwakarma@dgeniussolutions.com";

    await cmsExecute(
      `INSERT INTO google_update_notifications
       (id, update_id, notification_type, recipient, sent_at, smtp_message_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [notifId, params.updateId, params.notificationType, recipient, sentAt, emailResult.messageId || null],
    );

    return true;
  } catch (err) {
    console.warn(`Deduplicated notification failed for ${params.updateId}:`, err);
    return false;
  }
}

/**
 * Primary Google Search Update Monitor Execution Engine.
 * - Zero runtime hardcoded updates.
 * - Honest individual source health tracking.
 * - Strict SUCCESS / PARTIAL / FAILED states.
 * - Rolling lookback safety & source cursors.
 */
export async function checkAndRecordGoogleUpdates(options: { runType?: string } = {}): Promise<{
  runId: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  detectedCount: number;
  newCount: number;
  updatedCount: number;
  activeRolloutsCount: number;
  notifiedCount: number;
  sourceHealth: {
    statusDashboardOk: boolean;
    searchCentralBlogOk: boolean;
    docsUpdatesOk: boolean;
  };
  errors: string[];
}> {
  const runId = randomUUID();
  const runType = options.runType || "cron";
  const startedAt = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (!isCmsDatabaseConfigured()) {
    return {
      runId,
      status: "FAILED",
      detectedCount: 0,
      newCount: 0,
      updatedCount: 0,
      activeRolloutsCount: 0,
      notifiedCount: 0,
      sourceHealth: { statusDashboardOk: false, searchCentralBlogOk: false, docsUpdatesOk: false },
      errors: ["CMS Database not configured"],
    };
  }

  await ensureMonitorRunsTableExists();

  const sourcesChecked = [
    "https://status.search.google.com/incidents.json",
    "https://feeds.feedburner.com/blogspot/amDG",
    "https://developers.google.com/search/updates/search_docs_updates.rss",
  ];

  try {
    await cmsExecute(
      `INSERT INTO google_update_monitor_runs
      (id, run_type, started_at, status, sources_checked, updates_detected, new_updates_count, updated_items_count, active_rollouts_count, notified_count)
      VALUES (?, ?, ?, 'RUNNING', ?, 0, 0, 0, 0, 0)`,
      [runId, runType, startedAt, JSON.stringify(sourcesChecked)],
    );
  } catch (err: any) {
    console.warn("Failed to record monitor run start:", err);
  }

  // Determine lookback window:
  // - 30 days if no previous successful run
  // - 7 days on regular scheduled runs
  let lookbackDays = 7;
  try {
    const { rows: prevSuccess } = await cmsQuery<{ id: string }>(
      "SELECT id FROM google_update_monitor_runs WHERE status = 'SUCCESS' LIMIT 1",
    );
    if (prevSuccess.length === 0) {
      lookbackDays = 30;
    }
  } catch {
    lookbackDays = 7;
  }

  const lookbackCutoff = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

  // Fetch all 3 official sources concurrently with honest error reporting
  const [statusDashboardResult, blogResult, docsResult] = await Promise.all([
    fetchGoogleStatusDashboard(lookbackCutoff),
    fetchGoogleSearchCentralBlog(lookbackCutoff),
    fetchGoogleSearchDocsUpdates(lookbackCutoff),
  ]);

  // Overall status rules:
  // SUCCESS: all 3 required sources succeeded
  // PARTIAL: 1 or 2 sources failed, but at least 1 succeeded
  // FAILED: all sources failed
  const allOk = statusDashboardResult.ok && blogResult.ok && docsResult.ok;
  const anyOk = statusDashboardResult.ok || blogResult.ok || docsResult.ok;
  const runStatus: "SUCCESS" | "PARTIAL" | "FAILED" = allOk ? "SUCCESS" : anyOk ? "PARTIAL" : "FAILED";

  const errors: string[] = [];
  if (!statusDashboardResult.ok && statusDashboardResult.error) {
    errors.push(`Status dashboard: ${statusDashboardResult.error}`);
  }
  if (!blogResult.ok && blogResult.error) {
    errors.push(`Search Central blog: ${blogResult.error}`);
  }
  if (!docsResult.ok && docsResult.error) {
    errors.push(`Docs updates RSS: ${docsResult.error}`);
  }

  // Update source cursors
  const nowDatetime = new Date().toISOString().slice(0, 19).replace("T", " ");
  const sourceResults = [
    {
      id: "status_dashboard",
      name: "Google Search Status Dashboard",
      url: "https://status.search.google.com/incidents.json",
      res: statusDashboardResult,
    },
    {
      id: "search_central_blog",
      name: "Google Search Central Blog",
      url: "https://feeds.feedburner.com/blogspot/amDG",
      res: blogResult,
    },
    {
      id: "docs_updates",
      name: "Google Search Documentation Updates",
      url: "https://developers.google.com/search/updates/search_docs_updates.rss",
      res: docsResult,
    },
  ];

  for (const s of sourceResults) {
    try {
      const maxPub = s.res.items.reduce<string | null>((acc, item) => {
        if (!acc || item.publishedAt > acc) return item.publishedAt;
        return acc;
      }, null);
      const latestExtId = s.res.items[0]?.externalId || null;

      await cmsExecute(
        `INSERT INTO google_update_source_cursors
         (source_id, source_name, feed_url, last_check_at, last_success_at, status, http_status, last_error, last_seen_external_id, last_seen_published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           last_check_at = VALUES(last_check_at),
           last_success_at = CASE WHEN VALUES(status) = 'HEALTHY' THEN VALUES(last_check_at) ELSE last_success_at END,
           status = VALUES(status),
           http_status = VALUES(http_status),
           last_error = VALUES(last_error),
           last_seen_external_id = COALESCE(VALUES(last_seen_external_id), last_seen_external_id),
           last_seen_published_at = COALESCE(VALUES(last_seen_published_at), last_seen_published_at)`,
        [
          s.id,
          s.name,
          s.url,
          nowDatetime,
          s.res.ok ? nowDatetime : null,
          s.res.ok ? "HEALTHY" : "FAILED",
          s.res.httpStatus || null,
          s.res.error || null,
          latestExtId,
          maxPub,
        ],
      );
    } catch (err: any) {
      console.warn(`Failed to update cursor for ${s.id}:`, err);
    }
  }

  // Combine live sources ONLY — zero runtime hardcoded baseline
  const incomingMap = new Map<string, IncomingUpdateItem>();
  for (const item of statusDashboardResult.items) {
    incomingMap.set(item.externalId || item.sourceUrl, item);
  }
  for (const item of blogResult.items) {
    incomingMap.set(item.externalId || item.sourceUrl, item);
  }
  for (const item of docsResult.items) {
    incomingMap.set(item.externalId || item.sourceUrl, item);
  }

  const allIncoming = Array.from(incomingMap.values());
  let newCount = 0;
  let updatedCount = 0;
  let notifiedCount = 0;

  for (const item of allIncoming) {
    try {
      // Find existing update by external_id or source_url
      const { rows: existingRows } = await cmsQuery<{
        id: string;
        external_status: string | null;
        incident_end: string | null;
        summary: string | null;
        status: string;
        severity: string;
        raw_details: string | null;
      }>(
        "SELECT id, external_status, incident_end, summary, status, severity, raw_details FROM google_search_updates WHERE external_id = ? OR source_url = ? LIMIT 1",
        [item.externalId || item.sourceUrl, item.sourceUrl],
      );

      if (existingRows.length > 0) {
        const existing = existingRows[0];
        let hasChanges = false;

        const incomingStatus = item.externalStatus;
        const incomingEnd = item.incidentEnd || null;

        if (existing.external_status !== incomingStatus) hasChanges = true;
        if (incomingEnd && existing.incident_end !== incomingEnd) hasChanges = true;
        if (item.summary && existing.summary !== item.summary) hasChanges = true;

        if (hasChanges) {
          const isNowResolved = incomingStatus === "COMPLETED" && (existing.status === "new" || existing.status === "monitoring");
          const nextStatus = isNowResolved ? "resolved" : existing.status;

          await cmsExecute(
            `UPDATE google_search_updates
             SET external_status = ?,
                 incident_end = COALESCE(?, incident_end),
                 summary = ?,
                 status = ?,
                 raw_details = COALESCE(?, raw_details),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [incomingStatus, incomingEnd, item.summary, nextStatus, item.rawDetails || null, existing.id],
          );
          updatedCount++;

          // Send resolution alert email when transitioning from ACTIVE to COMPLETED
          if (existing.external_status === "ACTIVE" && incomingStatus === "COMPLETED") {
            const { category, severity } = classifyUpdate(item.title, item.summary);
            if (severity === "CRITICAL" || severity === "HIGH") {
              const dispatched = await dispatchDeduplicatedAlert({
                updateId: existing.id,
                notificationType: "ROLLOUT_COMPLETE",
                payload: {
                  id: existing.id,
                  title: `${item.title} (ROLLOUT COMPLETED)`,
                  source: item.source,
                  sourceUrl: item.sourceUrl,
                  publishedAt: item.publishedAt,
                  category,
                  severity: "INFORMATIONAL",
                  summary: `Google has officially confirmed the rollout is COMPLETE. ${item.summary}`,
                  impactAnalysis: "Rollout complete. Final 14-day observation window commences. Full post-rollout audit can be performed safely.",
                  recommendedActions: [
                    "Rollout complete. Run standard post-update organic SERP and GSC verification.",
                    "Review top 20 keywords for position shifts.",
                  ],
                  affectedDgsAreas: ["SERP Stability", "Post-Rollout Verification"],
                },
              });

              if (dispatched) notifiedCount++;
            }
          }
        }
        continue;
      }

      // New update record insertion
      const id = randomUUID();
      const detectedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      const publishedAt = item.publishedAt;

      const { category, severity } = classifyUpdate(item.title, item.summary);
      const { impactAnalysis, affectedAreas } = generateDgsImpact(item.title, category, severity);
      const recommendedActions = generateSafeRecommendations(severity, category);

      const text = `${item.title} ${category} ${item.summary}`.toLowerCase();
      const isInfo = text.includes("search central live") || text.includes("conference") || text.includes("podcast") || text.includes("webinar") || text.includes("event") || text.includes("announcement");
      const initialAssessmentStatus = isInfo ? "NOT APPLICABLE" : "NOT ASSESSED";

      await cmsExecute(
        `INSERT INTO google_search_updates
        (id, title, source, source_url, external_id, published_at, detected_at, category, severity, summary, impact_analysis, recommended_actions, affected_dgs_areas, status, assessment_status, external_status, incident_begin, incident_end, raw_details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.title,
          item.source,
          item.sourceUrl,
          item.externalId || null,
          publishedAt,
          detectedAt,
          category,
          severity,
          item.summary,
          impactAnalysis,
          JSON.stringify(recommendedActions),
          JSON.stringify(affectedAreas),
          "new",
          initialAssessmentStatus,
          item.externalStatus,
          item.incidentBegin || null,
          item.incidentEnd || null,
          item.rawDetails || null,
        ],
      );

      newCount++;

      // Dispatch alert email with strict deduplication for CRITICAL or HIGH updates
      if (severity === "CRITICAL" || severity === "HIGH") {
        const notifType = severity === "CRITICAL" ? "NEW_CRITICAL_UPDATE" : "NEW_HIGH_UPDATE";
        const dispatched = await dispatchDeduplicatedAlert({
          updateId: id,
          notificationType: notifType,
          payload: {
            id,
            title: item.title,
            source: item.source,
            sourceUrl: item.sourceUrl,
            publishedAt,
            category,
            severity,
            summary: item.summary,
            impactAnalysis,
            recommendedActions,
            affectedDgsAreas: affectedAreas,
          },
        });

        if (dispatched) {
          notifiedCount++;
          await cmsExecute(
            "UPDATE google_search_updates SET notified_at = ? WHERE id = ?",
            [detectedAt, id],
          );
        }
      }
    } catch (err: any) {
      errors.push(`Item processing error (${item.sourceUrl}): ${err.message}`);
    }
  }

  // Count active rollouts
  let activeRolloutsCount = 0;
  try {
    const { rows: activeRows } = await cmsQuery<{ count: number }>(
      "SELECT COUNT(*) AS count FROM google_search_updates WHERE external_status = 'ACTIVE'",
    );
    activeRolloutsCount = Number(activeRows[0]?.count || 0);
  } catch {
    activeRolloutsCount = 0;
  }

  // Record monitor run completion
  const completedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
  const lastError = errors.length > 0 ? errors[0] : null;

  try {
    await cmsExecute(
      `UPDATE google_update_monitor_runs
       SET completed_at = ?,
           status = ?,
           status_dashboard_ok = ?,
           search_central_blog_ok = ?,
           docs_updates_ok = ?,
           last_status_dashboard_error = ?,
           last_search_central_error = ?,
           last_docs_error = ?,
           updates_detected = ?,
           new_updates_count = ?,
           updated_items_count = ?,
           active_rollouts_count = ?,
           notified_count = ?,
           errors = ?,
           last_error = ?
       WHERE id = ?`,
      [
        completedAt,
        runStatus,
        statusDashboardResult.ok ? 1 : 0,
        blogResult.ok ? 1 : 0,
        docsResult.ok ? 1 : 0,
        statusDashboardResult.error || null,
        blogResult.error || null,
        docsResult.error || null,
        allIncoming.length,
        newCount,
        updatedCount,
        activeRolloutsCount,
        notifiedCount,
        JSON.stringify(errors),
        lastError,
        runId,
      ],
    );
  } catch (err: any) {
    console.warn("Failed to record monitor run completion:", err);
  }

  return {
    runId,
    status: runStatus,
    detectedCount: allIncoming.length,
    newCount,
    updatedCount,
    activeRolloutsCount,
    notifiedCount,
    sourceHealth: {
      statusDashboardOk: statusDashboardResult.ok,
      searchCentralBlogOk: blogResult.ok,
      docsUpdatesOk: docsResult.ok,
    },
    errors,
  };
}
