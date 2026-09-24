import "server-only";
import { randomUUID } from "node:crypto";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";

export type KeywordRankingStatus =
  | "TOP 3"
  | "TOP 10"
  | "TOP 20"
  | "TOP 50"
  | "VISIBLE"
  | "DECLINING"
  | "NEW"
  | "LOST";

export type TargetKeywordStatus =
  | "RANKING"
  | "LOST / NOT DETECTED"
  | "NOT DETECTED IN SEARCH CONSOLE";

export type PageQueryMetric = {
  id: string;
  pageUrl: string;
  queryText: string;
  clicks: number;
  impressions: number;
  ctr: number;
  googleAvgPosition: number;
  changePosition?: number;
  status: KeywordRankingStatus;
  periodType: string;
};

export type TargetKeywordRecord = {
  id: string;
  pageUrl: string;
  keyword: string;
  keywordGroup: string;
  status: TargetKeywordStatus;
  currentAvgPosition?: number | null;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  createdAt: string;
};

export type KeywordGapSummary = {
  totalTargets: number;
  rankingCount: number;
  notDetectedCount: number;
  decliningCount: number;
  improvingCount: number;
  top10Count: number;
  top20Count: number;
  targetDetails: TargetKeywordRecord[];
};

export type CannibalizationRisk = {
  queryText: string;
  competingPages: Array<{
    pageUrl: string;
    clicks: number;
    impressions: number;
    googleAvgPosition: number;
  }>;
  totalImpressions: number;
  recommendation: string;
};

export type PageRecommendation = {
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: "intent" | "content" | "links" | "schema" | "speed" | "meta";
  problem: string;
  evidence: string;
  recommendedAction: string;
  expectedPurpose: string;
  riskToExistingRanking: "NONE" | "LOW" | "HIGH — REQUIRES SUPERADMIN APPROVAL";
  requiresApproval: boolean;
};

/**
 * Pre-seed authentic target keywords for key DGS service landing pages.
 */
