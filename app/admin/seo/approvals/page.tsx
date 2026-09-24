import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listChangeRequests } from "@/lib/seo/change-requests";
import ApprovalsClientView from "./ApprovalsClientView";

export const dynamic = "force-dynamic";

export default async function AdminSeoApprovalsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "view")) {
    redirect("/admin/");
  }

  let requests: any[] = [];
  if (isCmsDatabaseConfigured()) {
    try {
      requests = await listChangeRequests({ limit: 100 });
    } catch (err) {
      console.error("Error loading change requests:", err);
    }
  }

  return (
    <ApprovalsClientView
      initialRequests={requests}
      userRole={currentUser.role}
      userEmail={currentUser.email}
    />
  );
}
