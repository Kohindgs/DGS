import { MetadataRoute } from "next";
import { getIndexableRoutes } from "@/lib/nextjs/routes";
import { siteConfig } from "@/lib/seo/site";
import { careerJobPath, getActiveCareerJobs } from "@/lib/careers/jobs";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listPublishedCmsBlogs } from "@/lib/cms/blogs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatW3CDate(rawDate?: string | Date | null): string | undefined {
  if (!rawDate) return undefined;
  if (rawDate instanceof Date) {
    return isNaN(rawDate.getTime()) ? undefined : rawDate.toISOString().slice(0, 10);
  }
  const str = String(rawDate).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    const d = new Date(match[1]);
    if (!isNaN(d.getTime())) return match[1];
  }
  return undefined;
}

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
      const existing = new Set(entries.map((entry) => entry.url.replace(/\/$/, "")));
      for (const blog of await listPublishedCmsBlogs()) {
        const url = `${siteConfig.url}/blogs/${blog.slug}/`;
        if (!existing.has(url.replace(/\/$/, ""))) {
          const entry: MetadataRoute.Sitemap[number] = { url };
          const formatted = formatW3CDate(blog.updated_at || blog.published_at);
          if (formatted) {
            entry.lastModified = formatted;
          }
          entries.push(entry);
        }
      }
    } catch {
      // Preserve the static sitemap if the native CMS is temporarily unavailable.
    }
  }

  return entries;
}
