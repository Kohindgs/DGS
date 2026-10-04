import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { seedTargetPagesIfEmpty } from "@/lib/off-page/authority-engine";
import type { OffPageTargetPage } from "@/lib/off-page/types";
import TargetPagesClientView from "./TargetPagesClientView";

export const dynamic = "force-dynamic";

export default async function AdminOffPageTargetPagesPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    redirect("/admin/");
  }

  let pages: OffPageTargetPage[] = [];
  if (isCmsDatabaseConfigured()) {
    try {
      await ensureOffPageTablesExist();
      await seedTargetPagesIfEmpty();
      const { rows } = await cmsQuery<OffPageTargetPage>(
        "SELECT * FROM off_page_target_pages ORDER BY priority_tier, target_backlinks_goal DESC"
      );
      pages = rows || [];
    } catch (err) {
      console.error("Failed to load initial target pages:", err);
    }
  }

  return <TargetPagesClientView initialPages={pages} />;
}
