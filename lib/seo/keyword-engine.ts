/**
 * DGS SEO Intelligence V8.1 - Keyword Engine
 * Real first-party recommendation engine derived from GSC telemetry,
 * historical comparison windows, ranking protection rules, and actionable SEO approval drafts.
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

export type KeywordActionOption = {
  id: string;
  label: string;
  changeType: string;
  description: string;
  riskLevel: "SAFE" | "MODERATE" | "HIGH" | "CRITICAL";
  requiresApproval: boolean;
};

export type KeywordRecommendation = {
  classification: KeywordClassification;
  whyThisMatters: string;
  recommendedActions: string[];
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  implementationPlan: string[];
  safeToAutoApply: boolean;
  suggestedAnchors: string[];
  contentGaps: string[];
  actionOptions: KeywordActionOption[];
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
  const current = currentPos != null && !isNaN(Number(currentPos)) && Number(currentPos) > 0 ? Number(currentPos) : null;
  const prev = prevPos != null && !isNaN(Number(prevPos)) && Number(prevPos) > 0 ? Number(prevPos) : null;

  // Case 1: No current position
  if (current == null) {
    if (prev != null) {
      return {
        status: "lost",
        label: "LOST",
        badgeClass: "warning",
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
      badgeClass: "primary",
      delta: null,
      currentPos: current,
      prevPos: null,
      changeText: `NEW (${current.toFixed(1)})`,
    };
  }

  // Case 3: Comparison between current and previous
  const diff = Number((prev - current).toFixed(1));

  if (Math.abs(diff) < 0.2) {
    return {
      status: "stable",
      label: "STABLE",
      badgeClass: "neutral",
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
      badgeClass: "success",
      delta: diff,
      currentPos: current,
      prevPos: prev,
      changeText: `${prev.toFixed(1)} → ${current.toFixed(1)} (+${diff.toFixed(1)})`,
    };
  } else {
    return {
      status: "falling",
      label: `DOWN ${diff.toFixed(1)}`,
      badgeClass: "danger",
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
  query?: string | null;
  position?: number | null | undefined;
  prevPosition?: number | null | undefined;
  clicks?: number | null | undefined;
  impressions?: number | null | undefined;
  ctr?: number | null | undefined;
  isCannibalized?: boolean;
  competingPagesCount?: number;
}): KeywordClassification {
  const { position, prevPosition, clicks = 0, impressions = 0, isCannibalized, competingPagesCount = 0 } = params;

  if (isCannibalized || competingPagesCount > 1) {
    return "CANNIBALIZATION RISK";
  }

  const pos = position != null && !isNaN(Number(position)) && Number(position) > 0 ? Number(position) : null;
  const prev = prevPosition != null && !isNaN(Number(prevPosition)) && Number(prevPosition) > 0 ? Number(prevPosition) : null;
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

  // 2. PROTECT Check: Top 10 Google Avg. Position (Page 1 ranking)
  if (pos <= 10) {
    return "PROTECT";
  }

  // 3. GROW Check: Striking distance (positions 11 - 20) with search demand
  if (pos > 10 && pos <= 20 && imp >= 25) {
    return "GROW";
  }

  // 4. NEW OPPORTUNITY Check: High impressions on Page 2/3 (pos 11-40) or zero clicks despite 50+ impressions
  if ((pos > 20 && pos <= 40 && imp >= 50) || (clk === 0 && imp >= 50)) {
    return "NEW OPPORTUNITY";
  }

  // 5. LOW SIGNAL: Minimal impressions
  if (imp < 10) {
    return "LOW SIGNAL";
  }

  return pos <= 25 ? "GROW" : "NEW OPPORTUNITY";
}

/**
 * Generate highly contextual anchor text suggestions based on target query intent and landing page topic.
 * Avoids mechanical naive repetitive templates.
 */
