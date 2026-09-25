/**
 * DGS SEO Intelligence V8.3 - Evidence-Based Cannibalization Engine
 * Replaces naive count(distinct page_url) with rigorous multi-page visibility,
 * brand query protection, intent differentiation, and primary-vs-competing role assignment.
 */

import {
  canonicalPageKey,
  normalizeSearchQuery,
  normalizeSitePageUrl,
} from "./search-normalization.ts";

export type PageRole = "PRIMARY" | "SECONDARY" | "COMPETING";

export type CannibalizationClassification =
  | "NONE"
  | "PROTECT — BRAND"
  | "BRAND MULTI-URL"
  | "MULTI-INTENT VISIBILITY"
  | "OBSERVE"
  | "POTENTIAL CANNIBALIZATION"
  | "CONFIRMED CANNIBALIZATION";

export type PageDiagnostic = {
  pageUrl: string;
  canonicalKey: string;
  role: PageRole;
  clicks: number;
  impressions: number;
  impressionShare: number; // 0..1
  clickShare: number;      // 0..1
  ctr: number;
  googleAvgPosition: number;
  isTargetPage?: boolean;
};

export type QueryCannibalizationDiagnostic = {
  queryText: string;
  normalizedQuery: string;
  classification: CannibalizationClassification;
  isBrand: boolean;
  totalClicks: number;
  totalImpressions: number;
  primaryPage: string;
  intendedTargetPage?: string | null;
  pageDiagnostics: PageDiagnostic[];
  competingPages: PageDiagnostic[];
  secondaryPages: PageDiagnostic[];
  evidence: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  recommendation: string;
  actionPlan: string[];
};

export type RawPageQueryInput = {
  query_text: string;
  page_url: string;
  clicks: number;
  impressions: number;
  ctr?: number;
  position?: number | null;
  period_type?: string;
};

export type TargetKeywordMapping = {
  keyword: string;
  pageUrl: string;
  keywordGroup?: string | null;
};

/**
 * Checks if a query is a branded navigational search for DGS.
 */
