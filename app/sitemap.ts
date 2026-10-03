import { MetadataRoute } from "next";
import { getIndexableRoutes } from "@/lib/nextjs/routes";
import { siteConfig } from "@/lib/seo/site";
import { careerJobPath, getActiveCareerJobs } from "@/lib/careers/jobs";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listPublishedCmsBlogs, listCmsBlogsDetailed } from "@/lib/cms/blogs";
import { formatW3CDate } from "@/lib/seo/sitemap-date";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

      const formatted = formatW3CDate(route.modified);
      if (formatted) {
        entry.lastModified = formatted;
      }

      return entry;
    });

  const careerJobs: MetadataRoute.Sitemap = getActiveCareerJobs().map((job) => {
    const entry: MetadataRoute.Sitemap[number] = {
      url: `${siteConfig.url}${careerJobPath(job)}`,
    };
    const formatted = formatW3CDate(job.datePosted);
    if (formatted) {
      entry.lastModified = formatted;
    }
    return entry;
  });

  const entries: MetadataRoute.Sitemap = [...migratedRoutes, ...careerJobs];

  if (isCmsDatabaseConfigured()) {
    try {
      const cmsPublished = await listPublishedCmsBlogs(200);
      const cmsPublishedMap = new Map(
        cmsPublished.map((b) => [`${siteConfig.url}/blogs/${b.slug}/`.replace(/\/$/, ""), b])
      );

      // Identify trashed blogs to purge them even if present in static registry
      const trashed = await listCmsBlogsDetailed({ view: "trashed", limit: 100 });
      const trashedUrls = new Set(
        trashed.blogs.map((b) => `${siteConfig.url}/blogs/${b.slug}/`.replace(/\/$/, ""))
      );

      // Filter out any trashed blogs from migratedRoutes and update lastModified for published ones
      for (let i = 0; i < entries.length; i++) {
        const normUrl = entries[i].url.replace(/\/$/, "");
        if (trashedUrls.has(normUrl)) {
          entries.splice(i, 1);
          i--;
          continue;
        }
        const cmsBlog = cmsPublishedMap.get(normUrl);
        if (cmsBlog) {
          const formatted = formatW3CDate(cmsBlog.updated_at || cmsBlog.published_at);
          if (formatted) {
            entries[i].lastModified = formatted;
          }
          cmsPublishedMap.delete(normUrl);
        }
      }

      // Add any remaining published CMS blogs not previously in migratedRoutes with fail-safe guards
      for (const [_, blog] of cmsPublishedMap) {
        if (!blog.slug || typeof blog.slug !== "string" || blog.slug.trim().length === 0) continue;
        if (blog.status !== "published") continue;
        if (!blog.published_at) continue;

        const cleanSlug = blog.slug.trim().replace(/^\/+|\/+$/g, "");
        if (!/^[a-z0-9-_]+$/i.test(cleanSlug)) continue;

        const url = `${siteConfig.url}/blogs/${cleanSlug}/`;
        const entry: MetadataRoute.Sitemap[number] = { url };
        const formatted = formatW3CDate(blog.updated_at || blog.published_at);
        if (formatted) {
          entry.lastModified = formatted;
        }
        entries.push(entry);
      }
    } catch {
      // Preserve the static sitemap if the native CMS is temporarily unavailable.
    }
  }

  return entries;
}
