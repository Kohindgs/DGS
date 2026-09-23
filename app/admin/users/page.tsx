import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission, ensureSuperadminSeeded, type CmsUser } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import UsersClientView from "./UsersClientView";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "users", "view")) {
    redirect("/admin/");
  }

  let users: CmsUser[] = [];
  if (isCmsDatabaseConfigured()) {
    await ensureSuperadminSeeded();
    const { rows } = await cmsQuery<CmsUser>(
      `SELECT id, email, display_name, role, avatar_url, is_active, failed_attempts, locked_until, last_login_at, created_at, updated_at
       FROM cms_users
       ORDER BY created_at ASC`
    );
    users = rows || [];
  }

  return <UsersClientView initialUsers={users} currentRole={currentUser.role} />;
}
