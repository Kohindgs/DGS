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
        `SELECT
           pq.id,
           pq.query_text,
           pq.page_url,
           pq.clicks,
           pq.impressions,
           pq.ctr,
           pq.position,
           pq.prev_position,
           pq.prev_clicks,
           pq.prev_impressions,
           pq.period_type,
           tk.keyword_group,
           psi_m.performance_score as mobile_psi,
           psi_d.performance_score as desktop_psi
         FROM gsc_page_query_metrics pq
         LEFT JOIN target_keywords tk ON (pq.query_text = tk.keyword AND pq.page_url = tk.page_url)
         LEFT JOIN pagespeed_cache psi_m ON (psi_m.url = pq.page_url AND psi_m.strategy = 'mobile')
         LEFT JOIN pagespeed_cache psi_d ON (psi_d.url = pq.page_url AND psi_d.strategy = 'desktop')
         ORDER BY pq.clicks DESC, pq.impressions DESC
         LIMIT 500`
      );
      queries = rows || [];

      // Also ensure target keywords not detected in GSC are included in universe
      const detectedPairs = new Set(
        queries.map((q) => `${q.query_text.trim().toLowerCase()}|||${q.page_url.trim().toLowerCase()}`)
      );

      for (const t of targets) {
        const pairKey = `${t.keyword.trim().toLowerCase()}|||${t.pageUrl.trim().toLowerCase()}`;
        if (!detectedPairs.has(pairKey)) {
          queries.push({
            id: `target_${t.id}`,
            query_text: t.keyword,
            page_url: t.pageUrl,
            clicks: 0,
            impressions: 0,
            ctr: 0,
            position: null,
            prev_position: null,
            prev_clicks: 0,
            prev_impressions: 0,
            period_type: "28d",
            keyword_group: t.keywordGroup || "Target Registry",
            mobile_psi: null,
            desktop_psi: null,
          });
        }
      }

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
