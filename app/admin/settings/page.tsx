import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import SettingsClientView from "@/components/admin/settings/SettingsClientView";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  return <SettingsClientView />;
}
