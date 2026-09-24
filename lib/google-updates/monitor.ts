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
};

export async function listGoogleSearchUpdates(options: {
  limit?: number;
  severity?: string;
  status?: string;
  assessmentStatus?: string;
} = {}): Promise<GoogleSearchUpdate[]> {
  if (!isCmsDatabaseConfigured()) return [];

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

  // Real assessment status determination: NEVER hardcode COMPLIANT
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
  if (text.includes("ai overview") || text.includes("sge") || text.includes("structured data") || text.includes("schema")) {
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
  }

  return recommendations;
}

type RawIncident = {
  id?: string;
  begin?: string;
  created?: string;
  end?: string;
  service_name?: string;
  service_key?: string;
  status_impact?: string;
  external_desc?: string;
  summary?: string;
  updates?: Array<{ when?: string; description?: string }>;
};

export async function fetchGoogleStatusDashboard(): Promise<Array<{
  title: string;
  sourceUrl: string;
  publishedAt: string;
  summary: string;
}>> {
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
        inc.external_desc ||
        inc.summary ||
        inc.updates?.[0]?.description ||
        "Google Search status incident reported.";
      const title = inc.service_name
        ? `${inc.service_name} Incident: ${summary.slice(0, 80)}`
        : `Google Search Status Incident: ${summary.slice(0, 80)}`;
      const publishedAt = inc.begin || inc.created || new Date().toISOString();
      const id = inc.id || inc.service_key || "incident";
      const sourceUrl = `https://status.search.google.com/incidents/${id}`;

      return {
        title,
        sourceUrl,
        publishedAt,
        summary,
      };
    });
  } catch (err) {
    console.warn("Could not fetch Google Search status dashboard:", err);
    return [];
  }
}

export async function fetchGoogleSearchCentralBlog(): Promise<Array<{
  title: string;
  sourceUrl: string;
  publishedAt: string;
  summary: string;
}>> {
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

      const items: Array<{
        title: string;
        sourceUrl: string;
        publishedAt: string;
        summary: string;
      }> = [];

      // Parse RSS items
      const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];
      for (const itemXml of itemMatches.slice(0, 10)) {
        const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
        const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        const descMatch =
          itemXml.match(/<description>([\s\S]*?)<\/description>/i) ||
          itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);

        const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "Search Central Update";
        const sourceUrl = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "https://developers.google.com/search/blog";
        const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : "";
        const publishedAt = pubDateStr ? new Date(pubDateStr).toISOString() : new Date().toISOString();
        const rawSummary = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1") : "";
        const summary = rawSummary.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);

        items.push({
          title,
          sourceUrl,
          publishedAt,
          summary: summary || title,
        });
      }

      if (items.length > 0) return items;
    } catch (err) {
      console.warn(`Could not fetch Google Search Central feed from ${url}:`, err);
    }
  }

  return [];
}

export async function checkAndRecordGoogleUpdates(): Promise<{
  detectedCount: number;
  newCount: number;
  notifiedCount: number;
  errors: string[];
}> {
  if (!isCmsDatabaseConfigured()) {
    return { detectedCount: 0, newCount: 0, notifiedCount: 0, errors: ["CMS Database not configured"] };
  }

  const errors: string[] = [];
  const [statusIncidents, blogArticles] = await Promise.all([
    fetchGoogleStatusDashboard().catch((e) => {
      errors.push(`Status dashboard: ${e.message}`);
      return [];
    }),
    fetchGoogleSearchCentralBlog().catch((e) => {
      errors.push(`Search Central blog: ${e.message}`);
      return [];
    }),
  ]);

  const allIncoming = [
    ...statusIncidents.map((s) => ({ ...s, source: "Google Search Status Dashboard" })),
    ...blogArticles.map((b) => ({ ...b, source: "Google Search Central Blog" })),
  ];

  let newCount = 0;
  let notifiedCount = 0;

  for (const item of allIncoming) {
    try {
      // Deduplicate by source_url
      const { rows } = await cmsQuery<{ id: string }>(
        "SELECT id FROM google_search_updates WHERE source_url = ? LIMIT 1",
        [item.sourceUrl],
      );

      if (rows.length > 0) {
        continue; // Already processed
      }

      const id = randomUUID();
      const detectedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      const publishedAt = new Date(item.publishedAt).toISOString().slice(0, 19).replace("T", " ");

      const { category, severity } = classifyUpdate(item.title, item.summary);
      const { impactAnalysis, affectedAreas } = generateDgsImpact(item.title, category, severity);
      const recommendedActions = generateSafeRecommendations(severity, category);

      await cmsExecute(
        `INSERT INTO google_search_updates
        (id, title, source, source_url, published_at, detected_at, category, severity, summary, impact_analysis, recommended_actions, affected_dgs_areas, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

  return {
    detectedCount: allIncoming.length,
    newCount,
    notifiedCount,
    errors,
  };
}
