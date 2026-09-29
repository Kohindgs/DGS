import https from "node:https";

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

async function verify() {
  console.log("=================================================================");
  console.log("DGS V8.8.8 BLOG PIPELINE LIVE HTTPS VERIFICATION");
  console.log("=================================================================\n");

  const baseUrl = "https://www.dgeniussolutions.com";

  // 1. Sitemap Verification
  console.log("1. Checking Live XML Sitemap...");
  const sitemapRes = await fetchUrl(`${baseUrl}/sitemap.xml`);
  console.log(`- Sitemap HTTP status: ${sitemapRes.status} (URL: ${sitemapRes.finalUrl})`);
  if (sitemapRes.status !== 200) {
    console.error("❌ Sitemap failed to load!");
  } else {
    const blogUrlsInSitemap = [...sitemapRes.body.matchAll(/<loc>(https:\/\/www\.dgeniussolutions\.com\/blogs\/[^<]+)<\/loc>/g)].map(m => m[1]);
    console.log(`✓ Found ${blogUrlsInSitemap.length} blog URLs in sitemap`);
    
    // Check lastmod
    const lastmods = [...sitemapRes.body.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(m => m[1]);
    const validLastmods = lastmods.filter(lm => !isNaN(Date.parse(lm)));
    console.log(`✓ Valid W3C lastmod timestamps: ${validLastmods.length}/${lastmods.length}`);
    if (blogUrlsInSitemap.length > 0) {
      console.log(`  Sample blog URL in sitemap: ${blogUrlsInSitemap[0]}`);
    }
  }

  // 2. Blog Archive Verification
  console.log("\n2. Checking Blog Archive Index (/blogs/)...");
  const archiveRes = await fetchUrl(`${baseUrl}/blogs/`);
  console.log(`- Archive HTTP status: ${archiveRes.status}`);
  if (archiveRes.status === 200) {
    console.log("✓ Blog Archive loaded successfully");
    const cards = [...archiveRes.body.matchAll(/href="\/blogs\/([^"/]+)\/?"/g)].map(m => m[1]);
    const uniqueCards = [...new Set(cards)];
    console.log(`✓ Detected ${uniqueCards.length} unique blog links in archive`);
  } else {
    console.warn(`⚠️ Blog Archive returned status ${archiveRes.status}`);
  }

  // 3. Test Native MySQL CMS Published Blogs + Static Registry Blogs
  const sampleSlugs = [
    // Native CMS Blogs (MySQL)
    "google-september-2026-spam-update-what-website-owners-should-know",
    "google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads",
    "dgs-cms-scheduled-cron-qa",
    // Static Route Registry Blogs
    "seo-company-in-mumbai",
    "google-ads-ai-max-2026",
    "aeo-in-2026",
  ];

  console.log("\n3. Testing Blog Articles for Visible Dates (<time>), Schema & AEO Signals...");
  for (const slug of sampleSlugs) {
    const postUrl = `${baseUrl}/blogs/${slug}/`;
    try {
      const res = await fetchUrl(postUrl);
      console.log(`\n--- Inspecting: ${slug} (HTTP ${res.status}) ---`);
      if (res.status === 404) {
        console.log(`• Post ${slug} returned 404.`);
        continue;
      }
      if (res.status !== 200) {
        console.log(`• Post returned status ${res.status}`);
        continue;
      }

      // Check visible <time> tags
      const timeMatches = [...res.body.matchAll(/<time[^>]*dateTime="([^"]*)"[^>]*>([\s\S]*?)<\/time>/gi)];
      if (timeMatches.length > 0) {
        console.log(`✓ Visible <time> tag detected: ${timeMatches.map(m => `dateTime="${m[1]}" [${m[2].trim()}]`).join(", ")}`);
      } else {
        console.warn(`⚠️ No visible <time dateTime="..."> tag found in HTML!`);
      }

      // Check schema JSON-LD scripts
      const jsonLdMatches = [...res.body.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
      let foundArticleSchema = false;
      let foundBreadcrumbSchema = false;

      for (const m of jsonLdMatches) {
        try {
          const parsed = JSON.parse(m[1]);
          const schemas = Array.isArray(parsed) ? parsed : [parsed];
          for (const s of schemas) {
            if (s["@type"] === "BlogPosting" || s["@type"] === "Article") {
              foundArticleSchema = true;
              console.log(`✓ Article Schema found:`);
              console.log(`  - @type: ${s["@type"]}`);
              console.log(`  - headline: ${s.headline}`);
              console.log(`  - datePublished: ${s.datePublished}`);
              console.log(`  - dateModified: ${s.dateModified}`);
              console.log(`  - author: ${JSON.stringify(s.author)}`);
              console.log(`  - publisher: ${s.publisher?.name}`);
              console.log(`  - mainEntityOfPage: ${JSON.stringify(s.mainEntityOfPage)}`);
            }
            if (s["@type"] === "BreadcrumbList") {
              foundBreadcrumbSchema = true;
              console.log(`✓ BreadcrumbList Schema found (${s.itemListElement?.length || 0} items)`);
            }
          }
        } catch {
          // ignore parse errors
        }
      }

      if (!foundArticleSchema) {
        console.warn(`⚠️ No BlogPosting/Article schema found in JSON-LD!`);
      }
      if (!foundBreadcrumbSchema) {
        console.warn(`⚠️ No BreadcrumbList schema found in JSON-LD!`);
      }
    } catch (err) {
      console.error(`Error testing ${slug}:`, err.message);
    }
  }

  console.log("\n=================================================================");
  console.log("LIVE VERIFICATION COMPLETE");
  console.log("=================================================================");
}

verify().catch(console.error);
