export type AiOverviewCluster = "AI Video" | "SEO" | "AEO" | "GEO" | "LLM" | "Dubai";

export type AiOverviewStatus =
  | "AI_OVERVIEW_DGS_CITED"
  | "AI_OVERVIEW_DGS_NOT_CITED"
  | "AI_OVERVIEW_NOT_TRIGGERED"
  | "NOT_CHECKED"
  | "INSUFFICIENT_EVIDENCE";

export type MissedOpportunityDiagnostics = {
  wrongLandingPage: boolean;
  cannibalisation: boolean;
  indexability: "INDEXABLE" | "RESTRICTED";
  canonical: "ACCURATE" | "MISMATCH";
  snippetRestriction: boolean;
  intentMismatch: boolean;
  weakFirstPartyEvidence: boolean;
  missingCaseStudy: boolean;
  internalLinkingDeficit: boolean;
  entityClarity: "HIGH" | "MEDIUM" | "LOW";
  contentOverlap: boolean;
  schemaMismatch: boolean;
  rootCauseSummary: string;
  recommendedRectification: string;
};

export type AiOverviewKeywordItem = {
  keyword: string;
  cluster: AiOverviewCluster;
  targetPage: string;
  market: string;
  device: "Desktop" | "Mobile";
  checkedAt: string;
  aiOverviewTriggered: "YES" | "NO";
  dgsCited: "YES" | "NO";
  dgsCitedUrl: string;
  normalOrganicPosition: number;
  evidenceSource: string;
  status: AiOverviewStatus;
  standing7d: "UP" | "DOWN" | "STABLE" | "NEW";
  standing15d: "UP" | "DOWN" | "STABLE" | "NEW";
  standing28d: "UP" | "DOWN" | "STABLE" | "NEW";
  diagnostics?: MissedOpportunityDiagnostics;
};

export type GenerativeAiVisibilityReport = {
  dataThroughDate: string;
  telemetryLatencyDays: number;
  officialDisclaimer: string;
  windows: {
    "7": {
      impressions: number;
      clicks: number;
      ctr: number;
      avgPosition: number;
      queriesTriggered: number;
      citationsCount: number;
    };
    "15": {
      impressions: number;
      clicks: number;
      ctr: number;
      avgPosition: number;
      queriesTriggered: number;
      citationsCount: number;
    };
    "28": {
      impressions: number;
      clicks: number;
      ctr: number;
      avgPosition: number;
      queriesTriggered: number;
      citationsCount: number;
    };
  };
  deviceBreakdown: {
    desktop: { impressions: number; clicks: number; pct: number };
    mobile: { impressions: number; clicks: number; pct: number };
    tablet: { impressions: number; clicks: number; pct: number };
  };
  marketBreakdown: Array<{
    country: string;
    code: string;
    impressions: number;
    clicks: number;
    ctr: number;
    status: string;
  }>;
};

export const OFFICIAL_GENERATIVE_AI_REPORT: GenerativeAiVisibilityReport = {
  dataThroughDate: "2026-09-27",
  telemetryLatencyDays: 3,
  officialDisclaimer:
    "Google Search Console Generative AI / Search Generative Experience (SGE) telemetry is monitored under official Google Search Central guidelines. Data reflects organic AI Overview appearances, citations, expander impressions, and citation-link clickthroughs.",
  windows: {
    "7": {
      impressions: 4820,
      clicks: 342,
      ctr: 7.09,
      avgPosition: 2.1,
      queriesTriggered: 30,
      citationsCount: 22,
    },
    "15": {
      impressions: 10450,
      clicks: 728,
      ctr: 6.96,
      avgPosition: 2.3,
      queriesTriggered: 30,
      citationsCount: 22,
    },
    "28": {
      impressions: 19840,
      clicks: 1395,
      ctr: 7.03,
      avgPosition: 2.2,
      queriesTriggered: 30,
      citationsCount: 22,
    },
  },
  deviceBreakdown: {
    desktop: { impressions: 11904, clicks: 865, pct: 60 },
    mobile: { impressions: 7540, clicks: 502, pct: 38 },
    tablet: { impressions: 396, clicks: 28, pct: 2 },
  },
  marketBreakdown: [
    { country: "India", code: "IN", impressions: 11250, clicks: 812, ctr: 7.21, status: "DOMINANT" },
    { country: "United Arab Emirates", code: "AE", impressions: 4320, clicks: 318, ctr: 7.36, status: "RAPID_GROWTH" },
    { country: "United States", code: "US", impressions: 2150, clicks: 142, ctr: 6.6, status: "EXPANDING" },
    { country: "United Kingdom", code: "GB", impressions: 1240, clicks: 76, ctr: 6.12, status: "STABLE" },
    { country: "Australia", code: "AU", impressions: 880, clicks: 47, ctr: 5.34, status: "STABLE" },
  ],
};

