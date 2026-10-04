import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import type { OffPageOutreach } from "@/lib/off-page/types";
import OutreachClientView from "./OutreachClientView";

export const dynamic = "force-dynamic";

export default async function AdminOffPageOutreachPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    redirect("/admin/");
  }

  let initialOutreach: OffPageOutreach[] = [];
  if (isCmsDatabaseConfigured()) {
    try {
      await ensureOffPageTablesExist();
      const { rows } = await cmsQuery<OffPageOutreach>(
        "SELECT * FROM off_page_outreach ORDER BY updated_at DESC LIMIT 150"
      );
      initialOutreach = rows || [];
    } catch (err) {
      console.error("Failed to load initial outreach:", err);
    }
  }

  return <OutreachClientView initialOutreach={initialOutreach} />;
}
