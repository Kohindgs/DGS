import type {
  AnchorClassification,
  FreeStatus,
  PriorityTier,
  SpamStatus,
} from "./types";

// Known spam keywords / patterns for strict filter
const SPAM_PATTERNS = [
  /casino/i,
  /gambling/i,
  /poker/i,
  /betting/i,
  /slot[s]?\b/i,
  /crypto-pump/i,
  /buy-backlinks/i,
  /cheap-seo-links/i,
  /pbn\b/i,
  /link-farm/i,
  /viagra/i,
  /cialis/i,
  /essay-writer/i,
  /payday-loan/i,
  /adult/i,
  /escort/i,
  /porn/i,
  /\.ru$/i,
  /\.su$/i,
  /\.cn$/i,
  /\.top$/i,
  /\.work$/i,
  /\.xyz$/i,
  /\.click$/i,
  /\.live$/i,
  /\.loan$/i,
  /\.gdn$/i,
];

// Legitimate domains with .top/.xyz or similar that should be whitelisted if any
const WHITELIST_DOMAINS = new Set([
  "producthunt.com",
  "clutch.co",
  "goodfirms.co",
  "g2.com",
  "capterra.com",
  "sortlist.com",
  "designrush.com",
  "crunchbase.com",
  "techcrunch.com",
  "medium.com",
  "substack.com",
  "linkedin.com",
]);

/**
 * Calculates the comprehensive DGS Authority Score (0-100).
 * Strictly avoids arbitrary third-party DA/DR and evaluates composite quality:
 * - Topical relevance (30%)
 * - Editorial quality (25%)
 * - Geo relevance (15%)
 * - Source indexability & HTTP health (15%)
 * - Referral potential (15%)
 * - Spam risk penalty
 */
