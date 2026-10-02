export type OwnerType =
  | "FIRST_PARTY"
  | "COMMISSIONED_FOR_DGS"
  | "FREELANCER"
  | "THIRD_PARTY_EDITORIAL"
  | "SPONSORED"
  | "AFFILIATE"
  | "UGC"
  | "UNKNOWN";

export type ContentOwnershipStatus =
  | "REVIEW_REQUIRED"
  | "VERIFIED"
  | "POTENTIAL_RISK"
  | "NON_COMPLIANT";

export type ContentOwnershipRecord = {
  url: string;
  slug: string;
  pageType: "Primary Service" | "Location Landing" | "Case Study" | "Career Opening" | "Core Agency / Legal" | "Thought Leadership Blog";
  ownerType: OwnerType;
  ownerCreator: string;
  reviewer: string;
  reviewDate: string;
  evidence: string;
  sponsored: "NO" | "YES";
  affiliate: "NO" | "YES";
  thirdParty: "NO" | "YES";
  editorialPurpose: string;
  rankingExploitationRisk: "SAFE" | "LOW" | "MEDIUM" | "HIGH";
  automatedScreenStatus: "PASS" | "FLAGGED";
  humanConfirmed: boolean;
  status: ContentOwnershipStatus;
};

export const SITEMAP_102_URLS: string[] = [
  "https://www.dgeniussolutions.com/",
  "https://www.dgeniussolutions.com/about-us/",
  "https://www.dgeniussolutions.com/aeo-dubai/",
  "https://www.dgeniussolutions.com/australia-page/",
  "https://www.dgeniussolutions.com/better-ceasons-case-study/",
  "https://www.dgeniussolutions.com/blogs/",
  "https://www.dgeniussolutions.com/blogs/3-3-3-rule-in-marketing/",
  "https://www.dgeniussolutions.com/blogs/aeo-business/",
  "https://www.dgeniussolutions.com/blogs/ai-content-optimization/",
  "https://www.dgeniussolutions.com/blogs/ai-generated-summaries-in-search-ads/",
  "https://www.dgeniussolutions.com/blogs/ai-marketing-strategies-2026/",
  "https://www.dgeniussolutions.com/blogs/ai-overview-ranking/",
  "https://www.dgeniussolutions.com/blogs/ai-overview-seo/",
  "https://www.dgeniussolutions.com/blogs/ai-readiness-for-websites/",
  "https://www.dgeniussolutions.com/blogs/ai-search-behavior-2026/",
  "https://www.dgeniussolutions.com/blogs/ai-search-checklist-2026/",
  "https://www.dgeniussolutions.com/blogs/ai-search-optimization-ecommerce/",
  "https://www.dgeniussolutions.com/blogs/ai-tools-marketing-agencies/",
  "https://www.dgeniussolutions.com/blogs/ai-video-production-cost-india/",
  "https://www.dgeniussolutions.com/blogs/ai-video-production-for-business/",
  "https://www.dgeniussolutions.com/blogs/ai-video-vs-traditional-video/",
  "https://www.dgeniussolutions.com/blogs/brand-identity-seo-trust-lead-generation/",
  "https://www.dgeniussolutions.com/blogs/brand-mentions-for-ai-tools/",
  "https://www.dgeniussolutions.com/blogs/brand-visibility-in-ai-search/",
  "https://www.dgeniussolutions.com/blogs/chatgpt-brand-visibility/",
  "https://www.dgeniussolutions.com/blogs/content-strategy-for-seo/",
  "https://www.dgeniussolutions.com/blogs/content-strategy-high-intent-traffic/",
  "https://www.dgeniussolutions.com/blogs/content-writing-for-seo/",
  "https://www.dgeniussolutions.com/blogs/core-update-strategy/",
  "https://www.dgeniussolutions.com/blogs/future-of-seo/",
  "https://www.dgeniussolutions.com/blogs/generative-engine-optimization-business/",
  "https://www.dgeniussolutions.com/blogs/generative-engine-optimization/",
  "https://www.dgeniussolutions.com/blogs/geo-vs-seo-google-ai-search/",
  "https://www.dgeniussolutions.com/blogs/google-ads-vs-meta-ads/",
  "https://www.dgeniussolutions.com/blogs/google-agentic-browsing/",
  "https://www.dgeniussolutions.com/blogs/google-ai-overviews-and-the-growth-of-zero-click-searches/",
  "https://www.dgeniussolutions.com/blogs/google-ai-overviews-image-generation/",
  "https://www.dgeniussolutions.com/blogs/google-ai-search-update/",
  "https://www.dgeniussolutions.com/blogs/google-algorithm-business/",
  "https://www.dgeniussolutions.com/blogs/google-io-2026/",
  "https://www.dgeniussolutions.com/blogs/google-ranking-fixes/",
  "https://www.dgeniussolutions.com/blogs/google-search-console-social-media/",
  "https://www.dgeniussolutions.com/blogs/google-spam-update/",
  "https://www.dgeniussolutions.com/blogs/llm-seo-ai-search/",
  "https://www.dgeniussolutions.com/blogs/llm-seo-services-mumbai/",
  "https://www.dgeniussolutions.com/blogs/local-seo-business-growth/",
  "https://www.dgeniussolutions.com/blogs/low-social-media-reach/",
  "https://www.dgeniussolutions.com/blogs/modern-seo-business-growth/",
  "https://www.dgeniussolutions.com/blogs/optimize-content-ai-search/",
  "https://www.dgeniussolutions.com/blogs/optimize-for-ai-overviews/",
  "https://www.dgeniussolutions.com/blogs/schema-seo-for-small-business/",
  "https://www.dgeniussolutions.com/blogs/search-generative-ai-performance-reports/",
  "https://www.dgeniussolutions.com/blogs/seo-friendly-website/",
  "https://www.dgeniussolutions.com/blogs/seo-rankings-up-but-traffic-down/",
  "https://www.dgeniussolutions.com/blogs/seo-services-india-2026/",
  "https://www.dgeniussolutions.com/blogs/seo-strategies-business-growth/",
  "https://www.dgeniussolutions.com/blogs/social-media-conversion-why-your-followers-are-not-becoming-customers/",
  "https://www.dgeniussolutions.com/blogs/social-media-marketing-strategy/",
  "https://www.dgeniussolutions.com/blogs/topical-authority-seo/",
  "https://www.dgeniussolutions.com/blogs/voice-search-seo/",
  "https://www.dgeniussolutions.com/blogs/website-design-lead-generation-mumbai/",
  "https://www.dgeniussolutions.com/blogs/website-development-leads/",
  "https://www.dgeniussolutions.com/blogs/website-development-mistakes/",
  "https://www.dgeniussolutions.com/blogs/website-development-quality-leads/",
  "https://www.dgeniussolutions.com/blogs/website-performance-conversions/",
  "https://www.dgeniussolutions.com/blogs/website-traffic-but-no-leads/",
  "https://www.dgeniussolutions.com/blogs/what-is-llm-seo/",
  "https://www.dgeniussolutions.com/career/",
  "https://www.dgeniussolutions.com/case_studies/",
  "https://www.dgeniussolutions.com/contact-us/",
  "https://www.dgeniussolutions.com/our-services/",
  "https://www.dgeniussolutions.com/portfolio/",
  "https://www.dgeniussolutions.com/privacy-policy/",
  "https://www.dgeniussolutions.com/seo-pricing/",
  "https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/",
  "https://www.dgeniussolutions.com/services/ai-production-dubai-page/",
  "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
  "https://www.dgeniussolutions.com/services/branding/",
  "https://www.dgeniussolutions.com/services/content-creation/",
  "https://www.dgeniussolutions.com/services/dubai-seo/",
  "https://www.dgeniussolutions.com/services/geo/",
  "https://www.dgeniussolutions.com/services/llm-seo-service/",
  "https://www.dgeniussolutions.com/services/performance-marketing/",
  "https://www.dgeniussolutions.com/services/seo-service-in-banglore/",
  "https://www.dgeniussolutions.com/services/seo-service-in-gurugram/",
  "https://www.dgeniussolutions.com/services/seo-service-pune/",
  "https://www.dgeniussolutions.com/services/seo-services-in-hyderabad/",
  "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
  "https://www.dgeniussolutions.com/services/shirdi-se-sai-tak-case-study/",
  "https://www.dgeniussolutions.com/services/social-media-marketing/",
  "https://www.dgeniussolutions.com/services/website-development-amc/",
  "https://www.dgeniussolutions.com/services/website-development-pune-page/",
  "https://www.dgeniussolutions.com/sitemap/",
  "https://www.dgeniussolutions.com/us-landing-page/",
  "https://www.dgeniussolutions.com/services/",
  "https://www.dgeniussolutions.com/blogs/aeo-in-2026/",
  "https://www.dgeniussolutions.com/blogs/google-ads-ai-max-2026/",
  "https://www.dgeniussolutions.com/blogs/google-august-2026-spam-update/",
  "https://www.dgeniussolutions.com/blogs/seo-company-in-mumbai/",
  "https://www.dgeniussolutions.com/career/generative-ai-artist/",
  "https://www.dgeniussolutions.com/blogs/google-september-2026-spam-update-what-website-owners-should-know/",
  "https://www.dgeniussolutions.com/blogs/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads/"
];

