import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { fetchDynamicSitemapUrls } from "@/lib/audit/audit-runner";
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
  if (url.includes("/portfolio")) return "Client Showcase";
  if (url.includes("/career")) return "Talent & Careers";
  if (url.includes("/blogs")) return "Editorial & Insights";
  if (url === "/" || url.endsWith(".com/")) return "Homepage & Brand";

  const slug = url.replace(/\/$/, "").split("/").pop() || "";
  return slug ? slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Corporate";
}

export default async function AdminSiteWidePages() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "view")) {
    redirect("/admin/");
  }

  let rankingRows: SitePageRankingRow[] = [];

  if (isCmsDatabaseConfigured()) {
    try {
      // Find latest completed audit
      const { rows: auditRows } = await cmsQuery<any>(
        `SELECT id FROM site_audit_runs WHERE status = 'completed' ORDER BY created_at DESC LIMIT 1`
      );
      const latestAuditId = auditRows[0]?.id;

      if (latestAuditId) {
        const { rows } = await cmsQuery<any>(
          `SELECT 
             p.url,
             p.title,
             gpm.position as googleAvgPosition,
             gpm.clicks as gscClicks,
             gpm.impressions as gscImpressions,
             gpm.ctr as gscCtr,
             psi_m.performance_score as mobileSpeed,
             psi_d.performance_score as desktopSpeed,
             (SELECT COUNT(*) FROM site_audit_issues i WHERE i.audit_run_id = p.audit_run_id AND i.url = p.url) as issuesCount,
             (SELECT GROUP_CONCAT(pq.query_text ORDER BY pq.clicks DESC SEPARATOR ', ')
              FROM (SELECT query_text, clicks FROM gsc_page_query_metrics WHERE page_url = p.url ORDER BY clicks DESC LIMIT 3) pq
             ) as topKeywords
           FROM site_audit_pages p
           LEFT JOIN gsc_page_metrics gpm ON (gpm.page_url = p.url)
           LEFT JOIN pagespeed_cache psi_m ON (psi_m.url = p.url AND psi_m.strategy = 'mobile')
           LEFT JOIN pagespeed_cache psi_d ON (psi_d.url = p.url AND psi_d.strategy = 'desktop')
           WHERE p.audit_run_id = ?
           ORDER BY gpm.impressions DESC, p.url ASC`,
          [latestAuditId]
        );

        rankingRows = (rows || []).map((r: any) => {
          const pos = r.googleAvgPosition != null ? Number(r.googleAvgPosition) : null;
          const imp = Number(r.gscImpressions || 0);
          const clk = Number(r.gscClicks || 0);
          const ctr = Number(r.gscCtr || 0);
          const issues = Number(r.issuesCount || 0);
          const mob = r.mobileSpeed != null ? Number(r.mobileSpeed) : null;
          const desk = r.desktopSpeed != null ? Number(r.desktopSpeed) : null;

          return {
            url: String(r.url),
            title: r.title ? String(r.title) : null,
            primaryTopic: extractPrimaryTopic(String(r.url), r.title),
            clicks: clk,
            impressions: imp,
            ctr,
            googleAvgPosition: pos,
            topKeywords: r.topKeywords ? String(r.topKeywords) : "",
            mobilePsi: mob,
            desktopPsi: desk,
            issuesCount: issues,
            opportunityScore: computeOpportunityScore({
              position: pos,
              impressions: imp,
              clicks: clk,
              ctr,
              issuesCount: issues,
              mobilePsi: mob,
            }),
          };
        });
      }
    } catch (err) {
      console.error("Error loading site-wide pages rankings:", err);
    }
  }

  // Fallback if DB was empty
  if (rankingRows.length === 0) {
    const sitemapUrls = await fetchDynamicSitemapUrls();
    rankingRows = sitemapUrls.map((u) => ({
      url: u,
      title: null,
      primaryTopic: extractPrimaryTopic(u),
      clicks: 0,
      impressions: 0,
      ctr: 0,
      googleAvgPosition: null,
      topKeywords: "",
      mobilePsi: null,
      desktopPsi: null,
      issuesCount: 0,
      opportunityScore: 0,
    }));
  }

  return <PagesClientView pages={rankingRows} />;
}
