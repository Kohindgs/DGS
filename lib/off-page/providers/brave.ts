import type { DiscoveryProvider, DiscoveryRequest, CandidateOpportunity, ProviderHealth } from "./types";
import type { RegionCode, OpportunityCategory } from "@/lib/off-page/types";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";

/**
 * Brave Search API discovery provider (V8.12.7).
 *
 * - Reads BRAVE_SEARCH_API_KEY from process.env or off_page_settings (admin UI configurable).
 * - Reports NOT_CONFIGURED when no key is present, returning zero candidates (never fabricated results).
 * - Every candidate is a real URL returned by the Brave web search API.
 * - A persisted daily quota guard (BRAVE_SEARCH_DAILY_QUOTA, default 60 queries/day) protects the plan.
 */

const BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";
const USAGE_KEY = "brave_search_daily_usage";
const QUOTA_KEY = "brave_search_daily_quota";
const SETTINGS_KEY_API = "brave_search_api_key";

const REGION_COUNTRY: Record<string, string | null> = {
  INDIA: "IN",
  UAE: "AE",
  USA: "US",
  GLOBAL: null,
};

let lastSuccessTime: string | undefined;
let lastErrorTime: string | undefined;
let lastErrorMessage: string | undefined;
let lastCount = 0;
let cachedBraveKey: string | null = null;
let lastKeyCheck = 0;

export interface BraveQuery {
  query: string;
  region: RegionCode;
  category: OpportunityCategory;
  lane?: string;
}

export async function resolveBraveApiKey(): Promise<string | null> {
  const envKey = (process.env.BRAVE_SEARCH_API_KEY || "").trim();
  if (envKey.length > 0) return envKey;

  const now = Date.now();
  if (cachedBraveKey !== null && now - lastKeyCheck < 30000) {
    return cachedBraveKey.length > 0 ? cachedBraveKey : null;
  }

  try {
    const { rows } = await cmsQuery<{ key_value: string }>(
      `SELECT key_value FROM off_page_settings WHERE key_name = ? LIMIT 1`,
      [SETTINGS_KEY_API]
    );
    cachedBraveKey = (rows[0]?.key_value || "").trim();
    lastKeyCheck = now;
    return cachedBraveKey.length > 0 ? cachedBraveKey : null;
  } catch {
    return null;
  }
}

export function getBraveApiKey(): string | null {
  const envKey = (process.env.BRAVE_SEARCH_API_KEY || "").trim();
  if (envKey.length > 0) return envKey;
  return cachedBraveKey && cachedBraveKey.length > 0 ? cachedBraveKey : null;
}

export async function dailyQuota(): Promise<number> {
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
  const n = Number(process.env.BRAVE_SEARCH_DAILY_QUOTA || 60);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 60;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getBraveUsageToday(): Promise<{ date: string; used: number; quota: number }> {
  const quota = await dailyQuota();
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
    // fall through
  }
  return { date: todayKey(), used: 0, quota };
}

async function recordBraveUsage(increment: number): Promise<void> {
  const current = await getBraveUsageToday();
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
      ["set_brave_search_daily_usage", USAGE_KEY, value, "Brave Search API queries used today (quota guard)"]
    );
  }
}

interface BraveWebResult {
  title?: string;
  url?: string;
  description?: string;
  page_age?: string;
  age?: string;
  meta_url?: { hostname?: string };
}

