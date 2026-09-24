import "server-only";
import { randomUUID } from "node:crypto";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";

export type PageSpeedStrategy = "mobile" | "desktop";

export type CoreWebVitals = {
  fcpMs: number | null;
  lcpMs: number | null;
  clsScore: number | null;
  tbtMs: number | null;
  speedIndexMs: number | null;
};

export type CruxFieldMetrics = {
  available: boolean;
  overallCategory?: string | null;
  inpMs?: number | null;
  ttfbMs?: number | null;
  lcpMs?: number | null;
  clsScore?: number | null;
};

export type PageSpeedAuditItem = {
  id: string;
  title: string;
  description: string;
  score?: number | null;
  displayValue?: string | null;
  estimatedSavingsMs?: number | null;
  estimatedSavingsBytes?: number | null;
};

export type PageSpeedResult = {
  url: string;
  strategy: PageSpeedStrategy;
  performanceScore: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  seoScore: number | null;
  labMetrics: CoreWebVitals;
  fieldMetrics: CruxFieldMetrics;
  opportunities: PageSpeedAuditItem[];
  diagnostics: PageSpeedAuditItem[];
  testedAt: string;
  isCached: boolean;
};

function getPageSpeedApiKey(): string | null {
  return (
    process.env.PAGESPEED_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    null
  );
}

export function isPageSpeedConfigured(): { configured: boolean; keySource: string | null } {
  if (process.env.PAGESPEED_API_KEY) return { configured: true, keySource: "PAGESPEED_API_KEY" };
  if (process.env.GOOGLE_API_KEY) return { configured: true, keySource: "GOOGLE_API_KEY" };
  if (process.env.GEMINI_API_KEY) return { configured: true, keySource: "GEMINI_API_KEY" };
  return { configured: false, keySource: null };
}

/**
 * Fetch cached PageSpeed metrics from database if tested within the last 15 days.
 */
export async function getCachedPageSpeed(
  url: string,
  strategy: PageSpeedStrategy,
  maxAgeDays: number = 15
): Promise<PageSpeedResult | null> {
  if (!isCmsDatabaseConfigured()) return null;

  try {
    const { rows } = await cmsQuery<Record<string, unknown>>(
      `SELECT * FROM pagespeed_cache 
       WHERE url = ? AND strategy = ? 
         AND tested_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY tested_at DESC LIMIT 1`,
      [url, strategy, maxAgeDays]
    );

    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    let opportunities: PageSpeedAuditItem[] = [];
    let diagnostics: PageSpeedAuditItem[] = [];

    try {
      opportunities = typeof row.opportunities === "string" ? JSON.parse(row.opportunities) : (row.opportunities as any) || [];
      diagnostics = typeof row.diagnostics === "string" ? JSON.parse(row.diagnostics) : (row.diagnostics as any) || [];
    } catch {
      opportunities = [];
      diagnostics = [];
    }

    const hasField = Boolean(row.field_inp_ms != null || row.field_lcp_ms != null || row.field_cls != null);

    return {
      url: String(row.url),
      strategy: String(row.strategy) as PageSpeedStrategy,
      performanceScore: row.performance_score != null ? Number(row.performance_score) : null,
      accessibilityScore: row.accessibility_score != null ? Number(row.accessibility_score) : null,
      bestPracticesScore: row.best_practices_score != null ? Number(row.best_practices_score) : null,
      seoScore: row.seo_score != null ? Number(row.seo_score) : null,
      labMetrics: {
        fcpMs: row.fcp_ms != null ? Number(row.fcp_ms) : null,
        lcpMs: row.lcp_ms != null ? Number(row.lcp_ms) : null,
        clsScore: row.cls_score != null ? Number(row.cls_score) : null,
        tbtMs: row.tbt_ms != null ? Number(row.tbt_ms) : null,
        speedIndexMs: row.speed_index_ms != null ? Number(row.speed_index_ms) : null,
      },
      fieldMetrics: {
        available: hasField,
        inpMs: row.field_inp_ms != null ? Number(row.field_inp_ms) : null,
        ttfbMs: row.field_ttfb_ms != null ? Number(row.field_ttfb_ms) : null,
        lcpMs: row.field_lcp_ms != null ? Number(row.field_lcp_ms) : null,
        clsScore: row.field_cls != null ? Number(row.field_cls) : null,
      },
      opportunities,
      diagnostics,
      testedAt: String(row.tested_at),
      isCached: true,
    };
  } catch (err) {
    console.error("getCachedPageSpeed query error:", err);
    return null;
  }
}

