import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { auditSingleUrl } from "@/lib/audit/audit-runner";
import { getCachedPageSpeed, runFullPageSpeed, isPageSpeedConfigured } from "@/lib/seo/pagespeed";
import { getKeywordsForPage, getPageKeywordGap, generatePageRecommendations } from "@/lib/seo/keywords";
import { listMissingAlts } from "@/lib/seo/alt-fixer";
import { cmsQuery, isCmsDatabaseConfigured } from "@/lib/cms/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    // 1. Technical Audit data
    let pageAudit: any = null;
    if (isCmsDatabaseConfigured()) {
      const { rows } = await cmsQuery<any>(
        `SELECT * FROM site_audit_pages WHERE url = ? ORDER BY created_at DESC LIMIT 1`,
        [url]
      );
      if (rows && rows[0]) {
        const r = rows[0];
        pageAudit = {
          url: r.url,
          statusCode: r.status_code,
          responseTimeMs: r.response_time_ms,
          title: r.title,
          metaDescription: r.meta_description,
          canonicalUrl: r.canonical_url,
          robotsMeta: r.robots_meta,
          h1Count: r.h1_count,
          h1Text: r.h1_text,
          schemaTypes: typeof r.schema_types === "string" ? JSON.parse(r.schema_types) : r.schema_types || [],
          imagesCount: r.images_count,
          missingAltCount: r.missing_alt_count,
          internalLinksCount: r.internal_links_count,
          externalLinksCount: r.external_links_count,
          isIndexable: Boolean(r.is_indexable),
          pageScore: r.page_score,
        };
      }
    }

    if (!pageAudit) {
      // Live crawl fallback
      pageAudit = await auditSingleUrl(url);
    }

    // 2. GSC Performance metrics
    let gscPerformance = {
      hasData: false,
      clicks: 0,
      impressions: 0,
      ctr: 0,
      googleAvgPosition: 0,
    };

    if (isCmsDatabaseConfigured()) {
      const pathPart = url.replace(/^https?:\/\/[^/]+/i, "") || "/";
      const { rows: pmRows } = await cmsQuery<any>(
        `SELECT * FROM gsc_page_metrics WHERE page_url = ? OR page_url LIKE ? LIMIT 1`,
        [url, `%${pathPart}`]
      );
      if (pmRows && pmRows[0] && Number(pmRows[0].impressions || 0) > 0) {
        gscPerformance = {
          hasData: true,
          clicks: Number(pmRows[0].clicks || 0),
          impressions: Number(pmRows[0].impressions || 0),
          ctr: Number(pmRows[0].ctr || 0),
          googleAvgPosition: Number(pmRows[0].position || 0),
        };
      }
    }

    // 3. Keywords ranking for page & Keyword gap
    const rankingKeywords = await getKeywordsForPage(url);
    const keywordGap = await getPageKeywordGap(url);

    // If gscPerformance was not in page_metrics but keywords exist, aggregate from keywords
    if (!gscPerformance.hasData && rankingKeywords.length > 0) {
      let totalClicks = 0;
      let totalImp = 0;
      let sumPos = 0;
      for (const k of rankingKeywords) {
        totalClicks += k.clicks;
        totalImp += k.impressions;
        sumPos += k.googleAvgPosition;
      }
      gscPerformance = {
        hasData: true,
        clicks: totalClicks,
        impressions: totalImp,
        ctr: totalImp > 0 ? totalClicks / totalImp : 0,
        googleAvgPosition: Number((sumPos / rankingKeywords.length).toFixed(1)),
      };
    }

    // 4. PageSpeed metrics (Mobile and Desktop)
    const [cachedMobile, cachedDesktop] = await Promise.all([
      getCachedPageSpeed(url, "mobile"),
      getCachedPageSpeed(url, "desktop"),
    ]);

    // 5. Media & Missing Alt items
    const missingAltRecords = await listMissingAlts({ pageUrl: url, resolved: false });

    // 6. Evidence-based Recommendations
    const recommendations = generatePageRecommendations({
      pageUrl: url,
      googleAvgPosition: gscPerformance.hasData ? gscPerformance.googleAvgPosition : null,
      clicks: gscPerformance.clicks,
      impressions: gscPerformance.impressions,
      ctr: gscPerformance.ctr,
      mobilePsi: cachedMobile?.performanceScore ?? null,
      desktopPsi: cachedDesktop?.performanceScore ?? null,
      missingAltCount: pageAudit.missingAltCount ?? missingAltRecords.length,
      hasSchema: pageAudit.schemaTypes && pageAudit.schemaTypes.length > 0,
      internalLinksCount: pageAudit.internalLinksCount ?? 0,
      rankingKeywords,
      keywordGap,
    });

    return NextResponse.json({
      ok: true,
      url,
      pageAudit,
      gscPerformance,
      rankingKeywords,
      keywordGap,
      pageSpeed: {
        mobile: cachedMobile,
        desktop: cachedDesktop,
        config: isPageSpeedConfigured(),
      },
      missingAlts: missingAltRecords,
      recommendations,
    });
  } catch (err: any) {
    console.error("Page intelligence API error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load page SEO intelligence" },
      { status: 500 }
    );
  }
}
