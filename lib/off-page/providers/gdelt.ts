import type { DiscoveryProvider, DiscoveryRequest, CandidateOpportunity, ProviderHealth } from "./types";
import type { RegionCode, OpportunityCategory } from "@/lib/off-page/types";

let lastSuccessTime: string | undefined;
let lastErrorTime: string | undefined;
let lastCount: number = 0;

export class GdeltDiscoveryProvider implements DiscoveryProvider {
  id = "gdelt-doc";
  name = "GDELT 2.0 Global Media & News Database";

  async health(): Promise<ProviderHealth> {
    try {
      const res = await fetch("https://api.gdeltproject.org/api/v2/doc/doc?query=test&mode=ArtList&maxrecords=1&format=json", {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; DGS-Discovery/1.0)" },
        signal: AbortSignal.timeout(6000),
      });

      if (res.status === 200) {
        return {
          id: this.id,
          name: this.name,
          type: "MEDIA_DATABASE",
          status: "ACTIVE",
          reason: "GDELT 2.0 DOC API online and responsive.",
          lastSuccess: lastSuccessTime || new Date().toISOString(),
          lastError: lastErrorTime,
          lastResultCount: lastCount,
        };
      }
      if (res.status === 429) {
        return {
          id: this.id,
          name: this.name,
          type: "MEDIA_DATABASE",
          status: "DEGRADED",
          reason: "GDELT 2.0 rate limit reached (HTTP 429). Will retry during subsequent automated cycle.",
          lastSuccess: lastSuccessTime,
          lastError: new Date().toISOString(),
          lastResultCount: lastCount,
        };
      }
      return {
        id: this.id,
        name: this.name,
        type: "MEDIA_DATABASE",
        status: "DEGRADED",
        reason: `GDELT 2.0 returned HTTP ${res.status}`,
        lastSuccess: lastSuccessTime,
        lastError: lastErrorTime,
        lastResultCount: lastCount,
      };
    } catch (err: any) {
      return {
        id: this.id,
        name: this.name,
        type: "MEDIA_DATABASE",
        status: "DEGRADED",
        reason: `GDELT unreachable: ${err?.message}`,
        lastSuccess: lastSuccessTime,
        lastError: new Date().toISOString(),
        lastResultCount: lastCount,
      };
    }
  }

  async discover(request: DiscoveryRequest): Promise<CandidateOpportunity[]> {
    const candidates: CandidateOpportunity[] = [];
    const query = (request.queries && request.queries[0]) || '"AI video" OR "digital marketing"';

    try {
      const encoded = encodeURIComponent(query);
      const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encoded}&mode=ArtList&maxrecords=10&format=json`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; DGS-Discovery/1.0)" },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        lastErrorTime = new Date().toISOString();
        return [];
      }

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        lastErrorTime = new Date().toISOString();
        return [];
      }

      for (const art of (data.articles || [])) {
        if (!art.url || !art.domain) continue;
        const domain = art.domain.toLowerCase().replace(/^www\./, "");
        if (domain.includes("google") || domain.includes("dgeniussolutions")) continue;

        candidates.push({
          site_name: art.title || domain,
          domain,
          url: art.url,
          category: "DIGITAL_PR",
          region: (request.regions?.[0] as RegionCode) || "GLOBAL",
          country: art.sourcecountry || "Global",
          free_status: "FREE",
          discovery_provider: "GDELT_2.0",
          discovery_query: query,
          evidence: `GDELT Record: ${art.title} (Published: ${art.seendate || "Recent"}). Domain: ${domain}`,
          notes: `Discovered from GDELT 2.0 Global Media monitoring`,
          pubDate: art.seendate,
        });
      }
    } catch (err: any) {
      lastErrorTime = new Date().toISOString();
      console.warn("[GdeltDiscoveryProvider] discover error:", err?.message);
    }

    lastCount = candidates.length;
    if (candidates.length > 0) {
      lastSuccessTime = new Date().toISOString();
    }
    return candidates;
  }
}
