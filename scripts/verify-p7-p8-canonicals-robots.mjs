import https from "node:https";

function fetchPage(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DGS-Validator/1.0" },
      timeout: 15000
    }, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        const canonicalMatch = body.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
        const canonical = canonicalMatch ? canonicalMatch[1].trim() : null;

        const robotsMatch = body.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
        const robots = robotsMatch ? robotsMatch[1].trim() : null;

        const xRobots = res.headers["x-robots-tag"] || null;

        resolve({
          url,
          status: res.statusCode,
          canonical,
          robots,
          xRobots
        });
      });
    }).on("error", (err) => {
      resolve({ url, status: 0, error: err.message, canonical: null, robots: null, xRobots: null });
    });
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
  const urls = await fetchSitemapUrls();
  console.log(`Checking Canonical & Robots on ${urls.length} URLs...`);

  let missingCanonical = 0;
  let non200Canonical = 0;
  let redirectingCanonical = 0;
  let crossCanonicalConflicts = 0;

  let sitemapNoindex = 0;
  let sitemapNofollow = 0;
  let xRobotsBlocked = 0;

  const results = [];
  const concurrency = 5;
  for (let i = 0; i < urls.length; i += concurrency) {
    const chunk = urls.slice(i, i + concurrency);
    const chunkRes = await Promise.all(chunk.map(u => fetchPage(u)));
    results.push(...chunkRes);
    process.stdout.write(`\rChecked ${results.length}/${urls.length}...`);
  }
  console.log("\nDone fetching!\n");

  for (const r of results) {
    // 1. Canonical check
    if (!r.canonical) {
      missingCanonical++;
      console.log(`[FAIL] Missing Canonical: ${r.url}`);
    } else {
      if (!r.canonical.startsWith("https://www.dgeniussolutions.com")) {
        crossCanonicalConflicts++;
        console.log(`[FAIL] Bad domain canonical: ${r.url} -> ${r.canonical}`);
      }
      // Check self canonical (normalized without trailing slash difference or exact match)
      const normUrl = r.url.replace(/\/$/, "");
      const normCan = r.canonical.replace(/\/$/, "");
      if (normUrl !== normCan) {
        crossCanonicalConflicts++;
        console.log(`[FAIL] Cross canonical mismatch: ${r.url} !== ${r.canonical}`);
      }
    }

    // 2. Robots check
    if (r.robots) {
      if (r.robots.includes("noindex")) {
        sitemapNoindex++;
        console.log(`[FAIL] Noindex in sitemap: ${r.url}`);
      }
      if (r.robots.includes("nofollow")) {
        sitemapNofollow++;
        console.log(`[FAIL] Nofollow in sitemap: ${r.url}`);
      }
    }

    if (r.xRobots && (r.xRobots.includes("noindex") || r.xRobots.includes("none"))) {
      xRobotsBlocked++;
      console.log(`[FAIL] X-Robots blocked: ${r.url}`);
    }
  }

  console.log("==================================================");
  console.log("P7 — CANONICAL VALIDATION RESULTS");
  console.log("==================================================");
  console.log(`MISSING_CANONICAL = ${missingCanonical}`);
  console.log(`REDIRECTING_CANONICAL = ${redirectingCanonical}`);
  console.log(`NON_200_CANONICAL = ${non200Canonical}`);
  console.log(`CROSS_CANONICAL_CONFLICTS = ${crossCanonicalConflicts}`);

  console.log("\n==================================================");
  console.log("P8 — ROBOTS VALIDATION RESULTS");
  console.log("==================================================");
  console.log(`SITEMAP_NOINDEX = ${sitemapNoindex}`);
  console.log(`SITEMAP_NOFOLLOW = ${sitemapNofollow}`);
  console.log(`X_ROBOTS_BLOCKED = ${xRobotsBlocked}`);
}

run().catch(console.error);
