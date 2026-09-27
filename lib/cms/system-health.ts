import { isCmsDatabaseConfigured, cmsQuery } from "./db";
import { listApprovedForms } from "../forms/registry";

export type SubsystemStatus =
  | "HEALTHY"
  | "DEGRADED"
  | "STALE"
  | "FAILED"
  | "NOT_CONFIGURED"
  | "CONFIGURED"
  | "UNKNOWN";

export type SubsystemHealth = {
  id: string;
  name: string;
  status: SubsystemStatus;
  details: string;
  lastCheckedAt: string;
  metrics?: Record<string, unknown>;
  error?: string | null;
};

export type CmsSystemHealthReport = {
  timestamp: string;
  overallStatus: "HEALTHY" | "DEGRADED" | "CRITICAL";
  subsystems: Record<string, SubsystemHealth>;
  summary: {
    totalSubsystems: number;
    healthyCount: number;
    degradedCount: number;
    staleCount: number;
    failedCount: number;
    notConfiguredCount: number;
    configuredCount: number;
    unknownCount: number;
    operationalCount?: number;
    unconfiguredCount?: number;
  };
};

export async function getCmsSystemHealth(): Promise<CmsSystemHealthReport> {
  const now = new Date().toISOString();
  const subsystems: Record<string, SubsystemHealth> = {};

  // 1. DATABASE (MySQL / MariaDB) - Critical Core
  const dbConfigured = isCmsDatabaseConfigured();
  let dbAvailable = false;

  if (!dbConfigured) {
    subsystems.database = {
      id: "database",
      name: "Database (MySQL / MariaDB)",
      status: "NOT_CONFIGURED",
      details: "Database connection parameters not fully set in environment.",
      lastCheckedAt: now,
    };
  } else {
    const t0 = Date.now();
    try {
      await cmsQuery("SELECT 1 as ping");
      const latencyMs = Date.now() - t0;
      dbAvailable = true;
      subsystems.database = {
        id: "database",
        name: "Database (MySQL / MariaDB)",
        status: latencyMs > 1000 ? "DEGRADED" : "HEALTHY",
        details: latencyMs > 1000
          ? `Connected (${latencyMs}ms latency - elevated latency)`
          : `Connected (${latencyMs}ms latency)`,
        lastCheckedAt: now,
        metrics: { latencyMs },
      };
    } catch (err: any) {
      console.error("[system-health] Database ping failed:", err?.message || err);
      subsystems.database = {
        id: "database",
        name: "Database (MySQL / MariaDB)",
        status: "FAILED",
        details: `Connection ping failed: ${err?.message || "Unknown error"}`,
        lastCheckedAt: now,
        error: err?.message || "Connection failed",
      };
    }
  }

  // 2. GOOGLE SEARCH CONSOLE (GSC)
  if (!dbAvailable) {
    subsystems.gsc = {
      id: "gsc",
      name: "Google Search Console",
      status: "UNKNOWN",
      details: "Cannot verify connection: database unavailable",
      lastCheckedAt: now,
    };
  } else {
    try {
      const { rows: connRows } = await cmsQuery<{
        service: string;
        property_id: string | null;
        status: string;
        last_sync_at: string | null;
        last_successful_sync_at: string | null;
        last_error: string | null;
      }>(`SELECT service, property_id, status, last_sync_at, last_successful_sync_at, last_error FROM google_connections WHERE service = 'gsc' LIMIT 1`);

      const { rows: metricsRows } = await cmsQuery<{ total: number; latest_date: string | null }>(
        `SELECT COUNT(*) as total, MAX(metric_date) as latest_date FROM gsc_daily_metrics`
      );

      const conn = connRows?.[0];
      const metricCount = Number(metricsRows?.[0]?.total || 0);
      const latestDate = metricsRows?.[0]?.latest_date || null;

      if (!conn || conn.status === "disconnected" || !conn.property_id) {
        subsystems.gsc = {
          id: "gsc",
          name: "Google Search Console",
          status: "NOT_CONFIGURED",
          details: "GSC OAuth connection or property pending configuration",
          lastCheckedAt: now,
          metrics: { connected: false },
        };
      } else if (conn.status === "error") {
        subsystems.gsc = {
          id: "gsc",
          name: "Google Search Console",
          status: "FAILED",
          details: `GSC sync error: ${conn.last_error || "Unknown error"}`,
          lastCheckedAt: now,
          error: conn.last_error,
          metrics: { connected: false, propertyId: conn.property_id },
        };
      } else if (metricCount === 0 || !conn.last_successful_sync_at) {
        subsystems.gsc = {
          id: "gsc",
          name: "Google Search Console",
          status: "DEGRADED",
          details: `Connected to ${conn.property_id}, but no telemetry rows recorded`,
          lastCheckedAt: now,
          metrics: { connected: true, propertyId: conn.property_id, metricCount: 0 },
        };
      } else {
        const daysSinceSync = (Date.now() - new Date(conn.last_successful_sync_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceSync > 30) {
          subsystems.gsc = {
            id: "gsc",
            name: "Google Search Console",
            status: "STALE",
            details: `Connected (${conn.property_id}), sync is stale (${Math.floor(daysSinceSync)}d ago)`,
            lastCheckedAt: now,
            metrics: { connected: true, propertyId: conn.property_id, lastSync: conn.last_successful_sync_at, daysSinceSync: Math.floor(daysSinceSync) },
          };
        } else {
          subsystems.gsc = {
            id: "gsc",
            name: "Google Search Console",
            status: "HEALTHY",
            details: `Active integration (${conn.property_id}) · ${metricCount} daily metrics cataloged (Latest: ${latestDate || conn.last_successful_sync_at})`,
            lastCheckedAt: now,
            metrics: { connected: true, propertyId: conn.property_id, lastSync: conn.last_successful_sync_at, metricCount, latestDate },
          };
        }
      }
    } catch (err: any) {
      console.error("[system-health] GSC check error:", err?.message || err);
      subsystems.gsc = {
        id: "gsc",
        name: "Google Search Console",
        status: "UNKNOWN",
        details: `Failed to inspect GSC connection: ${err?.message || "DB error"}`,
        lastCheckedAt: now,
        error: err?.message || "DB error",
      };
    }
  }

  // 3. GOOGLE ANALYTICS 4 (GA4)
  if (!dbAvailable) {
    subsystems.ga4 = {
      id: "ga4",
      name: "Google Analytics 4",
      status: "UNKNOWN",
      details: "Cannot verify connection: database unavailable",
      lastCheckedAt: now,
    };
  } else {
    try {
      const { rows: connRows } = await cmsQuery<{
        service: string;
        property_id: string | null;
        status: string;
        last_sync_at: string | null;
        last_successful_sync_at: string | null;
        last_error: string | null;
      }>(`SELECT service, property_id, status, last_sync_at, last_successful_sync_at, last_error FROM google_connections WHERE service = 'ga4' LIMIT 1`);

      const { rows: metricsRows } = await cmsQuery<{ total: number; latest_date: string | null }>(
        `SELECT COUNT(*) as total, MAX(metric_date) as latest_date FROM ga4_daily_metrics`
      );

      const conn = connRows?.[0];
      const metricCount = Number(metricsRows?.[0]?.total || 0);
      const latestDate = metricsRows?.[0]?.latest_date || null;

      if (!conn || conn.status === "disconnected" || !conn.property_id) {
        subsystems.ga4 = {
          id: "ga4",
          name: "Google Analytics 4",
          status: "NOT_CONFIGURED",
          details: "GA4 property connection pending configuration",
          lastCheckedAt: now,
          metrics: { connected: false },
        };
      } else if (conn.status === "error") {
        subsystems.ga4 = {
          id: "ga4",
          name: "Google Analytics 4",
          status: "FAILED",
          details: `GA4 sync error: ${conn.last_error || "Unknown error"}`,
          lastCheckedAt: now,
          error: conn.last_error,
          metrics: { connected: false, propertyId: conn.property_id },
        };
      } else if (metricCount === 0 || !conn.last_successful_sync_at) {
        subsystems.ga4 = {
          id: "ga4",
          name: "Google Analytics 4",
          status: "DEGRADED",
          details: `Connected to ${conn.property_id}, but no analytics telemetry recorded`,
          lastCheckedAt: now,
          metrics: { connected: true, propertyId: conn.property_id, metricCount: 0 },
        };
      } else {
        const daysSinceSync = (Date.now() - new Date(conn.last_successful_sync_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceSync > 30) {
          subsystems.ga4 = {
            id: "ga4",
            name: "Google Analytics 4",
            status: "STALE",
            details: `Connected (${conn.property_id}), sync is stale (${Math.floor(daysSinceSync)}d ago)`,
            lastCheckedAt: now,
            metrics: { connected: true, propertyId: conn.property_id, lastSync: conn.last_successful_sync_at, daysSinceSync: Math.floor(daysSinceSync) },
          };
        } else {
          subsystems.ga4 = {
            id: "ga4",
            name: "Google Analytics 4",
            status: "HEALTHY",
            details: `Active telemetry (${conn.property_id}) · ${metricCount} daily metrics cataloged (Latest: ${latestDate || conn.last_successful_sync_at})`,
            lastCheckedAt: now,
            metrics: { connected: true, propertyId: conn.property_id, lastSync: conn.last_successful_sync_at, metricCount, latestDate },
          };
        }
      }
    } catch (err: any) {
      console.error("[system-health] GA4 check error:", err?.message || err);
      subsystems.ga4 = {
        id: "ga4",
        name: "Google Analytics 4",
        status: "UNKNOWN",
        details: `Failed to inspect GA4 connection: ${err?.message || "DB error"}`,
        lastCheckedAt: now,
        error: err?.message || "DB error",
      };
    }
  }

  // 4. SMTP / TRANSACTIONAL EMAIL (with freshness evaluation)
  const smtpHost = (process.env.DGS_SMTP_HOST || process.env.SMTP_HOST)?.trim();
  const smtpUser = (process.env.DGS_SMTP_USER || process.env.SMTP_USER)?.trim();
  const smtpConfigured = Boolean(smtpHost && smtpUser);

  if (!smtpConfigured) {
    subsystems.smtp = {
      id: "smtp",
      name: "SMTP Mail Dispatcher",
      status: "NOT_CONFIGURED",
      details: "SMTP credentials pending in server environment",
      lastCheckedAt: now,
      metrics: { configured: false },
    };
  } else {
    let recentEmailSentAt: string | null = null;
    let recentFailure: string | null = null;

    if (dbAvailable) {
      try {
        const { rows: notifRows } = await cmsQuery<{ sent_at: string }>(
          `SELECT sent_at FROM google_update_notifications WHERE smtp_message_id IS NOT NULL ORDER BY sent_at DESC LIMIT 1`
        );
        if (notifRows && notifRows[0]?.sent_at) {
          recentEmailSentAt = notifRows[0].sent_at;
        }

        const { rows: failRows } = await cmsQuery<{ created_at: string; summary: string }>(
          `SELECT created_at, summary FROM cms_audit_log WHERE (action LIKE '%EMAIL_FAIL%' OR (action LIKE '%NOTIF%' AND status = 'failure')) AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) ORDER BY created_at DESC LIMIT 1`
        );
        if (failRows && failRows[0]) {
          recentFailure = failRows[0].summary;
        }
      } catch (err: any) {
        console.warn("[system-health] Note on email telemetry inspection:", err?.message);
      }
    }

    if (recentFailure) {
      subsystems.smtp = {
        id: "smtp",
        name: "SMTP Mail Dispatcher",
        status: "FAILED",
        details: `Recent SMTP dispatch error within 24h: ${recentFailure}`,
        lastCheckedAt: now,
        metrics: { configured: true, host: smtpHost, error: recentFailure },
      };
    } else if (recentEmailSentAt) {
      const daysSinceDelivery = (Date.now() - new Date(recentEmailSentAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDelivery > 30) {
        subsystems.smtp = {
          id: "smtp",
          name: "SMTP Mail Dispatcher",
          status: "STALE",
          details: `Configured with host ${smtpHost}, but last verified delivery was ${Math.floor(daysSinceDelivery)}d ago (> 30 days)`,
          lastCheckedAt: now,
          metrics: { configured: true, host: smtpHost, lastDelivery: recentEmailSentAt, daysSinceDelivery: Math.floor(daysSinceDelivery) },
        };
      } else {
        subsystems.smtp = {
          id: "smtp",
          name: "SMTP Mail Dispatcher",
          status: "HEALTHY",
          details: `Active mail dispatcher (Host: ${smtpHost}, Last verified delivery: ${recentEmailSentAt})`,
          lastCheckedAt: now,
          metrics: { configured: true, host: smtpHost, lastDelivery: recentEmailSentAt, daysSinceDelivery: Math.floor(daysSinceDelivery) },
        };
      }
    } else {
      subsystems.smtp = {
        id: "smtp",
        name: "SMTP Mail Dispatcher",
        status: "CONFIGURED",
        details: `Configured with host ${smtpHost} (Ready for dispatch; no delivery telemetry recorded yet)`,
        lastCheckedAt: now,
        metrics: { configured: true, host: smtpHost, lastDelivery: null },
      };
    }
  }

  // 5. GEMINI AI ENGINE (with verified operation freshness & quality)
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY)?.trim();
  const geminiConfigured = Boolean(geminiKey);

  if (!geminiConfigured) {
    subsystems.gemini = {
      id: "gemini",
      name: "AI Engine (Gemini 2.5)",
      status: "NOT_CONFIGURED",
      details: "GEMINI_API_KEY not configured in server environment",
      lastCheckedAt: now,
      metrics: { configured: false },
    };
  } else {
    let recentAiActivity: string | null = null;
    let recentAiFailure: string | null = null;

    if (dbAvailable) {
      try {
        const { rows: auditRows } = await cmsQuery<{ created_at: string; status: string; summary: string }>(
          `SELECT created_at, status, summary FROM cms_audit_log
           WHERE action IN ('assessment.generate', 'assessment.regenerate_question', 'gemini.test_connection', 'gemini.generate')
              OR (resource = 'assessment' AND action LIKE '%.generate%')
           ORDER BY created_at DESC LIMIT 5`
        );

        const successItem = auditRows?.find((r) => r.status === "success" || !r.status);
        const failItem = auditRows?.find((r) => r.status === "failure");

        if (successItem) {
          recentAiActivity = successItem.created_at;
        }

        // Also check assessment_versions table for generated assessments
        if (!recentAiActivity) {
          const { rows: verRows } = await cmsQuery<{ created_at: string }>(
            `SELECT created_at FROM assessment_versions ORDER BY created_at DESC LIMIT 1`
          );
          if (verRows && verRows[0]?.created_at) {
            recentAiActivity = verRows[0].created_at;
          }
        }

        if (failItem && (!recentAiActivity || new Date(failItem.created_at) > new Date(recentAiActivity))) {
          recentAiFailure = failItem.summary;
        }
      } catch (err: any) {
        console.warn("[system-health] Note on AI activity telemetry inspection:", err?.message);
      }
    }

    if (recentAiFailure) {
      subsystems.gemini = {
        id: "gemini",
        name: "AI Engine (Gemini 2.5)",
        status: "FAILED",
        details: `Recent Gemini generation error: ${recentAiFailure}`,
        lastCheckedAt: now,
        metrics: { configured: true, model: "gemini-2.5-flash", error: recentAiFailure },
      };
    } else if (recentAiActivity) {
      const daysSinceAi = (Date.now() - new Date(recentAiActivity).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceAi > 30) {
        subsystems.gemini = {
          id: "gemini",
          name: "AI Engine (Gemini 2.5)",
          status: "STALE",
          details: `Configured with gemini-2.5-flash, but last verified operation was ${Math.floor(daysSinceAi)}d ago (> 30 days)`,
          lastCheckedAt: now,
          metrics: { configured: true, model: "gemini-2.5-flash", lastActivity: recentAiActivity, daysSinceActivity: Math.floor(daysSinceAi) },
        };
      } else {
        subsystems.gemini = {
          id: "gemini",
          name: "AI Engine (Gemini 2.5)",
          status: "HEALTHY",
          details: `Provisioned & verified (Model: gemini-2.5-flash, Last verified: ${recentAiActivity})`,
          lastCheckedAt: now,
          metrics: { configured: true, model: "gemini-2.5-flash", lastActivity: recentAiActivity, daysSinceActivity: Math.floor(daysSinceAi) },
        };
      }
    } else {
      subsystems.gemini = {
        id: "gemini",
        name: "AI Engine (Gemini 2.5)",
        status: "CONFIGURED",
        details: "API key provisioned for automated SEO & content intelligence (Model: gemini-2.5-flash; no runtime execution logged yet)",
        lastCheckedAt: now,
        metrics: { configured: true, model: "gemini-2.5-flash", lastActivity: null },
      };
    }
  }

  // 6. GOOGLE UPDATE MONITOR
  if (!dbAvailable) {
    subsystems.google_update_monitor = {
      id: "google_update_monitor",
      name: "Google Search Update Monitor",
      status: "UNKNOWN",
      details: "Cannot query updates: database unavailable",
      lastCheckedAt: now,
    };
  } else {
    try {
      const { rows: updateRows } = await cmsQuery<{
        total: number;
        latest_title: string | null;
        last_checked: string | null;
      }>(`SELECT COUNT(*) as total, MAX(title) as latest_title, MAX(last_checked_at) as last_checked FROM google_search_updates`);

      const updateCount = Number(updateRows?.[0]?.total || 0);
      const latestUpdateTitle = updateRows?.[0]?.latest_title || null;
      const lastChecked = updateRows?.[0]?.last_checked || null;

      if (updateCount > 0) {
        subsystems.google_update_monitor = {
          id: "google_update_monitor",
          name: "Google Search Update Monitor",
          status: "HEALTHY",
          details: `${updateCount} updates cataloged · Latest: ${latestUpdateTitle || "Active"}`,
          lastCheckedAt: now,
          metrics: { updateCount, latestUpdateTitle, lastChecked },
        };
      } else {
        subsystems.google_update_monitor = {
          id: "google_update_monitor",
          name: "Google Search Update Monitor",
          status: "NOT_CONFIGURED",
          details: "Update catalog empty · Run manual check or schedule monitor",
          lastCheckedAt: now,
          metrics: { updateCount: 0 },
        };
      }
    } catch (err: any) {
      console.error("[system-health] Google update monitor check failed:", err?.message || err);
      subsystems.google_update_monitor = {
        id: "google_update_monitor",
        name: "Google Search Update Monitor",
        status: "UNKNOWN",
        details: `Query failed: ${err?.message || "DB error"}`,
        lastCheckedAt: now,
        error: err?.message,
      };
    }
  }

  // 7. BLOG SCHEDULER (with mandatory heartbeat evidence verification)
  if (!dbAvailable) {
    subsystems.blog_scheduler = {
      id: "blog_scheduler",
      name: "Editorial Scheduler",
      status: "UNKNOWN",
      details: "Cannot inspect blog scheduler: database unavailable",
      lastCheckedAt: now,
    };
  } else {
    try {
      const [{ rows: schedRows }, { rows: overdueRows }, { rows: heartbeatRows }] = await Promise.all([
        cmsQuery<{ total: number }>(`SELECT COUNT(*) as total FROM blog_posts WHERE status = 'scheduled'`),
        cmsQuery<{ overdue: number }>(`SELECT COUNT(*) as overdue FROM blog_posts WHERE status = 'scheduled' AND scheduled_for IS NOT NULL AND scheduled_for < NOW()`),
        cmsQuery<{ created_at: string; status: string; summary: string }>(
          `SELECT created_at, status, summary FROM cms_audit_log
           WHERE action LIKE 'BLOG_SCHEDULE%' OR actor_email = 'scheduler@dgeniussolutions.com'
           ORDER BY created_at DESC LIMIT 5`
        ).catch(() => ({ rows: [] })),
      ]);

      const scheduledPosts = Number(schedRows?.[0]?.total || 0);
      const overduePosts = Number(overdueRows?.[0]?.overdue || 0);
      const overdueBlogCount = overduePosts;

      const latestHeartbeat = heartbeatRows?.[0] || null;
      const latestSuccessful = heartbeatRows?.find((r) => r.status === "success") || null;

      const lastSchedulerRun = latestHeartbeat?.created_at || null;
      const lastSuccessfulSchedulerRun = latestSuccessful?.created_at || null;

      const schedulerAgeHours = lastSchedulerRun
        ? (Date.now() - new Date(lastSchedulerRun).getTime()) / (1000 * 60 * 60)
        : null;

      if (!lastSchedulerRun) {
        subsystems.blog_scheduler = {
          id: "blog_scheduler",
          name: "Editorial Scheduler",
          status: "UNKNOWN",
          details: "No scheduler execution evidence recorded in telemetry",
          lastCheckedAt: now,
          metrics: { scheduledPosts, overduePosts, overdueBlogCount, lastSchedulerRun: null, schedulerAgeHours: null },
        };
      } else if (overduePosts > 0 || overdueBlogCount > 0) {
        subsystems.blog_scheduler = {
          id: "blog_scheduler",
          name: "Editorial Scheduler",
          status: "DEGRADED",
          details: `${overduePosts} overdue scheduled post(s) pending publish (${scheduledPosts} scheduled total)`,
          lastCheckedAt: now,
          metrics: { scheduledPosts, overduePosts, overdueBlogCount, lastSchedulerRun, lastSuccessfulSchedulerRun, schedulerAgeHours },
        };
      } else if (latestHeartbeat && latestHeartbeat.status === "failure") {
        subsystems.blog_scheduler = {
          id: "blog_scheduler",
          name: "Editorial Scheduler",
          status: "DEGRADED",
          details: `Latest scheduler run failed: ${latestHeartbeat.summary}`,
          lastCheckedAt: now,
          metrics: { scheduledPosts, overduePosts, lastSchedulerRun, lastSuccessfulSchedulerRun, schedulerAgeHours },
        };
      } else if (schedulerAgeHours != null && schedulerAgeHours > 2) {
        subsystems.blog_scheduler = {
          id: "blog_scheduler",
          name: "Editorial Scheduler",
          status: "STALE",
          details: `Scheduler heartbeat is stale (${schedulerAgeHours.toFixed(1)}h ago; expected <= 2h)`,
          lastCheckedAt: now,
          metrics: { scheduledPosts, overduePosts, lastSchedulerRun, lastSuccessfulSchedulerRun, schedulerAgeHours },
        };
      } else {
        subsystems.blog_scheduler = {
          id: "blog_scheduler",
          name: "Editorial Scheduler",
          status: "HEALTHY",
          details: `Active scheduler worker (${scheduledPosts} scheduled posts, Last heartbeat: ${schedulerAgeHours ? schedulerAgeHours.toFixed(1) + "h ago" : "recent"})`,
          lastCheckedAt: now,
          metrics: { scheduledPosts, overduePosts: 0, lastSchedulerRun, lastSuccessfulSchedulerRun, schedulerAgeHours },
        };
      }
    } catch (err: any) {
      console.error("[system-health] Blog scheduler inspection failed:", err?.message || err);
      subsystems.blog_scheduler = {
        id: "blog_scheduler",
        name: "Editorial Scheduler",
        status: "UNKNOWN",
        details: `Query failed: ${err?.message || "DB error"}`,
        lastCheckedAt: now,
        error: err?.message,
      };
    }
  }

  // 8. SITE AUDIT WORKER (Strict: latestCompleted is authoritative, latestRun is status banner)
  if (!dbAvailable) {
    subsystems.site_audit_worker = {
      id: "site_audit_worker",
      name: "Technical Site Auditor",
      status: "UNKNOWN",
      details: "Cannot inspect site audit worker: database unavailable",
      lastCheckedAt: now,
    };
  } else {
    try {
      const [{ rows: latestRuns }, { rows: latestCompletedRuns }] = await Promise.all([
        cmsQuery<{ id: string; status: string; overall_score: number | null; created_at: string; completed_at: string | null }>(
          `SELECT id, status, overall_score, created_at, completed_at FROM site_audit_runs ORDER BY created_at DESC LIMIT 1`
        ),
        cmsQuery<{ id: string; status: string; overall_score: number | null; completed_at: string; created_at: string }>(
          `SELECT id, status, overall_score, completed_at, created_at FROM site_audit_runs WHERE status = 'completed' ORDER BY completed_at DESC LIMIT 1`
        ),
      ]);

      const latestRun = latestRuns?.[0] || null;
      const latestCompleted = latestCompletedRuns?.[0] || null;

      if (!latestRun && !latestCompleted) {
        subsystems.site_audit_worker = {
          id: "site_audit_worker",
          name: "Technical Site Auditor",
          status: "NOT_CONFIGURED",
          details: "No audits executed yet",
          lastCheckedAt: now,
          metrics: { lastAuditId: null },
        };
      } else if (latestCompleted) {
        const daysSinceCompleted = (Date.now() - new Date(latestCompleted.completed_at).getTime()) / (1000 * 60 * 60 * 24);
        const isRunFailed = latestRun && latestRun.status === "failed" && new Date(latestRun.created_at).getTime() > new Date(latestCompleted.completed_at).getTime();

        if (isRunFailed) {
          subsystems.site_audit_worker = {
            id: "site_audit_worker",
            name: "Technical Site Auditor",
            status: "DEGRADED",
            details: `Latest run (${latestRun.id}) failed; last completed was ${Math.floor(daysSinceCompleted)}d ago (Score: ${latestCompleted.overall_score ?? "N/A"}/100)`,
            lastCheckedAt: now,
            metrics: { lastAuditId: latestRun.id, lastCompletedId: latestCompleted.id, score: latestCompleted.overall_score, daysSinceCompleted: Math.floor(daysSinceCompleted) },
          };
        } else if (daysSinceCompleted > 15) {
          subsystems.site_audit_worker = {
            id: "site_audit_worker",
            name: "Technical Site Auditor",
            status: "STALE",
            details: `Latest completed audit was ${Math.floor(daysSinceCompleted)}d ago (> 15 days ago, Score: ${latestCompleted.overall_score ?? "N/A"}/100)`,
            lastCheckedAt: now,
            metrics: { lastAuditId: latestCompleted.id, score: latestCompleted.overall_score, daysSinceCompleted: Math.floor(daysSinceCompleted) },
          };
        } else {
          subsystems.site_audit_worker = {
            id: "site_audit_worker",
            name: "Technical Site Auditor",
            status: "HEALTHY",
            details: `Latest completed audit: ${Math.floor(daysSinceCompleted)}d ago (Score: ${latestCompleted.overall_score ?? "N/A"}/100)`,
            lastCheckedAt: now,
            metrics: { lastAuditId: latestCompleted.id, score: latestCompleted.overall_score, daysSinceCompleted: Math.floor(daysSinceCompleted) },
          };
        }
      } else {
        subsystems.site_audit_worker = {
          id: "site_audit_worker",
          name: "Technical Site Auditor",
          status: latestRun?.status === "running" ? "DEGRADED" : "FAILED",
          details: `Latest audit run status: ${latestRun?.status || "unknown"} (no completed audit on record)`,
          lastCheckedAt: now,
          metrics: { lastAuditId: latestRun?.id, status: latestRun?.status },
        };
      }
    } catch (err: any) {
      console.error("[system-health] Site audit worker inspection failed:", err?.message || err);
      subsystems.site_audit_worker = {
        id: "site_audit_worker",
        name: "Technical Site Auditor",
        status: "UNKNOWN",
        details: `Query failed: ${err?.message || "DB error"}`,
        lastCheckedAt: now,
        error: err?.message,
      };
    }
  }

  // 9. PAGESPEED WORKER
  if (!dbAvailable) {
    subsystems.pagespeed_worker = {
      id: "pagespeed_worker",
      name: "PageSpeed Performance Worker",
      status: "UNKNOWN",
      details: "Cannot inspect PageSpeed worker: database unavailable",
      lastCheckedAt: now,
    };
  } else {
    try {
      const [{ rows: cRows }, { rows: jRows }] = await Promise.all([
        cmsQuery<{ cnt: number }>(`SELECT COUNT(DISTINCT url) as cnt FROM pagespeed_cache`),
        cmsQuery<{
          queued: number;
          running: number;
          failed: number;
          total: number;
        }>(`SELECT
              SUM(CASE WHEN status = 'QUEUED' THEN 1 ELSE 0 END) as queued,
              SUM(CASE WHEN status = 'RUNNING' THEN 1 ELSE 0 END) as running,
              SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
              COUNT(*) as total
            FROM pagespeed_jobs`),
      ]);

      const measuredUrls = Number(cRows?.[0]?.cnt || 0);
      const queuedJobs = Number(jRows?.[0]?.queued || 0);
      const runningJobs = Number(jRows?.[0]?.running || 0);
      const failedJobs = Number(jRows?.[0]?.failed || 0);
      const totalJobs = Number(jRows?.[0]?.total || 0);

      if (failedJobs > 0) {
        subsystems.pagespeed_worker = {
          id: "pagespeed_worker",
          name: "PageSpeed Performance Worker",
          status: "DEGRADED",
          details: `${failedJobs} failed PageSpeed job(s) in backlog (${measuredUrls} URLs measured, ${queuedJobs} queued)`,
          lastCheckedAt: now,
          metrics: { measuredUrls, queuedJobs, runningJobs, failedJobs, totalJobs },
        };
      } else {
        subsystems.pagespeed_worker = {
          id: "pagespeed_worker",
          name: "PageSpeed Performance Worker",
          status: "HEALTHY",
          details: `${measuredUrls} URLs cached · ${queuedJobs} jobs queued, ${runningJobs} running`,
          lastCheckedAt: now,
          metrics: { measuredUrls, queuedJobs, runningJobs, failedJobs: 0, totalJobs },
        };
      }
    } catch (err: any) {
      console.error("[system-health] PageSpeed worker inspection failed:", err?.message || err);
      subsystems.pagespeed_worker = {
        id: "pagespeed_worker",
        name: "PageSpeed Performance Worker",
        status: "UNKNOWN",
        details: `Query failed: ${err?.message || "DB error"}`,
        lastCheckedAt: now,
        error: err?.message,
      };
    }
  }

  // 10. NATIVE FORMS & LEADS (Dynamic registry inspection & authoritative storage verification)
  if (!dbAvailable) {
    subsystems.native_forms = {
      id: "native_forms",
      name: "Native Forms & Lead Capture",
      status: "FAILED",
      details: "Submission storage unavailable: database connection offline",
      lastCheckedAt: now,
    };
  } else {
    try {
      // Dynamic loading from authoritative registry
      const approvedForms = listApprovedForms();
      const approvedFormIds = approvedForms.map((f) => Number(f.fluentFormId));

      const [{ rows: leadRows }, { rows: subRows }] = await Promise.all([
        cmsQuery<{ cnt: number; new_cnt: number; last_lead: string | null }>(
          `SELECT COUNT(*) as cnt, SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_cnt, MAX(created_at) as last_lead FROM leads`
        ),
        cmsQuery<{ cnt: number; last_sub: string | null }>(
          `SELECT COUNT(*) as cnt, MAX(created_at) as last_sub FROM form_submissions`
        ),
      ]);

      const totalLeads = Number(leadRows?.[0]?.cnt || 0);
      const newLeads = Number(leadRows?.[0]?.new_cnt || 0);
      const lastLead = leadRows?.[0]?.last_lead || null;
      const totalSubmissions = Number(subRows?.[0]?.cnt || 0);
      const lastSubmission = subRows?.[0]?.last_sub || null;

      if (approvedForms.length === 0) {
        subsystems.native_forms = {
          id: "native_forms",
          name: "Native Forms & Lead Capture",
          status: "FAILED",
          details: "Form registry contains 0 approved forms; forms core unconfigured",
          lastCheckedAt: now,
          metrics: { approvedFormCount: 0 },
        };
      } else if (totalLeads > 0 || totalSubmissions > 0) {
        subsystems.native_forms = {
          id: "native_forms",
          name: "Native Forms & Lead Capture",
          status: "HEALTHY",
          details: `${approvedForms.length} approved native forms active (Form 18 on /seo-pricing/ is LEGACY / UNMIGRATED) · ${totalLeads} leads, ${totalSubmissions} raw submissions captured`,
          lastCheckedAt: now,
          metrics: {
            approvedFormCount: approvedForms.length,
            approvedFormIds,
            legacyForms: ["Form 18 (/seo-pricing/) is LEGACY / UNMIGRATED"],
            totalLeads,
            newLeads,
            lastLead,
            totalSubmissions,
            lastSubmission,
          },
        };
      } else {
        subsystems.native_forms = {
          id: "native_forms",
          name: "Native Forms & Lead Capture",
          status: "CONFIGURED",
          details: `${approvedForms.length} approved forms provisioned (Storage tables ready; no submission records yet)`,
          lastCheckedAt: now,
          metrics: { approvedFormCount: approvedForms.length, approvedFormIds, totalLeads: 0, totalSubmissions: 0 },
        };
      }
    } catch (err: any) {
      console.error("[system-health] Native forms lead count query failed:", err?.message || err);
      subsystems.native_forms = {
        id: "native_forms",
        name: "Native Forms & Lead Capture",
        status: "FAILED",
        details: `Forms storage verification failed: ${err?.message || "DB query error"}`,
        lastCheckedAt: now,
        error: err?.message,
      };
    }
  }

  // 11. MEDIA PROCESSOR
  if (!dbAvailable) {
    subsystems.media_processor = {
      id: "media_processor",
      name: "Media Optimization Processor",
      status: "UNKNOWN",
      details: "Cannot query media: database unavailable",
      lastCheckedAt: now,
    };
  } else {
    try {
      const { rows: mediaRows } = await cmsQuery<{ cnt: number; missing_alt: number }>(
        `SELECT COUNT(*) as cnt, SUM(CASE WHEN (alt_text IS NULL OR TRIM(alt_text) = '') AND is_decorative = 0 THEN 1 ELSE 0 END) as missing_alt FROM media_assets WHERE deleted_at IS NULL`
      );
      const mediaCount = Number(mediaRows?.[0]?.cnt || 0);
      const missingAltCount = Number(mediaRows?.[0]?.missing_alt || 0);

      // Verify Sharp module availability
      let sharpAvailable = false;
      try {
        const sharpModule = await import("sharp");
        sharpAvailable = typeof sharpModule.default === "function" || typeof sharpModule === "function";
      } catch (err: any) {
        console.warn("[system-health] Sharp not available in runtime:", err?.message);
      }

      // Check upload path writability
      let storageWritable = false;
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const uploadDir = path.resolve(process.env.DGS_UPLOADS_DIR || "public/uploads");
      try {
        await fs.access(uploadDir);
        storageWritable = true;
      } catch {
        try {
          await fs.mkdir(uploadDir, { recursive: true });
          storageWritable = true;
        } catch (err: any) {
          console.warn("[system-health] Upload directory not writable:", err?.message);
        }
      }

      if (sharpAvailable && storageWritable) {
        subsystems.media_processor = {
          id: "media_processor",
          name: "Media Optimization Processor",
          status: "HEALTHY",
          details: `Active WebP conversions & EXIF stripping · Sharp ready · Storage writable (${mediaCount} assets managed, ${missingAltCount} missing alt)`,
          lastCheckedAt: now,
          metrics: { mediaAssetsCount: mediaCount, missingAltCount, sharpAvailable, storageWritable },
        };
      } else {
        subsystems.media_processor = {
          id: "media_processor",
          name: "Media Optimization Processor",
          status: "DEGRADED",
          details: `Degraded processing: Sharp=${sharpAvailable ? "ready" : "unavailable"}, Storage=${storageWritable ? "writable" : "unwritable"} (${mediaCount} assets managed)`,
          lastCheckedAt: now,
          metrics: { mediaAssetsCount: mediaCount, missingAltCount, sharpAvailable, storageWritable },
        };
      }
    } catch (err: any) {
      console.error("[system-health] Media processor check failed:", err?.message || err);
      subsystems.media_processor = {
        id: "media_processor",
        name: "Media Optimization Processor",
        status: "UNKNOWN",
        details: `Query failed: ${err?.message || "DB error"}`,
        lastCheckedAt: now,
        error: err?.message,
      };
    }
  }

  // Aggregate health status (Strict Truthful Aggregation)
  const statuses = Object.values(subsystems).map((s) => s.status);
  const healthyCount = statuses.filter((s) => s === "HEALTHY").length;
  const configuredCount = statuses.filter((s) => s === "CONFIGURED").length;
  const degradedCount = statuses.filter((s) => s === "DEGRADED").length;
  const staleCount = statuses.filter((s) => s === "STALE").length;
  const failedCount = statuses.filter((s) => s === "FAILED").length;
  const notConfiguredCount = statuses.filter((s) => s === "NOT_CONFIGURED").length;
  const unknownCount = statuses.filter((s) => s === "UNKNOWN").length;

  let overallStatus: "HEALTHY" | "DEGRADED" | "CRITICAL" = "HEALTHY";

  // Critical failures: database down or native forms storage failed
  if (subsystems.database.status === "FAILED" || subsystems.database.status === "NOT_CONFIGURED" || subsystems.native_forms.status === "FAILED") {
    overallStatus = "CRITICAL";
  } else if (failedCount > 0 || degradedCount > 0 || staleCount > 0 || unknownCount > 0) {
    // If ANY subsystem is FAILED, DEGRADED, STALE, or UNKNOWN, overall health CANNOT be HEALTHY!
    overallStatus = "DEGRADED";
  } else {
    overallStatus = "HEALTHY";
  }

  return {
    timestamp: now,
    overallStatus,
    subsystems,
    summary: {
      totalSubsystems: Object.keys(subsystems).length,
      healthyCount,
      configuredCount,
      degradedCount,
      staleCount,
      failedCount,
      notConfiguredCount,
      unknownCount,
      operationalCount: healthyCount + configuredCount,
      unconfiguredCount: notConfiguredCount,
    },
  };
}
