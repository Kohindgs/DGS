import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { listTargetKeywords, detectCannibalization, seedInitialTargetKeywords } from "@/lib/seo/keywords";
import KeywordsClientView from "./KeywordsClientView";

export const dynamic = "force-dynamic";

function safeStr(val: unknown): string {
  if (typeof val === "string") return val.trim();
  if (val != null) return String(val).trim();
  return "";
}

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
      await seedInitialTargetKeywords().catch((err) => {
        console.warn("Notice: seedInitialTargetKeywords failed:", err?.message);
      });

      const targets = await listTargetKeywords().catch(() => []);
      targetsCount = targets?.length || 0;

      // Primary query with historical comparison columns
      try {
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
           WHERE pq.query_text IS NOT NULL AND pq.query_text != ''
           ORDER BY pq.clicks DESC, pq.impressions DESC
           LIMIT 500`
        );
        queries = rows || [];
      } catch (sqlErr: any) {
        console.warn("Primary GSC query error, falling back to base columns:", sqlErr?.message);
        // Fallback without prev_* columns if schema not yet updated on this host
        const { rows } = await cmsQuery<any>(
          `SELECT
             pq.id,
             pq.query_text,
             pq.page_url,
             pq.clicks,
             pq.impressions,
             pq.ctr,
             pq.position,
             NULL as prev_position,
             0 as prev_clicks,
             0 as prev_impressions,
             pq.period_type,
             tk.keyword_group,
             psi_m.performance_score as mobile_psi,
             psi_d.performance_score as desktop_psi
           FROM gsc_page_query_metrics pq
           LEFT JOIN target_keywords tk ON (pq.query_text = tk.keyword AND pq.page_url = tk.page_url)
           LEFT JOIN pagespeed_cache psi_m ON (psi_m.url = pq.page_url AND psi_m.strategy = 'mobile')
           LEFT JOIN pagespeed_cache psi_d ON (psi_d.url = pq.page_url AND psi_d.strategy = 'desktop')
           WHERE pq.query_text IS NOT NULL AND pq.query_text != ''
           ORDER BY pq.clicks DESC, pq.impressions DESC
           LIMIT 500`
        ).catch(() => ({ rows: [] }));
        queries = rows || [];
      }

      // Ensure target keywords not detected in GSC are included in universe
      const detectedPairs = new Set<string>();
      for (const q of queries) {
        const qText = safeStr(q?.query_text).toLowerCase();
        const pUrl = safeStr(q?.page_url).toLowerCase();
        if (qText && pUrl) {
          detectedPairs.add(`${qText}|||${pUrl}`);
        }
      }

      for (const t of targets || []) {
        const kw = safeStr(t?.keyword).toLowerCase();
        const pUrl = safeStr(t?.pageUrl).toLowerCase();
        if (!kw || !pUrl) continue;

        const pairKey = `${kw}|||${pUrl}`;
        if (!detectedPairs.has(pairKey)) {
          queries.push({
            id: `target_${t.id || kw}`,
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

      cannibalizationRisks = await detectCannibalization().catch((cErr) => {
        console.warn("Cannibalization detection warning:", cErr?.message);
        return [];
      });
    } catch (err) {
      console.error("Error loading keywords page data:", err);
    }
  }

  return (
    <KeywordsClientView
      queries={queries || []}
      cannibalizationRisks={cannibalizationRisks || []}
      targetsCount={targetsCount || 0}
    />
  );
}
