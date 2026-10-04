import https from "node:https";
import http from "node:http";

function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve) => {
    let redirects = 0;
    
    function makeRequest(currentUrl) {
      const client = currentUrl.startsWith("https") ? https : http;
      const req = client.get(currentUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DGS-Sitemap-Audit/1.0"
        },
        timeout: 15000
      }, (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects < maxRedirects) {
          redirects++;
          let nextUrl = res.headers.location;
          if (nextUrl.startsWith("/")) {
            const u = new URL(currentUrl);
            nextUrl = `${u.protocol}//${u.host}${nextUrl}`;
          }
          res.resume();
          return makeRequest(nextUrl);
        }

        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          const robotsMatch = body.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
          const robotsContent = robotsMatch ? robotsMatch[1] : "NONE";
          const xRobots = res.headers["x-robots-tag"] || "NONE";
          const canonicalMatch = body.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
          const canonical = canonicalMatch ? canonicalMatch[1] : "NONE";
          const titleMatch = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : "NONE";

          let pageType = "standard";
          if (url.includes("/blogs/")) pageType = "blog";
          else if (url.includes("/services/")) pageType = "service";
          else if (url.includes("/career/")) pageType = "career";
          else if (url === "https://www.dgeniussolutions.com/") pageType = "homepage";

          resolve({
            url,
            statusCode: res.statusCode,
            finalUrl: currentUrl,
            redirectCount: redirects,
            robotsMeta: robotsContent,
            xRobotsTag: xRobots,
            canonical,
            title: title.slice(0, 80),
            pageType
          });
        });
      });

      req.on("error", (err) => {
        resolve({
          url,
          statusCode: 0,
          error: err.message,
          finalUrl: currentUrl,
          redirectCount: redirects,
          robotsMeta: "ERROR",
          xRobotsTag: "ERROR",
          canonical: "ERROR",
          title: "ERROR",
          pageType: "error"
        });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({
          url,
          statusCode: 408,
          error: "Timeout",
          finalUrl: currentUrl,
          redirectCount: redirects,
          robotsMeta: "TIMEOUT",
          xRobotsTag: "TIMEOUT",
          canonical: "TIMEOUT",
          title: "TIMEOUT",
          pageType: "error"
        });
      });
    }

    makeRequest(url);
  });
}

function fetchSitemapUrls() {
  return new Promise((resolve, reject) => {
    https.get("https://www.dgeniussolutions.com/sitemap.xml", { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        const matches = data.match(/<loc>(.*?)<\/loc>/g) || [];
        resolve(matches.map(m => m.replace(/<\/?loc>/g, "").trim()));
      });
    }).on("error", reject);
  });
}

async function run() {
  console.log("Fetching sitemap.xml...");
  const sitemapUrls = await fetchSitemapUrls();
  console.log(`Total URLs found in sitemap: ${sitemapUrls.length}`);

  const results = [];
  const concurrency = 5;
  for (let i = 0; i < sitemapUrls.length; i += concurrency) {
    const chunk = sitemapUrls.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(u => fetchUrl(u)));
    results.push(...chunkResults);
    process.stdout.write(`\rAudited ${results.length}/${sitemapUrls.length}...`);
  }
  console.log("\nAudit complete!\n");

  let c200 = 0;
  let c3xx = 0;
  let c4xx = 0;
  let c5xx = 0;
  let cOther = 0;

  const non200List = [];

  for (const r of results) {
    if (r.statusCode === 200) c200++;
    else if (r.statusCode >= 300 && r.statusCode < 400) { c3xx++; non200List.push(r); }
    else if (r.statusCode >= 400 && r.statusCode < 500) { c4xx++; non200List.push(r); }
    else if (r.statusCode >= 500) { c5xx++; non200List.push(r); }
    else { cOther++; non200List.push(r); }
  }

  console.log("==================================================");
  console.log("P0 — SITEMAP STATUS AUDIT RESULTS");
  console.log("==================================================");
  console.log(`TOTAL_SITEMAP_URLS = ${results.length}`);
  console.log(`HTTP_200 = ${c200}`);
  console.log(`HTTP_3XX = ${c3xx}`);
  console.log(`HTTP_4XX = ${c4xx}`);
  console.log(`HTTP_5XX = ${c5xx}`);
  if (cOther > 0) console.log(`HTTP_OTHER = ${cOther}`);

  console.log("\n==================================================");
  console.log("ALL_NON_200_URLS:");
  console.log("==================================================");
  for (const item of non200List) {
    console.log(JSON.stringify(item, null, 2));
  }
}

run().catch(console.error);
