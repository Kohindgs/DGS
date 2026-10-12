import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { siteConfig } from "@/lib/seo/site";
import { formatW3CDate } from "@/lib/seo/sitemap-date";
import { getRetiredRoute } from "@/lib/migration/retired-routes";
import { getRouteDecision } from "@/lib/migration/route-decisions";
import { getPageSeoOverride } from "@/lib/seo/page-overrides";
import { loadActiveCareerJobs, careerJobPath } from "@/lib/careers/jobs";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listPublishedCmsBlogs, listCmsBlogsDetailed } from "@/lib/cms/blogs";

export type ContentType =
  | "home"
  | "service"
  | "case-study"
  | "location"
  | "international"
  | "blog"
  | "career"
  | "company"
  | "general";

export type ServiceCluster =
  | "ai-search"
  | "creative-video"
  | "seo"
  | "web-dev"
  | "performance"
  | "branding"
  | "content"
  | "company"
  | "general";

export type Market = "IN" | "AE" | "US" | "AU" | "GLOBAL";

export type PublicRouteManifestItem = {
  path: string;
  canonical: string;
  indexable: boolean;
  includeInSitemap: boolean;
  title: string;
  description: string;
  lastModified?: string;
  contentType: ContentType;
  serviceCluster: ServiceCluster;
  market: Market;
};

const REGISTRY_PATH = path.join(process.cwd(), "data/migration/nextjs-route-registry.generated.json");
const HASH_REGISTRY_PATH = path.join(process.cwd(), "data/seo/route-content-hashes.json");

function classifyContentType(p: string): ContentType {
  if (p === "/") return "home";
  if (p.startsWith("/blogs/")) return "blog";
  if (p.startsWith("/career/")) return "career";
  if (p === "/portfolio/" || p.includes("case-study") || p === "/case_studies/") return "case-study";
  if (p.includes("banglore") || p.includes("gurugram") || p.includes("pune") || p.includes("hyderabad")) return "location";
  if (p.includes("dubai") || p.includes("australia") || p.includes("us-landing")) return "international";
  if (p.startsWith("/services/")) return "service";
  if (p === "/about-us/" || p === "/contact-us/" || p === "/our-services/" || p === "/privacy-policy/" || p === "/seo-pricing/") return "company";
  return "general";
}

function classifyServiceCluster(p: string): ServiceCluster {
  const lp = p.toLowerCase();
  if (lp.includes("aeo") || lp.includes("geo") || lp.includes("llm")) return "ai-search";
  if (lp.includes("ai-video") || lp.includes("video") || lp.includes("motion-graphics")) return "creative-video";
  if (lp.includes("seo")) return "seo";
  if (lp.includes("website") || lp.includes("web-dev") || lp.includes("amc")) return "web-dev";
  if (lp.includes("performance") || lp.includes("ads") || lp.includes("marketing-strategy")) return "performance";
  if (lp.includes("branding")) return "branding";
  if (lp.includes("content")) return "content";
  if (lp === "/" || lp === "/about-us/" || lp === "/contact-us/" || lp === "/our-services/" || lp === "/career/" || lp === "/portfolio/") return "company";
  return "general";
}

function classifyMarket(p: string): Market {
  const lp = p.toLowerCase();
  if (lp.includes("dubai")) return "AE";
  if (lp.includes("us-landing")) return "US";
  if (lp.includes("australia")) return "AU";
  if (lp.includes("mumbai") || lp.includes("banglore") || lp.includes("pune") || lp.includes("hyderabad") || lp.includes("gurugram")) return "IN";
  return "GLOBAL";
}

