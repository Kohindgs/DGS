import https from "node:https";

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        ...options.headers,
      },
      method: options.method || "GET",
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function run() {
  console.log("==================================================================");
  console.log("  LIVE PRODUCTION POST-DEPLOY VERIFICATION");
  console.log("  Target: https://www.dgeniussolutions.com");
  console.log("==================================================================\n");

  const results = [];

  // TEST 1: Redirects
  console.log("1. Testing 301/308 Redirects for old Web Dev URLs...");
  const r1 = await fetchUrl("https://www.dgeniussolutions.com/services/website-design-development/");
  const r1Pass = (r1.statusCode === 301 || r1.statusCode === 308) && (r1.headers.location === "/services/website-development-amc/" || r1.headers.location === "https://www.dgeniussolutions.com/services/website-development-amc/");
  console.log(`   /services/website-design-development/ -> status: ${r1.statusCode}, location: ${r1.headers.location} [${r1Pass ? "PASS" : "FAIL"}]`);
  results.push({ test: "Redirect /services/website-design-development/", pass: r1Pass, detail: `${r1.statusCode} -> ${r1.headers.location}` });

  const r2 = await fetchUrl("https://www.dgeniussolutions.com/website-design-development/");
  const r2Pass = (r2.statusCode === 301 || r2.statusCode === 308) && (r2.headers.location === "/services/website-development-amc/" || r2.headers.location === "https://www.dgeniussolutions.com/services/website-development-amc/");
  console.log(`   /website-design-development/ -> status: ${r2.statusCode}, location: ${r2.headers.location} [${r2Pass ? "PASS" : "FAIL"}]`);
  results.push({ test: "Redirect /website-design-development/", pass: r2Pass, detail: `${r2.statusCode} -> ${r2.headers.location}` });

  // TEST 2: Web Dev Page Title, H1, FAQ Schema
  console.log("\n2. Testing /services/website-development-amc/ Title, H1, JSON-LD...");
  const webdev = await fetchUrl("https://www.dgeniussolutions.com/services/website-development-amc/");
  const wdTitleMatch = webdev.body.match(/<title>(.*?)<\/title>/i);
  const wdTitle = wdTitleMatch ? wdTitleMatch[1] : "";
  const wdTitlePass = wdTitle.includes("Web Development Agency in Mumbai");
  console.log(`   Title: "${wdTitle}" [${wdTitlePass ? "PASS" : "FAIL"}]`);
  results.push({ test: "Web Dev Title contains 'Web Development Agency in Mumbai'", pass: wdTitlePass, detail: wdTitle });

  const wdH1Match = webdev.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const wdH1 = wdH1Match ? wdH1Match[1].replace(/<[^>]+>/g, "").trim() : "";
  const wdH1Pass = wdH1.toLowerCase().includes("web development agency in mumbai");
  console.log(`   H1: "${wdH1}" [${wdH1Pass ? "PASS" : "FAIL"}]`);
  results.push({ test: "Web Dev H1 contains 'Web Development Agency in Mumbai'", pass: wdH1Pass, detail: wdH1 });

  // Extract JSON-LD from webdev
  const jsonLdRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let wdFaqCount = 0;
  let wdHasService = false;
  let wdKnowsAbout = false;
  while ((match = jsonLdRegex.exec(webdev.body)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item["@type"] === "FAQPage" && Array.isArray(item.mainEntity)) {
          wdFaqCount = item.mainEntity.length;
        }
        if (item["@type"] === "Service" && item.name?.includes("Custom Web Development")) {
          wdHasService = true;
        }
        if (item["@type"] === "Organization" && Array.isArray(item.knowsAbout) && item.knowsAbout.length > 0) {
          wdKnowsAbout = true;
        }
      }
    } catch (e) {}
  }
  console.log(`   FAQPage items in JSON-LD: ${wdFaqCount} (Expected: 11) [${wdFaqCount === 11 ? "PASS" : "FAIL"}]`);
  results.push({ test: "Web Dev FAQPage JSON-LD has 11 FAQs", pass: wdFaqCount === 11, detail: `${wdFaqCount} FAQs found` });
  console.log(`   Service schema present: ${wdHasService} [${wdHasService ? "PASS" : "FAIL"}]`);
  results.push({ test: "Web Dev Service schema present", pass: wdHasService, detail: `Found: ${wdHasService}` });
  console.log(`   Organization knowsAbout present: ${wdKnowsAbout} [${wdKnowsAbout ? "PASS" : "FAIL"}]`);
  results.push({ test: "Organization knowsAbout present", pass: wdKnowsAbout, detail: `Found: ${wdKnowsAbout}` });

  // TEST 3: SEO Agency Mumbai Page
  console.log("\n3. Testing /services/seo-services-in-mumbai/ Title, H1, JSON-LD...");
  const seo = await fetchUrl("https://www.dgeniussolutions.com/services/seo-services-in-mumbai/");
  const seoTitleMatch = seo.body.match(/<title>(.*?)<\/title>/i);
  const seoTitle = seoTitleMatch ? seoTitleMatch[1] : "";
  const seoTitlePass = seoTitle.includes("SEO Agency in Mumbai");
  console.log(`   Title: "${seoTitle}" [${seoTitlePass ? "PASS" : "FAIL"}]`);
  results.push({ test: "SEO Mumbai Title contains 'SEO Agency in Mumbai'", pass: seoTitlePass, detail: seoTitle });

  const seoH1Match = seo.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const seoH1 = seoH1Match ? seoH1Match[1].replace(/<[^>]+>/g, "").trim() : "";
  const seoH1Pass = seoH1.toLowerCase().includes("seo agency in mumbai") || seoH1.toLowerCase().includes("seo company in mumbai") || seoH1.toLowerCase().includes("seo services in mumbai");
  console.log(`   H1: "${seoH1}" [${seoH1Pass ? "PASS" : "FAIL"}]`);
  results.push({ test: "SEO Mumbai H1 present", pass: seoH1Pass, detail: seoH1 });

  let seoFaqCount = 0;
  let seoHasService = false;
  jsonLdRegex.lastIndex = 0;
  while ((match = jsonLdRegex.exec(seo.body)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item["@type"] === "FAQPage" && Array.isArray(item.mainEntity)) {
          seoFaqCount = item.mainEntity.length;
        }
        if (item["@type"] === "Service" && item.name?.includes("SEO Services")) {
          seoHasService = true;
        }
      }
    } catch (e) {}
  }
  console.log(`   FAQPage items in JSON-LD: ${seoFaqCount} (Expected: 10) [${seoFaqCount === 10 ? "PASS" : "FAIL"}]`);
  results.push({ test: "SEO Mumbai FAQPage JSON-LD has 10 FAQs", pass: seoFaqCount === 10, detail: `${seoFaqCount} FAQs found` });
  console.log(`   Service schema present: ${seoHasService} [${seoHasService ? "PASS" : "FAIL"}]`);
  results.push({ test: "SEO Mumbai Service schema present", pass: seoHasService, detail: `Found: ${seoHasService}` });

  // TEST 4: Machine Readable llms-full.md
  console.log("\n4. Testing /llms-full.md...");
  const llms = await fetchUrl("https://www.dgeniussolutions.com/llms-full.md");
  const llmsHasOldUrl = llms.body.includes("/services/website-design-development/");
  const llmsHasCanonicalUrl = llms.body.includes("/services/website-development-amc/");
  console.log(`   Does NOT contain old 404/redirected URL: ${!llmsHasOldUrl} [${!llmsHasOldUrl ? "PASS" : "FAIL"}]`);
  results.push({ test: "llms-full.md does not contain redirected URL", pass: !llmsHasOldUrl, detail: `Old URL present: ${llmsHasOldUrl}` });
  console.log(`   Contains canonical URL: ${llmsHasCanonicalUrl} [${llmsHasCanonicalUrl ? "PASS" : "FAIL"}]`);
  results.push({ test: "llms-full.md contains canonical web dev URL", pass: llmsHasCanonicalUrl, detail: `Canonical present: ${llmsHasCanonicalUrl}` });

  // TEST 5: Media Availability & HTTP 206 Byte-Range
  console.log("\n5. Testing Media Playback & Byte-Range Requests on Production...");
  const videoTest1 = await fetchUrl("https://www.dgeniussolutions.com/media/portfolio/videos/hyundai_creta_1.mp4", {
    headers: { Range: "bytes=0-1024" },
  });
  const v1Pass = videoTest1.statusCode === 206 && videoTest1.headers["content-type"] === "video/mp4";
  console.log(`   hyundai_creta_1.mp4 (Range bytes=0-1024) -> Status: ${videoTest1.statusCode}, Content-Type: ${videoTest1.headers["content-type"]} [${v1Pass ? "PASS" : "FAIL"}]`);
  results.push({ test: "hyundai_creta_1.mp4 Byte-Range (206)", pass: v1Pass, detail: `Status ${videoTest1.statusCode}, Type ${videoTest1.headers["content-type"]}` });

  const videoTest2 = await fetchUrl("https://www.dgeniussolutions.com/media/portfolio/videos/hyundai_creta_1.webm", {
    headers: { Range: "bytes=0-1024" },
  });
  const v2Pass = videoTest2.statusCode === 206 && videoTest2.headers["content-type"] === "video/webm";
  console.log(`   hyundai_creta_1.webm (Range bytes=0-1024) -> Status: ${videoTest2.statusCode}, Content-Type: ${videoTest2.headers["content-type"]} [${v2Pass ? "PASS" : "FAIL"}]`);
  results.push({ test: "hyundai_creta_1.webm Byte-Range (206)", pass: v2Pass, detail: `Status ${videoTest2.statusCode}, Type ${videoTest2.headers["content-type"]}` });

  const legacyVideo = await fetchUrl("https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Makar-Sankranti-And-Pongal-Final-1.mp4", {
    headers: { Range: "bytes=0-1024" },
  });
  const legPass = legacyVideo.statusCode === 206 && legacyVideo.headers["content-type"] === "video/mp4";
  console.log(`   Makar-Sankranti-And-Pongal-Final-1.mp4 (Range bytes=0-1024) -> Status: ${legacyVideo.statusCode}, Content-Type: ${legacyVideo.headers["content-type"]} [${legPass ? "PASS" : "FAIL"}]`);
  results.push({ test: "Legacy WP upload Byte-Range (206)", pass: legPass, detail: `Status ${legacyVideo.statusCode}, Type ${legacyVideo.headers["content-type"]}` });

  console.log("\n==================================================================");
  console.log("  SUMMARY RESULTS");
  console.log("==================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  console.log(`Passed: ${passed}/${total} tests`);
  for (const r of results) {
    console.log(`  [${r.pass ? "PASS" : "FAIL"}] ${r.test} - ${r.detail}`);
  }

  if (passed !== total) {
    process.exit(1);
  }
  console.log("\n✓ ALL PRODUCTION TESTS PASSED WITH 100% SUCCESS!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
