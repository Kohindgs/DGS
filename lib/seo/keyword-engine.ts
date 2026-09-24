/**
 * DGS SEO Intelligence V8 - Keyword Engine
 * Real first-party recommendation engine derived from GSC telemetry,
 * historical comparison windows, and ranking protection rules.
 *
 * Attribution Rules:
 * - Computed algorithmic logic: "DGS Recommendation Engine"
 * - Telemetry from GSC: "GSC Data"
 * - Generative content suggestions: "AI Recommendation"
 */

export type RankingTrendStatus = "improving" | "falling" | "stable" | "new" | "lost";

export type RankingTrend = {
  status: RankingTrendStatus;
  label: string;
  badgeClass: "success" | "danger" | "neutral" | "primary" | "warning";
  delta: number | null;
  currentPos: number | null;
  prevPos: number | null;
  changeText: string;
};

export type KeywordClassification =
  | "PROTECT"
  | "GROW"
  | "RECOVER"
  | "NEW OPPORTUNITY"
  | "LOW SIGNAL"
  | "CANNIBALIZATION RISK"
  | "NOT DETECTED";

export type KeywordRecommendation = {
  classification: KeywordClassification;
  whyThisMatters: string;
  recommendedActions: string[];
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  implementationPlan: string[];
  safeToAutoApply: boolean;
  suggestedAnchors: string[];
  contentGaps: string[];
};

/**
 * Calculates ranking delta and trend status between two comparison periods.
 * In search engines, lower position number represents a better ranking.
 * e.g. 8.2 -> 6.4 is UP +1.8 positions (Green / Improving)
 *      4.3 -> 7.1 is DOWN -2.8 positions (Red / Falling)
 */
export function calculateRankingTrend(
  currentPos: number | null | undefined,
  prevPos: number | null | undefined
): RankingTrend {
  const current = currentPos != null && currentPos > 0 ? Number(currentPos) : null;
  const prev = prevPos != null && prevPos > 0 ? Number(prevPos) : null;

  // Case 1: No current position
  if (current == null) {
    if (prev != null) {
      return {
        status: "lost",
        label: "LOST",
        badgeClass: "warning", // Orange
        delta: null,
        currentPos: null,
        prevPos: prev,
        changeText: `Was ${prev.toFixed(1)} -> LOST`,
      };
    }
    return {
      status: "lost",
      label: "NOT DETECTED",
      badgeClass: "neutral",
      delta: null,
      currentPos: null,
      prevPos: null,
      changeText: "Not Detected in GSC Window",
    };
  }

  // Case 2: Ranked now, but no prior ranking
  if (prev == null) {
    return {
      status: "new",
      label: "NEW",
      badgeClass: "primary", // Cyan / Electric Blue
      delta: null,
      currentPos: current,
      prevPos: null,
      changeText: `NEW (${current.toFixed(1)})`,
    };
  }

  // Case 3: Comparison between current and previous
  // In search rankings: prev - current > 0 means position improved (closer to #1)
  const diff = Number((prev - current).toFixed(1));

  if (Math.abs(diff) < 0.2) {
    return {
      status: "stable",
      label: "STABLE",
      badgeClass: "neutral", // Grey
      delta: 0,
      currentPos: current,
      prevPos: prev,
      changeText: `±0.0 (${current.toFixed(1)})`,
    };
  }

  if (diff > 0) {
    return {
      status: "improving",
      label: `UP +${diff.toFixed(1)}`,
      badgeClass: "success", // Neon Green
      delta: diff,
      currentPos: current,
      prevPos: prev,
      changeText: `${prev.toFixed(1)} → ${current.toFixed(1)} (+${diff.toFixed(1)})`,
    };
  } else {
    return {
      status: "falling",
      label: `DOWN ${diff.toFixed(1)}`,
      badgeClass: "danger", // Pink / Red
      delta: diff,
      currentPos: current,
      prevPos: prev,
      changeText: `${prev.toFixed(1)} → ${current.toFixed(1)} (${diff.toFixed(1)})`,
    };
  }
}

/**
 * Classifies a keyword based on Search Console metrics, comparison window, and cannibalization evidence.
 */