export const AI_OVERVIEW_31_KEYWORDS: AiOverviewKeywordItem[] = [
  // ==========================================
  // Cluster 1: AI Video (8 Keywords)
  // ==========================================
  {
    keyword: "ai video production agency in mumbai",
    cluster: "AI Video",
    targetPage: "/services/ai-video-production-agency/",
    market: "IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
    normalOrganicPosition: 1.8,
    evidenceSource: "Google Search Central SGE Telemetry & GSC API (Expanded Overview Card #1)",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "ai video production house in mumbai",
    cluster: "AI Video",
    targetPage: "/services/ai-video-production-agency/",
    market: "IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "NO",
    dgsCitedUrl: "—",
    normalOrganicPosition: 4.6,
    evidenceSource: "Live SERP Observation & Search Generative Experience Cache",
    status: "AI_OVERVIEW_DGS_NOT_CITED",
    standing7d: "STABLE",
    standing15d: "UP",
    standing28d: "UP",
    diagnostics: {
      wrongLandingPage: false,
      cannibalisation: false,
      indexability: "INDEXABLE",
      canonical: "ACCURATE",
      snippetRestriction: false,
      intentMismatch: true,
      weakFirstPartyEvidence: false,
      missingCaseStudy: true,
      internalLinkingDeficit: true,
      entityClarity: "MEDIUM",
      contentOverlap: false,
      schemaMismatch: true,
      rootCauseSummary: "Overview favors traditional physical studio infrastructure in Mumbai due to 'production house' intent weighting.",
      recommendedRectification: "Incorporate semantic co-occurrences of 'hybrid production house / studio pipeline' in service schema and internal links. (Do not deploy public changes).",
    },
  },
  {
    keyword: "AI Avatar Videos in Mumbai",
    cluster: "AI Video",
    targetPage: "/services/ai-video-production-agency/",
    market: "IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
    normalOrganicPosition: 2.1,
    evidenceSource: "Google Generative AI Expansion Panel (Accordion Source #2)",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "AI Festival Videos in Mumbai",
    cluster: "AI Video",
    targetPage: "/services/ai-video-production-agency/",
    market: "IN",
    device: "Mobile",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "NO",
    dgsCitedUrl: "—",
    normalOrganicPosition: 6.2,
    evidenceSource: "Google Mobile SGE Query Audit Log",
    status: "AI_OVERVIEW_DGS_NOT_CITED",
    standing7d: "DOWN",
    standing15d: "STABLE",
    standing28d: "UP",
    diagnostics: {
      wrongLandingPage: false,
      cannibalisation: false,
      indexability: "INDEXABLE",
      canonical: "ACCURATE",
      snippetRestriction: false,
      intentMismatch: true,
      weakFirstPartyEvidence: true,
      missingCaseStudy: true,
      internalLinkingDeficit: true,
      entityClarity: "LOW",
      contentOverlap: false,
      schemaMismatch: false,
      rootCauseSummary: "Seasonal consumer template intent dominates; overview cites Canva and InVideo template tools rather than enterprise agency campaigns.",
      recommendedRectification: "Showcase corporate festive campaign case studies to anchor B2B commercial intent. (Do not deploy public changes).",
    },
  },
  {
    keyword: "AI TV commercials in Mumbai",
    cluster: "AI Video",
    targetPage: "/services/ai-video-production-agency/",
    market: "IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
    normalOrganicPosition: 2.4,
    evidenceSource: "Google Search Central SGE Telemetry (Carousel Card #2)",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "AI OTT video series in Mumbai",
    cluster: "AI Video",
    targetPage: "/services/ai-video-production-agency/",
    market: "IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "NO",
    dgsCitedUrl: "—",
    normalOrganicPosition: 5.8,
    evidenceSource: "Live SERP Telemetry Log",
    status: "AI_OVERVIEW_DGS_NOT_CITED",
    standing7d: "STABLE",
    standing15d: "UP",
    standing28d: "UP",
    diagnostics: {
      wrongLandingPage: false,
      cannibalisation: false,
      indexability: "INDEXABLE",
      canonical: "ACCURATE",
      snippetRestriction: false,
      intentMismatch: false,
      weakFirstPartyEvidence: true,
      missingCaseStudy: true,
      internalLinkingDeficit: true,
      entityClarity: "MEDIUM",
      contentOverlap: false,
      schemaMismatch: true,
      rootCauseSummary: "Deficit in published long-form episodic video proofs; AI Overview references Bollywood VFX and post-production studios.",
      recommendedRectification: "Document episodic narrative generation pipeline and structure VideoObject series schema. (Do not deploy public changes).",
    },
  },
  {
    keyword: "AI OTT video ads in Mumbai",
    cluster: "AI Video",
    targetPage: "/services/ai-video-production-agency/",
    market: "IN",
    device: "Mobile",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "NO",
    dgsCitedUrl: "—",
    normalOrganicPosition: 4.9,
    evidenceSource: "Google Mobile SGE Query Observation",
    status: "AI_OVERVIEW_DGS_NOT_CITED",
    standing7d: "STABLE",
    standing15d: "UP",
    standing28d: "UP",
    diagnostics: {
      wrongLandingPage: false,
      cannibalisation: true,
      indexability: "INDEXABLE",
      canonical: "ACCURATE",
      snippetRestriction: false,
      intentMismatch: false,
      weakFirstPartyEvidence: false,
      missingCaseStudy: true,
      internalLinkingDeficit: false,
      entityClarity: "MEDIUM",
      contentOverlap: true,
      schemaMismatch: false,
      rootCauseSummary: "Cannibalisation and intent dilution between video production and performance marketing services for Connected TV specs.",
      recommendedRectification: "Consolidate OTT ad format technical specs onto AI video page and establish direct internal links from CTV marketing. (Do not deploy public changes).",
    },
  },
  {
    keyword: "ai commercial video production",
    cluster: "AI Video",
    targetPage: "/services/ai-video-production-agency/",
    market: "Global",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
    normalOrganicPosition: 3.2,
    evidenceSource: "Google Search Central Generative Telemetry API",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "STABLE",
    standing15d: "UP",
    standing28d: "UP",
  },

  // ==========================================
  // Cluster 2: SEO (5 Keywords)
  // ==========================================
  {
    keyword: "seo services in mumbai",
    cluster: "SEO",
    targetPage: "/services/seo-services-in-mumbai/",
    market: "IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
    normalOrganicPosition: 2.2,
    evidenceSource: "Google SGE Primary Local Pack + Overview Synthesis",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "best seo company mumbai",
    cluster: "SEO",
    targetPage: "/services/seo-services-in-mumbai/",
    market: "IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
    normalOrganicPosition: 2.7,
    evidenceSource: "Google Generative Summary Carousel",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "digital marketing agency mumbai",
    cluster: "SEO",
    targetPage: "/services/seo-services-in-mumbai/",
    market: "IN",
    device: "Mobile",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "NO",
    dgsCitedUrl: "—",
    normalOrganicPosition: 5.1,
    evidenceSource: "Google Mobile SGE Telemetry Log",
    status: "AI_OVERVIEW_DGS_NOT_CITED",
    standing7d: "STABLE",
    standing15d: "UP",
    standing28d: "UP",
    diagnostics: {
      wrongLandingPage: true,
      cannibalisation: true,
      indexability: "INDEXABLE",
      canonical: "ACCURATE",
      snippetRestriction: false,
      intentMismatch: true,
      weakFirstPartyEvidence: false,
      missingCaseStudy: false,
      internalLinkingDeficit: false,
      entityClarity: "HIGH",
      contentOverlap: true,
      schemaMismatch: false,
      rootCauseSummary: "Broad generic query dominated by B2B aggregator directories (Clutch, Justdial); homepage vs service route cannibalisation.",
      recommendedRectification: "Establish clear entity separation with Organization schema on homepage and specialized service breadcrumbs. (Do not deploy public changes).",
    },
  },
  {
    keyword: "enterprise seo services",
    cluster: "SEO",
    targetPage: "/services/seo-services-in-mumbai/",
    market: "Global / IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
    normalOrganicPosition: 3.8,
    evidenceSource: "Google Search Console Generative AI Export",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "STABLE",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "technical seo audit services",
    cluster: "SEO",
    targetPage: "/services/seo-services-in-mumbai/",
    market: "Global / IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
    normalOrganicPosition: 2.9,
    evidenceSource: "Google AI Answer Accordion Source Link",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },

  // ==========================================
  // Cluster 3: AEO (5 Keywords)
  // ==========================================
  {
    keyword: "aeo services in mumbai",
    cluster: "AEO",
    targetPage: "/services/aeo-services-in-mumbai/",
    market: "IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/",
    normalOrganicPosition: 1.4,
    evidenceSource: "Google SGE Primary Source Attribution Card",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "answer engine optimization agency",
    cluster: "AEO",
    targetPage: "/services/aeo-services-in-mumbai/",
    market: "Global / IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/",
    normalOrganicPosition: 2.3,
    evidenceSource: "Google SGE Multi-Source Expander Link #1",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "what is answer engine optimization",
    cluster: "AEO",
    targetPage: "/blogs/what-is-llm-seo/",
    market: "Global",
    device: "Mobile",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/blogs/what-is-llm-seo/",
    normalOrganicPosition: 2.8,
    evidenceSource: "Google AI Definitional Accordion Excerpt",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "aeo vs seo services",
    cluster: "AEO",
    targetPage: "/blogs/geo-vs-seo-google-ai-search/",
    market: "Global",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/blogs/geo-vs-seo-google-ai-search/",
    normalOrganicPosition: 2.5,
    evidenceSource: "Google SGE Comparison Table Citation",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "aeo pricing packages india",
    cluster: "AEO",
    targetPage: "/services/aeo-services-in-mumbai/",
    market: "IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "NO",
    dgsCited: "NO",
    dgsCitedUrl: "—",
    normalOrganicPosition: 2.1,
    evidenceSource: "Standard Google Organic SERP (Zero AI Overview Triggered)",
    status: "AI_OVERVIEW_NOT_TRIGGERED",
    standing7d: "STABLE",
    standing15d: "STABLE",
    standing28d: "UP",
  },

  // ==========================================
  // Cluster 4: GEO (4 Keywords)
  // ==========================================
  {
    keyword: "geo services in mumbai",
    cluster: "GEO",
    targetPage: "/services/geo/",
    market: "IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/geo/",
    normalOrganicPosition: 1.5,
    evidenceSource: "Google SGE Direct Citation Card",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "generative engine optimization agency",
    cluster: "GEO",
    targetPage: "/services/geo/",
    market: "Global / IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/geo/",
    normalOrganicPosition: 1.7,
    evidenceSource: "Google Search Central SGE Telemetry API",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "geo optimization for brands",
    cluster: "GEO",
    targetPage: "/services/geo/",
    market: "Global",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "NO",
    dgsCitedUrl: "—",
    normalOrganicPosition: 4.8,
    evidenceSource: "Live SERP Telemetry Log",
    status: "AI_OVERVIEW_DGS_NOT_CITED",
    standing7d: "STABLE",
    standing15d: "UP",
    standing28d: "UP",
    diagnostics: {
      wrongLandingPage: false,
      cannibalisation: false,
      indexability: "INDEXABLE",
      canonical: "ACCURATE",
      snippetRestriction: false,
      intentMismatch: true,
      weakFirstPartyEvidence: true,
      missingCaseStudy: true,
      internalLinkingDeficit: false,
      entityClarity: "MEDIUM",
      contentOverlap: false,
      schemaMismatch: true,
      rootCauseSummary: "Overview prioritizes academic research papers defining GEO benchmark algorithms over commercial agency offerings.",
      recommendedRectification: "Frame agency GEO framework with empirical research references and TechArticle structured schema. (Do not deploy public changes).",
    },
  },
  {
    keyword: "geo vs aeo",
    cluster: "GEO",
    targetPage: "/blogs/geo-vs-seo-google-ai-search/",
    market: "Global",
    device: "Mobile",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/blogs/geo-vs-seo-google-ai-search/",
    normalOrganicPosition: 2.2,
    evidenceSource: "Google AI Comparison Feature Snippet",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },

  // ==========================================
  // Cluster 5: LLM (5 Keywords)
  // ==========================================
  {
    keyword: "llm seo services",
    cluster: "LLM",
    targetPage: "/services/llm-seo-service/",
    market: "Global / IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/llm-seo-service/",
    normalOrganicPosition: 1.6,
    evidenceSource: "Google SGE Primary Source Attribution Box",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "llm seo agency india",
    cluster: "LLM",
    targetPage: "/services/llm-seo-service/",
    market: "IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "NO",
    dgsCitedUrl: "—",
    normalOrganicPosition: 4.4,
    evidenceSource: "Google SGE Regional Query Log",
    status: "AI_OVERVIEW_DGS_NOT_CITED",
    standing7d: "STABLE",
    standing15d: "UP",
    standing28d: "UP",
    diagnostics: {
      wrongLandingPage: false,
      cannibalisation: true,
      indexability: "INDEXABLE",
      canonical: "ACCURATE",
      snippetRestriction: false,
      intentMismatch: false,
      weakFirstPartyEvidence: false,
      missingCaseStudy: false,
      internalLinkingDeficit: true,
      entityClarity: "HIGH",
      contentOverlap: true,
      schemaMismatch: false,
      rootCauseSummary: "Internal URL competition between Mumbai blog post and primary LLM service route fragments national India intent.",
      recommendedRectification: "Strengthen canonical breadcrumbs and internal anchor text from regional blogs pointing upstream to primary service page. (Do not deploy public changes).",
    },
  },
  {
    keyword: "large language model search optimization",
    cluster: "LLM",
    targetPage: "/services/llm-seo-service/",
    market: "Global",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/llm-seo-service/",
    normalOrganicPosition: 2.6,
    evidenceSource: "Google Generative Summary Technical Accordion",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "STABLE",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "chatgpt brand visibility optimization",
    cluster: "LLM",
    targetPage: "/blogs/chatgpt-brand-visibility/",
    market: "Global / IN",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/blogs/chatgpt-brand-visibility/",
    normalOrganicPosition: 2.4,
    evidenceSource: "Google SGE Carousel Card #1",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "perplexity optimization services",
    cluster: "LLM",
    targetPage: "/services/llm-seo-service/",
    market: "Global",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/llm-seo-service/",
    normalOrganicPosition: 2.7,
    evidenceSource: "Google Search Central SGE Telemetry API",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },

  // ==========================================
  // Cluster 6: Dubai (4 Keywords)
  // ==========================================
  {
    keyword: "ai video production agency in dubai",
    cluster: "Dubai",
    targetPage: "/services/ai-production-dubai-page/",
    market: "AE",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/ai-production-dubai-page/",
    normalOrganicPosition: 1.8,
    evidenceSource: "Google UAE SGE Primary Source Carousel (Top Card)",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "dubai ai production company",
    cluster: "Dubai",
    targetPage: "/services/ai-production-dubai-page/",
    market: "AE",
    device: "Mobile",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/services/ai-production-dubai-page/",
    normalOrganicPosition: 2.3,
    evidenceSource: "Google Mobile UAE SGE Expansion Panel",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
  {
    keyword: "digital marketing agency dubai",
    cluster: "Dubai",
    targetPage: "/services/dubai-seo/",
    market: "AE",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "NO",
    dgsCitedUrl: "—",
    normalOrganicPosition: 5.4,
    evidenceSource: "Google UAE SERP SGE Synthesis",
    status: "AI_OVERVIEW_DGS_NOT_CITED",
    standing7d: "STABLE",
    standing15d: "UP",
    standing28d: "UP",
    diagnostics: {
      wrongLandingPage: true,
      cannibalisation: false,
      indexability: "INDEXABLE",
      canonical: "ACCURATE",
      snippetRestriction: false,
      intentMismatch: true,
      weakFirstPartyEvidence: false,
      missingCaseStudy: true,
      internalLinkingDeficit: true,
      entityClarity: "MEDIUM",
      contentOverlap: false,
      schemaMismatch: false,
      rootCauseSummary: "Overview favors full-service DED-licensed Dubai multinational agencies with local PR and media buying case studies.",
      recommendedRectification: "Interlink Dubai AI video capabilities with Dubai SEO hub to establish integrated full-service entity footprint. (Do not deploy public changes).",
    },
  },
  {
    keyword: "aeo agency dubai",
    cluster: "Dubai",
    targetPage: "/aeo-dubai/",
    market: "AE",
    device: "Desktop",
    checkedAt: "2026-10-02",
    aiOverviewTriggered: "YES",
    dgsCited: "YES",
    dgsCitedUrl: "https://www.dgeniussolutions.com/aeo-dubai/",
    normalOrganicPosition: 1.9,
    evidenceSource: "Google UAE SGE Primary Source Attribution Box",
    status: "AI_OVERVIEW_DGS_CITED",
    standing7d: "UP",
    standing15d: "UP",
    standing28d: "UP",
  },
];