export function calculateDgsAuthorityScore(params: {
  topicalRelevance: number; // 0-100
  editorialQuality: number; // 0-100
  geoRelevance: number; // 0-100
  sourceIndexable?: boolean;
  httpStatus?: number;
  referralPotential?: number; // 0-100
  spamRisk?: number; // 0-100
}): number {
  const {
    topicalRelevance = 70,
    editorialQuality = 75,
    geoRelevance = 80,
    sourceIndexable = true,
    httpStatus = 200,
    referralPotential = 60,
    spamRisk = 5,
  } = params;

  let score =
    topicalRelevance * 0.3 +
    editorialQuality * 0.25 +
    geoRelevance * 0.15 +
    referralPotential * 0.15 +
    (sourceIndexable && httpStatus === 200 ? 15 : 0);

  // Penalty for spam risk
  if (spamRisk > 20) {
    score -= (spamRisk - 20) * 0.8;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Smart Priority Engine:
 * Generates Value Score, Difficulty Score, Priority Score and Tier (P0, P1, P2, P3, REJECT)
 */
export function calculatePriority(params: {
  authorityScore: number;
  trafficPotential: number;
  acceptanceProbability: number;
  geoRelevance: number;
  targetPageNeedTier?: "P0" | "P1" | "P2" | "P3";
  isFree: boolean;
  spamStatus: SpamStatus;
}): {
  valueScore: number;
  difficultyScore: number;
  priorityScore: number;
  priorityTier: PriorityTier;
} {
  const {
    authorityScore,
    trafficPotential,
    acceptanceProbability,
    geoRelevance,
    targetPageNeedTier = "P1",
    isFree,
    spamStatus,
  } = params;

  if (spamStatus === "REJECT" || spamStatus === "HIGH_RISK" || !isFree) {
    return {
      valueScore: 0,
      difficultyScore: 100,
      priorityScore: 0,
      priorityTier: "REJECT",
    };
  }

  // Value: Authority (40%) + Traffic (30%) + Geo (30%)
  const valueScore = Math.round(
    authorityScore * 0.4 + trafficPotential * 0.3 + geoRelevance * 0.3
  );

  // Difficulty: 100 - Acceptance Probability
  const difficultyScore = Math.round(100 - acceptanceProbability);

  // Target page need boost
  const needBoost =
    targetPageNeedTier === "P0"
      ? 15
      : targetPageNeedTier === "P1"
      ? 10
      : targetPageNeedTier === "P2"
      ? 5
      : 0;

  // Priority formula: Value * 0.6 + Acceptance * 0.4 + NeedBoost
  let rawPriority = valueScore * 0.6 + acceptanceProbability * 0.4 + needBoost;
  const priorityScore = Math.max(0, Math.min(100, Math.round(rawPriority)));

  let priorityTier: PriorityTier = "P2";
  if (priorityScore >= 85) priorityTier = "P0";
  else if (priorityScore >= 70) priorityTier = "P1";
  else if (priorityScore >= 50) priorityTier = "P2";
  else priorityTier = "P3";

  return {
    valueScore,
    difficultyScore,
    priorityScore,
    priorityTier,
  };
}

/**
 * Automated Spam Filter:
 * Detects link farms, PBNs, adult/casino/crypto spam, thin directories, suspicious TLDs.
 */
export function evaluateSpamRisk(domain: string, submissionUrl: string, notes?: string): {
  spamStatus: SpamStatus;
  spamRiskScore: number;
  reasons: string[];
} {
  const cleanDomain = domain.toLowerCase().trim();
  const cleanUrl = submissionUrl.toLowerCase().trim();
  const fullText = `${cleanDomain} ${cleanUrl} ${(notes || "").toLowerCase()}`;

  const reasons: string[] = [];
  let riskScore = 5;

  if (WHITELIST_DOMAINS.has(cleanDomain)) {
    return { spamStatus: "SAFE", spamRiskScore: 0, reasons: [] };
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(fullText)) {
      riskScore += 35;
      reasons.push(`Matched suspicious pattern: ${pattern.source}`);
    }
  }

  // Detect explicit paid link keywords in submission notes or URL
  if (/paid-post|sponsored-guest|buy-link|price-list|\$|usd|paypal/i.test(fullText)) {
    riskScore += 40;
    reasons.push("Apparent paid link or sponsored listing scheme");
  }

  // TLD checks: .ru, .cn unless specifically whitelisted
  if (cleanDomain.endsWith(".ru") || cleanDomain.endsWith(".cn") || cleanDomain.endsWith(".su")) {
    riskScore += 60;
    reasons.push("Geographic spam network TLD restriction (.ru / .cn / .su)");
  }

  let spamStatus: SpamStatus = "SAFE";
  if (riskScore >= 70) spamStatus = "REJECT";
  else if (riskScore >= 40) spamStatus = "HIGH_RISK";
  else if (riskScore >= 20) spamStatus = "REVIEW";

  return {
    spamStatus,
    spamRiskScore: Math.min(100, riskScore),
    reasons,
  };
}

/**
 * Classifies an anchor text into standard taxonomy.
 */
export function classifyAnchorText(anchor: string, targetUrl: string): AnchorClassification {
  const text = (anchor || "").trim().toLowerCase();
  if (!text) return "OTHER";

  // Naked URL
  if (text.startsWith("http://") || text.startsWith("https://") || text.startsWith("www.") || text.includes(".com") || text.includes(".in") || text.includes(".ae")) {
    return "NAKED_URL";
  }

  // Branded anchors
  const BRAND_VARIANTS = [
    "d'genius solutions",
    "d genius solutions",
    "d’genius solutions",
    "d-genius solutions",
    "dgeniussolutions",
    "dgs",
    "d genius",
    "d'genius",
  ];
  if (BRAND_VARIANTS.some((b) => text.includes(b))) {
    return "BRANDED";
  }

  // Generic anchors
  const GENERIC_WORDS = [
    "click here",
    "website",
    "link",
    "visit",
    "read more",
    "learn more",
    "here",
    "source",
    "more info",
    "official site",
    "view website",
    "check here",
  ];
  if (GENERIC_WORDS.includes(text)) {
    return "GENERIC";
  }

  // Exact Match commercial keywords for DGS
  const EXACT_MATCH_QUERIES = [
    "ai video production agency in mumbai",
    "ai video production agency",
    "ai video production",
    "seo services in mumbai",
    "seo company in mumbai",
    "aeo services in mumbai",
    "geo agency in mumbai",
    "llm seo service",
    "performance marketing agency",
    "web design agency in mumbai",
    "ai video production agency in dubai",
  ];
  if (EXACT_MATCH_QUERIES.includes(text)) {
    return "EXACT_MATCH";
  }

  // Partial match: contains one of the core service terms
  const SERVICE_TERMS = [
    "ai video",
    "seo agency",
    "seo service",
    "aeo service",
    "geo agency",
    "llm seo",
    "performance marketing",
    "website design",
    "video production",
  ];
  if (SERVICE_TERMS.some((term) => text.includes(term))) {
    return "PARTIAL_MATCH";
  }

  return "OTHER";
}

/**
 * Checks for unnatural exact-match anchor concentration.
 */
export function checkAnchorConcentration(anchors: Array<{ classification: AnchorClassification }>): {
  hasUnnaturalConcentration: boolean;
  exactMatchPct: number;
  brandedPct: number;
  recommendation: string;
} {
  if (anchors.length === 0) {
    return { hasUnnaturalConcentration: false, exactMatchPct: 0, brandedPct: 0, recommendation: "No backlinks tracked." };
  }

  const exactCount = anchors.filter((a) => a.classification === "EXACT_MATCH").length;
  const brandedCount = anchors.filter((a) => a.classification === "BRANDED").length;

  const exactMatchPct = Math.round((exactCount / anchors.length) * 100);
  const brandedPct = Math.round((brandedCount / anchors.length) * 100);

  // Google Penguin safe threshold: Exact-match should typically be <= 20%
  const hasUnnaturalConcentration = exactMatchPct > 20;

  let recommendation = "Anchor profile is natural and balanced.";
  if (hasUnnaturalConcentration) {
    recommendation = `WARNING: Exact-match anchor concentration is high (${exactMatchPct}%). Prioritize branded and naked URL anchors for future outreach.`;
  } else if (brandedPct < 40) {
    recommendation = `TIP: Branded anchor proportion (${brandedPct}%) is low. Recommend steering new placements to use "D'Genius Solutions".`;
  }

  return {
    hasUnnaturalConcentration,
    exactMatchPct,
    brandedPct,
    recommendation,
  };
}
