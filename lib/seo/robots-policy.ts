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
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
