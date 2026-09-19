import { MetadataRoute } from "next";
import { getIndexableRoutes } from "@/lib/nextjs/routes";
import { siteConfig } from "@/lib/seo/site";
import { careerJobPath, getActiveCareerJobs } from "@/lib/careers/jobs";

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

  return [...migratedRoutes, ...careerJobs];
}
