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
          `SELECT url, status_code as statusCode, response_time_ms as responseTimeMs, title, h1_count as h1Count, page_score as pageScore, missing_alt_count as missingAltCount, is_indexable as isIndexable
           FROM site_audit_pages
           WHERE audit_run_id = ?
           ORDER BY page_score ASC
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
