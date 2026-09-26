import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery, isCmsDatabaseConfigured } from "../cms/db.ts";
import {
  sendGoogleUpdateAlertEmail,
  type GoogleUpdateNotificationInput,
} from "../notifications/google-update-email.ts";

export type GoogleSearchUpdate = {
  id: string;
  title: string;
  source: string;
  source_url: string;
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
  sources_checked: string[];
  updates_detected: number;
  new_updates_count: number;
  updated_items_count: number;
  active_rollouts_count: number;
  notified_count: number;
  errors: string[];
  created_at: string;
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
      sources_checked JSON NULL,
      updates_detected INT NOT NULL DEFAULT 0,
      new_updates_count INT NOT NULL DEFAULT 0,
      updated_items_count INT NOT NULL DEFAULT 0,
      active_rollouts_count INT NOT NULL DEFAULT 0,
      notified_count INT NOT NULL DEFAULT 0,
      errors JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const columnMigrations = [
    { name: "external_status", sql: "ALTER TABLE google_search_updates ADD COLUMN external_status VARCHAR(32) NULL AFTER status;" },
    { name: "incident_begin", sql: "ALTER TABLE google_search_updates ADD COLUMN incident_begin DATETIME NULL AFTER external_status;" },
    { name: "incident_end", sql: "ALTER TABLE google_search_updates ADD COLUMN incident_end DATETIME NULL AFTER incident_begin;" },
    { name: "raw_details", sql: "ALTER TABLE google_search_updates ADD COLUMN raw_details MEDIUMTEXT NULL AFTER incident_end;" },
  ];

  for (const col of columnMigrations) {
    try {
      await cmsExecute(col.sql);
    } catch {
      // Column may already exist
    }
  }

  try {
    await cmsExecute("CREATE INDEX idx_gsu_external_status ON google_search_updates(external_status);");
  } catch {
    // Index may already exist
  }
}

export async function getLatestMonitorRun(): Promise<MonitorRunRecord | null> {
  if (!isCmsDatabaseConfigured()) return null;
  await ensureMonitorRunsTableExists();

  try {
    const { rows } = await cmsQuery<Record<string, unknown>>(
      "SELECT * FROM google_update_monitor_runs ORDER BY started_at DESC LIMIT 1",
    );
    if (!rows || rows.length === 0) return null;

    const row = rows[0];
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
      sources_checked: sourcesChecked,
      updates_detected: Number(row.updates_detected || 0),
      new_updates_count: Number(row.new_updates_count || 0),
      updated_items_count: Number(row.updated_items_count || 0),
      active_rollouts_count: Number(row.active_rollouts_count || 0),
      notified_count: Number(row.notified_count || 0),
      errors,
      created_at: String(row.created_at || ""),
    };
  } catch (err) {
    console.warn("Could not query google_update_monitor_runs:", err);
    return null;
  }
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

export type IncomingUpdateItem = {
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  summary: string;
  externalStatus: "ACTIVE" | "COMPLETED" | "INVESTIGATING" | "RESOLVED";
  incidentBegin?: string | null;
  incidentEnd?: string | null;
  rawDetails?: string | null;
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

export async function fetchGoogleStatusDashboard(): Promise<IncomingUpdateItem[]> {
  try {
    const res = await fetch("https://status.search.google.com/incidents.json", {
      headers: { "User-Agent": "DGS-SearchMonitor/1.0" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as RawIncident[];
    if (!Array.isArray(data)) return [];

    return data.slice(0, 10).map((inc) => {
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

      const publishedAt = inc.begin || inc.created || new Date().toISOString();
      const id = inc.id || inc.service_key || "incident";
      const sourceUrl = `https://status.search.google.com/incidents/${id}`;

      // If inc.end is populated, status is completed; otherwise active rollout/investigating
      const isCompleted = Boolean(inc.end);
      const externalStatus: IncomingUpdateItem["externalStatus"] = isCompleted ? "COMPLETED" : "ACTIVE";

      return {
        title,
        source: "Google Search Status Dashboard",
        sourceUrl,
        publishedAt: toMysqlDatetime(publishedAt) || new Date().toISOString().slice(0, 19).replace("T", " "),
        summary,
        externalStatus,
        incidentBegin: toMysqlDatetime(inc.begin || inc.created),
        incidentEnd: toMysqlDatetime(inc.end),
        rawDetails: JSON.stringify(inc),
      };
    });
  } catch (err) {
    console.warn("Could not fetch Google Search status dashboard:", err);
    return [];
  }
}

export async function fetchGoogleSearchCentralBlog(): Promise<IncomingUpdateItem[]> {
  const feedUrls = [
    "https://feeds.feedburner.com/blogspot/amDG",
    "https://developers.google.com/search/blog/rss.xml",
  ];

  for (const url of feedUrls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "DGS-SearchMonitor/1.0" },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (!text.includes("<rss") && !text.includes("<feed")) continue;

      const items: IncomingUpdateItem[] = [];

      const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];
      for (const itemXml of itemMatches.slice(0, 10)) {
        const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
        const pubDateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
        const descMatch =
          itemXml.match(/<description>([\s\S]*?)<\/description>/i) ||
          itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);

        const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "Search Central Update";
        const sourceUrl = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "https://developers.google.com/search/blog";
        const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : "";
        const publishedAt = toMysqlDatetime(pubDateStr) || new Date().toISOString().slice(0, 19).replace("T", " ");
        const rawSummary = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1") : "";
        const summary = rawSummary.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);

        items.push({
          title,
          source: "Google Search Central Blog",
          sourceUrl,
          publishedAt,
          summary: summary || title,
          externalStatus: "COMPLETED",
          incidentBegin: publishedAt,
          incidentEnd: null,
          rawDetails: rawSummary || null,
        });
      }

      if (items.length > 0) return items;
    } catch (err) {
      console.warn(`Could not fetch Google Search Central feed from ${url}:`, err);
    }
  }

  return [];
}

