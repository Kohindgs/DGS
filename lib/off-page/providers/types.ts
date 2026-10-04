import type { OpportunityCategory, RegionCode } from "@/lib/off-page/types";

export interface ProviderHealth {
  id: string;
  name: string;
  type: "SEARCH" | "RSS" | "MEDIA_DATABASE" | "BACKLINK" | "VECTOR" | "DATABASE" | "AUTOMATION";
  status: "ACTIVE" | "DEGRADED" | "NOT_CONFIGURED" | "ERROR";
  reason?: string;
  lastSuccess?: string;
  lastError?: string;
  lastResultCount?: number;
  requiredConfig?: string[];
}

export interface CandidateOpportunity {
  site_name: string;
  domain: string;
  url: string;
  category: OpportunityCategory;
  region: RegionCode;
  country?: string;
  free_status?: "FREE" | "NOT_FREE" | "FREEMIUM";
  free_tier_details?: string;
  discovery_provider: string;
  discovery_query: string;
  evidence?: string;
  notes?: string;
  pubDate?: string;
}

export interface DiscoveryRequest {
  queries?: string[];
  services?: string[];
  regions?: RegionCode[];
  categories?: OpportunityCategory[];
  limit?: number;
}

export interface DiscoveryProvider {
  id: string;
  name: string;
  health(): Promise<ProviderHealth>;
  discover(request: DiscoveryRequest): Promise<CandidateOpportunity[]>;
}