function generateContextualAnchors(cleanQuery: string = "", pageUrl: string = ""): string[] {
  const normQuery = (cleanQuery || "").toLowerCase();
  const normUrl = (pageUrl || "").toLowerCase();
  const anchors: string[] = cleanQuery ? [cleanQuery] : [];

  // Derive page service domain
  const isVideo = normUrl.includes("video") || normQuery.includes("video");
  const isSeo = normUrl.includes("seo") || normQuery.includes("seo");
  const isAeo = normUrl.includes("aeo") || normUrl.includes("geo") || normQuery.includes("aeo") || normQuery.includes("geo");
  const isPerformance = normUrl.includes("performance") || normQuery.includes("ads") || normQuery.includes("marketing");

  // Contextual variations based on query structure
  const hasMumbai = normQuery.includes("mumbai");
  const hasAgency = normQuery.includes("agency") || normQuery.includes("company");

  if (isVideo) {
    if (!hasAgency) anchors.push(`${cleanQuery} agency deliverables`);
    if (!hasMumbai) anchors.push(`Mumbai ${cleanQuery} case studies`);
    anchors.push(`custom AI generative workflow for ${cleanQuery.replace(/agency|company/gi, "").trim()}`);
  } else if (isAeo) {
    anchors.push(`answer engine optimization guide for ${cleanQuery}`);
    anchors.push(`Perplexity & ChatGPT search optimization with ${cleanQuery}`);
    if (!hasMumbai) anchors.push(`${cleanQuery} strategies in Mumbai`);
  } else if (isSeo) {
    if (!hasAgency) anchors.push(`enterprise ${cleanQuery} solutions`);
    anchors.push(`verified ranking roadmap for ${cleanQuery}`);
    if (!hasMumbai) anchors.push(`${cleanQuery} consultants in Mumbai`);
  } else if (isPerformance) {
    anchors.push(`performance ROAS case studies: ${cleanQuery}`);
    anchors.push(`full-funnel paid media with ${cleanQuery}`);
  } else {
    anchors.push(`proven results in ${cleanQuery}`);
    anchors.push(`comprehensive guide to ${cleanQuery}`);
  }

  // Return deduplicated list of at most 4 high-relevance contextual anchors
  return Array.from(new Set(anchors.map((a) => a.trim()))).slice(0, 4);
}

/**
 * Generates actionable strategy and implementation plan for a keyword.
 * Strictly adheres to ranking protection for pages positioned 1-10.
 */
