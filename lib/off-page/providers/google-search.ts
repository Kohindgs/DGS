import type { DiscoveryProvider, DiscoveryRequest, CandidateOpportunity, ProviderHealth } from "./types";
import type { RegionCode, OpportunityCategory } from "@/lib/off-page/types";

let lastSuccessTime: string | undefined;
let lastErrorTime: string | undefined;
let lastCount: number = 0;

export class GoogleSearchDiscoveryProvider implements DiscoveryProvider {
  id = "google-search";
  name = "Google Search / SERP API";

  async health(): Promise<ProviderHealth> {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;
    const serpApiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey && !serpApiKey) {
      return {
        id: this.id,
        name: this.name,
        type: "SEARCH",
        status: "NOT_CONFIGURED",
        reason: "No search provider credentials configured. Requires GOOGLE_SEARCH_API_KEY & GOOGLE_SEARCH_CX or SERPAPI_API_KEY in environment variables.",
        requiredConfig: ["GOOGLE_SEARCH_API_KEY", "GOOGLE_SEARCH_CX"],
        lastSuccess: lastSuccessTime,
        lastError: lastErrorTime,
        lastResultCount: lastCount,
      };
    }

    return {
      id: this.id,
      name: this.name,
      type: "SEARCH",
      status: "ACTIVE",
      reason: "Search provider API credentials configured and ready.",
      lastSuccess: lastSuccessTime,
      lastError: lastErrorTime,
      lastResultCount: lastCount,
    };
  }

  async discover(request: DiscoveryRequest): Promise<CandidateOpportunity[]> {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;
    const serpApiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey && !serpApiKey) {
      lastErrorTime = new Date().toISOString();
      return [];
    }

    const queries = request.queries || [
      "digital marketing directory India",
      "SEO agency directory Mumbai",
      "Dubai marketing company directory",
      "AI video production company directory",
    ];

    const candidates: CandidateOpportunity[] = [];

    for (const q of queries.slice(0, request.limit || 5)) {
      try {
        if (apiKey && cx) {
          const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(q)}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
          if (!res.ok) {
            lastErrorTime = new Date().toISOString();
            continue;
          }
          const data = await res.json();
          for (const item of (data.items || [])) {
            try {
              const parsedUrl = new URL(item.link);
              const domain = parsedUrl.hostname.replace(/^www\./, "").toLowerCase();
              if (domain.includes("google") || domain.includes("dgeniussolutions")) continue;

              candidates.push({
                site_name: item.title || domain,
                domain,
                url: item.link,
                category: q.includes("directory") ? "AGENCY_DIRECTORY" : "RESOURCE_PAGE",
                region: (request.regions?.[0] as RegionCode) || "GLOBAL",
                discovery_provider: "GOOGLE_SEARCH_API",
                discovery_query: q,
                evidence: item.snippet || item.title,
                notes: `Discovered via Google Search query: "${q}"`,
              });
            } catch {
              // Skip invalid link
            }
          }
        }
      } catch (err: any) {
        lastErrorTime = new Date().toISOString();
        console.warn(`[GoogleSearchDiscoveryProvider] Query "${q}" failed:`, err?.message);
      }
    }

    lastCount = candidates.length;
    if (candidates.length > 0) {
      lastSuccessTime = new Date().toISOString();
    }
    return candidates;
  }
}