export async function seedInitialTargetKeywords(): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;

  const initialSeeds = [
    // AI Video Production Agency
    {
      page: "/services/ai-video-production-agency/",
      keywords: [
        "ai video production agency in mumbai",
        "ai video production company in mumbai",
        "ai automobile service videos production in mumbai",
        "ai documentary videos production in mumbai",
        "ai edtech videos production in mumbai",
        "ai fintech videos production in mumbai",
        "ai tv commercial video production in mumbai",
        "ai jewellery video production in mumbai",
        "ai fmcg videos production in mumbai",
        "ai pharma videos production in mumbai",
        "pharmaceutical ai videos production in mumbai",
        "ai it video production in mumbai",
      ],
      group: "services_ai_video",
    },
    // SEO Services Mumbai
    {
      page: "/services/seo-services-in-mumbai/",
      keywords: [
        "seo company in mumbai",
        "seo agency in mumbai",
        "best seo company in mumbai",
        "local seo services mumbai",
        "enterprise seo services mumbai",
        "ecommerce seo company in mumbai",
      ],
      group: "services_seo",
    },
    // AEO Services
    {
      page: "/services/aeo-services-in-mumbai/",
      keywords: [
        "aeo services in mumbai",
        "answer engine optimization company mumbai",
        "ai search optimization agency",
        "perplexity seo agency mumbai",
      ],
      group: "services_aeo",
    },
    // Performance Marketing
    {
      page: "/services/performance-marketing/",
      keywords: [
        "performance marketing agency in mumbai",
        "google ads management company in mumbai",
        "meta ads agency in mumbai",
      ],
      group: "services_performance",
    },
  ];

  for (const group of initialSeeds) {
    for (const kw of group.keywords) {
      try {
        const id = randomUUID();
        await cmsExecute(
          `INSERT INTO target_keywords (id, page_url, keyword, keyword_group)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
          [id, group.page, kw, group.group]
        );
      } catch {}
    }
  }
}

/**
 * List target keywords for a page or group.
 */
export async function listTargetKeywords(options: {
  pageUrl?: string;
  keywordGroup?: string;
} = {}): Promise<TargetKeywordRecord[]> {
  if (!isCmsDatabaseConfigured()) return [];

  const whereClauses: string[] = [];
  const params: unknown[] = [];

  if (options.pageUrl) {
    whereClauses.push("page_url = ?");
    params.push(options.pageUrl);
  }

  if (options.keywordGroup) {
    whereClauses.push("keyword_group = ?");
    params.push(options.keywordGroup);
  }

  const whereSql = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(" AND ")}` : "";

  try {
    const { rows } = await cmsQuery<Record<string, unknown>>(
      `SELECT * FROM target_keywords${whereSql} ORDER BY page_url ASC, keyword ASC`,
      params
    );

    return rows.map((r) => ({
      id: String(r.id),
      pageUrl: String(r.page_url),
      keyword: String(r.keyword),
      keywordGroup: String(r.keyword_group || "primary"),
      status: "NOT DETECTED IN SEARCH CONSOLE",
      createdAt: String(r.created_at || ""),
    }));
  } catch (err) {
    console.error("listTargetKeywords error:", err);
    return [];
  }
}

/**
 * Add a target keyword.
 */
export async function addTargetKeyword(params: {
  pageUrl: string;
  keyword: string;
  keywordGroup?: string;
}): Promise<string> {
  if (!isCmsDatabaseConfigured()) throw new Error("Database not configured");

  const id = randomUUID();
  const kw = params.keyword.trim().toLowerCase();
  const grp = params.keywordGroup || "primary";

  await cmsExecute(
    `INSERT INTO target_keywords (id, page_url, keyword, keyword_group)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE keyword_group = VALUES(keyword_group)`,
    [id, params.pageUrl, kw, grp]
  );

  return id;
}

/**
 * Remove a target keyword.
 */
export async function removeTargetKeyword(id: string): Promise<boolean> {
  if (!isCmsDatabaseConfigured()) return false;
  await cmsExecute(`DELETE FROM target_keywords WHERE id = ?`, [id]);
  return true;
}

/**
 * Retrieve keywords ranking for a given page from GSC page-query matrix.
 */
export async function getKeywordsForPage(
  pageUrl: string,
  period: string = "28d"
): Promise<PageQueryMetric[]> {
  if (!isCmsDatabaseConfigured()) return [];

  // Match relative or absolute page URL
  const pathPart = pageUrl.replace(/^https?:\/\/[^/]+/i, "") || "/";

  try {
    const { rows } = await cmsQuery<Record<string, unknown>>(
      `SELECT * FROM gsc_page_query_metrics
       WHERE (page_url = ? OR page_url LIKE ?) AND period_type = ?
       ORDER BY clicks DESC, impressions DESC
       LIMIT 100`,
      [pageUrl, `%${pathPart}`, period]
    );

    return rows.map((r) => {
      const pos = Number(r.position || 0);
      let status: KeywordRankingStatus = "VISIBLE";

      if (pos > 0 && pos <= 3) status = "TOP 3";
      else if (pos > 0 && pos <= 10) status = "TOP 10";
      else if (pos > 0 && pos <= 20) status = "TOP 20";
      else if (pos > 0 && pos <= 50) status = "TOP 50";

      return {
        id: String(r.id),
        pageUrl: String(r.page_url),
        queryText: String(r.query_text),
        clicks: Number(r.clicks || 0),
        impressions: Number(r.impressions || 0),
        ctr: Number(r.ctr || 0),
        googleAvgPosition: pos,
        status,
        periodType: String(r.period_type || "28d"),
      };
    });
  } catch (err) {
    console.error("getKeywordsForPage error:", err);
    return [];
  }
}

/**
 * Calculate keyword gap analysis for a page.
 */
export async function getPageKeywordGap(
  pageUrl: string,
  period: string = "28d"
): Promise<KeywordGapSummary> {
  const targetKeywords = await listTargetKeywords({ pageUrl });
  const rankingKeywords = await getKeywordsForPage(pageUrl, period);

  const rankingByText = new Map<string, PageQueryMetric>();
  for (const rk of rankingKeywords) {
    rankingByText.set(rk.queryText.toLowerCase().trim(), rk);
  }

  let rankingCount = 0;
  let notDetectedCount = 0;
  let decliningCount = 0;
  let improvingCount = 0;
  let top10Count = 0;
  let top20Count = 0;

  const enrichedTargets: TargetKeywordRecord[] = targetKeywords.map((tk) => {
    const match = rankingByText.get(tk.keyword.toLowerCase().trim());

    if (match && match.impressions > 0) {
      rankingCount++;
      const pos = match.googleAvgPosition;
      if (pos > 0 && pos <= 10) top10Count++;
      if (pos > 0 && pos <= 20) top20Count++;

      return {
        ...tk,
        status: "RANKING" as TargetKeywordStatus,
        currentAvgPosition: pos,
        clicks: match.clicks,
        impressions: match.impressions,
        ctr: match.ctr,
      };
    } else {
      notDetectedCount++;
      return {
        ...tk,
        status: "NOT DETECTED IN SEARCH CONSOLE" as TargetKeywordStatus,
        currentAvgPosition: null,
        clicks: 0,
        impressions: 0,
        ctr: 0,
      };
    }
  });

  return {
    totalTargets: targetKeywords.length,
    rankingCount,
    notDetectedCount,
    decliningCount,
    improvingCount,
    top10Count,
    top20Count,
    targetDetails: enrichedTargets,
  };
}

/**
 * Detect keyword cannibalization across the entire DGS site.
 * Flags queries where 2 or more distinct pages compete with significant impressions.
 */
export async function detectCannibalization(): Promise<CannibalizationRisk[]> {
  if (!isCmsDatabaseConfigured()) return [];

  try {
    const { rows } = await cmsQuery<Record<string, unknown>>(
      `SELECT query_text, COUNT(DISTINCT page_url) as page_count, SUM(impressions) as total_imp
       FROM gsc_page_query_metrics
       GROUP BY query_text
       HAVING page_count > 1 AND total_imp > 50
       ORDER BY total_imp DESC
       LIMIT 50`
    );

    const risks: CannibalizationRisk[] = [];

    for (const r of rows) {
      const queryText = String(r.query_text);
      const { rows: pageRows } = await cmsQuery<Record<string, unknown>>(
        `SELECT page_url, clicks, impressions, position
         FROM gsc_page_query_metrics
         WHERE query_text = ?
         ORDER BY impressions DESC`,
        [queryText]
      );

      risks.push({
        queryText,
        totalImpressions: Number(r.total_imp || 0),
        competingPages: pageRows.map((pr) => ({
          pageUrl: String(pr.page_url),
          clicks: Number(pr.clicks || 0),
          impressions: Number(pr.impressions || 0),
          googleAvgPosition: Number(pr.position || 0),
        })),
        recommendation: `Multiple DGS URLs receive search impressions for "${queryText}". Conduct editorial review to differentiate topic intent and strengthen internal links to the primary authoritative target page. (Do NOT automatically canonicalize or delete).`,
      });
    }

    return risks;
  } catch (err) {
    console.error("detectCannibalization error:", err);
    return [];
  }
}

/**
 * Evidence-based SEO recommendation engine for a page.
 * Strictly adheres to ranking protection for pages positioned 1-5.
 */
export function generatePageRecommendations(params: {
  pageUrl: string;
  googleAvgPosition?: number | null;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  mobilePsi?: number | null;
  desktopPsi?: number | null;
  missingAltCount: number;
  hasSchema: boolean;
  internalLinksCount: number;
  rankingKeywords?: PageQueryMetric[];
  keywordGap?: KeywordGapSummary;
}): PageRecommendation[] {
  const {
    pageUrl,
    googleAvgPosition,
    impressions = 0,
    ctr = 0,
    mobilePsi,
    missingAltCount,
    hasSchema,
    internalLinksCount,
    keywordGap,
  } = params;

  const recs: PageRecommendation[] = [];
  const isTopRanking = googleAvgPosition != null && googleAvgPosition > 0 && googleAvgPosition <= 5.0;

  // 1. Missing Alt Text
  if (missingAltCount > 0) {
    recs.push({
      priority: "MEDIUM",
      category: "meta",
      problem: `${missingAltCount} image(s) on page lack descriptive alt attributes.`,
      evidence: `Crawl inspection detected ${missingAltCount} non-decorative images with empty/missing alt text.`,
      recommendedAction: `Open Alt Fixer drawer to review context-aware AI suggestions and apply verified descriptions or mark decorative.`,
      expectedPurpose: "Improves screen-reader accessibility and qualifies images for Google Image search indexing.",
      riskToExistingRanking: "NONE",
      requiresApproval: false,
    });
  }

  // 2. Structured Data / Schema
  if (!hasSchema) {
    recs.push({
      priority: "HIGH",
      category: "schema",
      problem: "No JSON-LD structured data detected on page.",
      evidence: "HTML source lacks <script type='application/ld+json'> markup.",
      recommendedAction: "Implement BreadcrumbList and WebPage schema JSON-LD.",
      expectedPurpose: "Enables Google rich result snippets and explicit entity understanding.",
      riskToExistingRanking: "NONE",
      requiresApproval: false,
    });
  }

  // 3. Internal Linking
  if (internalLinksCount < 3) {
    recs.push({
      priority: "HIGH",
      category: "links",
      problem: `Low internal linking density (${internalLinksCount} internal links found).`,
      evidence: `Page has fewer than 3 inbound/outbound contextual internal links on the site.`,
      recommendedAction: `Add 2-3 contextual internal links from complementary service guides or case study pages using natural descriptive anchor text.`,
      expectedPurpose: "Distributes PageRank authority and enhances crawler discovery.",
      riskToExistingRanking: "NONE",
      requiresApproval: false,
    });
  }

  // 4. Mobile Performance
  if (mobilePsi != null && mobilePsi < 70) {
    recs.push({
      priority: "HIGH",
      category: "speed",
      problem: `Mobile PageSpeed score is ${mobilePsi}/100.`,
      evidence: `Lighthouse mobile laboratory evaluation scored ${mobilePsi}/100.`,
      recommendedAction: `Optimize largest contentful paint (LCP) element, defer uncritical JavaScript, and verify responsive image dimension attributes.`,
      expectedPurpose: "Improves Core Web Vitals pass rate, mobile dwell time, and Google mobile-first ranking signals.",
      riskToExistingRanking: "LOW",
      requiresApproval: true,
    });
  }

  // 5. Keyword Gap Opportunities (e.g. Target queries with impressions near page 2)
  if (keywordGap && keywordGap.notDetectedCount > 0) {
    recs.push({
      priority: "MEDIUM",
      category: "content",
      problem: `${keywordGap.notDetectedCount} target keyword(s) not yet detected in Search Console for this URL.`,
      evidence: `Target keyword registry contains ${keywordGap.notDetectedCount} configured topics with zero Search Console impressions.`,
      recommendedAction: isTopRanking
        ? `Page already holds strong position (${googleAvgPosition}). DO NOT rewrite core H1/title. Expand secondary FAQ sections or add relevant subheadings to naturally cover missing sub-topics without disrupting existing rankings.`
        : `Add dedicated subsections, FAQs, or case study examples addressing the unranked target queries.`,
      expectedPurpose: "Expands organic query footprint into long-tail commercial intent.",
      riskToExistingRanking: isTopRanking ? "HIGH — REQUIRES SUPERADMIN APPROVAL" : "LOW",
      requiresApproval: isTopRanking,
    });
  }

  // 6. CTR Optimization on High-Impression Queries
  if (impressions > 500 && ctr < 0.02 && googleAvgPosition != null && googleAvgPosition <= 15) {
    recs.push({
      priority: "HIGH",
      category: "intent",
      problem: `Low Click-Through Rate (${(ctr * 100).toFixed(1)}%) despite ${impressions} impressions (Avg. Position ${googleAvgPosition.toFixed(1)}).`,
      evidence: `Page is appearing in search results but searchers are choosing competitor snippets.`,
      recommendedAction: isTopRanking
        ? `Position is 1-5: preserve core Title and H1. Refine meta description only with a compelling value proposition and clear call-to-action.`
        : `Test a more compelling meta description and title tag highlighting unique Mumbai agency deliverables and proof points.`,
      expectedPurpose: "Increases organic CTR from existing SERP impressions without changing ranking baseline.",
      riskToExistingRanking: isTopRanking ? "HIGH — REQUIRES SUPERADMIN APPROVAL" : "LOW",
      requiresApproval: isTopRanking,
    });
  }

  return recs;
}
