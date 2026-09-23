import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { getGscDashboardMetrics } from "@/lib/integrations/google";
import SearchConsoleClientView from "./SearchConsoleClientView";

export const dynamic = "force-dynamic";

export default async function AdminSearchConsolePage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "search_console", "view")) {
    redirect("/admin/");
  }

  const metrics = await getGscDashboardMetrics(28);

  return <SearchConsoleClientView metrics={metrics as any} />;
}
