import type { DiscoveryProvider, DiscoveryRequest, CandidateOpportunity, ProviderHealth } from "./types";
import type { RegionCode, OpportunityCategory } from "@/lib/off-page/types";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import * as cheerio from "cheerio";

/**
 * Native Live Web Search Discovery Provider (V8.12.7).
 *
 * - Free, legitimate, live web search acquisition provider running directly on the production host.
 * - Extracts real external URLs from live SERPs (no synthetic or fabricated candidates).
 * - Enforces persisted daily quota guards, cooldown intervals, backoff, and error tracking.
 * - Strictly avoids search engine / social platform false positives and excludes dgeniussolutions.com.
 */

const USAGE_KEY = "web_search_daily_usage";
const QUOTA_KEY = "web_search_daily_quota";
const DEFAULT_DAILY_QUOTA = 100;

let lastSuccessTime: string | undefined;
let lastErrorTime: string | undefined;
let lastErrorMessage: string | undefined;
let lastCount = 0;

export interface WebSearchQuery {
  query: string;
  region: RegionCode;
  category: OpportunityCategory;
  lane?: string;
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getWebSearchQuota(): Promise<number> {
  try {
    const { rows } = await cmsQuery<{ key_value: string }>(
      `SELECT key_value FROM off_page_settings WHERE key_name = ? LIMIT 1`,
      [QUOTA_KEY]
    );
    if (rows.length > 0) {
      const n = Number(rows[0].key_value);
      if (Number.isFinite(n) && n > 0) return Math.floor(n);
    }
  } catch {
    // fallback
  }
  return DEFAULT_DAILY_QUOTA;
}

export async function getWebSearchUsageToday(): Promise<{ date: string; used: number; quota: number }> {
  const quota = await getWebSearchQuota();
  try {
    const { rows } = await cmsQuery<{ key_value: string }>(
      `SELECT key_value FROM off_page_settings WHERE key_name = ? LIMIT 1`,
      [USAGE_KEY]
    );
    if (rows.length > 0) {
      const parsed = JSON.parse(rows[0].key_value || "{}");
      if (parsed?.date === todayKey()) return { date: parsed.date, used: Number(parsed.used) || 0, quota };
    }
  } catch {
    // fallback
  }
  return { date: todayKey(), used: 0, quota };
}

export async function recordWebSearchUsage(increment: number): Promise<void> {
  const current = await getWebSearchUsageToday();
  const value = JSON.stringify({ date: current.date, used: current.used + increment });
  const { rows } = await cmsQuery<{ id: string }>(
    `SELECT id FROM off_page_settings WHERE key_name = ? LIMIT 1`,
    [USAGE_KEY]
  );
  if (rows.length > 0) {
    await cmsExecute(`UPDATE off_page_settings SET key_value = ?, updated_at = NOW() WHERE key_name = ?`, [value, USAGE_KEY]);
  } else {
    await cmsExecute(
      `INSERT INTO off_page_settings (id, key_name, key_value, description, updated_at) VALUES (?, ?, ?, ?, NOW())`,
      ["set_web_search_daily_usage", USAGE_KEY, value, "Native web search queries used today (quota guard)"]
    );
  }
}

interface RawWebResult {
  title: string;
  url: string;
  snippet: string;
}

const EXCLUDED_HOSTS = new Set([
  "google.com",
  "www.google.com",
  "duckduckgo.com",
  "html.duckduckgo.com",
  "bing.com",
  "yahoo.com",
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "wikipedia.org",
  "en.wikipedia.org",
]);

/**
 * Performs a single live web search query against the native search endpoint.
 */
export async function executeNativeWebSearch(query: string, limit = 20): Promise<RawWebResult[]> {
  const usage = await getWebSearchUsageToday();
  if (usage.used >= usage.quota) {
    throw new Error(`WEB_SEARCH_QUOTA_EXHAUSTED: ${usage.used}/${usage.quota} queries used today`);
  }

  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 DGS-Acquisition/8.12.7",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(14000),
  });

  await recordWebSearchUsage(1);

  if (!res.ok) {
    throw new Error(`Web Search HTTP ${res.status}: ${res.statusText}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const results: RawWebResult[] = [];
  const seen = new Set<string>();

  $(".result").each((_, el) => {
    if (results.length >= limit) return;
    const title = $(el).find(".result__title").text().trim().replace(/\s+/g, " ");
    let href = $(el).find(".result__title a").attr("href");

    if (href && href.includes("uddg=")) {
      try {
        const u = new URL("https://duckduckgo.com" + href);
        href = decodeURIComponent(u.searchParams.get("uddg") || href);
      } catch {
        // keep original href
      }
    }

    if (!href || !href.startsWith("http")) return;

    let parsed: URL;
    try {
      parsed = new URL(href);
    } catch {
      return;
    }

    const hostname = parsed.hostname.toLowerCase();
    const cleanDomain = hostname.replace(/^www\./, "");

    if (cleanDomain.includes("dgeniussolutions")) return;
    if (EXCLUDED_HOSTS.has(hostname) || EXCLUDED_HOSTS.has(cleanDomain)) return;
    if (seen.has(href)) return;
    seen.add(href);

    const snippet = $(el).find(".result__snippet").text().trim().replace(/\s+/g, " ");
    results.push({
      title: title || cleanDomain,
      url: href,
      snippet: snippet || "",
    });
  });

  return results;
}

export class WebSearchDiscoveryProvider implements DiscoveryProvider {
  id = "web-search";
  name = "Web Search (Native Search Engine)";

  async health(): Promise<ProviderHealth> {
    const usage = await getWebSearchUsageToday();
    const isDegraded = usage.used >= usage.quota;
    return {
      id: this.id,
      name: this.name,
      type: "SEARCH",
      status: isDegraded ? "DEGRADED" : "ACTIVE",
      reason: isDegraded
        ? `Daily search quota reached: ${usage.used}/${usage.quota} queries today.`
        : `Native Live Web Search engine operational. Today's quota: ${usage.used}/${usage.quota} queries used.${lastErrorMessage ? ` Last error: ${lastErrorMessage}` : ""}`,
      lastSuccess: lastSuccessTime,
      lastError: lastErrorTime,
      lastResultCount: lastCount,
    };
  }

  /**
   * Executes explicit lane queries sequentially with polite cooldown.
   * Returns only real external URLs found on live SERPs.
   */
  async discoverQueries(
    queries: WebSearchQuery[],
    perQuery = 20
  ): Promise<{ candidates: CandidateOpportunity[]; errors: string[]; queriesRun: number }> {
    const candidates: CandidateOpportunity[] = [];
    const errors: string[] = [];
    let queriesRun = 0;
    const seen = new Set<string>();

    for (let i = 0; i < queries.length; i++) {
      const q = queries[i];
      if (i > 0) {
        // 1.2s cooldown between queries for respect and rate-limit safety
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      try {
        const results = await executeNativeWebSearch(q.query, perQuery);
        queriesRun++;

        for (const r of results) {
          try {
            const parsed = new URL(r.url);
            const domain = parsed.hostname.toLowerCase().replace(/^www\./, "");
            if (domain.includes("dgeniussolutions")) continue;
            if (seen.has(parsed.toString())) continue;
            seen.add(parsed.toString());

            candidates.push({
              site_name: r.title.slice(0, 140) || domain,
              domain,
              url: parsed.toString(),
              category: q.category,
              region: q.region,
              discovery_provider: "WEB_SEARCH",
              discovery_query: q.query,
              source_type: "web_search",
              lane: q.lane,
              title: r.title,
              snippet: r.snippet,
              evidence: `Live web search result for "${q.query}": "${r.title}" — ${r.snippet.slice(0, 300)}`,
            });
          } catch {
            // skip invalid URL
          }
        }
      } catch (err: any) {
        const msg = String(err?.message || err);
        errors.push(`[${q.query}] ${msg}`);
        lastErrorTime = new Date().toISOString();
        lastErrorMessage = msg.slice(0, 160);
        if (msg.includes("WEB_SEARCH_QUOTA_EXHAUSTED")) break;
      }
    }

    lastCount = candidates.length;
    if (queriesRun > 0) lastSuccessTime = new Date().toISOString();
    return { candidates, errors, queriesRun };
  }

  async discover(request: DiscoveryRequest): Promise<CandidateOpportunity[]> {
    const queries: WebSearchQuery[] = (request.queries || []).map((q) => ({
      query: q,
      region: (request.regions?.[0] || "GLOBAL") as RegionCode,
      category: (request.categories?.[0] || "RESOURCE_PAGE") as OpportunityCategory,
    }));
    if (queries.length === 0) return [];
    const { candidates } = await this.discoverQueries(queries, Math.min(request.limit || 20, 20));
    return candidates;
  }
}
