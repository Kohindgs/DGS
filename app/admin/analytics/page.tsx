import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { getGa4DashboardMetrics } from "@/lib/integrations/google";
import AnalyticsClientView from "./AnalyticsClientView";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "analytics", "view")) {
    redirect("/admin/");
  }

  const metrics = await getGa4DashboardMetrics(28);

  return <AnalyticsClientView metrics={metrics as any} />;
}