export function generateKeywordRecommendation(params: {
  query?: string | null;
  pageUrl: string;
  position?: number | null | undefined;
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
  const {
    query = "",
    pageUrl,
    position,
    prevPosition,
    clicks = 0,
    impressions = 0,
    competingPages = [],
    mobilePsi,
    issuesCount = 0,
  } = params;

  const trend = calculateRankingTrend(position, prevPosition);
  const cleanQuery = (query || "").trim() || "target topic";

  const suggestedAnchors = generateContextualAnchors(cleanQuery, pageUrl);

  const contentGaps = [
    `Dedicated FAQ section answering intent for "${cleanQuery}"`,
    `Step-by-step deliverable breakdown addressing commercial inquiries`,
    `Client proof points and verified deliverables for "${cleanQuery}"`,
  ];

  switch (classification) {
    case "PROTECT":
      return {
        classification: "PROTECT",
        whyThisMatters: `This query ranks at position ${position != null ? Number(position).toFixed(1) : "1-10"} on Google Page 1. It is an established revenue driver and core brand asset. Unintentional copy modifications could forfeit this top position.`,
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
        actionOptions: [
          {
            id: "internal_link_plan",
            label: "Create Internal Link Plan",
            changeType: "INTERNAL_LINK",
            description: "Propose high-relevance internal links from complementary blog posts using natural anchors.",
            riskLevel: "SAFE",
            requiresApproval: false,
          },
          {
            id: "supporting_content_brief",
            label: "Create Supporting Content Brief",
            changeType: "CONTENT_SECTION",
            description: "Draft a new supporting blog article or FAQ to bolster topical authority without altering the core ranking landing page.",
            riskLevel: "MODERATE",
            requiresApproval: true,
          },
          {
            id: "monitor_priority",
            label: "Monitor Priority",
            changeType: "TARGET_EXPANSION",
            description: "Pin this query to the high-priority watchlist with daily ranking delta alerts.",
            riskLevel: "SAFE",
            requiresApproval: false,
          },
        ],
      };

    case "GROW":
      return {
        classification: "GROW",
        whyThisMatters: `Currently in striking distance at position ${position != null ? Number(position).toFixed(1) : "11-20"} with ${Number(impressions || 0).toLocaleString()} impressions. Moving from Page 2 into the Top 5 will multiply organic click volume exponentially.`,
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
          `Add an expandable FAQ block on ${pageUrl.replace(/^https?:\/\/[^/]+/i, "") || "/"} addressing "${cleanQuery}"`,
          "Identify 3 related blog posts and insert contextual hyperlinks pointing to this landing page",
          mobilePsi != null && mobilePsi < 70
            ? `Optimize mobile PageSpeed score (currently ${mobilePsi}) by deferring unneeded scripts and compressing images`
            : "Review meta description copy to include a compelling call-to-action",
        ],
        safeToAutoApply: false,
        suggestedAnchors,
        contentGaps,
        actionOptions: [
          {
            id: "draft_expansion",
            label: "Generate Draft Expansion",
            changeType: "CONTENT_SECTION",
            description: "Draft a new service subsection expanding intent coverage for this query.",
            riskLevel: "MODERATE",
            requiresApproval: true,
          },
          {
            id: "faq_draft",
            label: "Generate FAQ Draft",
            changeType: "FAQ_ADDITION",
            description: "Draft a 2-question FAQ accordion answering user questions for this term with FAQPage JSON-LD.",
            riskLevel: "MODERATE",
            requiresApproval: true,
          },
          {
            id: "internal_link_plan",
            label: "Internal Link Plan",
            changeType: "INTERNAL_LINK",
            description: "Build an internal linking campaign pointing from blog articles to this striking-distance page.",
            riskLevel: "SAFE",
            requiresApproval: false,
          },
          {
            id: "snippet_improvement",
            label: "Snippet Improvement Draft",
            changeType: "META_DESCRIPTION",
            description: "Draft a high-CTR meta description containing proof points to improve SERP click-through rate.",
            riskLevel: "MODERATE",
            requiresApproval: true,
          },
        ],
      };

    case "RECOVER":
      return {
        classification: "RECOVER",
        whyThisMatters: `Ranking position declined (${trend.changeText}) in the active comparison window. Prompt diagnosis is needed to halt organic visibility decay.`,
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
        actionOptions: [
          {
            id: "recovery_investigation",
            label: "Create Recovery Investigation",
            changeType: "PAGESPEED_REMEDIATION",
            description: "Run automated comparative investigation across audit history, PageSpeed, competing URLs, and SERP delta to create an actionable remediation proposal.",
            riskLevel: "HIGH",
            requiresApproval: true,
          },
        ],
      };

    case "CANNIBALIZATION RISK":
      return {
        classification: "CANNIBALIZATION RISK",
        whyThisMatters: `Multiple DGS URLs (${competingPages.length} pages) are competing in Google search for "${cleanQuery}". This splits ranking signals, suppresses position stability, and causes Google to alternate which page it ranks.`,
        recommendedActions: [
          "Designate one primary landing page as the canonical target for this query",
          "Differentiate copy and heading tags across secondary competing pages",
          "Update internal link anchor text so all mentions point strictly to the primary URL",
          "Do NOT blindly redirect or delete ranking pages without human review",
        ],
        riskLevel: "HIGH",
        implementationPlan: [
          `Designate ${pageUrl.replace(/^https?:\/\/[^/]+/i, "") || "/"} as the primary ranking target`,
          "Modify internal links on competing secondary pages to point to the primary target",
          "Ensure secondary pages focus on their own unique sub-topics or service niches",
        ],
        safeToAutoApply: false,
        suggestedAnchors,
        contentGaps,
        actionOptions: [
          {
            id: "cannibalization_plan",
            label: "Create Cannibalization Resolution Plan",
            changeType: "INTERNAL_LINK",
            description: "Propose anchor text updates and topic differentiation across the competing pages without deleting or 301-redirecting.",
            riskLevel: "HIGH",
            requiresApproval: true,
          },
        ],
      };

    case "NEW OPPORTUNITY":
      return {
        classification: "NEW OPPORTUNITY",
        whyThisMatters: `Google is indexing and showing this page for "${cleanQuery}" with ${Number(impressions || 0).toLocaleString()} impressions, but clicks remain low (${clicks}). Optimizing relevance will convert impressions into organic visits.`,
        recommendedActions: [
          "Align page headings (H2/H3) and introductory paragraphs with this search intent",
          "Add dedicated sub-section explaining key terms and benefits",
          "Improve meta description snippet to make searchers want to click",
          "Link from top navigation or main services hub to boost page authority",
        ],
        riskLevel: "LOW",
        implementationPlan: [
          `Incorporate "${cleanQuery}" naturally in a prominent sub-heading and opening paragraph`,
          "Test an updated meta description featuring clear value propositions and CTA",
          "Add 2 internal links from authoritative site pages with descriptive anchors",
        ],
        safeToAutoApply: false,
        suggestedAnchors,
        contentGaps,
        actionOptions: [
          {
            id: "intent_expansion",
            label: "Generate Intent Expansion Draft",
            changeType: "CONTENT_SECTION",
            description: "Draft a dedicated paragraph and H2 covering this search intent naturally.",
            riskLevel: "MODERATE",
            requiresApproval: true,
          },
          {
            id: "snippet_draft",
            label: "Snippet Improvement Draft",
            changeType: "META_DESCRIPTION",
            description: "Draft a targeted meta description to boost click-through rate.",
            riskLevel: "MODERATE",
            requiresApproval: true,
          },
        ],
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
        actionOptions: [
          {
            id: "monitor_watchlist",
            label: "Monitor Priority",
            changeType: "TARGET_EXPANSION",
            description: "Add to keyword tracking watchlist for monitoring.",
            riskLevel: "SAFE",
            requiresApproval: false,
          },
        ],
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
          `Verify that "${cleanQuery}" or close synonyms appear in heading structure`,
          "Create a dedicated supporting blog article linking back to this target URL",
        ],
        safeToAutoApply: false,
        suggestedAnchors,
        contentGaps,
        actionOptions: [
          {
            id: "ranking_plan",
            label: "Create Ranking Plan",
            changeType: "CONTENT_SECTION",
            description: "Create an organic ranking roadmap including indexing verification, content gap analysis, and internal links.",
            riskLevel: "MODERATE",
            requiresApproval: true,
          },
        ],
      };
  }
}
