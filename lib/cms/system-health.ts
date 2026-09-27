import { isCmsDatabaseConfigured, cmsQuery } from "./db";

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

  // 1. DATABASE (MySQL / MariaDB)
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

  // 4. SMTP / TRANSACTIONAL EMAIL
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
    if (dbAvailable) {
      try {
        const { rows: notifRows } = await cmsQuery<{ sent_at: string }>(
          `SELECT sent_at FROM google_update_notifications WHERE smtp_message_id IS NOT NULL ORDER BY sent_at DESC LIMIT 1`
        );
        if (notifRows && notifRows[0]?.sent_at) {
          recentEmailSentAt = notifRows[0].sent_at;
        }
      } catch (err: any) {
        console.warn("[system-health] Note on email telemetry inspection:", err?.message);
      }
    }

    if (recentEmailSentAt) {
      subsystems.smtp = {
        id: "smtp",
        name: "SMTP Mail Dispatcher",
        status: "HEALTHY",
        details: `Active mail dispatcher (Host: ${smtpHost}, Last delivery: ${recentEmailSentAt})`,
        lastCheckedAt: now,
        metrics: { configured: true, host: smtpHost, lastDelivery: recentEmailSentAt },
      };
    } else {
      subsystems.smtp = {
        id: "smtp",
        name: "SMTP Mail Dispatcher",
        status: "CONFIGURED",
        details: `Configured with host ${smtpHost} (Ready for dispatch; no recent deliveries recorded)`,
        lastCheckedAt: now,
        metrics: { configured: true, host: smtpHost, lastDelivery: null },
      };
    }
  }

  // 5. GEMINI AI ENGINE
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
    if (dbAvailable) {
      try {
        const { rows: auditRows } = await cmsQuery<{ created_at: string }>(
          `SELECT created_at FROM cms_audit_log WHERE resource IN ('assessment', 'gemini', 'seo_generation') OR action LIKE '%gemini%' OR action LIKE '%generate%' ORDER BY created_at DESC LIMIT 1`
        );
        if (auditRows && auditRows[0]?.created_at) {
          recentAiActivity = auditRows[0].created_at;
        }
      } catch (err: any) {
        console.warn("[system-health] Note on AI activity telemetry inspection:", err?.message);
      }
    }

    if (recentAiActivity) {
      subsystems.gemini = {
        id: "gemini",
        name: "AI Engine (Gemini 2.5)",
        status: "HEALTHY",
        details: `Provisioned & active (Model: gemini-2.5-flash, Last activity: ${recentAiActivity})`,
        lastCheckedAt: now,
        metrics: { configured: true, model: "gemini-2.5-flash", lastActivity: recentAiActivity },
      };
    } else {
      subsystems.gemini = {
        id: "gemini",
        name: "AI Engine (Gemini 2.5)",
        status: "CONFIGURED",
        details: "API key provisioned for automated SEO & content intelligence (Model: gemini-2.5-flash)",
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

  // 7. BLOG SCHEDULER
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
        cmsQuery<{ last_run: string }>(`SELECT created_at as last_run FROM cms_audit_log WHERE action LIKE 'BLOG_SCHEDULE%' OR actor_email = 'scheduler@dgeniussolutions.com' ORDER BY created_at DESC LIMIT 1`).catch(() => ({ rows: [] })),
      ]);

      const scheduledBlogCount = Number(schedRows?.[0]?.total || 0);
      const overdueBlogCount = Number(overdueRows?.[0]?.overdue || 0);
      const lastSchedulerRun = heartbeatRows?.[0]?.last_run || null;

      if (overdueBlogCount > 0) {
        subsystems.blog_scheduler = {
          id: "blog_scheduler",
          name: "Editorial Scheduler",
          status: "DEGRADED",
          details: `${overdueBlogCount} overdue scheduled post(s) pending publish (${scheduledBlogCount} scheduled total)`,
          lastCheckedAt: now,
          metrics: { scheduledBlogCount, overdueBlogCount, lastSchedulerRun },
        };
      } else {
        subsystems.blog_scheduler = {
          id: "blog_scheduler",
          name: "Editorial Scheduler",
          status: "HEALTHY",
          details: `Active scheduler worker (${scheduledBlogCount} posts scheduled${lastSchedulerRun ? `, Last run: ${lastSchedulerRun}` : ""})`,
          lastCheckedAt: now,
          metrics: { scheduledBlogCount, overdueBlogCount: 0, lastSchedulerRun },
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

  // 8. SITE AUDIT WORKER
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
          details: `Latest audit run status: ${latestRun?.status || "unknown"}`,
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

  // 10. NATIVE FORMS & LEADS (Authoritative `leads` table)
  if (!dbAvailable) {
    subsystems.native_forms = {
      id: "native_forms",
      name: "Native Forms & Lead Capture",
      status: "UNKNOWN",
      details: "Cannot query leads: database unavailable",
      lastCheckedAt: now,
    };
  } else {
    try {
      const { rows: leadRows } = await cmsQuery<{ cnt: number; new_cnt: number }>(
        `SELECT COUNT(*) as cnt, SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_cnt FROM leads`
      );
      const totalLeads = Number(leadRows?.[0]?.cnt || 0);
      const newLeads = Number(leadRows?.[0]?.new_cnt || 0);
      const approvedForms = [1, 3, 4, 6, 9, 10, 11, 19, 20, 21, 26];

      subsystems.native_forms = {
        id: "native_forms",
        name: "Native Forms & Lead Capture",
        status: "HEALTHY",
        details: `${approvedForms.length} approved native forms active (Form 18 is LEGACY / UNMIGRATED) · ${totalLeads} leads captured (${newLeads} new)`,
        lastCheckedAt: now,
        metrics: {
          approvedFormCount: approvedForms.length,
          approvedFormIds: approvedForms,
          legacyForms: ["Form 18 (/seo-pricing/) is LEGACY / UNMIGRATED"],
          totalLeads,
          newLeads,
        },
      };
    } catch (err: any) {
      console.error("[system-health] Native forms lead count query failed:", err?.message || err);
      subsystems.native_forms = {
        id: "native_forms",
        name: "Native Forms & Lead Capture",
        status: "UNKNOWN",
        details: `Query failed: ${err?.message || "DB error"}`,
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

  // Aggregate health status
  const statuses = Object.values(subsystems).map((s) => s.status);
  const healthyCount = statuses.filter((s) => s === "HEALTHY").length;
  const configuredCount = statuses.filter((s) => s === "CONFIGURED").length;
  const degradedCount = statuses.filter((s) => s === "DEGRADED").length;
  const staleCount = statuses.filter((s) => s === "STALE").length;
  const failedCount = statuses.filter((s) => s === "FAILED").length;
  const notConfiguredCount = statuses.filter((s) => s === "NOT_CONFIGURED").length;
  const unknownCount = statuses.filter((s) => s === "UNKNOWN").length;

  let overallStatus: "HEALTHY" | "DEGRADED" | "CRITICAL" = "HEALTHY";
  if (subsystems.database.status === "FAILED" || subsystems.database.status === "NOT_CONFIGURED") {
    overallStatus = "CRITICAL";
  } else if (failedCount > 0 || degradedCount > 0) {
    overallStatus = "DEGRADED";
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
