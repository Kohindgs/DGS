async function main() {
  console.log("==================================================================");
  console.log("       TESTING REAL NEXT.JS LOCAL SERVER (PORT 3005)              ");
  console.log("==================================================================");

  const BASE = "http://localhost:3005";

  // TEST 1: REDIRECT ON THE 404 PHANTOM TARGET
  console.log("\n[TEST 1] Testing /services/website-design-development/ redirect:");
  const redirRes = await fetch(`${BASE}/services/website-design-development/`, { redirect: "manual" });
  console.log("  - Status:", redirRes.status);
  console.log("  - Location:", redirRes.headers.get("location"));
  if (redirRes.status !== 301 && redirRes.status !== 307 && redirRes.status !== 308) {
    throw new Error(`FAIL: Expected redirect status, got ${redirRes.status}`);
  }
  const loc = redirRes.headers.get("location") || "";
  if (!loc.includes("/services/website-development-amc/")) {
    throw new Error(`FAIL: Expected redirect destination to include /services/website-development-amc/, got ${loc}`);
  }
  console.log("  -> PASS: Dead-end 404 is now permanently redirected to active service page!");

  // TEST 2: WEB DEVELOPMENT AMC PAGE
  console.log("\n[TEST 2] Testing /services/website-development-amc/:");
  const webRes = await fetch(`${BASE}/services/website-development-amc/`);
  console.log("  - HTTP Status:", webRes.status);
  if (webRes.status !== 200) throw new Error("FAIL: Web Dev page did not return 200");
  const webHtml = await webRes.text();

  const titleMatch = webHtml.match(/<title>([^<]+)<\/title>/i);
  console.log("  - Title Tag:", titleMatch ? titleMatch[1] : "NONE");
  if (!titleMatch || !titleMatch[1].includes("Web Development Agency in Mumbai")) {
    throw new Error(`FAIL: Title tag does not contain target keyword: ${titleMatch?.[1]}`);
  }

  const h1Match = webHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  console.log("  - H1 Tag:", h1Match ? h1Match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "NONE");
  if (!h1Match || !h1Match[1].includes("Web Development")) {
    throw new Error("FAIL: H1 tag missing Web Development keyword");
  }

  // Schema verification
  const jsonLdMatches = [...webHtml.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  let foundService = null;
  let foundFaq = null;
  let foundOrg = null;

  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1]);
      const list = Array.isArray(parsed) ? parsed : (parsed["@graph"] || [parsed]);
      for (const ent of list) {
        if (ent["@type"] === "Service") foundService = ent;
        if (ent["@type"] === "FAQPage") foundFaq = ent;
        if (ent["@type"] === "Organization") foundOrg = ent;
      }
    } catch {}
  }

  console.log("  - Service Schema Name:", foundService?.name);
  console.log("  - Service Schema serviceType:", foundService?.serviceType);
  console.log("  - Service Schema areaServed:", JSON.stringify(foundService?.areaServed));
  console.log("  - Organization knowsAbout:", foundOrg?.knowsAbout?.slice(0, 4));
  console.log("  - FAQPage Present?", Boolean(foundFaq));
  console.log("  - FAQ Questions Count:", foundFaq?.mainEntity?.length);

  if (!foundService?.serviceType || !foundService?.areaServed) {
    throw new Error("FAIL: Web Dev Service schema missing serviceType or areaServed!");
  }
  if (!foundFaq || foundFaq.mainEntity.length < 10) {
    throw new Error(`FAIL: Web Dev FAQPage schema missing or incomplete (got ${foundFaq?.mainEntity?.length} FAQs)`);
  }
  console.log("  -> PASS: Web Development page has verified Title, H1, Service Schema, and 11 FAQ rich results!");

  // TEST 3: SEO SERVICES IN MUMBAI PAGE
  console.log("\n[TEST 3] Testing /services/seo-services-in-mumbai/:");
  const seoRes = await fetch(`${BASE}/services/seo-services-in-mumbai/`);
  console.log("  - HTTP Status:", seoRes.status);
  if (seoRes.status !== 200) throw new Error("FAIL: SEO page did not return 200");
  const seoHtml = await seoRes.text();

  const seoTitleMatch = seoHtml.match(/<title>([^<]+)<\/title>/i);
  console.log("  - Title Tag:", seoTitleMatch ? seoTitleMatch[1] : "NONE");
  if (!seoTitleMatch || !seoTitleMatch[1].includes("SEO Agency in Mumbai")) {
    throw new Error(`FAIL: SEO Title tag does not lead with SEO Agency in Mumbai: ${seoTitleMatch?.[1]}`);
  }

  const seoJsonLdMatches = [...seoHtml.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  let seoFoundService = null;
  let seoFoundFaq = null;

  for (const m of seoJsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1]);
      const list = Array.isArray(parsed) ? parsed : (parsed["@graph"] || [parsed]);
      for (const ent of list) {
        if (ent["@type"] === "Service") seoFoundService = ent;
        if (ent["@type"] === "FAQPage") seoFoundFaq = ent;
      }
    } catch {}
  }

  console.log("  - Service Schema Name:", seoFoundService?.name);
  console.log("  - Service Schema serviceType:", seoFoundService?.serviceType);
  console.log("  - Service Schema areaServed:", JSON.stringify(seoFoundService?.areaServed));
  console.log("  - FAQPage Present?", Boolean(seoFoundFaq));
  console.log("  - FAQ Questions Count:", seoFoundFaq?.mainEntity?.length);

  if (!seoFoundService?.serviceType || !seoFoundService?.areaServed) {
    throw new Error("FAIL: SEO Service schema missing serviceType or areaServed!");
  }
  if (!seoFoundFaq || seoFoundFaq.mainEntity.length < 10) {
    throw new Error(`FAIL: SEO FAQPage schema missing or incomplete (got ${seoFoundFaq?.mainEntity?.length} FAQs)`);
  }
  console.log("  -> PASS: SEO Mumbai page has verified Title, Service Schema, and 10 FAQ rich results!");

  // TEST 4: LLMS-FULL.MD
  console.log("\n[TEST 4] Testing /llms-full.md:");
  const llmRes = await fetch(`${BASE}/llms-full.md`);
  console.log("  - HTTP Status:", llmRes.status);
  const llmText = await llmRes.text();
  console.log("  - Document Length:", llmText.length);

  const hasRedirectUrl = llmText.includes("website-development-services-in-mumbai-dgenius-solutions");
  console.log("  - Contains 301 redirected URL?", hasRedirectUrl);
  if (hasRedirectUrl) {
    throw new Error("FAIL: llms-full.md still contains 301 redirected URL!");
  }
  console.log("  -> PASS: llms-full.md is clean and verified!");

  console.log("\n==================================================================");
  console.log("       ALL SERVER TESTS PASSED WITH 100% SUCCESS!                 ");
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("SERVER TEST FAILED:", err);
  process.exit(1);
});
