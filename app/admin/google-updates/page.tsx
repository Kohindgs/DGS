import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { listGoogleSearchUpdates, getMonitorSchedulerState } from "@/lib/google-updates/monitor";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
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
  const [updates, schedulerState] = ready
    ? await Promise.all([
        listGoogleSearchUpdates({ limit: 100 }),
        getMonitorSchedulerState(),
      ])
    : [[], null];

  return (
    <GoogleUpdatesClientView
      updates={updates as any}
      schedulerState={schedulerState}
    />
  );
}