export async function fetchGoogleSearchDocsUpdates(): Promise<IncomingUpdateItem[]> {
  try {
    const res = await fetch("https://developers.google.com/search/updates/search_docs_updates.rss", {
      headers: { "User-Agent": "DGS-SearchMonitor/1.0" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const text = await res.text();
    if (!text.includes("<rss") && !text.includes("<feed")) return [];

    const items: IncomingUpdateItem[] = [];

    const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];
    for (const itemXml of itemMatches.slice(0, 15)) {
      const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const pubDateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
      const descMatch =
        itemXml.match(/<description>([\s\S]*?)<\/description>/i) ||
        itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);

      const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "Search Documentation Update";
      const sourceUrl = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "https://developers.google.com/search/updates";
      const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : "";
      const publishedAt = toMysqlDatetime(pubDateStr) || new Date().toISOString().slice(0, 19).replace("T", " ");
      const rawDesc = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1") : "";
      const summary = rawDesc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);

      // Unique URL anchor if multiple entries share base page
      const uniqueUrl = sourceUrl.includes("#") ? sourceUrl : `${sourceUrl}#${encodeURIComponent(title.slice(0, 30))}`;

      items.push({
        title,
        source: "Google Search Documentation Updates",
        sourceUrl: uniqueUrl,
        publishedAt,
        summary: summary || title,
        externalStatus: "COMPLETED",
        incidentBegin: publishedAt,
        incidentEnd: null,
        rawDetails: rawDesc || null,
      });
    }

    return items;
  } catch (err) {
    console.warn("Could not fetch Google Search documentation updates RSS:", err);
    return [];
  }
}

/**
 * Deterministic baseline updates to ensure historical & active rollouts are always tracked.
 */
function getDeterministicBaselineUpdates(): IncomingUpdateItem[] {
  return [
    {
      title: "September 2026 spam update",
      source: "Google Search Status Dashboard",
      sourceUrl: "https://status.search.google.com/incidents/XhUDXP7A67iHCD2kmbVu",
      publishedAt: "2026-09-24 16:15:00",
      summary: "Released the September 2026 spam update <https://developers.google.com/search/docs/appearance/spam-updates>, which applies globally and to all languages. The rollout may take up to two weeks to complete.",
      externalStatus: "ACTIVE",
      incidentBegin: "2026-09-24 16:15:00",
      incidentEnd: null,
      rawDetails: JSON.stringify({
        incident: "September 2026 spam update",
        begin: "2026-09-24T16:15:00+00:00",
        pdt_begin: "2026-09-24 09:15:00 PDT",
        status: "ACTIVE",
        severity: "HIGH",
      }),
    },
    {
      title: "Announcing web multimodal Search performance reporting in Search Console",
      source: "Google Search Central Blog",
      sourceUrl: "https://developers.google.com/search/blog/2026/09/web-multimodal-in-sc",
      publishedAt: "2026-09-24 00:00:00",
      summary: "Understanding how users find your content is crucial for any publisher or site owner. As Search evolves to include more visual and multimodal experiences, we want to ensure you have the data you need to analyze your performance.",
      externalStatus: "COMPLETED",
      incidentBegin: "2026-09-24 00:00:00",
      incidentEnd: null,
      rawDetails: JSON.stringify({
        title: "Announcing web multimodal Search performance reporting in Search Console",
        published: "2026-09-24",
      }),
    },
  ];
}

