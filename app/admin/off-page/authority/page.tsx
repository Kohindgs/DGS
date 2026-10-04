import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { getDetectedAuthorityOpportunities } from "@/lib/off-page/authority-engine";
import type { OffPageAuthorityOpportunity } from "@/lib/off-page/types";
import AuthorityClientView from "./AuthorityClientView";

export const dynamic = "force-dynamic";

export default async function AdminOffPageAuthorityPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    redirect("/admin/");
  }

  let initialOpportunities: OffPageAuthorityOpportunity[] = [];
  if (isCmsDatabaseConfigured()) {
    try {
      initialOpportunities = await getDetectedAuthorityOpportunities();
    } catch (err) {
      console.error("Failed to load authority opportunities:", err);
    }
  }

  return <AuthorityClientView initialOpportunities={initialOpportunities} />;
}
