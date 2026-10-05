/**
 * V8.12.7 discovery lane configuration.
 *
 * Each lane fetches live external data independently through real providers and validates
 * every candidate page with its own validator. Default queries can be overridden by admins
 * via the `discovery_lane_queries` key in off_page_settings (JSON: { [laneId]: LaneQuery[] }).
 */
import type { OpportunityCategory, RegionCode } from "../types";

export type LaneId =
  | "BUSINESS_CITATIONS"
  | "LOCAL_LISTINGS"
  | "AGENCY_DIRECTORIES"
  | "ARTICLE_CONTRIBUTIONS"
  | "EXPERT_CONTRIBUTIONS"
  | "DIGITAL_PR"
  | "COMMUNITIES_QA"
  | "PARTNERSHIPS"
  | "RESOURCE_PAGES"
  | "BROKEN_LINKS"
  | "UNLINKED_MENTIONS"
  | "REVIEW_PLATFORMS"
  | "COMPETITOR_LINK_GAP";

export type LaneProvider = "WEB_SEARCH" | "BRAVE_SEARCH" | "GOOGLE_NEWS_RSS" | "GDELT";

/** Which page-level rule the validator applies. */
export type ValidatorKind =
  | "SUBMISSION" // directory / listing / citation / review profile: needs submit/list/claim signals
  | "CONTRIBUTION" // write-for-us / guest / expert: needs contributor signals
  | "PR_REQUEST" // journalist / source request signals
  | "COMMUNITY" // forum / Q&A platform
  | "PARTNERSHIP" // partner programme signals
  | "RESOURCE" // curated resource list with many outbound links
  | "BROKEN_LINK" // resource list with >=1 dead outbound link
  | "UNLINKED_MENTION" // brand mentioned, no DGS link
  | "COMPETITOR_GAP"; // links to a configured competitor, not to DGS

export interface LaneQuery {
  query: string;
  region: RegionCode;
}

export interface LaneDefinition {
  id: LaneId;
  label: string;
  category: OpportunityCategory;
  validator: ValidatorKind;
  providers: LaneProvider[];
  /** Hyperlink not applicable (NAP citations) -> link type N/A. */
  linkNotApplicable?: boolean;
  defaultQueries: LaneQuery[];
  description: string;
}

const q = (query: string, region: RegionCode): LaneQuery => ({ query, region });

