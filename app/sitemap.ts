import { MetadataRoute } from "next";
import { getSitemapRoutes } from "@/lib/seo/public-route-manifest";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getSitemapRoutes();

  return routes.map((r) => {
    const entry: MetadataRoute.Sitemap[number] = {
      url: r.canonical,
    };
    if (r.lastModified) {
      entry.lastModified = r.lastModified;
    }
    return entry;
  });
}
