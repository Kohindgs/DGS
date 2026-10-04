import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { seedCompetitorsIfEmpty } from "@/lib/off-page/authority-engine";
import CompetitorsClientView from "./CompetitorsClientView";

export const dynamic = "force-dynamic";

export default async function AdminOffPageCompetitorsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    redirect("/admin/");
  }

  let competitors: any[] = [];
  let gaps: any[] = [];

  if (isCmsDatabaseConfigured()) {
    try {
      await ensureOffPageTablesExist();
      await seedCompetitorsIfEmpty();
      const [compRes, gapRes] = await Promise.all([
        cmsQuery(`SELECT * FROM off_page_competitor_domains ORDER BY region, estimated_referring_domains DESC`),
        cmsQuery(`SELECT * FROM off_page_competitor_gaps ORDER BY quality_score DESC LIMIT 100`),
      ]);
      competitors = compRes.rows || [];
      gaps = gapRes.rows || [];
    } catch (err) {
      console.error("Failed to load initial competitors:", err);
    }
  }

  return <CompetitorsClientView initialCompetitors={competitors} initialGaps={gaps} />;
}