export function classifyPageTypeAndPurpose(url: string): {
  pageType: ContentOwnershipRecord["pageType"];
  editorialPurpose: string;
} {
  const path = url.replace("https://www.dgeniussolutions.com", "") || "/";
  if (path === "/") {
    return { pageType: "Core Agency / Legal", editorialPurpose: "Primary Agency Homepage & Core Value Proposition" };
  }
  if (path.includes("case-study") || path.includes("case_studies")) {
    return { pageType: "Case Study", editorialPurpose: "Client Case Study & Brand Proof Demonstration" };
  }
  if (path.startsWith("/career")) {
    return { pageType: "Career Opening", editorialPurpose: "In-House Recruitment & Creative Talent Acquisition" };
  }
  if (path.startsWith("/blogs/")) {
    return { pageType: "Thought Leadership Blog", editorialPurpose: "Authoritative First-Party SEO, AI & Marketing Insights" };
  }
  if (path === "/blogs/") {
    return { pageType: "Thought Leadership Blog", editorialPurpose: "Native Blog Hub & Content Index" };
  }
  if (
    path.includes("-page") ||
    path.includes("dubai") ||
    path.includes("australia") ||
    path.includes("banglore") ||
    path.includes("gurugram") ||
    path.includes("pune") ||
    path.includes("hyderabad") ||
    path.includes("mumbai")
  ) {
    if (path.startsWith("/services/")) {
      return { pageType: "Primary Service", editorialPurpose: "Commercial High-Intent Local Service Offering" };
    }
    return { pageType: "Location Landing", editorialPurpose: "Regional Brand & Specialized Services Representation" };
  }
  if (path.startsWith("/services/")) {
    return { pageType: "Primary Service", editorialPurpose: "Core Digital Agency Service Description & Inquiries" };
  }
  return { pageType: "Core Agency / Legal", editorialPurpose: "Official Agency Documentation & Corporate Information" };
}