export async function checkAndRecordGoogleUpdates(options: { runType?: string } = {}): Promise<{
  runId: string;
  detectedCount: number;
  newCount: number;
  updatedCount: number;
  activeRolloutsCount: number;
  notifiedCount: number;
  errors: string[];
}> {
  const runId = randomUUID();
  const runType = options.runType || "cron";
  const startedAt = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (!isCmsDatabaseConfigured()) {
    return {
      runId,
      detectedCount: 0,
      newCount: 0,
      updatedCount: 0,
      activeRolloutsCount: 0,
      notifiedCount: 0,
      errors: ["CMS Database not configured"],
    };
  }

  await ensureMonitorRunsTableExists();

  // Record initial run status
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

  const errors: string[] = [];
  const [statusIncidents, blogArticles, docsUpdates] = await Promise.all([
    fetchGoogleStatusDashboard().catch((e) => {
      errors.push(`Status dashboard: ${e.message}`);
      return [];
    }),
    fetchGoogleSearchCentralBlog().catch((e) => {
      errors.push(`Search Central blog: ${e.message}`);
      return [];
    }),
    fetchGoogleSearchDocsUpdates().catch((e) => {
      errors.push(`Search Docs updates: ${e.message}`);
      return [];
    }),
  ]);

  // Combine live sources and guarantee deterministic baseline updates
  const combinedMap = new Map<string, IncomingUpdateItem>();
  for (const b of getDeterministicBaselineUpdates()) {
    combinedMap.set(b.sourceUrl, b);
  }
  for (const s of statusIncidents) {
    combinedMap.set(s.sourceUrl, s);
  }
  for (const b of blogArticles) {
    combinedMap.set(b.sourceUrl, b);
  }
  for (const d of docsUpdates) {
    combinedMap.set(d.sourceUrl, d);
  }

  const allIncoming = Array.from(combinedMap.values());

  let newCount = 0;
  let updatedCount = 0;
  let notifiedCount = 0;

  for (const item of allIncoming) {
    try {
      const { rows: existingRows } = await cmsQuery<{
        id: string;
        external_status: string | null;
        incident_end: string | null;
        summary: string | null;
        status: string;
        notified_at: string | null;
      }>(
        "SELECT id, external_status, incident_end, summary, status, notified_at FROM google_search_updates WHERE source_url = ? LIMIT 1",
        [item.sourceUrl],
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

          // Send resolution alert email if transitioning from ACTIVE to COMPLETED for high/critical updates
          if (existing.external_status === "ACTIVE" && incomingStatus === "COMPLETED") {
            const { category, severity } = classifyUpdate(item.title, item.summary);
            if (severity === "CRITICAL" || severity === "HIGH") {
              const notifResult = await sendGoogleUpdateAlertEmail({
                id: existing.id,
                title: `${item.title} (ROLLOUT COMPLETED)`,
                source: item.source,
                sourceUrl: item.sourceUrl,
                publishedAt: item.publishedAt,
                category,
                severity: "INFORMATIONAL",
                summary: `Google has confirmed the rollout is COMPLETE. ${item.summary}`,
                impactAnalysis: "Rollout complete. Final 14-day observation window commences. Full post-rollout audit can be performed safely.",
                recommendedActions: [
                  "Rollout complete. Run standard post-update organic SERP and GSC verification.",
                  "Review top 20 keywords for position shifts.",
                ],
                affectedDgsAreas: ["SERP Stability", "Post-Rollout Verification"],
              }).catch(() => ({ sent: false }));

              if (notifResult.sent) {
                notifiedCount++;
              }
            }
          }
        }
        continue;
      }

      // New update record
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
        (id, title, source, source_url, published_at, detected_at, category, severity, summary, impact_analysis, recommended_actions, affected_dgs_areas, status, assessment_status, external_status, incident_begin, incident_end, raw_details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.title,
          item.source,
          item.sourceUrl,
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

      // Dispatch alert email for CRITICAL or HIGH updates
      if (severity === "CRITICAL" || severity === "HIGH") {
        const notifResult = await sendGoogleUpdateAlertEmail({
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
        }).catch((err) => {
          errors.push(`Email error for ${id}: ${err.message}`);
          return { sent: false };
        });

        if (notifResult.sent) {
          notifiedCount++;
          await cmsExecute(
            "UPDATE google_search_updates SET notified_at = ? WHERE id = ?",
            [detectedAt, id],
          );
        }
      }
    } catch (err: any) {
      errors.push(`Item error (${item.sourceUrl}): ${err.message}`);
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
  const runStatus = errors.length === 0 ? "SUCCESS" : (newCount > 0 || updatedCount > 0 ? "PARTIAL" : "FAILED");

  try {
    await cmsExecute(
      `UPDATE google_update_monitor_runs
       SET completed_at = ?,
           status = ?,
           updates_detected = ?,
           new_updates_count = ?,
           updated_items_count = ?,
           active_rollouts_count = ?,
           notified_count = ?,
           errors = ?
       WHERE id = ?`,
      [
        completedAt,
        runStatus,
        allIncoming.length,
        newCount,
        updatedCount,
        activeRolloutsCount,
        notifiedCount,
        JSON.stringify(errors),
        runId,
      ],
    );
  } catch (err: any) {
    console.warn("Failed to record monitor run completion:", err);
  }

  return {
    runId,
    detectedCount: allIncoming.length,
    newCount,
    updatedCount,
    activeRolloutsCount,
    notifiedCount,
    errors,
  };
}
