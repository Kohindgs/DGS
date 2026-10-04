import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { generateMonthlyOffPageReport } from "@/lib/off-page/reports";
import type { OffPageMonthlyReport } from "@/lib/off-page/types";
import ReportsClientView from "./ReportsClientView";

export const dynamic = "force-dynamic";

export default async function AdminOffPageReportsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    redirect("/admin/");
  }

  let report: OffPageMonthlyReport | undefined;
  if (isCmsDatabaseConfigured()) {
    try {
      await ensureOffPageTablesExist();
      report = await generateMonthlyOffPageReport("2026-09");
    } catch (err) {
      console.error("Failed to load initial off-page report:", err);
    }
  }

  return <ReportsClientView initialReport={report} />;
}