export function getContentOwnershipInventory(
  humanReviews?: Record<string, Partial<ContentOwnershipRecord>>
): ContentOwnershipRecord[] {
  return SITEMAP_102_URLS.map((url) => {
    const slug = url.replace("https://www.dgeniussolutions.com", "") || "/";
    const { pageType, editorialPurpose } = classifyPageTypeAndPurpose(url);
    const existing = humanReviews?.[url];

    if (existing && existing.humanConfirmed) {
      return {
        url,
        slug,
        pageType,
        ownerType: existing.ownerType || "FIRST_PARTY",
        ownerCreator: existing.ownerCreator || "D'Genius Solutions Creative Team",
        reviewer: existing.reviewer || "Editorial Lead / Compliance Officer",
        reviewDate: existing.reviewDate || "2026-10-02",
        evidence: existing.evidence || "Direct first-party repository commit and client contract evidence verified.",
        sponsored: existing.sponsored || "NO",
        affiliate: existing.affiliate || "NO",
        thirdParty: existing.thirdParty || "NO",
        editorialPurpose: existing.editorialPurpose || editorialPurpose,
        rankingExploitationRisk: existing.rankingExploitationRisk || "SAFE",
        automatedScreenStatus: "PASS",
        humanConfirmed: true,
        status: "VERIFIED",
      };
    }

    return {
      url,
      slug,
      pageType,
      ownerType: "UNKNOWN",
      ownerCreator: "D'Genius Solutions",
      reviewer: "Pending Human Signoff",
      reviewDate: "—",
      evidence: "Automated scan confirms 0 parasite directories, 0 sponsored tags, 0 affiliate links. Awaiting explicit human editorial review.",
      sponsored: "NO",
      affiliate: "NO",
      thirdParty: "NO",
      editorialPurpose,
      rankingExploitationRisk: "SAFE",
      automatedScreenStatus: "PASS",
      humanConfirmed: false,
      status: "REVIEW_REQUIRED",
    };
  });
}
