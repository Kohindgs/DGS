import type { MetadataRoute } from "next";
import { siteConfig } from "./site";
import { isPublicIndexingEnabled } from "./environment";

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

  const searchDiscoveryCrawlers = [
    "*",
    "Googlebot",
    "Bingbot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Claude-SearchBot",
    "Claude-User",
  ];

  const aiTrainingCrawlers = [
    "GPTBot",
    "ClaudeBot",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
    "Bytespider",
  ];

  const allConfiguredAgents = [...searchDiscoveryCrawlers, ...aiTrainingCrawlers];

  return {
    rules: allConfiguredAgents.map((userAgent) => ({
      userAgent,
      ...crawlRules,
    })),
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
