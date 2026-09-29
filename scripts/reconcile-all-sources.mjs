import https from "node:https";
import fs from "node:fs";

function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location && maxRedirects > 0) {
        const redirectUrl = new URL(res.headers.location, url).href;
        return resolve(fetchUrl(redirectUrl, maxRedirects - 1));
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data, finalUrl: url }));
    }).on("error", reject);
  });
}

async function reconcile() {
  const baseUrl = "https://www.dgeniussolutions.com";

  // 1. Fetch live sitemap
  console.log("Fetching sitemap.xml...");
  const sitemapRes = await fetchUrl(`${baseUrl}/sitemap.xml`);
  const sitemapBlogUrls = [...sitemapRes.body.matchAll(/<loc>(https:\/\/www\.dgeniussolutions\.com\/blogs\/[^<]+)<\/loc>/g)].map(m => m[1]);
  const sitemapSlugs = sitemapBlogUrls.map(u => u.replace(/^https:\/\/www\.dgeniussolutions\.com\/blogs\/|\/$/g, ""));
  const sitemapSet = new Set(sitemapSlugs);

  // 2. Fetch live blog archive
  console.log("Fetching /blogs/ archive...");
  const archiveRes = await fetchUrl(`${baseUrl}/blogs/`);
  const archiveHrefs = [...archiveRes.body.matchAll(/href="\/blogs\/([^"/]+)\/?"/g)].map(m => m[1]);
  const archiveSlugs = [...new Set(archiveHrefs)].filter(s => s !== "" && s !== "blogs");
  const archiveSet = new Set(archiveSlugs);

  console.log(`\nSitemap Blog Count: ${sitemapSlugs.length}`);
  console.log(`Archive Blog Count: ${archiveSlugs.length}`);

  // Find difference between sitemap and archive
  const inSitemapNotArchive = sitemapSlugs.filter(s => !archiveSet.has(s));
  const inArchiveNotSitemap = archiveSlugs.filter(s => !sitemapSet.has(s));

  console.log("\n=== SLUGS IN SITEMAP BUT NOT IN ARCHIVE ===");
  console.log(inSitemapNotArchive);

  console.log("\n=== SLUGS IN ARCHIVE BUT NOT IN SITEMAP ===");
  console.log(inArchiveNotSitemap);

  // Check route registry
  const registryRaw = fs.readFileSync("data/migration/nextjs-route-registry.generated.json", "utf8");
  const registry = JSON.parse(registryRaw);
  const registryBlogs = registry.routes.filter(r => r.path.startsWith("/blogs/") && r.path !== "/blogs/");
  const registrySlugs = registryBlogs.map(r => r.path.replace(/^\/blogs\/|\/$/g, ""));
  const registrySet = new Set(registrySlugs);
  console.log(`\nRegistry Blog Count: ${registrySlugs.length}`);

  // Known MySQL blogs from Step 1
  const dbBlogs = [
    {
      id: "3b2532ad-8bf6-4479-91cd-51f00c34a192",
      title: "Google September 2026 Spam Update What Website Owners Should Know",
      slug: "google-september-2026-spam-update-what-website-owners-should-know",
      status: "published",
      created_at: "2026-09-29T10:33:38.000Z",
      published_at: "2026-09-29T10:34:34.000Z",
      deleted_at: null,
    },
    {
      id: "88b63ba8-91a5-4d36-a3f5-645f91f3d556",
      title: "DGS CMS Scheduled Cron QA",
      slug: "dgs-cms-scheduled-cron-qa",
      status: "published",
      created_at: "2026-09-26T20:42:18.000Z",
      published_at: "2026-09-26T22:29:33.000Z",
      deleted_at: null,
    },
    {
      id: "3d878e02-8fdf-4688-a70f-505763501957",
      title: "Google Ads for B2B Lead Generation How to Get Better Quality Leads",
      slug: "google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads",
      status: "published",
      created_at: "2026-09-25T06:11:12.000Z",
      published_at: "2026-09-25T06:12:12.000Z",
      deleted_at: null,
    }
  ];

  console.log("\n=== RECONCILIATION FOR MYSQL BLOGS ===");
  for (const b of dbBlogs) {
    const inSitemap = sitemapSet.has(b.slug);
    const inArchive = archiveSet.has(b.slug);
    const inRegistry = registrySet.has(b.slug);
    console.log(`Slug: ${b.slug}`);
    console.log(`  Title: ${b.title}`);
    console.log(`  In DB? YES (${b.status})`);
    console.log(`  In Sitemap? ${inSitemap}`);
    console.log(`  In Archive (/blogs/)? ${inArchive}`);
    console.log(`  In Route Registry? ${inRegistry}`);
  }

  // Also check each inSitemapNotArchive slug for HTTP status
  console.log("\n=== TESTING IN_SITEMAP_NOT_ARCHIVE SLUGS HTTP STATUS ===");
  for (const slug of inSitemapNotArchive) {
    const testUrl = `${baseUrl}/blogs/${slug}/`;
    const res = await fetchUrl(testUrl);
    console.log(`- ${slug}: HTTP ${res.status}`);
  }
}

reconcile().catch(console.error);
