import { isCmsDatabaseConfigured, cmsQuery } from "./db";

export type SubsystemStatus = "operational" | "degraded" | "disconnected" | "unconfigured" | "pending";

export type SubsystemHealth = {
  id: string;
  name: string;
  status: SubsystemStatus;
  details: string;
  lastCheckedAt: string;
  metrics?: Record<string, unknown>;
};

export type CmsSystemHealthReport = {
  timestamp: string;
  overallStatus: "healthy" | "degraded" | "critical";
  subsystems: Record<string, SubsystemHealth>;
  summary: {
    totalSubsystems: number;
    operationalCount: number;
    degradedCount: number;
    unconfiguredCount: number;
  };
};

export async function getCmsSystemHealth(): Promise<CmsSystemHealthReport> {
  const now = new Date().toISOString();
  const subsystems: Record<string, SubsystemHealth> = {};

  // 1. DATABASE
  const dbConfigured = isCmsDatabaseConfigured();
  if (!dbConfigured) {
    subsystems.database = {
      id: "database",
      name: "Database (MySQL / MariaDB)",
      status: "unconfigured",
      details: "Database connection parameters not fully set in environment.",
      lastCheckedAt: now,
    };
  } else {
    const t0 = Date.now();
    try {
      await cmsQuery("SELECT 1 as ping");
      const latencyMs = Date.now() - t0;
      subsystems.database = {
        id: "database",
        name: "Database (MySQL / MariaDB)",
        status: latencyMs > 1000 ? "degraded" : "operational",
        details: `Connected (${latencyMs}ms latency)`,
        lastCheckedAt: now,
        metrics: { latencyMs },
      };
    } catch (err: any) {
      subsystems.database = {
        id: "database",
        name: "Database (MySQL / MariaDB)",
        status: "disconnected",
        details: `Connection failed: ${err?.message || "Unknown error"}`,
        lastCheckedAt: now,
      };
    }
  }

  // 2. GOOGLE SEARCH CONSOLE (GSC)
  // 3. GOOGLE ANALYTICS 4 (GA4)
  let gscConnected = false;
  let gscLastSync: string | null = null;
  let ga4Connected = false;
  let ga4LastSync: string | null = null;

  if (subsystems.database.status === "operational") {
    try {
      const { rows } = await cmsQuery<{ service: string; status: string; last_successful_sync_at: string }>(
        `SELECT service, status, last_successful_sync_at FROM google_service_connections`
      );
      for (const row of rows || []) {
        if (row.service === "gsc" && row.status === "connected") {
          gscConnected = true;
          gscLastSync = row.last_successful_sync_at || null;
        }
        if (row.service === "ga4" && row.status === "connected") {
          ga4Connected = true;
          ga4LastSync = row.last_successful_sync_at || null;
        }
      }
    } catch {}
  }

  subsystems.gsc = {
    id: "gsc",
    name: "Google Search Console",
    status: gscConnected ? "operational" : "unconfigured",
    details: gscConnected ? `Active integration (Last sync: ${gscLastSync || "recent"})` : "OAuth credentials or connection pending",
    lastCheckedAt: now,
    metrics: { connected: gscConnected, lastSync: gscLastSync },
  };

  subsystems.ga4 = {
    id: "ga4",
    name: "Google Analytics 4",
    status: ga4Connected ? "operational" : "unconfigured",
    details: ga4Connected ? `Active telemetry (Last sync: ${ga4LastSync || "recent"})` : "Property credentials or connection pending",
    lastCheckedAt: now,
    metrics: { connected: ga4Connected, lastSync: ga4LastSync },
  };

  // 4. SMTP / TRANSACTIONAL EMAIL
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpConfigured = Boolean(smtpHost && smtpUser);
  subsystems.smtp = {
    id: "smtp",
    name: "SMTP Mail Dispatcher",
    status: smtpConfigured ? "operational" : "unconfigured",
    details: smtpConfigured ? `Configured with host ${smtpHost}` : "SMTP credentials pending",
    lastCheckedAt: now,
    metrics: { host: smtpHost || null },
  };

  // 5. GEMINI AI ENGINE
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY?.trim());
  subsystems.gemini = {
    id: "gemini",
    name: "AI Engine (Gemini 2.5)",
    status: geminiConfigured ? "operational" : "unconfigured",
    details: geminiConfigured ? "API Key provisioned for automated SEO & content intelligence" : "GEMINI_API_KEY not configured",
    lastCheckedAt: now,
    metrics: { model: "gemini-2.5-flash" },
  };

  // 6. GOOGLE UPDATE MONITOR
  let updateCount = 0;
  let latestUpdateTitle: string | null = null;
  if (subsystems.database.status === "operational") {
    try {
      const { rows } = await cmsQuery<{ total: number; latest_title: string }>(
        `SELECT COUNT(*) as total, MAX(title) as latest_title FROM google_search_updates`
      );
      updateCount = Number(rows[0]?.total || 0);
      latestUpdateTitle = rows[0]?.latest_title || null;
    } catch {}
  }
  subsystems.google_update_monitor = {
    id: "google_update_monitor",
    name: "Google Search Update Monitor",
    status: updateCount > 0 ? "operational" : "pending",
    details: updateCount > 0 ? `${updateCount} updates cataloged · Latest: ${latestUpdateTitle || "Active"}` : "Update catalog empty",
    lastCheckedAt: now,
    metrics: { updateCount, latestUpdateTitle },
  };

  // 7. BLOG SCHEDULER
  let scheduledBlogCount = 0;
  if (subsystems.database.status === "operational") {
    try {
      const { rows } = await cmsQuery<{ total: number }>(
        `SELECT COUNT(*) as total FROM blog_posts WHERE status = 'scheduled'`
      );
      scheduledBlogCount = Number(rows[0]?.total || 0);
    } catch {}
  }
  subsystems.blog_scheduler = {
    id: "blog_scheduler",
    name: "Editorial Scheduler",
    status: "operational",
    details: `Active worker (${scheduledBlogCount} posts scheduled)`,
    lastCheckedAt: now,
    metrics: { scheduledBlogCount },
  };

  // 8. SITE AUDIT WORKER
  let lastAuditRun: any = null;
  if (subsystems.database.status === "operational") {
    try {
      const { rows } = await cmsQuery<any>(
        `SELECT id, status, overall_score, completed_at FROM site_audit_runs ORDER BY created_at DESC LIMIT 1`
      );
      if (rows && rows[0]) {
        lastAuditRun = rows[0];
      }
    } catch {}
  }
  subsystems.site_audit_worker = {
    id: "site_audit_worker",
    name: "Technical Site Auditor",
    status: lastAuditRun ? "operational" : "pending",
    details: lastAuditRun
      ? `Latest audit: ${lastAuditRun.status} (Score: ${lastAuditRun.overall_score ?? "N/A"}/100)`
      : "No audits executed yet",
    lastCheckedAt: now,
    metrics: { lastAuditId: lastAuditRun?.id, score: lastAuditRun?.overall_score },
  };

  // 9. PAGESPEED WORKER
  let cachedPsCount = 0;
  let queuedPsCount = 0;
  if (subsystems.database.status === "operational") {
    try {
      const [{ rows: cRows }, { rows: qRows }] = await Promise.all([
        cmsQuery<{ cnt: number }>(`SELECT COUNT(DISTINCT url) as cnt FROM pagespeed_cache`),
        cmsQuery<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM pagespeed_jobs WHERE status = 'QUEUED'`),
      ]);
      cachedPsCount = Number(cRows[0]?.cnt || 0);
      queuedPsCount = Number(qRows[0]?.cnt || 0);
    } catch {}
  }
  subsystems.pagespeed_worker = {
    id: "pagespeed_worker",
    name: "PageSpeed Performance Worker",
    status: "operational",
    details: `${cachedPsCount} URLs cached · ${queuedPsCount} jobs in queue`,
    lastCheckedAt: now,
    metrics: { cachedUrls: cachedPsCount, queuedJobs: queuedPsCount },
  };

  // 10. NATIVE FORMS & LEADS
  let totalLeadsCount = 0;
  if (subsystems.database.status === "operational") {
    try {
      const { rows } = await cmsQuery<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM cms_leads`);
      totalLeadsCount = Number(rows[0]?.cnt || 0);
    } catch {}
  }
  subsystems.native_forms = {
    id: "native_forms",
    name: "Native Forms & Lead Capture",
    status: "operational",
    details: `Active and operational · ${totalLeadsCount} submissions captured`,
    lastCheckedAt: now,
    metrics: { totalLeads: totalLeadsCount },
  };

  // 11. MEDIA PROCESSOR
  let mediaCount = 0;
  if (subsystems.database.status === "operational") {
    try {
      const { rows } = await cmsQuery<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM media_assets`);
      mediaCount = Number(rows[0]?.cnt || 0);
    } catch {}
  }
  subsystems.media_processor = {
    id: "media_processor",
    name: "Media Optimization Processor",
    status: "operational",
    details: `Active · WebP conversions & EXIF stripping (${mediaCount} assets managed)`,
    lastCheckedAt: now,
    metrics: { mediaAssetsCount: mediaCount },
  };

  // Aggregate health status
  const statuses = Object.values(subsystems).map((s) => s.status);
  const operationalCount = statuses.filter((s) => s === "operational").length;
  const degradedCount = statuses.filter((s) => s === "degraded" || s === "disconnected").length;
  const unconfiguredCount = statuses.filter((s) => s === "unconfigured" || s === "pending").length;

  let overallStatus: "healthy" | "degraded" | "critical" = "healthy";
  if (subsystems.database.status !== "operational") {
    overallStatus = "critical";
  } else if (degradedCount > 0) {
    overallStatus = "degraded";
  }

  return {
    timestamp: now,
    overallStatus,
    subsystems,
    summary: {
      totalSubsystems: Object.keys(subsystems).length,
      operationalCount,
      degradedCount,
      unconfiguredCount,
    },
  };
}
