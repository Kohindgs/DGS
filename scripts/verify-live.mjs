async function testRoute(url, expectedTitleRegex, expectedH1Regex) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "DGS-Verification-Bot/1.0" } });
    const text = await res.text();
    const titleMatch = text.match(/<title>([^<]*)<\/title>/i);
    const h1Match = text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const cleanH1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "None";
    const title = titleMatch ? titleMatch[1].trim() : "None";

    console.log(`\nURL: ${url}`);
    console.log(`Status: ${res.status}`);
    console.log(`Title: ${title}`);
    console.log(`H1: ${cleanH1}`);

    if (expectedTitleRegex && !expectedTitleRegex.test(title)) {
      console.error(`  FAIL: Title does not match ${expectedTitleRegex}`);
    } else {
      console.log(`  ✓ Title verified`);
    }

    if (expectedH1Regex && !expectedH1Regex.test(cleanH1)) {
      console.error(`  FAIL: H1 does not match ${expectedH1Regex}`);
    } else {
      console.log(`  ✓ H1 verified`);
    }
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
  }
}

async function run() {
  console.log("==================================================");
  console.log("VERIFYING LIVE PRODUCTION STATUS & RANKING ROUTES");
  console.log("==================================================");

  // 1. Homepage
  await testRoute("https://www.dgeniussolutions.com/", /D['’]Genius Solutions/i, null);

  // 2. AI Video Production (Protected intent)
  await testRoute(
    "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
    /AI Video Production Agency in Mumbai \| D['’]Genius Solutions/i,
    /AI Video Production House In Mumbai/i
  );

  // 3. SEO Services in Mumbai (Protected)
  await testRoute(
    "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
    /SEO Company in Mumbai \| SEO Agency \| D['’]Genius Solutions/i,
    /SEO Services In Mumbai/i
  );

  // 4. Performance Marketing (Protected nested span H1)
  await testRoute(
    "https://www.dgeniussolutions.com/services/performance-marketing/",
    /Performance Marketing Agency in Mumbai \| D['’]Genius Solutions/i,
    /Performance Marketing Agency in Mumbai for Qualified Leads, Sales & ROI/i
  );

  // 5. Sitemap
  const sitemapRes = await fetch("https://www.dgeniussolutions.com/sitemap.xml");
  console.log(`\nSitemap: status=${sitemapRes.status}, length=${(await sitemapRes.text()).length}`);

  // 6. llms.txt
  const llmRes = await fetch("https://www.dgeniussolutions.com/llms.txt");
  console.log(`LLMs.txt: status=${llmRes.status}, length=${(await llmRes.text()).length}`);

  console.log("\n==================================================");
  console.log("PRODUCTION VERIFICATION COMPLETE");
  console.log("==================================================");
}

run();
