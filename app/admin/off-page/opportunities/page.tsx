import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { seedOpportunitiesIfEmpty } from "@/lib/off-page/discovery";
import type { OffPageOpportunity } from "@/lib/off-page/types";
import OpportunitiesClientView from "./OpportunitiesClientView";

export const dynamic = "force-dynamic";

export default async function AdminOffPageOpportunitiesPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    redirect("/admin/");
  }

  let initialOpportunities: OffPageOpportunity[] = [];
  if (isCmsDatabaseConfigured()) {
    try {
      await ensureOffPageTablesExist();
      await seedOpportunitiesIfEmpty();
      const { rows } = await cmsQuery<OffPageOpportunity>(
        "SELECT * FROM off_page_opportunities ORDER BY priority_score DESC, authority_score DESC LIMIT 300"
      );
      initialOpportunities = rows || [];
    } catch (err) {
      console.error("Failed to load initial opportunities:", err);
    }
  }

  return <OpportunitiesClientView initialOpportunities={initialOpportunities} />;
}
