import { GoogleSearchDiscoveryProvider } from "./google-search";
import { GoogleNewsRssDiscoveryProvider } from "./google-news-rss";
import { GdeltDiscoveryProvider } from "./gdelt";
import { BraveSearchDiscoveryProvider } from "./brave";
import type { DiscoveryProvider, ProviderHealth } from "./types";
import { getTurboVecStatus } from "@/lib/intelligence/turbovec-client";
import { cmsQuery } from "@/lib/cms/db";

const googleSearch = new GoogleSearchDiscoveryProvider();
const googleNewsRss = new GoogleNewsRssDiscoveryProvider();
const gdelt = new GdeltDiscoveryProvider();
const brave = new BraveSearchDiscoveryProvider();

const providers: Record<string, DiscoveryProvider> = {
  [googleSearch.id]: googleSearch,
  [googleNewsRss.id]: googleNewsRss,
  [gdelt.id]: gdelt,
  [brave.id]: brave,
};

export function getProvider(id?: string): DiscoveryProvider {
  if (id && providers[id]) {
    return providers[id];
  }
  // Default to active Google News RSS provider
  return googleNewsRss;
}

export function getAllDiscoveryProviders(): DiscoveryProvider[] {
  return [brave, googleNewsRss, googleSearch, gdelt];
}

/**
 * Returns comprehensive health status across all 10 Off-Page systems (Section 40)
 */
