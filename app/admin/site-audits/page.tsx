import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { isAuditDue } from "@/lib/audit/audit-runner";
import SiteAuditsClientView from "./SiteAuditsClientView";

export const dynamic = "force-dynamic";

export default async function AdminSiteAuditsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "audits", "view")) {
    redirect("/admin/");
  }

  let latestAudit: any = null;
  let auditHistory: any[] = [];
  let pages: any[] = [];
  let issues: any[] = [];
  let healthDiagnostics: any = null;
  const isDue = await isAuditDue();

  if (isCmsDatabaseConfigured()) {
    try {
      const { rows: history } = await cmsQuery(
        `SELECT * FROM site_audit_runs ORDER BY created_at DESC LIMIT 10`
      );
      auditHistory = history || [];
      latestAudit = auditHistory[0] || null;

      if (latestAudit) {
        const { rows: pageRows } = await cmsQuery(
          `SELECT 
             p.url, 
             p.status_code as statusCode, 
             p.response_time_ms as responseTimeMs, 
             p.title, 
             p.h1_count as h1Count, 
             p.page_score as pageScore, 
             p.missing_alt_count as missingAltCount, 
             p.is_indexable as isIndexable,
             p.schema_types as schemaTypes,
             p.internal_links_count as internalLinksCount,
             gpm.position as googleAvgPosition,
             gpm.clicks as gscClicks,
             gpm.impressions as gscImpressions,
             gpm.ctr as gscCtr,
             psi_m.performance_score as mobileSpeed,
             psi_m.accessibility_score as mobileAccessibility,
             psi_m.best_practices_score as mobileBestPractices,
             psi_m.seo_score as mobileSeo,
             psi_m.fcp_ms as mobileFcp,
             psi_m.lcp_ms as mobileLcp,
             psi_m.cls_score as mobileCls,
             psi_m.tbt_ms as mobileTbt,
             psi_m.speed_index_ms as mobileSpeedIndex,
             psi_m.field_inp_ms as mobileInp,
             psi_m.field_ttfb_ms as mobileTtfb,
             psi_m.field_lcp_ms as mobileFieldLcp,
             psi_m.field_cls as mobileFieldCls,
             psi_d.performance_score as desktopSpeed,
             psi_d.accessibility_score as desktopAccessibility,
             psi_d.best_practices_score as desktopBestPractices,
             psi_d.seo_score as desktopSeo,
             psi_d.fcp_ms as desktopFcp,
             psi_d.lcp_ms as desktopLcp,
             psi_d.cls_score as desktopCls,
             psi_d.tbt_ms as desktopTbt,
             psi_d.speed_index_ms as desktopSpeedIndex,
             (SELECT COUNT(*) FROM site_audit_issues i WHERE i.audit_run_id = p.audit_run_id AND i.url = p.url) as issuesCount,
             (SELECT COUNT(*) FROM gsc_page_query_metrics pq WHERE pq.page_url = p.url) as keywordsCount
           FROM site_audit_pages p
           LEFT JOIN gsc_page_metrics gpm ON (gpm.page_url = p.url)
           LEFT JOIN pagespeed_cache psi_m ON (psi_m.url = p.url AND psi_m.strategy = 'mobile')
           LEFT JOIN pagespeed_cache psi_d ON (psi_d.url = p.url AND psi_d.strategy = 'desktop')
           WHERE p.audit_run_id = ?
           ORDER BY p.page_score ASC`,
          [latestAudit.id]
        );
        pages = pageRows || [];

        const { rows: issueRows } = await cmsQuery(
          `SELECT id, url, severity, category, issue_code, title, description, recommendation
           FROM site_audit_issues
           WHERE audit_run_id = ?
           ORDER BY FIELD(severity, 'critical', 'high', 'medium', 'low', 'info')
           LIMIT 100`,
          [latestAudit.id]
        );
        issues = issueRows || [];

        // Data Consistency Diagnostics (Requirement V)
        const [
          { rows: altDetailRows },
          { rows: altAggRows },
          { rows: gscRows },
          { rows: psCacheRows },
          { rows: psQueueRows },
        ] = await Promise.all([
          cmsQuery<{ cnt: number }>(
            `SELECT COUNT(*) as cnt FROM site_audit_missing_alts WHERE audit_run_id = ?`,
            [latestAudit.id]
          ).catch(() => ({ rows: [{ cnt: 0 }] })),
          cmsQuery<{ total_missing: number }>(
            `SELECT SUM(missing_alt_count) as total_missing FROM site_audit_pages WHERE audit_run_id = ?`,
            [latestAudit.id]
          ).catch(() => ({ rows: [{ total_missing: 0 }] })),
          cmsQuery<{ total: number; last_sync: string }>(
            `SELECT COUNT(*) as total, MAX(updated_at) as last_sync FROM gsc_page_query_metrics`
          ).catch(() => ({ rows: [{ total: 0, last_sync: "" }] })),
          cmsQuery<{ measured: number }>(
            `SELECT COUNT(DISTINCT url) as measured FROM pagespeed_cache`
          ).catch(() => ({ rows: [{ measured: 0 }] })),
          cmsQuery<{ queued: number; failed: number }>(
            `SELECT
               SUM(CASE WHEN status = 'QUEUED' THEN 1 ELSE 0 END) as queued,
               SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
             FROM pagespeed_jobs`
          ).catch(() => ({ rows: [{ queued: 0, failed: 0 }] })),
        ]);

        const detailAltCount = Number(altDetailRows[0]?.cnt || 0);
        const aggAltCount = Number(altAggRows[0]?.total_missing || 0);

        healthDiagnostics = {
          auditId: latestAudit.id,
          sitemapUrls: Number(latestAudit.discovered_url_count || latestAudit.total_pages || 0),
          crawledPages: Number(latestAudit.crawled_url_count || latestAudit.crawled_pages || 0),
          persistedPageRows: pages.length,
          aggAltCount,
          detailAltCount,
          isAltConsistent: aggAltCount === detailAltCount || detailAltCount > 0,
          gscTotalRows: Number(gscRows[0]?.total || 0),
          gscLastSync: gscRows[0]?.last_sync || "Not Synced",
          pageSpeedMeasured: Number(psCacheRows[0]?.measured || 0),
          pageSpeedQueued: Number(psQueueRows[0]?.queued || 0),
          pageSpeedFailed: Number(psQueueRows[0]?.failed || 0),
        };
      }
    } catch (err) {
      console.error("Error loading site audits data:", err);
    }
  }

  return (
    <SiteAuditsClientView
      latestAudit={latestAudit}
      auditHistory={auditHistory}
      pages={pages}
      issues={issues}
      healthDiagnostics={healthDiagnostics}
      isDue={isDue}
    />
  );
}
