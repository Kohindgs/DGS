import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/site";
import { isPublicIndexingEnabled } from "@/lib/seo/environment";

const DISALLOWED_PATHS = ["/api/", "/admin/", "/wp-admin/", "/wp-login.php"];

export function stagingRobotsHeaderValue() {
  return "noindex, nofollow, noarchive";
}

export function buildRobotsManifest(): MetadataRoute.Robots {
  const publicIndexing = isPublicIndexingEnabled();

  if (!publicIndexing) {
    // Staging must not block crawlers via robots.txt when X-Robots-Tag carries noindex.
    // Password protection at the CDN/host layer is the preferred staging guard.
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
        },
      ],
    };
  }

  const crawlRules = {
    allow: "/",
    disallow: DISALLOWED_PATHS,
  };

  return {
    rules: [
      { userAgent: "*", ...crawlRules },
      { userAgent: "Googlebot", ...crawlRules },
      { userAgent: "Bingbot", ...crawlRules },
      { userAgent: "OAI-SearchBot", ...crawlRules },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
