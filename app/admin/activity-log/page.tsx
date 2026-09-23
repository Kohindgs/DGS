import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import ActivityLogClientView from "./ActivityLogClientView";

export const dynamic = "force-dynamic";

export default async function AdminActivityLogPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || currentUser.role !== "superadmin") {
    redirect("/admin/");
  }

  let logs: any[] = [];
  if (isCmsDatabaseConfigured()) {
    const { rows } = await cmsQuery(
      `SELECT id, user_id, actor_email, role, action, resource, resource_id, summary, before_state, after_state, ip_address, user_agent, status, created_at
       FROM cms_audit_log
       ORDER BY created_at DESC
       LIMIT 100`
    );
    logs = rows || [];
  }

  return <ActivityLogClientView initialLogs={logs} />;
}