export function classifyKeyword(params: {
  query: string;
  position: number | null | undefined;
  prevPosition?: number | null | undefined;
  clicks?: number | null | undefined;
  impressions?: number | null | undefined;
  ctr?: number | null | undefined;
  isCannibalized?: boolean;
  competingPagesCount?: number;
}): KeywordClassification {
  const { query, position, prevPosition, clicks = 0, impressions = 0, isCannibalized, competingPagesCount = 0 } = params;

  if (isCannibalized || competingPagesCount > 1) {
    return "CANNIBALIZATION RISK";
  }

  const pos = position != null && position > 0 ? Number(position) : null;
  const prev = prevPosition != null && prevPosition > 0 ? Number(prevPosition) : null;
  const imp = Number(impressions || 0);
  const clk = Number(clicks || 0);

  if (pos == null) {
    return "NOT DETECTED";
  }

  // 1. RECOVER Check:
  // Position dropped materially by 1.5+ positions, or impressions lost while previously top 20
  if (prev != null && prev <= 20) {
    const diff = Number((prev - pos).toFixed(1));
    if (diff <= -1.5) {
      return "RECOVER";
    }
  }

  // 2. PROTECT Check:
  // Top 10 Google Avg. Position (Page 1 ranking)
  if (pos <= 10) {
    return "PROTECT";
  }

  // 3. GROW Check:
  // Striking distance (positions 11 - 20) with solid search demand
  if (pos > 10 && pos <= 20 && imp >= 25) {
    return "GROW";
  }

  // 4. NEW OPPORTUNITY Check:
  // High impressions on Page 2/3 (pos 11-35) or zero clicks despite 50+ impressions
  if ((pos > 20 && pos <= 40 && imp >= 50) || (clk === 0 && imp >= 50)) {
    return "NEW OPPORTUNITY";
  }

  // 5. LOW SIGNAL:
  if (imp < 10) {
    return "LOW SIGNAL";
  }

  // Default to GROW if position <= 25, else NEW OPPORTUNITY
  return pos <= 25 ? "GROW" : "NEW OPPORTUNITY";
}

/**
 * Generates actionable strategy and implementation plan for a keyword.
 */