let manifestCache: { items: PublicRouteManifestItem[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60000; // 1 minute in memory

export async function getPublicRouteManifest(forceFresh = false): Promise<PublicRouteManifestItem[]> {
  if (!forceFresh && manifestCache && Date.now() - manifestCache.timestamp < CACHE_TTL_MS) {
    return manifestCache.items;
  }

  // 1. Load static registry & freshness hashes
  const [rawRegistry, rawHashes] = await Promise.all([
    readFile(REGISTRY_PATH, "utf8").then((c) => JSON.parse(c)).catch(() => ({ routes: [] })),
    readFile(HASH_REGISTRY_PATH, "utf8").then((c) => JSON.parse(c)).catch(() => ({})),
  ]);

  const items: PublicRouteManifestItem[] = [];
  const seenPaths = new Set<string>();

  // 2. Process migrated routes
  for (const r of rawRegistry.routes || []) {
    if (getRetiredRoute(r.path)) continue;

    const decision = getRouteDecision(r.path);
    const seoOverride = getPageSeoOverride(r.path);
    const isIndexable = decision?.indexable ?? r.indexable;
    const includeInSitemap =
      r.includeInSitemap &&
      (r.proposedAction === "KEEP_SAME_URL" || r.proposedAction === "PROTECTED") &&
      isIndexable;

    const canonicalPath = decision?.canonicalPath || r.desiredCanonicalPath || r.canonical || r.path;
    const canonical = canonicalPath.startsWith("http")
      ? canonicalPath
      : `${siteConfig.url}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;

    const title = seoOverride?.title || r.title || "";
    const description = seoOverride?.description || r.description || "";

    // Reliable freshness: check hash registry first, then fallback to authentic registry date (omit if unproven)
    const hashEntry = rawHashes[r.path];
    const sourceDate = formatW3CDate(r.modified);
    const lastModified = hashEntry?.lastModified || (sourceDate && sourceDate <= "2026-10-12" ? sourceDate : undefined);

    const item: PublicRouteManifestItem = {
      path: r.path,
      canonical,
      indexable: isIndexable,
      includeInSitemap,
      title,
      description,
      contentType: classifyContentType(r.path),
      serviceCluster: classifyServiceCluster(r.path),
      market: classifyMarket(r.path),
    };
    if (lastModified) {
      item.lastModified = lastModified;
    }

    items.push(item);
    seenPaths.add(r.path);
  }

  // 3. Process Active Career Roles
  try {
    const activeJobs = await loadActiveCareerJobs();
    for (const job of activeJobs) {
      if (!job.active) continue;
      const cPath = careerJobPath(job);
      if (seenPaths.has(cPath)) continue;

      items.push({
        path: cPath,
        canonical: `${siteConfig.url}${cPath}`,
        indexable: true,
        includeInSitemap: true,
        title: `${job.title} | Careers at D'Genius Solutions`,
        description: job.summary,
        lastModified: formatW3CDate(job.datePosted) || "2026-10-06",
        contentType: "career",
        serviceCluster: "company",
        market: "IN",
      });
      seenPaths.add(cPath);
    }
  } catch (careerErr) {
    console.warn("Could not load career jobs for route manifest:", careerErr);
  }

  // 4. Process Native CMS Published Blogs & Purge Trashed Blogs
  if (isCmsDatabaseConfigured()) {
    try {
      const [cmsPublished, trashedData] = await Promise.all([
        listPublishedCmsBlogs(500),
        listCmsBlogsDetailed({ view: "trashed", limit: 200 }).catch(() => ({ blogs: [] })),
      ]);

      const trashedSlugs = new Set(
        (trashedData.blogs || []).map((b) => b.slug.toLowerCase().trim())
      );

      // Remove any trashed blogs that were in the static migrated items
      for (let i = 0; i < items.length; i++) {
        if (items[i].contentType === "blog") {
          const slug = items[i].path.replace(/^\/blogs\/|\/$/g, "").toLowerCase().trim();
          if (trashedSlugs.has(slug)) {
            items.splice(i, 1);
            i--;
          }
        }
      }

      // Add or update dynamically published CMS blogs
      for (const blog of cmsPublished) {
        if (!blog.slug || blog.status !== "published" || !blog.published_at) continue;
        const cleanSlug = blog.slug.trim().replace(/^\/+|\/+$/g, "");
        if (trashedSlugs.has(cleanSlug.toLowerCase())) continue;

        const bPath = `/blogs/${cleanSlug}/`;
        const existingIdx = items.findIndex((it) => it.path === bPath);
        const lastMod = formatW3CDate(blog.updated_at || blog.published_at) || undefined;

        if (existingIdx !== -1) {
          if (lastMod) items[existingIdx].lastModified = lastMod;
          items[existingIdx].title = blog.title;
          items[existingIdx].description = blog.excerpt || items[existingIdx].description;
        } else {
          const blogItem: PublicRouteManifestItem = {
            path: bPath,
            canonical: `${siteConfig.url}${bPath}`,
            indexable: true,
            includeInSitemap: true,
            title: blog.title,
            description: blog.excerpt || "",
            contentType: "blog",
            serviceCluster: classifyServiceCluster(cleanSlug),
            market: "GLOBAL",
          };
          if (lastMod) {
            blogItem.lastModified = lastMod;
          }
          items.push(blogItem);
        }
      }
    } catch (cmsErr) {
      console.warn("Could not synchronize CMS blogs in route manifest:", cmsErr);
    }
  }

  manifestCache = { items, timestamp: Date.now() };
  return items;
}

export async function getSitemapRoutes(): Promise<PublicRouteManifestItem[]> {
  const all = await getPublicRouteManifest();
  return all.filter((r) => r.includeInSitemap && r.indexable);
}

export async function getManifestRoutesByCluster(): Promise<Record<ServiceCluster, PublicRouteManifestItem[]>> {
  const all = await getPublicRouteManifest();
  const clusters: Record<ServiceCluster, PublicRouteManifestItem[]> = {
    "ai-search": [],
    "creative-video": [],
    seo: [],
    "web-dev": [],
    performance: [],
    branding: [],
    content: [],
    company: [],
    general: [],
  };

  for (const item of all) {
    if (clusters[item.serviceCluster]) {
      clusters[item.serviceCluster].push(item);
    }
  }

  return clusters;
}

export async function getManifestRoutesByType(): Promise<Record<ContentType, PublicRouteManifestItem[]>> {
  const all = await getPublicRouteManifest();
  const types: Record<ContentType, PublicRouteManifestItem[]> = {
    home: [],
    service: [],
    "case-study": [],
    location: [],
    international: [],
    blog: [],
    career: [],
    company: [],
    general: [],
  };

  for (const item of all) {
    if (types[item.contentType]) {
      types[item.contentType].push(item);
    }
  }

  return types;
}