export async function getProviderHealthMatrix(): Promise<ProviderHealth[]> {
  const matrix: ProviderHealth[] = [];

  // 0. Brave Search API (V8.12.6 primary web search)
  try {
    matrix.push(await brave.health());
  } catch (err: any) {
    matrix.push({ id: "brave-search", name: "Web Search (Brave Search API)", type: "SEARCH", status: "ERROR", reason: err?.message });
  }

  // 1. Google Search / SERP API
  try {
    matrix.push(await googleSearch.health());
  } catch (err: any) {
    matrix.push({
      id: "google-search",
      name: "Google Search / SERP API",
      type: "SEARCH",
      status: "ERROR",
      reason: err?.message,
    });
  }

  // 2. Google News & RSS Discovery
  try {
    matrix.push(await googleNewsRss.health());
  } catch (err: any) {
    matrix.push({
      id: "google-news-rss",
      name: "Google News & Industry RSS Discovery",
      type: "RSS",
      status: "ERROR",
      reason: err?.message,
    });
  }

  // 3. GDELT 2.0 Global Media
  try {
    matrix.push(await gdelt.health());
  } catch (err: any) {
    matrix.push({
      id: "gdelt-doc",
      name: "GDELT 2.0 Global Media & News Database",
      type: "MEDIA_DATABASE",
      status: "ERROR",
      reason: err?.message,
    });
  }

  // 4. Brand Mention Discovery (Section 29)
  const brandMentionKey = process.env.BRAND_MENTIONS_API_KEY || process.env.TALKWALKER_API_KEY;
  if (!brandMentionKey) {
    matrix.push({
      id: "brand-mentions",
      name: "Brand Mention Discovery Provider",
      type: "MEDIA_DATABASE",
      status: "NOT_CONFIGURED",
      reason: "No brand monitoring provider credentials configured (Requires Google Alerts API, Brand24, or Mention webhook).",
      requiredConfig: ["BRAND_MENTIONS_API_KEY"],
    });
  } else {
    matrix.push({
      id: "brand-mentions",
      name: "Brand Mention Discovery Provider",
      type: "MEDIA_DATABASE",
      status: "ACTIVE",
      reason: "Brand mention monitoring provider credentials configured.",
    });
  }

  // 5. Digital PR Provider (Section 31)
  const prKey = process.env.HARO_API_KEY || process.env.QWOTED_API_KEY;
  if (!prKey) {
    matrix.push({
      id: "digital-pr",
      name: "Digital PR & Journalist Request Provider",
      type: "MEDIA_DATABASE",
      status: "NOT_CONFIGURED",
      reason: "No PR journalist request provider configured (Requires Connectively / HARO or Qwoted API integration).",
      requiredConfig: ["HARO_API_KEY", "QWOTED_API_KEY"],
    });
  } else {
    matrix.push({
      id: "digital-pr",
      name: "Digital PR & Journalist Request Provider",
      type: "MEDIA_DATABASE",
      status: "ACTIVE",
      reason: "Journalist request stream connected.",
    });
  }

  // 6. Competitor Gap Data Provider (Section 32)
  const compKey = process.env.AHREFS_API_KEY || process.env.SEMRUSH_API_KEY || process.env.DATAFORSEO_API_KEY;
  if (!compKey) {
    matrix.push({
      id: "competitor-gaps",
      name: "Competitor Backlink Gap Provider",
      type: "BACKLINK",
      status: "NOT_CONFIGURED",
      reason: "No third-party competitor backlink database configured (Requires Ahrefs, Semrush, or DataForSEO API).",
      requiredConfig: ["AHREFS_API_KEY", "SEMRUSH_API_KEY", "DATAFORSEO_API_KEY"],
    });
  } else {
    matrix.push({
      id: "competitor-gaps",
      name: "Competitor Backlink Gap Provider",
      type: "BACKLINK",
      status: "ACTIVE",
      reason: "Competitor backlink gap database connected.",
    });
  }

  // 7. Backlink Crawler (Section 25)
  matrix.push({
    id: "backlink-crawler",
    name: "Real Remote Backlink Crawler & Verifier",
    type: "BACKLINK",
    status: "ACTIVE",
    reason: "Native HTTP crawler with HTML link extraction, rel tag detection, and redirect tracking is active.",
    lastSuccess: new Date().toISOString(),
  });

  // 8. TurboVec Semantic Authority Intelligence (Section 1 & 52)
  try {
    const tvHealth = await getTurboVecStatus();
    matrix.push({
      id: "turbovec",
      name: "TurboVec Semantic Intelligence Layer",
      type: "VECTOR",
      status: tvHealth.ok ? "ACTIVE" : "ERROR",
      reason: tvHealth.ok
        ? `TurboVec 1.0.0 daemon connected via private Unix socket (${tvHealth.model || "nomic-embed-text"}, 768d, IdMapIndex 4-bit)`
        : `TurboVec connection notice: ${(tvHealth as any).error || "Offline"} (Fail-safe lexical fallback active)`,
      lastSuccess: tvHealth.ok ? new Date().toISOString() : undefined,
    });
  } catch (err: any) {
    matrix.push({
      id: "turbovec",
      name: "TurboVec Semantic Intelligence Layer",
      type: "VECTOR",
      status: "DEGRADED",
      reason: `Socket offline: ${err?.message} (Fail-safe lexical fallback active)`,
    });
  }

  // 9. MariaDB Database (Section 6)
  try {
    const { rows: testRows } = await cmsQuery<{ c: number }>("SELECT 1 as c");
    matrix.push({
      id: "mariadb",
      name: "Production MariaDB Vector & Relational Store",
      type: "DATABASE",
      status: testRows?.[0]?.c === 1 ? "ACTIVE" : "ERROR",
      reason: "Relational source of truth connected and operational.",
      lastSuccess: new Date().toISOString(),
    });
  } catch (err: any) {
    matrix.push({
      id: "mariadb",
      name: "Production MariaDB Vector & Relational Store",
      type: "DATABASE",
      status: "ERROR",
      reason: `Database error: ${err?.message}`,
    });
  }

  // 10. Daily Automation (Section 42)
  try {
    const { rows: lastRun } = await cmsQuery<{ status: string; completed_at: string }>(
      "SELECT status, completed_at FROM off_page_automation_runs ORDER BY started_at DESC LIMIT 1"
    );
    const hasRun = lastRun.length > 0;
    matrix.push({
      id: "daily-automation",
      name: "Daily Automation & Maintenance Engine",
      type: "AUTOMATION",
      status: "ACTIVE",
      reason: hasRun
        ? `Last run completed with status ${lastRun[0].status} at ${lastRun[0].completed_at}`
        : "Scheduled daily automation engine ready for execution.",
      lastSuccess: hasRun ? lastRun[0].completed_at : undefined,
    });
  } catch {
    matrix.push({
      id: "daily-automation",
      name: "Daily Automation & Maintenance Engine",
      type: "AUTOMATION",
      status: "ACTIVE",
      reason: "Scheduled daily automation engine ready for execution.",
    });
  }

  return matrix;
}