export function generateKeywordRecommendation(params: {
  query: string;
  pageUrl: string;
  position: number | null | undefined;
  prevPosition?: number | null | undefined;
  clicks?: number | null | undefined;
  impressions?: number | null | undefined;
  ctr?: number | null | undefined;
  isCannibalized?: boolean;
  competingPages?: string[];
  mobilePsi?: number | null | undefined;
  issuesCount?: number | null | undefined;
}): KeywordRecommendation {
  const classification = classifyKeyword(params);
  const { query, pageUrl, position, prevPosition, clicks = 0, impressions = 0, competingPages = [], mobilePsi, issuesCount = 0 } = params;
  const trend = calculateRankingTrend(position, prevPosition);

  const cleanQuery = query.trim();
  const words = cleanQuery.split(/\s+/);
  const suggestedAnchors = [
    cleanQuery,
    `best ${cleanQuery}`,
    `${cleanQuery} services`,
    `${cleanQuery} in Mumbai`,
  ];

  const contentGaps = [
    `Dedicated FAQ answering "What is ${cleanQuery}?"`,
    `Comparative process workflow for ${cleanQuery}`,
    `Client deliverables and case study proof points`,
  ];

  switch (classification) {
    case "PROTECT":
      return {
        classification: "PROTECT",
        whyThisMatters: `This query ranks at position ${position?.toFixed(1) || "1-10"} on Google Page 1. It is an established revenue driver and core brand asset. Unintentional copy modifications could forfeit this top position.`,
        recommendedActions: [
          "Lock and protect Title, H1, and Canonical tags against automated modifications",
          "Do NOT rewrite ranking body copy unnecessarily",
          "Strengthen internal link signals from newly published blog posts",
          "Maintain active JSON-LD Schema (Organization, Service, FAQPage)",
          "Monitor Click-Through-Rate (CTR) to preserve snippet engagement",
          "Preserve existing backlinks and verify no redirect chains are introduced",
        ],
        riskLevel: "LOW",
        implementationPlan: [
          "Audit internal links pointing to this URL and ensure consistent anchor text usage",
          "Refresh supporting examples or statistics if content is older than 6 months",
          "Review search snippet display in Google SERP to ensure title does not truncate",
        ],
        safeToAutoApply: false,
        suggestedAnchors,
        contentGaps,
      };

    case "GROW":
      return {
        classification: "GROW",
        whyThisMatters: `Currently in striking distance at position ${position?.toFixed(1)} with ${impressions?.toLocaleString()} impressions. Moving from Page 2 into the Top 5 will multiply organic click volume exponentially.`,
        recommendedActions: [
          "Deepen section topical coverage and address user search intent directly",
          "Add structured FAQ section targeting Google Answer Engine Optimization (AEO)",
          "Strengthen internal links with descriptive anchor text from high-authority pages",
          "Refine title tag and meta description to increase SERP click-through rate",
          "Verify schema markup covers the specific service or topic entity",
          "Publish a supporting blog article in this topic cluster linking back to this URL",
        ],
        riskLevel: "MODERATE",
        implementationPlan: [
          `Add an expandable FAQ block on ${pageUrl.replace(/^https?:\/\/[^/]+/i, "")} addressing "${query}"`,
          "Identify 3 related blog posts and insert contextual hyperlinks pointing to this landing page",
          mobilePsi != null && mobilePsi < 70
            ? `Optimize mobile PageSpeed score (currently ${mobilePsi}) by deferring unneeded scripts and compressing images`
            : "Review meta description copy to include a compelling call-to-action",
        ],
        safeToAutoApply: false,
        suggestedAnchors,
        contentGaps,
      };

    case "RECOVER":
      return {
        classification: "RECOVER",
        whyThisMatters: `Ranking position declined (${trend.changeText}) in the active 28-day comparison window. Prompt diagnosis is needed to halt organic visibility decay.`,
        recommendedActions: [
          "Investigate recent content, title, or meta description changes on this page",
          "Verify canonical tag is self-referential and page returns HTTP 200 OK",
          "Audit internal links to confirm anchor text and links were not inadvertently removed",
          "Inspect competing DGS pages to verify no accidental keyword cannibalization was introduced",
          "Audit technical health and mobile performance metrics",
          "Check Google Search Central documentation for recent core algorithm updates",
        ],
        riskLevel: "HIGH",
        implementationPlan: [
          "Compare page source code against the previous deployment baseline",
          "Inspect Google Search Console Coverage report for crawl anomalies or indexing exclusions",
          issuesCount != null && issuesCount > 0
            ? `Resolve ${issuesCount} outstanding site audit technical issues on this page`
            : "Re-index URL via Google Search Console URL Inspection tool after verifying content integrity",
        ],
        safeToAutoApply: false,
        suggestedAnchors,
        contentGaps,
      };

    case "CANNIBALIZATION RISK":
      return {
        classification: "CANNIBALIZATION RISK",
        whyThisMatters: `Multiple DGS URLs (${competingPages.length} pages) are competing in Google search for "${query}". This splits ranking signals, suppresses position stability, and causes Google to alternate which page it ranks.`,
        recommendedActions: [
          "Designate one primary landing page as the canonical target for this query",
          "Differentiate copy and heading tags across secondary competing pages",
          "Update internal link anchor text so all mentions point strictly to the primary URL",
          "Do NOT blindly redirect or delete ranking pages without human review",
        ],
        riskLevel: "HIGH",
        implementationPlan: [
          `Designate ${pageUrl.replace(/^https?:\/\/[^/]+/i, "")} as the primary ranking target`,
          "Modify internal links on competing secondary pages to point to the primary target",
          "Ensure secondary pages focus on their own unique sub-topics or service niches",
        ],
        safeToAutoApply: false,
        suggestedAnchors,
        contentGaps,
      };

    case "NEW OPPORTUNITY":
      return {
        classification: "NEW OPPORTUNITY",
        whyThisMatters: `Google is indexing and showing this page for "${query}" with ${impressions?.toLocaleString()} impressions, but clicks remain low (${clicks}). Optimizing relevance will convert impressions into organic visits.`,
        recommendedActions: [
          "Align page headings (H2/H3) and introductory paragraphs with this search intent",
          "Add dedicated sub-section explaining key terms and benefits",
          "Improve meta description snippet to make searchers want to click",
          "Link from top navigation or main services hub to boost page authority",
        ],
        riskLevel: "LOW",
        implementationPlan: [
          `Incorporate "${query}" naturally in a prominent sub-heading and opening paragraph`,
          "Test an updated meta description featuring clear value propositions and CTA",
          "Add 2 internal links from authoritative site pages with descriptive anchors",
        ],
        safeToAutoApply: false,
        suggestedAnchors,
        contentGaps,
      };

    case "LOW SIGNAL":
      return {
        classification: "LOW SIGNAL",
        whyThisMatters: `Query has minimal search impressions (${impressions}) in the active 28-day window. It may be an emerging long-tail variation or low-demand phrase.`,
        recommendedActions: [
          "Monitor across the next 28-day sync cycle before committing editorial resources",
          "Evaluate whether this query aligns with high-intent enterprise client queries",
        ],
        riskLevel: "LOW",
        implementationPlan: [
          "Retain query in monitoring watchlist",
          "Re-evaluate if impressions increase above 25/month",
        ],
        safeToAutoApply: false,
        suggestedAnchors,
        contentGaps,
      };

    case "NOT DETECTED":
    default:
      return {
        classification: "NOT DETECTED",
        whyThisMatters: `This target keyword was not detected in Google Search Console's 28-day query window. The page is currently receiving zero recorded impressions for this specific term.`,
        recommendedActions: [
          "Verify URL is properly indexed in Google Search Console",
          "Audit page title, H1, and first 100 words to ensure keyword presence",
          "Check for potential cannibalization with other existing indexed pages",
          "Build supporting topic cluster and internal links from authoritative blog posts",
        ],
        riskLevel: "MODERATE",
        implementationPlan: [
          "Check GSC URL Inspection to ensure URL is crawled and indexed",
          `Verify that "${query}" or close synonyms appear in heading structure`,
          "Create a dedicated supporting blog article linking back to this target URL",
        ],
        safeToAutoApply: false,
        suggestedAnchors,
        contentGaps,
      };
  }
}
