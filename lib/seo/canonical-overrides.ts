/**
 * Canonical URL overrides — corrects WordPress Rank Math mistakes in the Next app.
 * Keys are pathname with trailing slash.
 */
export const CANONICAL_OVERRIDES: Record<string, string> = {
  "/services/aeo-services-in-mumbai/": "/services/aeo-services-in-mumbai/",
  "/services/aeo/": "/services/aeo-services-in-mumbai/",
  "/career/": "/career/",
};

/** Paths that must not be indexed in the Next mirror (even if WP allows). */
export const NOINDEX_PATHS = new Set([
  "/indriya-test/",
  "/thank-you/",
  "/wp-file-download-search/",
]);

/** Meta description overrides where WP meta is broken or too thin. */
export const META_DESC_OVERRIDES: Record<string, string> = {
  "/services/performance-marketing/":
    "Performance marketing agency in Mumbai — Google Ads, Meta Ads, lead generation, conversion tracking and ROI-focused campaigns by D'Genius Solutions.",
  "/contact-us/":
    "Contact D'Genius Solutions in Mumbai for SEO, AEO, GEO, LLM SEO, website development, branding and AI production. We respond within 24 hours.",
  "/services/":
    "Explore D'Genius Solutions services — SEO, AEO, GEO, LLM SEO, website development, performance marketing, branding, content and AI video production in Mumbai.",
};

export const SITE_URL = "https://www.dgeniussolutions.com";

export function absoluteCanonical(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withSlash = normalized.endsWith("/") ? normalized : `${normalized}/`;
  const override = CANONICAL_OVERRIDES[withSlash] ?? withSlash;
  return `${SITE_URL}${override}`;
}
