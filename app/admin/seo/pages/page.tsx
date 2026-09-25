import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { fetchRecursiveSitemapUrls } from "@/lib/audit/audit-runner";
import { calculateRankingTrend } from "@/lib/seo/keyword-engine";
import PagesClientView, { type SitePageRankingRow } from "./PagesClientView";

export const dynamic = "force-dynamic";

function computeOpportunityScore(p: {
  position?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  ctr?: number | null;
  issuesCount?: number | null;
  mobilePsi?: number | null;
}): number {
  let score = 0;
  const pos = p.position != null ? Number(p.position) : 0;
  const imp = p.impressions != null ? Number(p.impressions) : 0;
  const ctr = p.ctr != null ? Number(p.ctr) : 0;
  const issues = p.issuesCount != null ? Number(p.issuesCount) : 0;
  const mob = p.mobilePsi != null ? Number(p.mobilePsi) : null;

  // 1. Position in striking distance (positions 4.5 to 20): up to 40 points
  if (pos >= 4.5 && pos <= 10) score += 40;
  else if (pos > 10 && pos <= 20) score += 30;
  else if (pos > 20 && pos <= 35) score += 15;

  // 2. High Impressions (proven search demand): up to 25 points
  if (imp > 1000) score += 25;
  else if (imp > 300) score += 18;
  else if (imp > 50) score += 10;

  // 3. Low CTR on existing impressions: up to 15 points
  if (imp > 100 && ctr < 0.02) score += 15;
  else if (imp > 50 && ctr < 0.03) score += 10;

  // 4. Solvable technical or speed issues: up to 20 points
  if (issues > 0) score += Math.min(10, issues * 3);
  if (mob != null && mob < 70) score += 10;

  return Math.min(100, Math.max(0, score));
}

function extractPrimaryTopic(url: string, title?: string | null): string {
  if (url.includes("/services/ai-video-production-agency")) return "AI Video Production";
  if (url.includes("/services/seo-services-in-mumbai") || url.includes("/services/seo-company-in-mumbai")) return "SEO Services";
  if (url.includes("/services/aeo-services-in-mumbai")) return "AEO & Answer Engines";
  if (url.includes("/services/performance-marketing")) return "Performance Marketing";
  if (url.includes("/services/social-media-agency-mumbai")) return "Social Media Marketing";
  if (url.includes("/services/web-development-company-mumbai")) return "Web Development";
  if (url.includes("/services/geo")) return "Generative Engine Optimization";
  if (url.includes("/services/llm-seo-service")) return "LLM Search Optimization";
  if (url.includes("/portfolio")) return "Client Showcase";
  if (url.includes("/career")) return "Talent & Careers";
  if (url.includes("/blogs")) return "Editorial & Insights";
  if (url === "/" || url.endsWith(".com/") || url.endsWith(".com")) return "Homepage & Brand";

  const slug = url.replace(/\/$/, "").split("/").pop() || "";
  return slug ? slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Corporate";
}

function normalizeUrlKey(rawUrl: string): string {
  return rawUrl.trim().toLowerCase().replace(/\/$/, "");
}

