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
             psi_d.performance_score as desktopSpeed,
             (SELECT COUNT(*) FROM site_audit_issues i WHERE i.audit_run_id = p.audit_run_id AND i.url = p.url) as issuesCount,
             (SELECT COUNT(*) FROM gsc_page_query_metrics pq WHERE pq.page_url = p.url) as keywordsCount
           FROM site_audit_pages p
           LEFT JOIN gsc_page_metrics gpm ON (gpm.page_url = p.url)
           LEFT JOIN pagespeed_cache psi_m ON (psi_m.url = p.url AND psi_m.strategy = 'mobile')
           LEFT JOIN pagespeed_cache psi_d ON (psi_d.url = p.url AND psi_d.strategy = 'desktop')
           WHERE p.audit_run_id = ?
           ORDER BY p.page_score ASC
           LIMIT 150`,
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
      isDue={isDue}
    />
  );
}
