import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { seedBacklinksIfEmpty } from "@/lib/off-page/backlinks";
import type { OffPageBacklink } from "@/lib/off-page/types";
import ReclamationClientView from "./ReclamationClientView";

export const dynamic = "force-dynamic";

export default async function AdminOffPageReclamationPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    redirect("/admin/");
  }

  let reclaimCandidates: OffPageBacklink[] = [];
  if (isCmsDatabaseConfigured()) {
    try {
      await ensureOffPageTablesExist();
      const { rows } = await cmsQuery<OffPageBacklink>(
        "SELECT * FROM off_page_backlinks WHERE status IN ('LOST', 'REL_CHANGED', 'NOINDEX_SOURCE', 'ANCHOR_CHANGED') ORDER BY authority_score DESC"
      );
      reclaimCandidates = rows || [];
    } catch (err) {
      console.error("Failed to load initial reclamation links:", err);
    }
  }

  return <ReclamationClientView initialLinks={reclaimCandidates} />;
}
