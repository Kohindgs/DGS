import { MetadataRoute } from "next";
import { getIndexableRoutes } from "@/lib/nextjs/routes";
import { siteConfig } from "@/lib/seo/site";
import { careerJobPath, getActiveCareerJobs } from "@/lib/careers/jobs";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listPublishedCmsBlogs } from "@/lib/cms/blogs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getIndexableRoutes();

  const migratedRoutes = routes
    .filter((route) => route.includeInSitemap)
    .map((route) => {
      const canonicalPath = route.desiredCanonicalPath || route.canonical || route.path;
      const url = canonicalPath.startsWith("http")
        ? canonicalPath
        : `${siteConfig.url}${canonicalPath}`;

      const entry: MetadataRoute.Sitemap[number] = { url };

      if (route.modified) {
        entry.lastModified = route.modified;
      }

      return entry;
    });

  const careerJobs: MetadataRoute.Sitemap = getActiveCareerJobs().map((job) => ({
    url: `${siteConfig.url}${careerJobPath(job)}`,
    lastModified: job.datePosted,
  }));

  const entries: MetadataRoute.Sitemap = [...migratedRoutes, ...careerJobs];
  if (isCmsDatabaseConfigured()) {
    try {
      const existing = new Set(entries.map((entry) => entry.url.replace(/\/$/, "")));
      for (const blog of await listPublishedCmsBlogs()) {
        const url = `${siteConfig.url}/blogs/${blog.slug}/`;
        if (!existing.has(url.replace(/\/$/, ""))) {
          entries.push({ url, lastModified: blog.updated_at });
        }
      }
    } catch {
      // Preserve the static sitemap if the native CMS is temporarily unavailable.
    }
  }

  return entries;
}