export default async function AdminSiteWidePages() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "view")) {
    redirect("/admin/");
  }

  // 1. Fetch full sitemap page universe (all recursive sitemaps)
  const sitemapUrls = await fetchRecursiveSitemapUrls();

  let rankingRows: SitePageRankingRow[] = [];
  let sitemapUrlsCount = sitemapUrls.length;
  let crawledCount = 0;
  let gscPagesCount = 0;
  let rankedQueriesCount = 0;

  if (isCmsDatabaseConfigured()) {
    try {
      // Find latest completed audit
      const { rows: auditRuns } = await cmsQuery<any>(
        `SELECT id, crawled_url_count FROM site_audit_runs WHERE status = 'completed' ORDER BY created_at DESC LIMIT 1`
      );
      const latestAuditId = auditRuns[0]?.id;
      crawledCount = auditRuns[0]?.crawled_url_count || 0;

      // Map of audit pages (title, issues)
      const auditPagesMap = new Map<string, { title: string | null }>();
      const issuesCountMap = new Map<string, number>();

      if (latestAuditId) {
        const { rows: auditPages } = await cmsQuery<any>(
          `SELECT url, title FROM site_audit_pages WHERE audit_run_id = ?`,
          [latestAuditId]
        );
        for (const ap of auditPages || []) {
          auditPagesMap.set(normalizeUrlKey(ap.url), { title: ap.title || null });
        }
        if (crawledCount === 0) {
          crawledCount = auditPages.length;
        }

        const { rows: issueRows } = await cmsQuery<any>(
          `SELECT url, COUNT(*) as cnt FROM site_audit_issues WHERE audit_run_id = ? GROUP BY url`,
          [latestAuditId]
        );
        for (const ir of issueRows || []) {
          issuesCountMap.set(normalizeUrlKey(ir.url), Number(ir.cnt || 0));
        }
      }

      // Map of GSC page metrics
      const gscPageMap = new Map<
        string,
        {
          clicks: number;
          impressions: number;
          ctr: number;
          position: number | null;
          prev_position: number | null;
        }
      >();

      const { rows: gpmRows } = await cmsQuery<any>(
        `SELECT page_url, clicks, impressions, ctr, position, prev_position FROM gsc_page_metrics`
      );
      for (const gpm of gpmRows || []) {
        const pos = gpm.position != null && Number(gpm.position) > 0 ? Number(gpm.position) : null;
        const prevPos = gpm.prev_position != null && Number(gpm.prev_position) > 0 ? Number(gpm.prev_position) : null;
        gscPageMap.set(normalizeUrlKey(gpm.page_url), {
          clicks: Number(gpm.clicks || 0),
          impressions: Number(gpm.impressions || 0),
          ctr: Number(gpm.ctr || 0),
          position: pos,
          prev_position: prevPos,
        });
      }
      gscPagesCount = gscPageMap.size;

      // PageSpeed cache map
      const psiMap = new Map<string, { mobile: number | null; desktop: number | null }>();
      const { rows: psiRows } = await cmsQuery<any>(
        `SELECT url, strategy, performance_score FROM pagespeed_cache`
      );
      for (const pr of psiRows || []) {
        const key = normalizeUrlKey(pr.url);
        const existing = psiMap.get(key) || { mobile: null, desktop: null };
        if (pr.strategy === "mobile") existing.mobile = pr.performance_score != null ? Number(pr.performance_score) : null;
        if (pr.strategy === "desktop") existing.desktop = pr.performance_score != null ? Number(pr.performance_score) : null;
        psiMap.set(key, existing);
      }

      // Top queries per page map (Current 28d window only)
      const topKeywordsMap = new Map<string, string[]>();
      const { rows: pqRows } = await cmsQuery<any>(
        `SELECT page_url, canonical_page_key, query_text, clicks FROM gsc_page_query_metrics WHERE period_type = '28d' ORDER BY clicks DESC, impressions DESC`
      );
      for (const pq of pqRows || []) {
        const key = normalizeUrlKey(pq.canonical_page_key || pq.page_url);
        const list = topKeywordsMap.get(key) || [];
        if (list.length < 3 && !list.includes(pq.query_text)) {
          list.push(pq.query_text);
        }
        topKeywordsMap.set(key, list);
        // Also map raw URL key
        const rawKey = normalizeUrlKey(pq.page_url);
        if (rawKey !== key) {
          topKeywordsMap.set(rawKey, list);
        }
      }

      // Total ranked queries count
      const { rows: qCountRows } = await cmsQuery<any>(
        `SELECT COUNT(DISTINCT query_text) as totalQueries FROM gsc_query_metrics`
      );
      rankedQueriesCount = Number(qCountRows[0]?.totalQueries || 0);

      // Build unified page universe:
      // Start with all sitemap URLs
      const seenUrls = new Set<string>();
      const fullUniverseUrls: string[] = [];

      for (const u of sitemapUrls) {
        const key = normalizeUrlKey(u);
        if (!seenUrls.has(key)) {
          seenUrls.add(key);
          fullUniverseUrls.push(u);
        }
      }

      // Also ensure any GSC page or audited page is included even if not explicitly listed in sitemap
      for (const gpm of gpmRows || []) {
        const key = normalizeUrlKey(gpm.page_url);
        if (!seenUrls.has(key)) {
          seenUrls.add(key);
          fullUniverseUrls.push(gpm.page_url);
        }
      }

      // Transform into SitePageRankingRow objects
      rankingRows = fullUniverseUrls.map((url) => {
        const key = normalizeUrlKey(url);
        const gpm = gscPageMap.get(key);
        const ap = auditPagesMap.get(key);
        const psi = psiMap.get(key);
        const issues = issuesCountMap.get(key) || 0;
        const topKwList = topKeywordsMap.get(key) || [];

        const pos = gpm?.position ?? null;
        const prevPos = gpm?.prev_position ?? null;
        const imp = gpm?.impressions ?? 0;
        const clk = gpm?.clicks ?? 0;
        const ctr = gpm?.ctr ?? 0;
        const trend = calculateRankingTrend(pos, prevPos);

        return {
          url,
          title: ap?.title || null,
          primaryTopic: extractPrimaryTopic(url, ap?.title),
          clicks: clk,
          impressions: imp,
          ctr,
          googleAvgPosition: pos,
          prevPosition: prevPos,
          rankingTrend: trend,
          topKeywords: topKwList.join(", "),
          mobilePsi: psi?.mobile ?? null,
          desktopPsi: psi?.desktop ?? null,
          issuesCount: issues,
          opportunityScore: computeOpportunityScore({
            position: pos,
            impressions: imp,
            clicks: clk,
            ctr,
            issuesCount: issues,
            mobilePsi: psi?.mobile ?? null,
          }),
        };
      });

      // Sort: highest impressions first, then opportunities, then URL
      rankingRows.sort((a, b) => {
        if (b.impressions !== a.impressions) return b.impressions - a.impressions;
        if (b.opportunityScore !== a.opportunityScore) return b.opportunityScore - a.opportunityScore;
        return a.url.localeCompare(b.url);
      });
    } catch (err) {
      console.error("Error loading site-wide pages rankings universe:", err);
    }
  }

  // Fallback if DB was empty
  if (rankingRows.length === 0) {
    rankingRows = sitemapUrls.map((u: string) => ({
      url: u,
      title: null,
      primaryTopic: extractPrimaryTopic(u),
      clicks: 0,
      impressions: 0,
      ctr: 0,
      googleAvgPosition: null,
      prevPosition: null,
      rankingTrend: calculateRankingTrend(null, null),
      topKeywords: "",
      mobilePsi: null,
      desktopPsi: null,
      issuesCount: 0,
      opportunityScore: 0,
    }));
  }

  return (
    <PagesClientView
      pages={rankingRows}
      sitemapUrlsCount={sitemapUrlsCount}
      crawledCount={crawledCount}
      gscPagesCount={gscPagesCount}
      rankedQueriesCount={rankedQueriesCount}
    />
  );
}