/** Executes one Brave web search. Throws on HTTP/network errors. */
export async function braveWebSearch(query: string, region: RegionCode, count = 20): Promise<BraveWebResult[]> {
  const key = await resolveBraveApiKey();
  if (!key) throw new Error("BRAVE_SEARCH_API_KEY not configured");

  const usage = await getBraveUsageToday();
  if (usage.used >= usage.quota) {
    throw new Error(`BRAVE_QUOTA_EXHAUSTED: ${usage.used}/${usage.quota} queries used today`);
  }

  const doFetch = async (country: string | null) => {
    const params = new URLSearchParams({ q: query, count: String(Math.min(Math.max(count, 1), 20)), safesearch: "moderate" });
    if (country) params.set("country", country);
    const res = await fetch(`${BRAVE_ENDPOINT}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": key,
      },
      signal: AbortSignal.timeout(12000),
    });
    return res;
  };

  const country = REGION_COUNTRY[region] ?? null;
  let res = await doFetch(country);
  await recordBraveUsage(1);
  if (res.status === 422 && country) {
    // Country not supported by Brave -> retry globally (query text still carries the geo intent)
    res = await doFetch(null);
    await recordBraveUsage(1);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brave API HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const json: any = await res.json();
  return Array.isArray(json?.web?.results) ? json.web.results : [];
}

export class BraveSearchDiscoveryProvider implements DiscoveryProvider {
  id = "brave-search";
  name = "Web Search (Brave Search API)";

  async health(): Promise<ProviderHealth> {
    const key = await resolveBraveApiKey();
    if (!key) {
      return {
        id: this.id,
        name: this.name,
        type: "SEARCH",
        status: "NOT_CONFIGURED",
        reason: "WEB SEARCH (BRAVE) — NOT CONFIGURED. Add BRAVE_SEARCH_API_KEY to server environment or configure in Off-Page Settings.",
        requiredConfig: ["BRAVE_SEARCH_API_KEY"],
      };
    }
    const usage = await getBraveUsageToday();
    return {
      id: this.id,
      name: this.name,
      type: "SEARCH",
      status: lastErrorTime && (!lastSuccessTime || lastErrorTime > lastSuccessTime) ? "DEGRADED" : "ACTIVE",
      reason: `API key configured. Quota today: ${usage.used}/${usage.quota} queries.${lastErrorMessage ? ` Last error: ${lastErrorMessage}` : ""}`,
      lastSuccess: lastSuccessTime,
      lastError: lastErrorTime,
      lastResultCount: lastCount,
    };
  }

  /** Runs explicit lane queries. Returns only real URLs from the API. */
  async discoverQueries(queries: BraveQuery[], perQuery = 20): Promise<{ candidates: CandidateOpportunity[]; errors: string[]; queriesRun: number }> {
    const candidates: CandidateOpportunity[] = [];
    const errors: string[] = [];
    let queriesRun = 0;
    const seen = new Set<string>();

    const key = await resolveBraveApiKey();
    if (!key) {
      return { candidates, errors: ["WEB SEARCH (BRAVE) — NOT CONFIGURED"], queriesRun };
    }

    for (const q of queries) {
      try {
        const results = await braveWebSearch(q.query, q.region, perQuery);
        queriesRun++;
        for (const r of results) {
          if (!r.url) continue;
          let parsed: URL;
          try {
            parsed = new URL(r.url);
          } catch {
            continue;
          }
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") continue;
          const domain = parsed.hostname.toLowerCase().replace(/^www\./, "");
          if (domain.includes("dgeniussolutions")) continue; // own site is not an opportunity
          if (seen.has(parsed.toString())) continue;
          seen.add(parsed.toString());
          const title = (r.title || "").replace(/<[^>]+>/g, "").trim();
          const snippet = (r.description || "").replace(/<[^>]+>/g, "").trim();
          candidates.push({
            site_name: title.slice(0, 120) || domain,
            domain,
            url: parsed.toString(),
            category: q.category,
            region: q.region,
            discovery_provider: "BRAVE_SEARCH",
            discovery_query: q.query,
            source_type: "brave_search",
            lane: q.lane,
            title,
            snippet,
            evidence: `Brave web result for "${q.query}": "${title}" — ${snippet.slice(0, 300)}`,
            pubDate: r.page_age || r.age,
          });
        }
      } catch (err: any) {
        const msg = String(err?.message || err);
        errors.push(`[${q.query}] ${msg}`);
        lastErrorTime = new Date().toISOString();
        lastErrorMessage = msg.slice(0, 160);
        if (msg.includes("BRAVE_QUOTA_EXHAUSTED") || msg.includes("HTTP 401") || msg.includes("HTTP 403")) break;
      }
    }

    lastCount = candidates.length;
    if (queriesRun > 0) lastSuccessTime = new Date().toISOString();
    return { candidates, errors, queriesRun };
  }

  async discover(request: DiscoveryRequest): Promise<CandidateOpportunity[]> {
    const queries: BraveQuery[] = (request.queries || []).map((q) => ({
      query: q,
      region: (request.regions?.[0] || "GLOBAL") as RegionCode,
      category: (request.categories?.[0] || "RESOURCE_PAGE") as OpportunityCategory,
    }));
    if (queries.length === 0) return [];
    const { candidates } = await this.discoverQueries(queries, Math.min(request.limit || 20, 20));
    return candidates;
  }
}
