/**
 * Global chrome link discovery for full-site audit.
 * Preferred source: rendered homepage header/menu/footer extraction.
 * Fallback: canonical navigation constants mirrored from lib/site/navigation.ts.
 */
import { normalizePath } from "./tier0-parity-compare.mjs";

const CANONICAL_CHROME_INTERNAL_LINKS = [
  { label: "Home (header logo)", href: "/", source: "header-logo" },
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
  { label: "Privacy Policy", href: "/privacy-policy/", source: "legal-links" },
  { label: "Sitemap", href: "/sitemap/", source: "legal-links" },
];

export function extractGlobalChromeLinksFromHtml(html, target) {
  const origin = new URL(target).origin;
  const byPath = new Map();

  const sectionPatterns = [
    /<header[^>]*id=["']dgsNav["'][\s\S]*?<\/header>/i,
    /id=["']site-menu-panel["'][\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i,
    /<footer[\s\S]*?<\/footer>/i,
  ];

  for (const pattern of sectionPatterns) {
    const match = html.match(pattern);
    if (!match) continue;
    for (const hrefMatch of match[0].matchAll(/href=["']([^"'#]+)["']/gi)) {
      try {
        const url = new URL(hrefMatch[1], target);
        if (url.origin !== origin) continue;
        const path = normalizePath(url.pathname, target);
        if (!byPath.has(path)) {
          byPath.set(path, { path, anchor: path, sources: ["rendered-chrome"] });
        }
      } catch {
        /* ignore malformed href */
      }
    }
  }

  return [...byPath.values()];
}

export function deduplicatedGlobalChromeInternalLinks(html = null, target = null) {
  const extracted =
    html && target ? extractGlobalChromeLinksFromHtml(html, target) : [];
  const fallback = [];
  const seen = new Set();
  for (const link of [...extracted, ...CANONICAL_CHROME_INTERNAL_LINKS.map((l) => ({
    path: l.href,
    anchor: l.label,
    sources: [l.source],
  }))]) {
    if (seen.has(link.path)) continue;
    seen.add(link.path);
    fallback.push(link);
  }
  return fallback;
}

export const GLOBAL_CHROME_SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/d-genius-solutions/" },
  { label: "Instagram", href: "https://www.instagram.com/dgeniussolutions/" },
  { label: "Facebook", href: "https://www.facebook.com/dgeniussolutions/" },
  { label: "YouTube", href: "https://www.youtube.com/@dgeniussolutionspvtltd4060" },
  { label: "Pinterest", href: "https://in.pinterest.com/dgeniussolutions/" },
];
