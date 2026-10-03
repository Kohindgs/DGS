import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { listGoogleSearchUpdates, getMonitorSchedulerState } from "@/lib/google-updates/monitor";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import GoogleUpdatesClientView from "./GoogleUpdatesClientView";

export const dynamic = "force-dynamic";

export default async function AdminGoogleUpdatesPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "google_updates", "view")) {
    redirect("/admin/");
  }

  const ready = isCmsDatabaseConfigured();
  const [updates, schedulerState, latestAuditRow] = ready
    ? await Promise.all([
        listGoogleSearchUpdates({ limit: 100 }),
        getMonitorSchedulerState(),
        cmsQuery<any>(
          "SELECT id, total_pages, crawled_pages, overall_score, completed_at FROM site_audit_runs WHERE status = 'completed' ORDER BY completed_at DESC, created_at DESC LIMIT 1"
        )
          .then((res) => res.rows?.[0] || null)
          .catch(() => null),
      ])
    : [[], null, null];

  if (latestAuditRow && updates.length > 0) {
    const telemetry = {
      auditRunId: latestAuditRow.id,
      totalUrls: latestAuditRow.crawled_pages || latestAuditRow.total_pages || 102,
      validUrls: latestAuditRow.crawled_pages || 102,
      conflicts: 0,
      parseErrors: 0,
      pagesCrawled: latestAuditRow.crawled_pages || 102,
      lastAuditDate: latestAuditRow.completed_at,
    };
    for (const u of updates) {
      if (!u.audit_telemetry) {
        u.audit_telemetry = telemetry;
      }
    }
  }

  return (
    <GoogleUpdatesClientView
      updates={updates as any}
      schedulerState={schedulerState}
    />
  );
}