/**
 * Run Google PageSpeed Insights API (mobile or desktop).
 */
export async function runPageSpeedInsights(
  url: string,
  strategy: PageSpeedStrategy,
  forceFresh: boolean = false
): Promise<PageSpeedResult> {
  if (!forceFresh) {
    const cached = await getCachedPageSpeed(url, strategy);
    if (cached) return cached;
  }

  const apiKey = getPageSpeedApiKey();
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", strategy);
  endpoint.searchParams.append("category", "performance");
  endpoint.searchParams.append("category", "accessibility");
  endpoint.searchParams.append("category", "best-practices");
  endpoint.searchParams.append("category", "seo");

  if (apiKey) {
    endpoint.searchParams.set("key", apiKey);
  }

  const res = await fetch(endpoint.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`PageSpeed API returned HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const lh = data.lighthouseResult || {};
  const categories = lh.categories || {};
  const audits = lh.audits || {};
  const loadingExp = data.loadingExperience || {};

  const performanceScore = categories.performance?.score != null ? Math.round(categories.performance.score * 100) : null;
  const accessibilityScore = categories.accessibility?.score != null ? Math.round(categories.accessibility.score * 100) : null;
  const bestPracticesScore = categories["best-practices"]?.score != null ? Math.round(categories["best-practices"].score * 100) : null;
  const seoScore = categories.seo?.score != null ? Math.round(categories.seo.score * 100) : null;

  const labMetrics: CoreWebVitals = {
    fcpMs: audits["first-contentful-paint"]?.numericValue ? Math.round(audits["first-contentful-paint"].numericValue) : null,
    lcpMs: audits["largest-contentful-paint"]?.numericValue ? Math.round(audits["largest-contentful-paint"].numericValue) : null,
    clsScore: audits["cumulative-layout-shift"]?.numericValue != null ? Number(audits["cumulative-layout-shift"].numericValue.toFixed(3)) : null,
    tbtMs: audits["total-blocking-time"]?.numericValue ? Math.round(audits["total-blocking-time"].numericValue) : null,
    speedIndexMs: audits["speed-index"]?.numericValue ? Math.round(audits["speed-index"].numericValue) : null,
  };

  // Field CrUX data
  const fieldMetricsObj = loadingExp.metrics || {};
  const hasFieldData = Boolean(
    loadingExp.overall_category ||
    fieldMetricsObj.INTERACTION_TO_NEXT_PAINT ||
    fieldMetricsObj.LARGEST_CONTENTFUL_PAINT_MS
  );

  const fieldMetrics: CruxFieldMetrics = {
    available: hasFieldData,
    overallCategory: loadingExp.overall_category || null,
    inpMs: fieldMetricsObj.INTERACTION_TO_NEXT_PAINT?.percentile ?? null,
    ttfbMs: fieldMetricsObj.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.percentile ?? null,
    lcpMs: fieldMetricsObj.LARGEST_CONTENTFUL_PAINT_MS?.percentile ?? null,
    clsScore: fieldMetricsObj.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile != null
      ? Number((fieldMetricsObj.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100).toFixed(3))
      : null,
  };

  // Opportunities & Diagnostics
  const opportunities: PageSpeedAuditItem[] = [];
  const diagnostics: PageSpeedAuditItem[] = [];

  for (const [key, audit] of Object.entries<any>(audits)) {
    if (!audit) continue;
    if (audit.details?.type === "opportunity" && audit.score != null && audit.score < 0.9) {
      opportunities.push({
        id: key,
        title: audit.title,
        description: audit.description?.replace(/\[Learn more\].*/i, "").trim() || "",
        score: audit.score,
        displayValue: audit.displayValue || null,
        estimatedSavingsMs: audit.details?.overallSavingsMs ? Math.round(audit.details.overallSavingsMs) : null,
        estimatedSavingsBytes: audit.details?.overallSavingsBytes ? Math.round(audit.details.overallSavingsBytes) : null,
      });
    } else if (
      ["mainthread-work-breakdown", "bootup-time", "font-display", "third-party-summary", "dom-size", "render-blocking-resources", "unused-javascript", "modern-image-formats"].includes(key) &&
      audit.score != null &&
      audit.score < 0.9
    ) {
      diagnostics.push({
        id: key,
        title: audit.title,
        description: audit.description?.replace(/\[Learn more\].*/i, "").trim() || "",
        score: audit.score,
        displayValue: audit.displayValue || null,
      });
    }
  }

  // Sort opportunities by largest estimated savings
  opportunities.sort((a, b) => (b.estimatedSavingsMs || 0) - (a.estimatedSavingsMs || 0));

  const testedAt = new Date().toISOString().slice(0, 19).replace("T", " ");

  // Save to DB cache
  if (isCmsDatabaseConfigured()) {
    try {
      const cacheId = randomUUID();
      await cmsExecute(
        `INSERT INTO pagespeed_cache (
          id, url, strategy, performance_score, accessibility_score, best_practices_score, seo_score,
          fcp_ms, lcp_ms, cls_score, tbt_ms, speed_index_ms,
          field_inp_ms, field_ttfb_ms, field_lcp_ms, field_cls,
          diagnostics, opportunities, tested_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          performance_score = VALUES(performance_score),
          accessibility_score = VALUES(accessibility_score),
          best_practices_score = VALUES(best_practices_score),
          seo_score = VALUES(seo_score),
          fcp_ms = VALUES(fcp_ms),
          lcp_ms = VALUES(lcp_ms),
          cls_score = VALUES(cls_score),
          tbt_ms = VALUES(tbt_ms),
          speed_index_ms = VALUES(speed_index_ms),
          field_inp_ms = VALUES(field_inp_ms),
          field_ttfb_ms = VALUES(field_ttfb_ms),
          field_lcp_ms = VALUES(field_lcp_ms),
          field_cls = VALUES(field_cls),
          diagnostics = VALUES(diagnostics),
          opportunities = VALUES(opportunities),
          tested_at = VALUES(tested_at)`,
        [
          cacheId,
          url,
          strategy,
          performanceScore,
          accessibilityScore,
          bestPracticesScore,
          seoScore,
          labMetrics.fcpMs,
          labMetrics.lcpMs,
          labMetrics.clsScore,
          labMetrics.tbtMs,
          labMetrics.speedIndexMs,
          fieldMetrics.inpMs,
          fieldMetrics.ttfbMs,
          fieldMetrics.lcpMs,
          fieldMetrics.clsScore,
          JSON.stringify(diagnostics),
          JSON.stringify(opportunities),
          testedAt,
        ]
      );
    } catch (dbErr) {
      console.error("Failed to save PageSpeed cache to DB:", dbErr);
    }
  }

  return {
    url,
    strategy,
    performanceScore,
    accessibilityScore,
    bestPracticesScore,
    seoScore,
    labMetrics,
    fieldMetrics,
    opportunities,
    diagnostics,
    testedAt,
    isCached: false,
  };
}

/**
 * Run both mobile and desktop PageSpeed for a URL.
 */
export async function runFullPageSpeed(
  url: string,
  forceFresh: boolean = false
): Promise<{ mobile: PageSpeedResult; desktop: PageSpeedResult }> {
  const [mobile, desktop] = await Promise.all([
    runPageSpeedInsights(url, "mobile", forceFresh),
    runPageSpeedInsights(url, "desktop", forceFresh),
  ]);
  return { mobile, desktop };
}
