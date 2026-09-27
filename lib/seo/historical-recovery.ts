/**
 * DGS Historical Ranking Recovery Model (V8.8.1)
 * 
 * Strict Query-Level Recovery Evaluation for Commercial Queries.
 * Separates historical #1 ranking recovery from period-over-period 28d trends
 * and ensures page-wide query averages do not misclassify primary commercial queries.
 */

export type RecoveryTier =
  | "AT_HISTORICAL_PEAK"
  | "NEAR_HISTORICAL_PEAK"
  | "PARTIAL_RECOVERY"
  | "SIGNIFICANT_LOSS"
  | "CRITICAL_LOSS"
  | "INSUFFICIENT_CURRENT_DATA"
  | "INSUFFICIENT_HISTORICAL_DATA";

export type PeriodTrend =
  | "CRITICAL_DECLINE"
  | "DECLINING"
  | "VOLATILE"
  | "STABLE"
  | "GROWING"
  | "INSUFFICIENT_DATA";

export type HistoricalRankingPeak = {
  page: string;
  primaryQuery: string;
  secondaryQueries: string[];
  peakPosition: number;
  evidenceSource: "USER_CONFIRMED_HISTORICAL_#1" | "GSC_HISTORICAL_PEAK";
  evidenceDate: string;
};

/**
 * Explicit User-Confirmed Historical #1 Peak Records.
 * IMPORTANT: PROTECTED_PAGES and HISTORICALLY_#1_PAGES are distinct concepts.
 * Only pages with explicit confirmation/evidence are defined here.
 */
export const HISTORICAL_RANKING_PEAKS: HistoricalRankingPeak[] = [
  {
    page: "/services/ai-video-production-agency/",
    primaryQuery: "ai video production agency in mumbai",
    secondaryQueries: [
      "ai video agency",
      "ai video production agency",
      "ai video production services",
      "ai video production company",
    ],
    peakPosition: 1.0,
    evidenceSource: "USER_CONFIRMED_HISTORICAL_#1",
    evidenceDate: "GSC_HISTORICAL_DATE_UNAVAILABLE",
  },
  {
    page: "/services/aeo-services-in-mumbai/",
    primaryQuery: "aeo services in mumbai",
    secondaryQueries: [
      "aeo agency in mumbai",
      "aeo services",
      "aeo agency",
    ],
    peakPosition: 1.0,
    evidenceSource: "USER_CONFIRMED_HISTORICAL_#1",
    evidenceDate: "GSC_HISTORICAL_DATE_UNAVAILABLE",
  },
  {
    page: "/aeo-dubai/",
    primaryQuery: "aeo services in dubai",
    secondaryQueries: [
      "aeo services dubai",
      "aeo agency dubai",
      "aeo agency in dubai",
      "best aeo agencies in dubai",
    ],
    peakPosition: 1.0,
    evidenceSource: "USER_CONFIRMED_HISTORICAL_#1",
    evidenceDate: "GSC_HISTORICAL_DATE_UNAVAILABLE",
  },
  {
    page: "/services/geo/",
    primaryQuery: "geo services in mumbai",
    secondaryQueries: [
      "geo services",
      "generative engine optimization agency",
      "geo optimization services india",
    ],
    peakPosition: 1.0,
    evidenceSource: "USER_CONFIRMED_HISTORICAL_#1",
    evidenceDate: "GSC_HISTORICAL_DATE_UNAVAILABLE",
  },
  {
    page: "/services/llm-seo-service/",
    primaryQuery: "best llm seo agency in mumbai",
    secondaryQueries: [
      "llm seo services",
      "llm seo company",
      "llm seo agency india",
      "best llm seo agency in navi mumbai",
    ],
    peakPosition: 1.0,
    evidenceSource: "USER_CONFIRMED_HISTORICAL_#1",
    evidenceDate: "GSC_HISTORICAL_DATE_UNAVAILABLE",
  },
  {
    page: "/services/dubai-seo/",
    primaryQuery: "seo agency in dubai",
    secondaryQueries: [
      "dubai seo services",
      "seo company dubai",
      "seo services dubai",
    ],
    peakPosition: 1.0,
    evidenceSource: "USER_CONFIRMED_HISTORICAL_#1",
    evidenceDate: "GSC_HISTORICAL_DATE_UNAVAILABLE",
  },
];

/**
 * Strict Query-Level Recovery Tier Calculator.
 * 
 * Rules:
 * - Position <= 0 or null or impressions <= 0 => INSUFFICIENT_CURRENT_DATA (never AT_HISTORICAL_PEAK).
 * - current <= 1.5 => AT_HISTORICAL_PEAK
 * - > 1.5 to <= 2.5 => NEAR_HISTORICAL_PEAK
 * - > 2.5 to <= 5.0 => PARTIAL_RECOVERY
 * - > 5.0 to <= 10.0 => SIGNIFICANT_LOSS
 * - > 10.0 => CRITICAL_LOSS
 */
export function calculateQueryRecoveryTier(
  historicalPeak: number | null,
  currentQueryPosition: number | null,
  currentImpressions: number = 0
): RecoveryTier {
  if (historicalPeak == null || historicalPeak <= 0) {
    return "INSUFFICIENT_HISTORICAL_DATA";
  }

  // Zero-Position Bug Safeguard: 0 position or 0 impressions must NEVER mean better than #1
  if (currentQueryPosition == null || currentQueryPosition <= 0 || currentImpressions <= 0) {
    return "INSUFFICIENT_CURRENT_DATA";
  }

  if (currentQueryPosition <= 1.5) {
    return "AT_HISTORICAL_PEAK";
  }
  if (currentQueryPosition <= 2.5) {
    return "NEAR_HISTORICAL_PEAK";
  }
  if (currentQueryPosition <= 5.0) {
    return "PARTIAL_RECOVERY";
  }
  if (currentQueryPosition <= 10.0) {
    return "SIGNIFICANT_LOSS";
  }
  return "CRITICAL_LOSS";
}

/**
 * Calculates position delta from historical peak.
 */
export function calculatePositionLoss(
  historicalPeak: number | null,
  currentPosition: number | null
): number | null {
  if (historicalPeak == null || currentPosition == null || currentPosition <= 0) {
    return null;
  }
  return Number((currentPosition - historicalPeak).toFixed(2));
}

/**
 * Normalizes URL path for consistent lookup.
 */
export function normalizePath(urlOrPath: string): string {
  try {
    let p = urlOrPath.startsWith("http") ? new URL(urlOrPath).pathname : urlOrPath;
    p = p.split(/[?#]/)[0];
    if (!p.startsWith("/")) p = "/" + p;
    if (!p.endsWith("/") && !p.includes(".")) p = p + "/";
    return p.toLowerCase();
  } catch {
    return urlOrPath;
  }
}

/**
 * Finds historical peak config for a path.
 */
export function getHistoricalPeakConfig(pagePath: string): HistoricalRankingPeak | null {
  const norm = normalizePath(pagePath);
  return HISTORICAL_RANKING_PEAKS.find((hp) => normalizePath(hp.page) === norm) || null;
}
