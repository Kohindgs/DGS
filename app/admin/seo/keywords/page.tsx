import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { listTargetKeywords, detectCannibalization, seedInitialTargetKeywords } from "@/lib/seo/keywords";
import KeywordsClientView from "./KeywordsClientView";

export const dynamic = "force-dynamic";

export default async function AdminKeywordsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "view")) {
    redirect("/admin/");
  }

  let queries: any[] = [];
  let cannibalizationRisks: any[] = [];
  let targetsCount = 0;

  if (isCmsDatabaseConfigured()) {
    try {
      await seedInitialTargetKeywords();
      const targets = await listTargetKeywords();
      targetsCount = targets.length;

      const { rows } = await cmsQuery<any>(
        `SELECT pq.*, tk.keyword_group
         FROM gsc_page_query_metrics pq
         LEFT JOIN target_keywords tk ON pq.query_text = tk.keyword AND pq.page_url = tk.page_url
         ORDER BY pq.clicks DESC, pq.impressions DESC
         LIMIT 200`
      );
      queries = rows || [];
      cannibalizationRisks = await detectCannibalization();
    } catch (err) {
      console.error("Error loading keywords page data:", err);
    }
  }

  return (
    <KeywordsClientView
      queries={queries}
      cannibalizationRisks={cannibalizationRisks}
      targetsCount={targetsCount}
    />
  );
}
