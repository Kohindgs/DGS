import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import SettingsClientView from "./SettingsClientView";

export const dynamic = "force-dynamic";

export default async function AdminOffPageSettingsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    redirect("/admin/");
  }

  let settingsMap: Record<string, string> | undefined;
  if (isCmsDatabaseConfigured()) {
    try {
      await ensureOffPageTablesExist();
      const { rows } = await cmsQuery<{ key_name: string; key_value: string }>(
        "SELECT key_name, key_value FROM off_page_settings"
      );
      if (rows && rows.length > 0) {
        settingsMap = {};
        for (const r of rows) {
          settingsMap[r.key_name] = r.key_value;
        }
      }
    } catch (err) {
      console.error("Failed to load initial settings:", err);
    }
  }

  return <SettingsClientView initialSettings={settingsMap} />;
}
