/**
 * SEO redirect map — fixes wrong WordPress / Redirection-plugin rules.
 * Applied in next.config.js at build time.
 */
export type RedirectRule = {
  source: string;
  destination: string;
  permanent: boolean;
};

export const SEO_REDIRECTS: RedirectRule[] = [
  // Canonical host
  { source: "/index.php", destination: "/", permanent: true },
  { source: "/home", destination: "/", permanent: true },

  // AEO — single canonical URL (fixes WP canonical ↔ redirect loop)
  { source: "/services/aeo", destination: "/services/aeo-services-in-mumbai", permanent: true },
  { source: "/services/aeo-services", destination: "/services/aeo-services-in-mumbai", permanent: true },

  // AI-search cluster shortcuts → service pages (not blogs)
  { source: "/aeo", destination: "/services/aeo-services-in-mumbai", permanent: true },
  { source: "/geo", destination: "/services/geo", permanent: true },
  { source: "/llm-seo", destination: "/services/llm-seo-service", permanent: true },
  {
    source: "/services/generative-engine-optimization",
    destination: "/services/geo",
    permanent: true,
  },
  { source: "/services/llm-seo", destination: "/services/llm-seo-service", permanent: true },
  { source: "/services/llm", destination: "/services/llm-seo-service", permanent: true },

  // SEO hub fixes (wrong WP redirects)
  { source: "/seo-services", destination: "/services/seo-services-in-mumbai", permanent: true },
  { source: "/seo-services-in-mumbai", destination: "/services/seo-services-in-mumbai", permanent: true },
  { source: "/services/seo", destination: "/services/seo-services-in-mumbai", permanent: true },
  { source: "/seo", destination: "/services/seo-services-in-mumbai", permanent: true },

  // Bangalore typo → correct spelling (create page or keep until WP slug fixed)
  {
    source: "/services/seo-service-in-bangalore",
    destination: "/services/seo-service-in-banglore",
    permanent: true,
  },
  {
    source: "/services/seo-services-in-bangalore",
    destination: "/services/seo-service-in-banglore",
    permanent: true,
  },

  // City slug normalization
  {
    source: "/services/seo-services-in-pune",
    destination: "/services/seo-service-pune",
    permanent: true,
  },
  {
    source: "/services/seo-services-in-gurugram",
    destination: "/services/seo-service-in-gurugram",
    permanent: true,
  },

  // Dubai / page-suffix cleanup
  { source: "/dubai-seo", destination: "/services/dubai-seo", permanent: true },
  {
    source: "/services/ai-production-dubai",
    destination: "/services/ai-production-dubai-page",
    permanent: true,
  },
  {
    source: "/services/website-development-pune",
    destination: "/services/website-development-pune-page",
    permanent: true,
  },

  // Case studies / blogs
  { source: "/case-studies", destination: "/case_studies", permanent: true },
  { source: "/blog", destination: "/blogs", permanent: true },
  { source: "/blog/:path*", destination: "/blogs/:path*", permanent: true },

  // Landing shortcuts
  { source: "/australia", destination: "/australia-page", permanent: true },
  { source: "/us", destination: "/us-landing-page", permanent: true },
  { source: "/contact", destination: "/contact-us", permanent: true },
  { source: "/services", destination: "/our-services", permanent: false },

  // Junk
  {
    source: "/wp-file-download-search",
    destination: "/",
    permanent: true,
  },

  // Mixed-case soft duplicates
  { source: "/About-Us", destination: "/about-us", permanent: true },
  { source: "/ABOUT-US", destination: "/about-us", permanent: true },
  { source: "/Contact-Us", destination: "/contact-us", permanent: true },
];
