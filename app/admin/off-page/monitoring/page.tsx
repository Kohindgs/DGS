import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import type { OffPageAlert } from "@/lib/off-page/types";
import MonitoringClientView from "./MonitoringClientView";

export const dynamic = "force-dynamic";

export default async function AdminOffPageMonitoringPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    redirect("/admin/");
  }

  let alerts: OffPageAlert[] = [];
  let runs: any[] = [];

  if (isCmsDatabaseConfigured()) {
    try {
      await ensureOffPageTablesExist();
      const [alertRes, runRes] = await Promise.all([
        cmsQuery<OffPageAlert>(`SELECT * FROM off_page_alerts ORDER BY created_at DESC LIMIT 50`),
        cmsQuery(`SELECT * FROM off_page_automation_runs ORDER BY started_at DESC LIMIT 20`),
      ]);
      alerts = alertRes.rows || [];
      runs = runRes.rows || [];
    } catch (err) {
      console.error("Failed to load initial monitoring data:", err);
    }
  }

  return <MonitoringClientView initialAlerts={alerts} initialRuns={runs} />;
}