export const LANES: LaneDefinition[] = [
  {
    id: "BUSINESS_CITATIONS",
    label: "Business Citations",
    category: "BUSINESS_LISTING",
    validator: "SUBMISSION",
    providers: ["WEB_SEARCH", "BRAVE_SEARCH"],
    linkNotApplicable: true,
    description: "Free business listing / citation sites that accept company profiles.",
    defaultQueries: [
      q("free business listing India add your company", "INDIA"),
      q("UAE business directory free listing", "UAE"),
      q("add your business free directory USA", "USA"),
    ],
  },
  {
    id: "LOCAL_LISTINGS",
    label: "Local Listings",
    category: "LOCAL_CITATION",
    validator: "SUBMISSION",
    providers: ["WEB_SEARCH", "BRAVE_SEARCH"],
    linkNotApplicable: true,
    description: "City / local directories (Mumbai, Bengaluru, Dubai, etc.).",
    defaultQueries: [
      q("Mumbai local business directory add listing", "INDIA"),
      q("Dubai local business directory add your business", "UAE"),
    ],
  },
  {
    id: "AGENCY_DIRECTORIES",
    label: "Agency Directories",
    category: "AGENCY_DIRECTORY",
    validator: "SUBMISSION",
    providers: ["WEB_SEARCH", "BRAVE_SEARCH"],
    description: "Marketing / SEO / AI video / web development agency directories.",
    defaultQueries: [
      q("SEO agency directory India", "INDIA"),
      q("digital marketing agency directory India", "INDIA"),
      q("SEO agency submit company", "GLOBAL"),
      q("digital marketing agency directory UAE", "UAE"),
      q("Dubai marketing agency directory", "UAE"),
      q("marketing agency directory USA", "USA"),
      q("digital agency free listing", "USA"),
      q("AI video production directory", "GLOBAL"),
      q("AI production company directory", "GLOBAL"),
      q("web development agency directory", "GLOBAL"),
      q("website development company listing", "INDIA"),
    ],
  },
  {
    id: "ARTICLE_CONTRIBUTIONS",
    label: "Article / Content Contributions",
    category: "ARTICLE_SUBMISSION",
    validator: "CONTRIBUTION",
    providers: ["WEB_SEARCH", "BRAVE_SEARCH"],
    description: "Write-for-us / guest article pages in DGS topics.",
    defaultQueries: [
      q("digital marketing write for us India", "INDIA"),
      q("Dubai write for us marketing", "UAE"),
      q("generative engine optimization write for us", "GLOBAL"),
      q("AI video write for us", "GLOBAL"),
      q("AI search marketing guest article", "GLOBAL"),
    ],
  },
  {
    id: "EXPERT_CONTRIBUTIONS",
    label: "Expert Contributions",
    category: "EXPERT_CONTRIBUTION",
    validator: "CONTRIBUTION",
    providers: ["WEB_SEARCH", "BRAVE_SEARCH"],
    description: "Expert roundups / contributor programmes / expert quotes.",
    defaultQueries: [
      q("SEO expert contribute article", "GLOBAL"),
      q("answer engine optimization contribute", "GLOBAL"),
      q("GEO marketing expert contribution", "GLOBAL"),
      q("generative AI video expert contribution", "GLOBAL"),
      q("UAE AI marketing contribute", "UAE"),
    ],
  },
  {
    id: "DIGITAL_PR",
    label: "Digital PR / Journalist Requests",
    category: "DIGITAL_PR",
    validator: "PR_REQUEST",
    providers: ["WEB_SEARCH", "BRAVE_SEARCH", "GOOGLE_NEWS_RSS"],
    description: "Journalist source requests and expert-source platforms.",
    defaultQueries: [
      q("SEO expert journalist query", "USA"),
      q("marketing expert source journalist", "USA"),
      q("journalist request marketing expert India", "INDIA"),
    ],
  },
  {
    id: "COMMUNITIES_QA",
    label: "Communities / Q&A",
    category: "COMMUNITY",
    validator: "COMMUNITY",
    providers: ["WEB_SEARCH", "BRAVE_SEARCH"],
    description: "Active forums and Q&A threads where DGS expertise is relevant (UGC links).",
    defaultQueries: [
      q("generative engine optimization forum discussion", "GLOBAL"),
      q("SEO community India forum", "INDIA"),
      q("AI video production community forum", "GLOBAL"),
    ],
  },
  {
    id: "PARTNERSHIPS",
    label: "Partnership Opportunities",
    category: "PARTNERSHIP",
    validator: "PARTNERSHIP",
    providers: ["WEB_SEARCH", "BRAVE_SEARCH"],
    description: "Agency / technology partner programmes and partner directories.",
    defaultQueries: [
      q("agency partner program marketing tools", "GLOBAL"),
      q("become a partner digital agency India", "INDIA"),
      q("agency partner directory UAE", "UAE"),
    ],
  },
  {
    id: "RESOURCE_PAGES",
    label: "Resource Page Opportunities",
    category: "RESOURCE_PAGE",
    validator: "RESOURCE",
    providers: ["WEB_SEARCH", "BRAVE_SEARCH"],
    description: "Curated resource lists relevant to SEO / AEO / GEO / AI marketing.",
    defaultQueries: [
      q("SEO resources", "GLOBAL"),
      q("digital marketing resources", "INDIA"),
      q("AI marketing resources", "GLOBAL"),
      q("recommended SEO agencies", "GLOBAL"),
      q("marketing tools resources", "USA"),
    ],
  },
  {
    id: "BROKEN_LINKS",
    label: "Broken Link Opportunities",
    category: "BROKEN_LINK",
    validator: "BROKEN_LINK",
    providers: ["WEB_SEARCH", "BRAVE_SEARCH"],
    description: "Resource pages with dead outbound links DGS content can replace.",
    defaultQueries: [
      q("SEO resources useful links", "GLOBAL"),
      q("digital marketing resources links", "GLOBAL"),
      q("AI marketing tools resources list", "GLOBAL"),
    ],
  },
  {
    id: "UNLINKED_MENTIONS",
    label: "Unlinked Brand Mentions",
    category: "UNLINKED_MENTION",
    validator: "UNLINKED_MENTION",
    providers: ["WEB_SEARCH", "BRAVE_SEARCH", "GOOGLE_NEWS_RSS", "GDELT"],
    description: "Pages mentioning D'Genius Solutions / founders without linking to dgeniussolutions.com.",
    defaultQueries: [
      q('"D\'Genius Solutions"', "GLOBAL"),
      q('"D Genius Solutions"', "GLOBAL"),
      q('"dgeniussolutions"', "GLOBAL"),
      q('"Kohin Bellara"', "GLOBAL"),
      q('"Sneha Bellara"', "GLOBAL"),
    ],
  },
  {
    id: "REVIEW_PLATFORMS",
    label: "Reviews / Client Review Platforms",
    category: "REVIEW_PLATFORM",
    validator: "SUBMISSION",
    providers: ["WEB_SEARCH", "BRAVE_SEARCH"],
    description: "Client review platforms where agencies can create a free profile.",
    defaultQueries: [
      q("agency reviews platform create free profile", "GLOBAL"),
      q("digital marketing company reviews India list your agency", "INDIA"),
    ],
  },
  {
    id: "COMPETITOR_LINK_GAP",
    label: "Competitor Link Gap",
    category: "OTHER",
    validator: "COMPETITOR_GAP",
    providers: ["WEB_SEARCH", "BRAVE_SEARCH"],
    description: "Pages linking to configured competitors but not DGS. Requires competitor domains in settings.",
    defaultQueries: [],
  },
];

export function getLane(id: string): LaneDefinition | undefined {
  return LANES.find((l) => l.id === id);
}

/** Region priority (India -> UAE -> USA -> Global). Lower is higher priority. */
export const REGION_PRIORITY: Record<string, number> = { INDIA: 1, UAE: 2, USA: 3, GLOBAL: 4 };
