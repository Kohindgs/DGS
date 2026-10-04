import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { getOffPageDashboardData } from "@/lib/off-page/dashboard";
import OffPageDashboardView from "./OffPageDashboardView";

export const dynamic = "force-dynamic";

export default async function AdminOffPageDashboardPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    redirect("/admin/");
  }

  const ready = isCmsDatabaseConfigured();
  const initialData = ready ? await getOffPageDashboardData().catch(() => undefined) : undefined;

  return <OffPageDashboardView initialData={initialData} />;
}
