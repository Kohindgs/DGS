import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { seedBacklinksIfEmpty, calculateLinkDecayMetrics } from "@/lib/off-page/backlinks";
import type { OffPageBacklink } from "@/lib/off-page/types";
import BacklinksClientView from "./BacklinksClientView";

export const dynamic = "force-dynamic";

export default async function AdminOffPageBacklinksPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    redirect("/admin/");
  }

  let initialBacklinks: OffPageBacklink[] = [];
  let decayMetrics: any = null;

  if (isCmsDatabaseConfigured()) {
    try {
      await ensureOffPageTablesExist();
      await seedBacklinksIfEmpty();
      const { rows } = await cmsQuery<OffPageBacklink>(
        "SELECT * FROM off_page_backlinks ORDER BY authority_score DESC, created_at DESC LIMIT 200"
      );
      initialBacklinks = rows || [];
      decayMetrics = await calculateLinkDecayMetrics();
    } catch (err) {
      console.error("Failed to load initial backlinks:", err);
    }
  }

  return <BacklinksClientView initialBacklinks={initialBacklinks} initialDecay={decayMetrics} />;
}
