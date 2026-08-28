export type ProtectedRoute = {
  path: string;
  wordpressId: number;
  wordpressType: "page" | "service";
  protectionLevel: "critical" | "high";
  notes: string;
};

export const protectedRoutes: ProtectedRoute[] = [
  {
    path: "/",
    wordpressId: 63505,
    wordpressType: "page",
    protectionLevel: "high",
    notes: "Homepage content and internal-link architecture must be preserved during migration.",
  },
  {
    path: "/services/seo-services-in-mumbai/",
    wordpressId: 40278,
    wordpressType: "service",
    protectionLevel: "critical",
    notes: "Ranking-protected SEO service page. Preserve URL, visible copy, headings, links, metadata, schema and indexability.",
  },
  {
    path: "/services/aeo-services-in-mumbai/",
    wordpressId: 62373,
    wordpressType: "service",
    protectionLevel: "critical",
    notes: "Ranking-protected AEO page. No content rewrite during migration.",
  },
  {
    path: "/services/geo/",
    wordpressId: 62317,
    wordpressType: "service",
    protectionLevel: "critical",
    notes: "GEO service page. Preserve current search structure and internal links.",
  },
  {
    path: "/services/llm-seo-service/",
    wordpressId: 62322,
    wordpressType: "service",
    protectionLevel: "critical",
    notes: "Ranking-protected LLM SEO page. No content rewrite during migration.",
  },
  {
    path: "/services/ai-video-production-agency/",
    wordpressId: 40114,
    wordpressType: "service",
    protectionLevel: "critical",
    notes: "Ranking-protected AI Production page. Preserve content and search signals while replacing gallery dependencies with custom portfolio links where approved.",
  },
  {
    path: "/about-us/",
    wordpressId: 38769,
    wordpressType: "page",
    protectionLevel: "high",
    notes: "Preserve entity and organization information used by search and AI systems.",
  },
  {
    path: "/services/performance-marketing/",
    wordpressId: 64616,
    wordpressType: "service",
    protectionLevel: "high",
    notes: "Preserve content; technical issues can be corrected without rewriting copy.",
  },
  {
    path: "/services/website-development-amc/",
    wordpressId: 41418,
    wordpressType: "service",
    protectionLevel: "high",
    notes: "Preserve content; migrate to semantic Next.js rendering.",
  },
  {
    path: "/services/social-media-marketing/",
    wordpressId: 40112,
    wordpressType: "service",
    protectionLevel: "high",
    notes: "Preserve content and improve technical/indexing foundation.",
  },
  {
    path: "/services/branding/",
    wordpressId: 40277,
    wordpressType: "service",
    protectionLevel: "high",
    notes: "Preserve content; portfolio work should move to the custom /portfolio/ system.",
  },
  {
    path: "/services/content-creation/",
    wordpressId: 40276,
    wordpressType: "service",
    protectionLevel: "high",
    notes: "Preserve content and improve technical/indexing foundation.",
  },
];
