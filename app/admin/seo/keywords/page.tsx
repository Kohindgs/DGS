import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import {
  listTargetKeywords,
  detectCannibalization,
  getCannibalizationDiagnostics,
  seedInitialTargetKeywords,
  type CannibalizationRisk,
  type QueryCannibalizationDiagnostic,
} from "@/lib/seo/keywords";
import {
  canonicalPageKey,
  normalizeSearchQuery,
} from "@/lib/seo/search-normalization";
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
  let cannibalizationRisks: CannibalizationRisk[] = [];
  let cannibalizationDiagnostics: QueryCannibalizationDiagnostic[] = [];
  let targetsCount = 0;
  let dataHealth = {
    currentRowsCount: 0,
    snapshotsCount: 0,
    duplicatePairsCount: 0,
    windowStart: null as string | null,
    windowEnd: null as string | null,
    lastSyncAt: null as string | null,
    isHealthy: true,
  };

  if (isCmsDatabaseConfigured()) {
    try {
      await seedInitialTargetKeywords().catch((err) => {
        console.warn("Notice: seedInitialTargetKeywords failed:", err?.message);
      });

      const targets = await listTargetKeywords().catch(() => []);
      targetsCount = targets?.length || 0;

      // Map targets by canonical page key + normalized keyword
      const targetMap = new Map<string, any>();
      for (const t of targets || []) {
        const key = `${canonicalPageKey(t.pageUrl)}|||${normalizeSearchQuery(t.keyword)}`;
        targetMap.set(key, t);
      }

      // 1. Fetch current GSC page-query matrix
      try {
        const { rows } = await cmsQuery<any>(
          `SELECT
             pq.id,
             pq.query_text,
             pq.page_url,
             pq.canonical_page_key,
             pq.query_text_normalized,
             pq.clicks,
             pq.impressions,
             pq.ctr,
             pq.position,
             pq.prev_position,
             pq.prev_clicks,
             pq.prev_impressions,
             pq.period_type,
             psi_m.performance_score as mobile_psi,
             psi_d.performance_score as desktop_psi
           FROM gsc_page_query_metrics pq
           LEFT JOIN pagespeed_cache psi_m ON (psi_m.url = pq.page_url AND psi_m.strategy = 'mobile')
           LEFT JOIN pagespeed_cache psi_d ON (psi_d.url = pq.page_url AND psi_d.strategy = 'desktop')
           WHERE pq.period_type = '28d' AND pq.query_text IS NOT NULL AND pq.query_text != ''
           ORDER BY pq.clicks DESC, pq.impressions DESC
           LIMIT 1000`
        );
        queries = rows || [];
      } catch (sqlErr: any) {
        console.warn("Primary GSC query error, falling back:", sqlErr?.message);
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
             psi_m.performance_score as mobile_psi,
             psi_d.performance_score as desktop_psi
           FROM gsc_page_query_metrics pq
           LEFT JOIN pagespeed_cache psi_m ON (psi_m.url = pq.page_url AND psi_m.strategy = 'mobile')
           LEFT JOIN pagespeed_cache psi_d ON (psi_d.url = pq.page_url AND psi_d.strategy = 'desktop')
           WHERE pq.query_text IS NOT NULL AND pq.query_text != ''
           ORDER BY pq.clicks DESC, pq.impressions DESC
           LIMIT 1000`
        ).catch(() => ({ rows: [] }));
        queries = rows || [];
      }

      // 2. Enrich current queries with canonical target matches
      const detectedPairs = new Set<string>();
      for (const q of queries) {
        const canonKey = canonicalPageKey(q.page_url);
        const normQ = normalizeSearchQuery(q.query_text);
        const pairKey = `${canonKey}|||${normQ}`;
        detectedPairs.add(pairKey);

        const matchedTarget = targetMap.get(pairKey);
        if (matchedTarget) {
          q.keyword_group = matchedTarget.keywordGroup || "Target Registry";
          q.is_target = true;
          q.source = "GSC + TARGET";
        } else {
          q.keyword_group = null;
          q.is_target = false;
          q.source = "GSC";
        }
      }

      // 3. Include configured target keywords not yet discovered in Search Console
      for (const t of targets || []) {
        const canonKey = canonicalPageKey(t.pageUrl);
        const normQ = normalizeSearchQuery(t.keyword);
        if (!normQ) continue;

        const pairKey = `${canonKey}|||${normQ}`;
        if (!detectedPairs.has(pairKey)) {
          queries.push({
            id: `target_${t.id || normQ}`,
            query_text: t.keyword,
            page_url: t.pageUrl,
            canonical_page_key: canonKey,
            query_text_normalized: normQ,
            clicks: 0,
            impressions: 0,
            ctr: 0,
            position: null,
            prev_position: null,
            prev_clicks: 0,
            prev_impressions: 0,
            period_type: "28d",
            keyword_group: t.keywordGroup || "Target Registry",
            is_target: true,
            source: "TARGET",
            mobile_psi: null,
            desktop_psi: null,
          });
          detectedPairs.add(pairKey);
        }
      }

      // 4. Retrieve cannibalization intelligence
      cannibalizationDiagnostics = await getCannibalizationDiagnostics().catch((cErr) => {
        console.warn("Cannibalization diagnostics warning:", cErr?.message);
        return [];
      });

      cannibalizationRisks = await detectCannibalization().catch((cErr) => {
        console.warn("Cannibalization detection warning:", cErr?.message);
        return [];
      });

      // 5. Gather SEO Data Health telemetry
      try {
        const { rows: pqCount } = await cmsQuery<any>(
          `SELECT COUNT(*) as cnt FROM gsc_page_query_metrics WHERE period_type = '28d'`
        );
        dataHealth.currentRowsCount = Number(pqCount[0]?.cnt || 0);

        const { rows: snapCount } = await cmsQuery<any>(
          `SELECT COUNT(*) as cnt FROM gsc_ranking_snapshots`
        );
        dataHealth.snapshotsCount = Number(snapCount[0]?.cnt || 0);

        const { rows: dupeRows } = await cmsQuery<any>(
          `SELECT query_text_normalized, canonical_page_key, COUNT(*) as cnt
           FROM gsc_page_query_metrics
           WHERE period_type = '28d' AND query_text_normalized IS NOT NULL
           GROUP BY query_text_normalized, canonical_page_key
           HAVING cnt > 1`
        );
        dataHealth.duplicatePairsCount = (dupeRows || []).length;

        const { rows: syncRuns } = await cmsQuery<any>(
          `SELECT window_start, window_end, completed_at
           FROM gsc_sync_runs
           WHERE status = 'completed'
           ORDER BY completed_at DESC LIMIT 1`
        );
        if (syncRuns && syncRuns[0]) {
          dataHealth.windowStart = syncRuns[0].window_start ? new Date(syncRuns[0].window_start).toISOString().slice(0, 10) : null;
          dataHealth.windowEnd = syncRuns[0].window_end ? new Date(syncRuns[0].window_end).toISOString().slice(0, 10) : null;
          dataHealth.lastSyncAt = syncRuns[0].completed_at ? new Date(syncRuns[0].completed_at).toISOString() : null;
        }

        dataHealth.isHealthy = dataHealth.duplicatePairsCount === 0;
      } catch (healthErr) {
        console.warn("Could not compute SEO Data Health:", healthErr);
      }
    } catch (err) {
      console.error("Error loading keywords page data:", err);
    }
  }

  return (
    <KeywordsClientView
      queries={queries || []}
      cannibalizationRisks={cannibalizationRisks || []}
      cannibalizationDiagnostics={cannibalizationDiagnostics || []}
      targetsCount={targetsCount || 0}
      dataHealth={dataHealth}
    />
  );
}
