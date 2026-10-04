import https from "node:https";

const routes = [
  "/",
  "/services/ai-video-production-agency/",
  "/services/seo-services-in-mumbai/",
  "/services/aeo-services-in-mumbai/",
  "/services/geo/",
  "/services/llm-seo-service/",
  "/services/performance-marketing/",
  "/services/ai-production-dubai-page/"
];

function fetchRoute(route) {
  return new Promise((resolve, reject) => {
    const url = "https://www.dgeniussolutions.com" + route;
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        const xRobots = res.headers["x-robots-tag"] || "NONE";
        const robotsMatch = data.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
        const robotsContent = robotsMatch ? robotsMatch[1] : "NONE";
        const canonicalMatch = data.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
        const canonical = canonicalMatch ? canonicalMatch[1] : "NONE";
        resolve({
          route,
          status: res.statusCode,
          xRobots,
          robotsContent,
          canonical,
          hasIndexFollow: robotsContent.includes("index") && !robotsContent.includes("noindex"),
          hasNoIndex: robotsContent.includes("noindex"),
          hasNoFollow: robotsContent.includes("nofollow")
        });
      });
    }).on("error", reject);
  });
}

function fetchSitemap() {
  return new Promise((resolve, reject) => {
    https.get("https://www.dgeniussolutions.com/sitemap.xml", { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        resolve(data);
      });
    }).on("error", reject);
  });
}

async function run() {
  console.log("Checking sitemap.xml...");
  const sitemapXml = await fetchSitemap();
  const sitemapUrls = (sitemapXml.match(/<loc>(.*?)<\/loc>/g) || []).map(l => l.replace(/<\/?loc>/g, ""));
  console.log(`Total URLs in sitemap: ${sitemapUrls.length}`);

  console.log("\nChecking live routes...");
  let noindexCount = 0;
  let nofollowCount = 0;
  let indexFollowCount = 0;

  for (const r of routes) {
    const res = await fetchRoute(r);
    const fullUrl = "https://www.dgeniussolutions.com" + (r === "/" ? "" : r);
    const inSitemap = sitemapUrls.some(u => u === fullUrl || u === fullUrl + "/" || u + "/" === fullUrl);
    if (res.hasNoIndex) noindexCount++;
    if (res.hasNoFollow) nofollowCount++;
    if (res.hasIndexFollow) indexFollowCount++;
    console.log(`Route: ${r}`);
    console.log(`  HTTP Status: ${res.status}`);
    console.log(`  robots meta: ${res.robotsContent}`);
    console.log(`  X-Robots-Tag: ${res.xRobots}`);
    console.log(`  canonical: ${res.canonical}`);
    console.log(`  sitemap inclusion: ${inSitemap ? "YES" : "NO"}`);
  }

  console.log("\n================ SUMMARY ================");
  console.log(`TOTAL_CHECKED = ${routes.length}`);
  console.log(`NOINDEX_ROUTES = ${noindexCount}`);
  console.log(`NOFOLLOW_ROUTES = ${nofollowCount}`);
  console.log(`INDEX_FOLLOW_ROUTES = ${indexFollowCount}`);
}

run().catch(console.error);
