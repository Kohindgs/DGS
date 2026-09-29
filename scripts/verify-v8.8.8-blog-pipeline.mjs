import https from "node:https";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on("error", reject);
  });
}

async function verify() {
  console.log("=================================================================");
  console.log("DGS V8.8.8 BLOG PIPELINE LIVE VERIFICATION");
  console.log("=================================================================\n");

  const baseUrl = "https://dgeniussolutions.com";

  // 1. Sitemap Verification
  console.log("1. Checking Live XML Sitemap...");
  const sitemapRes = await fetchUrl(`${baseUrl}/sitemap.xml`);
  console.log(`- Sitemap HTTP status: ${sitemapRes.status}`);
  if (sitemapRes.status !== 200) {
    console.error("❌ Sitemap failed to load!");
  } else {
    const blogUrlsInSitemap = [...sitemapRes.body.matchAll(/<loc>(https:\/\/dgeniussolutions\.com\/blogs\/[^<]+)<\/loc>/g)].map(m => m[1]);
    console.log(`✓ Found ${blogUrlsInSitemap.length} blog URLs in sitemap`);
    
    // Check lastmod
    const lastmods = [...sitemapRes.body.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(m => m[1]);
    const validLastmods = lastmods.filter(lm => !isNaN(Date.parse(lm)));
    console.log(`✓ Valid W3C lastmod timestamps: ${validLastmods.length}/${lastmods.length}`);
  }

  // 2. Blog Archive Verification
  console.log("\n2. Checking Blog Archive Index...");
  const archiveRes = await fetchUrl(`${baseUrl}/blogs/`);
  console.log(`- Archive HTTP status: ${archiveRes.status}`);
  if (archiveRes.status === 200) {
    console.log("✓ Blog Archive loaded successfully");
  } else {
    console.warn(`⚠️ Blog Archive returned status ${archiveRes.status}`);
  }

  // 3. Sample Live Blog Pages Verification
  const sampleSlugs = [
    "future-of-digital-marketing-2026",
    "ai-video-production-dubai-trends",
    "top-digital-marketing-agency-mumbai",
    "local-seo-services-guide-2026",
  ];

  console.log("\n3. Testing Sample Blog Articles for Schema, Dates & AEO Signals...");
  for (const slug of sampleSlugs) {
    const postUrl = `${baseUrl}/blogs/${slug}/`;
    try {
      const res = await fetchUrl(postUrl);
      console.log(`\n--- Inspecting: ${slug} (HTTP ${res.status}) ---`);
      if (res.status === 404) {
        console.log(`• Post ${slug} returned 404 (may not exist or not published yet).`);
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
          // ignore parse errors for non-json scripts
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
  console.log("VERIFICATION COMPLETE");
  console.log("=================================================================");
}

verify().catch(console.error);
