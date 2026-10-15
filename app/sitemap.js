import manifest from "@/data/wordpress/manifest.json";

const SITE = "https://www.dgeniussolutions.com";

export default function sitemap() {
  return manifest.routes
    .filter((r) => !r.noindex)
    .map((r) => ({
      url: `${SITE}${r.path.replace(/\/$/, "") || ""}`,
      lastModified: r.modified,
      changeFrequency: r.type === "post" ? "weekly" : "monthly",
      priority: r.path === "/" ? 1 : r.type === "service" ? 0.9 : 0.7,
    }));
}
