/**
 * Deduplicated internal links from shared site chrome (header, mobile nav, footer, CTA).
 * Keep in sync with lib/site/navigation.ts and layout chrome components.
 */
export const GLOBAL_CHROME_INTERNAL_LINKS = [
  { label: "Home (header logo)", href: "/", source: "header-logo" },
  { label: "Home (footer logo)", href: "/", source: "footer-logo" },
  { label: "Home", href: "/", source: "top-level-nav" },
  { label: "About Us", href: "/about-us/", source: "top-level-nav" },
  { label: "Our Services", href: "/services/", source: "top-level-nav" },
  { label: "Portfolio", href: "/portfolio/", source: "top-level-nav" },
  { label: "Case Studies", href: "/case_studies/", source: "top-level-nav" },
  { label: "Blogs", href: "/blogs/", source: "top-level-nav" },
  { label: "Careers", href: "/career/", source: "top-level-nav" },
  { label: "Contact Us", href: "/contact-us/", source: "top-level-nav" },
  { label: "Start a Project", href: "/contact-us/", source: "mobile-cta" },
  { label: "AI Video Production", href: "/services/ai-video-production-agency/", source: "service-nav" },
  { label: "SEO", href: "/services/seo-services-in-mumbai/", source: "service-nav" },
  { label: "AEO", href: "/services/aeo-services-in-mumbai/", source: "service-nav" },
  { label: "GEO", href: "/services/geo/", source: "service-nav" },
  { label: "LLM SEO", href: "/services/llm-seo-service/", source: "service-nav" },
  { label: "Social Media", href: "/services/social-media-marketing/", source: "service-nav" },
  { label: "Performance Marketing", href: "/services/performance-marketing/", source: "service-nav" },
  { label: "Website Dev", href: "/services/website-development-amc/", source: "service-nav" },
  { label: "Branding", href: "/services/branding/", source: "service-nav" },
  { label: "Content Creation", href: "/services/content-creation/", source: "service-nav" },
  { label: "Contact", href: "/contact-us/", source: "footer-quick-links" },
  { label: "SEO Services", href: "/services/seo-services-in-mumbai/", source: "footer-services" },
  { label: "Website Development", href: "/services/website-development-amc/", source: "footer-services" },
  { label: "Social Media Marketing", href: "/services/social-media-marketing/", source: "footer-services" },
  { label: "Performance Marketing", href: "/services/performance-marketing/", source: "footer-services" },
  { label: "AI Video Production", href: "/services/ai-video-production-agency/", source: "footer-services" },
  { label: "Content Creation", href: "/services/content-creation/", source: "footer-services" },
  { label: "Branding", href: "/services/branding/", source: "footer-services" },
  { label: "AEO Services", href: "/services/aeo-services-in-mumbai/", source: "footer-services" },
  { label: "GEO Services", href: "/services/geo/", source: "footer-services" },
  { label: "LLM SEO Services", href: "/services/llm-seo-service/", source: "footer-services" },
  { label: "Privacy Policy", href: "/privacy-policy/", source: "legal-links" },
  { label: "Sitemap", href: "/sitemap/", source: "legal-links" },
];

export function deduplicatedGlobalChromeInternalLinks() {
  const seen = new Set();
  const links = [];
  for (const link of GLOBAL_CHROME_INTERNAL_LINKS) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    links.push({ path: link.href, anchor: link.label, sources: [link.source] });
  }
  return links;
}

export const GLOBAL_CHROME_SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/d-genius-solutions/" },
  { label: "Instagram", href: "https://www.instagram.com/dgeniussolutions/" },
  { label: "Facebook", href: "https://www.facebook.com/dgeniussolutions/" },
  { label: "YouTube", href: "https://www.youtube.com/@dgeniussolutionspvtltd4060" },
  { label: "Pinterest", href: "https://in.pinterest.com/dgeniussolutions/" },
];