export function isBrandQuery(query: string): boolean {
  const norm = normalizeSearchQuery(query);
  if (!norm) return false;

  // Exact brand terms, variations, and brand + modifier/location queries
  const brandPatterns = [
    /^d[\s'-]?genius(\s+solutions?)?(\s+.*)?$/i,
    /^digital\s+genius(\s+solutions?)?(\s+.*)?$/i,
    /^dgeniussolutions(\.com)?(\s+.*)?$/i,
    /^d-genius/i,
  ];

  return brandPatterns.some((re) => re.test(norm));
}

/**
 * Categorizes a canonical page by its structural intent.
 */
export function categorizePageRoute(canonicalKey: string): "home" | "service" | "blog" | "utility" | "other" {
  if (canonicalKey === "/" || canonicalKey === "") return "home";
  if (canonicalKey.startsWith("/services/")) return "service";
  if (canonicalKey.startsWith("/blogs/") || canonicalKey.startsWith("/blog/")) return "blog";
  if (
    canonicalKey.startsWith("/contact") ||
    canonicalKey.startsWith("/about") ||
    canonicalKey.startsWith("/career") ||
    canonicalKey.startsWith("/privacy") ||
    canonicalKey.startsWith("/terms") ||
    canonicalKey.startsWith("/portfolio") ||
    canonicalKey.startsWith("/case_studies")
  ) {
    return "utility";
  }
  return "other";
}

/**
 * Analyzes a set of page-query metrics for a specific normalized query and classifies cannibalization risk.
 */
export function analyzeQueryCannibalization(params: {
  normalizedQuery: string;
  rawQueryText: string;
  pageRows: RawPageQueryInput[];
  targetMapping?: TargetKeywordMapping | null;
}): QueryCannibalizationDiagnostic {
  const { normalizedQuery, rawQueryText, pageRows, targetMapping } = params;

  // 1. Group and aggregate by canonical page key
  const pageMap = new Map<string, {
    canonicalKey: string;
    sampleUrl: string;
    clicks: number;
    impressions: number;
    weightedPosSum: number;
  }>();

  let totalClicks = 0;
  let totalImpressions = 0;

  for (const row of pageRows) {
    const key = canonicalPageKey(row.page_url);
    const clicks = Math.round(Number(row.clicks || 0));
    const impressions = Math.round(Number(row.impressions || 0));
    const pos = Number(row.position || 0);

    totalClicks += clicks;
    totalImpressions += impressions;

    const existing = pageMap.get(key) || {
      canonicalKey: key,
      sampleUrl: normalizeSitePageUrl(key),
      clicks: 0,
      impressions: 0,
      weightedPosSum: 0,
    };

    existing.clicks += clicks;
    existing.impressions += impressions;
    existing.weightedPosSum += pos * (impressions || 1);
    pageMap.set(key, existing);
  }

  const distinctPages = Array.from(pageMap.values()).map((p) => {
    const avgPos = p.impressions > 0 ? Number((p.weightedPosSum / p.impressions).toFixed(2)) : 0;
    const ctr = p.impressions > 0 ? Number((p.clicks / p.impressions).toFixed(4)) : 0;
    const impShare = totalImpressions > 0 ? Number((p.impressions / totalImpressions).toFixed(4)) : 0;
    const clkShare = totalClicks > 0 ? Number((p.clicks / totalClicks).toFixed(4)) : 0;

    return {
      canonicalKey: p.canonicalKey,
      pageUrl: p.sampleUrl,
      clicks: p.clicks,
      impressions: p.impressions,
      ctr,
      googleAvgPosition: avgPos,
      impressionShare: impShare,
      clickShare: clkShare,
      isTargetPage: targetMapping ? canonicalPageKey(targetMapping.pageUrl) === p.canonicalKey : false,
    };
  });

  // 2. Determine Primary Page
  // Preference order:
  // a) Explicit target keyword mapping (if it has search signal)
  // b) Highest clicks
  // c) Highest impressions
  // d) Best average position (lowest non-zero)
  let primaryIndex = 0;
  const targetIdx = distinctPages.findIndex((p) => p.isTargetPage && p.impressions > 0);

  if (targetIdx !== -1) {
    primaryIndex = targetIdx;
  } else {
    // Sort candidates to find primary
    let bestScore = -1;
    for (let i = 0; i < distinctPages.length; i++) {
      const p = distinctPages[i];
      // Weighted ranking power score: clicks (x100) + impressions + position bonus
      const posBonus = p.googleAvgPosition > 0 && p.googleAvgPosition <= 10 ? (11 - p.googleAvgPosition) * 10 : 0;
      const score = p.clicks * 100 + p.impressions + posBonus;
      if (score > bestScore) {
        bestScore = score;
        primaryIndex = i;
      }
    }
  }

  const primaryPage = distinctPages[primaryIndex] || {
    canonicalKey: "/",
    pageUrl: "https://www.dgeniussolutions.com/",
    clicks: 0,
    impressions: 0,
    ctr: 0,
    googleAvgPosition: 0,
    impressionShare: 1,
    clickShare: 1,
    isTargetPage: false,
  };

  const isBrand = isBrandQuery(normalizedQuery);
  const targetKey = targetMapping ? canonicalPageKey(targetMapping.pageUrl) : null;

  // 3. Classify Page Roles & Query Classification
  const pageDiagnostics: PageDiagnostic[] = [];
  const competingPages: PageDiagnostic[] = [];
  const secondaryPages: PageDiagnostic[] = [];

  // Material visibility thresholds (Section 14):
  // Query total impressions >= 30, and secondary page has:
  // impressions >= 10 OR impressionShare >= 0.10 OR clicks >= 2
  const queryHasVolume = totalImpressions >= 30;

  for (let i = 0; i < distinctPages.length; i++) {
    const page = distinctPages[i];
    if (i === primaryIndex) {
      pageDiagnostics.push({ ...page, role: "PRIMARY" });
      continue;
    }

    const hasMaterialVisibility =
      queryHasVolume &&
      (page.impressions >= 10 || page.impressionShare >= 0.10 || page.clicks >= 2);

    // Brand Queries: secondary pages are normal navigational sitelinks
    if (isBrand) {
      const diag: PageDiagnostic = { ...page, role: "SECONDARY" };
      pageDiagnostics.push(diag);
      secondaryPages.push(diag);
      continue;
    }

    // Non-Brand Queries
    const primaryCategory = categorizePageRoute(primaryPage.canonicalKey);
    const pageCategory = categorizePageRoute(page.canonicalKey);

    // Multi-intent: e.g. commercial service vs educational blog
    const isMultiIntent =
      (primaryCategory === "service" && pageCategory === "blog") ||
      (primaryCategory === "blog" && pageCategory === "service") ||
      (pageCategory === "utility" && page.impressions < 30);

    if (hasMaterialVisibility) {
      if (isMultiIntent) {
        const diag: PageDiagnostic = { ...page, role: "SECONDARY" };
        pageDiagnostics.push(diag);
        secondaryPages.push(diag);
      } else {
        const diag: PageDiagnostic = { ...page, role: "COMPETING" };
        pageDiagnostics.push(diag);
        competingPages.push(diag);
      }
    } else {
      // Low signal / trivial secondary impressions (e.g. 1-2 impressions) -> NOT competing
      const diag: PageDiagnostic = { ...page, role: "SECONDARY" };
      pageDiagnostics.push(diag);
      secondaryPages.push(diag);
    }
  }

  // 4. Overall Classification
  let classification: CannibalizationClassification = "NONE";
  let evidence = "";
  let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  let recommendation = "";
  const actionPlan: string[] = [];

  if (isBrand) {
    if (distinctPages.length > 1) {
      classification = "BRAND MULTI-URL";
      evidence = `Navigational brand query "${rawQueryText}" ranks primary homepage (${primaryPage.canonicalKey}) with ${primaryPage.clicks} clicks alongside ${secondaryPages.length} valid secondary brand/sitelink pages (${secondaryPages.map((p) => p.canonicalKey).join(", ")}).`;
      confidence = "HIGH";
      recommendation = `Maintain brand authority on homepage. Ensure secondary pages have descriptive anchor text pointing back to the homepage. Do NOT de-optimize or redirect valid sitelinks.`;
    } else {
      classification = "PROTECT — BRAND";
      evidence = `Navigational brand query ranks solely for authoritative homepage (${primaryPage.canonicalKey}).`;
      confidence = "HIGH";
      recommendation = `Protect homepage brand ranking and structured data. Do NOT de-optimize or redirect.`;
    }
  } else if (competingPages.length > 0) {
    const hasSevereConflict = competingPages.some(
      (cp) => cp.clicks >= 2 || cp.impressionShare >= 0.25 || (cp.googleAvgPosition <= 15 && cp.impressions >= 15)
    );

    if (hasSevereConflict) {
      classification = "CONFIRMED CANNIBALIZATION";
      confidence = "HIGH";
      evidence = `Material keyword competition detected for "${rawQueryText}". Primary page ${primaryPage.canonicalKey} (${(primaryPage.impressionShare * 100).toFixed(1)}% imp share) competes directly against ${competingPages.map((cp) => `${cp.canonicalKey} (${(cp.impressionShare * 100).toFixed(1)}% share, ${cp.clicks} clicks)`).join(", ")}.`;
      recommendation = `Differentiate topical intent between pages. Strengthen internal linking from competing pages pointing to the authoritative primary target page ${primaryPage.canonicalKey}. Do NOT delete or blindly 301 redirect.`;
      actionPlan.push(`Review content headings on ${competingPages.map((p) => p.canonicalKey).join(", ")} to differentiate sub-intent.`);
      actionPlan.push(`Add contextual internal links from competing pages to primary page (${primaryPage.canonicalKey}) using exact target anchors.`);
    } else {
      classification = "POTENTIAL CANNIBALIZATION";
      confidence = "MEDIUM";
      evidence = `Moderate secondary impression split for "${rawQueryText}" between ${primaryPage.canonicalKey} and ${competingPages.map((cp) => cp.canonicalKey).join(", ")}.`;
      recommendation = `Observe next 28-day window. If competing page impressions continue to rise, adjust page heading focus.`;
      actionPlan.push(`Monitor ranking distribution for query over subsequent sync cycles.`);
    }
  } else if (secondaryPages.some((sp) => categorizePageRoute(sp.canonicalKey) === "blog" && sp.impressions >= 10)) {
    classification = "MULTI-INTENT VISIBILITY";
    confidence = "HIGH";
    evidence = `Query "${rawQueryText}" achieves multi-intent SERP coverage across commercial (${primaryPage.canonicalKey}) and informational (${secondaryPages.map((p) => p.canonicalKey).join(", ")}) pages.`;
    recommendation = `Positive multi-intent SERP coverage. Add an internal link from the informational article to the commercial service page.`;
    actionPlan.push(`Ensure the blog article links prominently to the corresponding service page.`);
  } else if (distinctPages.length > 1 && totalImpressions >= 20) {
    classification = "OBSERVE";
    confidence = "LOW";
    evidence = `Minor secondary impressions observed across ${distinctPages.length} URLs, but no material competition detected.`;
    recommendation = `No action needed; secondary URLs lack significant ranking share.`;
  } else {
    classification = "NONE";
    evidence = `Single authoritative page ranks for this query.`;
    confidence = "HIGH";
    recommendation = `Normal keyword performance.`;
  }

  return {
    queryText: rawQueryText,
    normalizedQuery,
    classification,
    isBrand,
    totalClicks,
    totalImpressions,
    primaryPage: primaryPage.pageUrl,
    intendedTargetPage: targetMapping ? normalizeSitePageUrl(targetMapping.pageUrl) : null,
    pageDiagnostics,
    competingPages,
    secondaryPages,
    evidence,
    confidence,
    recommendation,
    actionPlan,
  };
}

/**
 * Runs cannibalization detection across all current page-query metrics.
 */
export function buildSiteCannibalizationIndex(
  pageQueries: RawPageQueryInput[],
  targetMappings: TargetKeywordMapping[] = []
): Map<string, QueryCannibalizationDiagnostic> {
  const targetMap = new Map<string, TargetKeywordMapping>();
  for (const tm of targetMappings) {
    targetMap.set(normalizeSearchQuery(tm.keyword), tm);
  }

  // Group raw rows by normalized query
  const queryGroups = new Map<string, { rawText: string; rows: RawPageQueryInput[] }>();

  for (const row of pageQueries) {
    const norm = normalizeSearchQuery(row.query_text);
    if (!norm) continue;

    const group = queryGroups.get(norm) || { rawText: row.query_text, rows: [] };
    group.rows.push(row);
    // Keep most frequent or properly cased rawText
    if (row.clicks > 0 || group.rows.length === 1) {
      group.rawText = row.query_text;
    }
    queryGroups.set(norm, group);
  }

  const index = new Map<string, QueryCannibalizationDiagnostic>();

  for (const [normQ, group] of queryGroups.entries()) {
    const diagnostic = analyzeQueryCannibalization({
      normalizedQuery: normQ,
      rawQueryText: group.rawText,
      pageRows: group.rows,
      targetMapping: targetMap.get(normQ) || null,
    });
    index.set(normQ, diagnostic);
  }

  return index;
}
