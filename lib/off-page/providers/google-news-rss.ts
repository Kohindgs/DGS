import type { DiscoveryProvider, DiscoveryRequest, CandidateOpportunity, ProviderHealth } from "./types";
import type { RegionCode, OpportunityCategory } from "@/lib/off-page/types";

let lastSuccessTime: string | undefined;
let lastErrorTime: string | undefined;
let lastCount: number = 0;

export class GoogleNewsRssDiscoveryProvider implements DiscoveryProvider {
  id = "google-news-rss";
  name = "Google News & Industry RSS Discovery";

  async health(): Promise<ProviderHealth> {
    try {
      const res = await fetch("https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en", {
        method: "HEAD",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; DGS-DiscoveryBot/1.0)" },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        return {
          id: this.id,
          name: this.name,
          type: "RSS",
          status: "ACTIVE",
          reason: "Google News RSS endpoint responsive (HTTP 200 OK)",
          lastSuccess: lastSuccessTime || new Date().toISOString(),
          lastError: lastErrorTime,
          lastResultCount: lastCount,
        };
      }
      return {
        id: this.id,
        name: this.name,
        type: "RSS",
        status: "DEGRADED",
        reason: `Google News RSS responded with HTTP ${res.status}`,
        lastSuccess: lastSuccessTime,
        lastError: lastErrorTime,
        lastResultCount: lastCount,
      };
    } catch (err: any) {
      return {
        id: this.id,
        name: this.name,
        type: "RSS",
        status: "ERROR",
        reason: `Connection error: ${err?.message}`,
        lastSuccess: lastSuccessTime,
        lastError: new Date().toISOString(),
        lastResultCount: lastCount,
      };
    }
  }

  async discover(request: DiscoveryRequest): Promise<CandidateOpportunity[]> {
    const candidates: CandidateOpportunity[] = [];
    const seenUrls = new Set<string>();
    const seenDomains = new Set<string>();

    const regionalFeeds: Record<string, { hl: string; gl: string; ceid: string; defaultRegion: RegionCode }> = {
      INDIA: { hl: "en-IN", gl: "IN", ceid: "IN:en", defaultRegion: "INDIA" },
      UAE: { hl: "en-AE", gl: "AE", ceid: "AE:en", defaultRegion: "UAE" },
      USA: { hl: "en-US", gl: "US", ceid: "US:en", defaultRegion: "USA" },
      GLOBAL: { hl: "en", gl: "US", ceid: "US:en", defaultRegion: "GLOBAL" },
    };

    // Build dimensioned query set (Section 11)
    const baseQueries: Array<{ query: string; region: RegionCode; category: OpportunityCategory }> = [
      { query: '"AI video production" OR "generative AI video" agency', region: "GLOBAL", category: "DIGITAL_PR" },
      { query: '"digital marketing agency" directory India', region: "INDIA", category: "AGENCY_DIRECTORY" },
      { query: '"SEO agency" listing Mumbai', region: "INDIA", category: "AGENCY_DIRECTORY" },
      { query: '"digital agency" directory Dubai UAE', region: "UAE", category: "AGENCY_DIRECTORY" },
      { query: '"generative engine optimization" OR "LLM SEO" publication', region: "USA", category: "DIGITAL_PR" },
      { query: '"B2B marketing" case studies contributors', region: "GLOBAL", category: "EXPERT_CONTRIBUTION" },
      { query: '"AI video" corporate production trends', region: "UAE", category: "DIGITAL_PR" },
      { query: '"search engine optimization" editorial resources', region: "INDIA", category: "RESOURCE_PAGE" },
    ];

    const activeQueries = request.queries && request.queries.length > 0
      ? request.queries.map((q) => ({
          query: q,
          region: (request.regions?.[0] || "GLOBAL") as RegionCode,
          category: (request.categories?.[0] || "DIGITAL_PR") as OpportunityCategory,
        }))
      : baseQueries;

    const maxQueries = Math.min(activeQueries.length, request.limit ? Math.ceil(request.limit / 3) : 6);

    for (let i = 0; i < maxQueries; i++) {
      const item = activeQueries[i];
      const feedConf = regionalFeeds[item.region] || regionalFeeds.GLOBAL;

      try {
        const encodedQuery = encodeURIComponent(item.query);
        const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=${feedConf.hl}&gl=${feedConf.gl}&ceid=${feedConf.ceid}`;

        const res = await fetch(rssUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/rss+xml, application/xml, text/xml",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
          lastErrorTime = new Date().toISOString();
          continue;
        }

        const xml = await res.text();
        const rawItems = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

        for (const rawItem of rawItems.slice(0, 5)) {
          const titleMatch = rawItem.match(/<title>([\s\S]*?)<\/title>/);
          const linkMatch = rawItem.match(/<link>([\s\S]*?)<\/link>/);
          const pubDateMatch = rawItem.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
          const sourceMatch = rawItem.match(/<source\b[^>]*>([\s\S]*?)<\/source>/);
          const sourceUrlMatch = rawItem.match(/<source\b[^>]*url=['"]([^'"]+)['"]/);

          let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "";
          const link = linkMatch ? linkMatch[1].trim() : "";
          const pubDate = pubDateMatch ? pubDateMatch[1].trim() : "";
          const sourceName = sourceMatch ? sourceMatch[1].trim() : "";
          const sourceUrl = sourceUrlMatch ? sourceUrlMatch[1].trim() : "";

          // Resolve publisher domain
          let domain = "";
          let finalCandidateUrl = link;

          if (sourceUrl) {
            try {
              domain = new URL(sourceUrl).hostname.replace(/^www\./, "").toLowerCase();
              finalCandidateUrl = sourceUrl;
            } catch {
              // Ignore invalid url
            }
          }

          if (!domain && sourceName) {
            domain = sourceName.toLowerCase().replace(/[^a-z0-9.-]/g, "").replace(/^www\./, "");
            if (!domain.includes(".")) domain += ".com";
            if (!sourceUrl) finalCandidateUrl = `https://${domain}`;
          }

          if (!domain) {
            // Extract from title suffix (e.g., "Headline - domain.com")
            const dashIdx = title.lastIndexOf(" - ");
            if (dashIdx > 0) {
              const suffix = title.substring(dashIdx + 3).trim().toLowerCase();
              if (suffix.includes(".")) {
                domain = suffix.replace(/^www\./, "");
                if (!sourceUrl) finalCandidateUrl = `https://${domain}`;
              }
            }
          }

          // Fallback domain extraction
          if (!domain) domain = "industry-news-portal.com";

          // Exclude Google itself or DGS self-citations
          if (domain.includes("google") || domain.includes("dgeniussolutions") || domain.includes("youtube")) {
            continue;
          }

          if (seenDomains.has(domain) || seenUrls.has(finalCandidateUrl)) {
            continue;
          }

          seenDomains.add(domain);
          seenUrls.add(finalCandidateUrl);

          // Clean title
          const cleanTitle = title.replace(/\s*-\s*[^-]+$/, "").trim() || `${domain} Editorial Publication`;

          candidates.push({
            site_name: sourceName || cleanTitle.slice(0, 80),
            domain,
            url: finalCandidateUrl,
            category: item.category,
            region: item.region,
            country: item.region === "INDIA" ? "India" : item.region === "UAE" ? "United Arab Emirates" : item.region === "USA" ? "United States" : "Global",
            free_status: "FREE",
            free_tier_details: "Public editorial coverage, contributor opportunity, or organic PR citation",
            discovery_provider: "GOOGLE_NEWS_RSS",
            discovery_query: item.query,
            evidence: `Editorial item: "${cleanTitle}". Published: ${pubDate || "Recent"}. Source: ${sourceName || domain}.`,
            notes: `Discovered from Google News RSS feed for query: "${item.query}" in region ${item.region}.`,
            pubDate,
          });

          if (request.limit && candidates.length >= request.limit) break;
        }
      } catch (err: any) {
        lastErrorTime = new Date().toISOString();
        console.warn(`[GoogleNewsRssDiscoveryProvider] Failed for query "${item.query}":`, err?.message);
      }

      if (request.limit && candidates.length >= request.limit) break;
    }

    lastCount = candidates.length;
    if (candidates.length > 0) {
      lastSuccessTime = new Date().toISOString();
    }
    return candidates;
  }
}
