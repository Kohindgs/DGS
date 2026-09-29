import https from "node:https";

const BASE_URL = "https://www.dgeniussolutions.com";

async function fetchLive(path) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "DGS-V8.8.6-Live-Audit-Verifier/1.0",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  }
  return await res.text();
}

function clean(str) {
  if (!str) return "";
  return str.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtml(html) {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function runAudit() {
  console.log("================================================================================");
  console.log("DGS V8.8.6 — PRODUCTION SEO AUDIT & POST-DEPLOYMENT VERIFICATION");
  console.log("Base URL: " + BASE_URL);
  console.log("Time: " + new Date().toISOString());
  console.log("================================================================================\n");

  const results = [];

  // Helper for test assertions
  function assert(name, condition, details = "") {
    results.push({ name, pass: Boolean(condition), details });
    const status = condition ? "PASS" : "FAIL";
    console.log(`  [${status}] ${name} ${details ? `(${details})` : ""}`);
  }

  // 1. /services/ai-production-dubai-page/
  console.log("\n--- TEST SUITE 1: /services/ai-production-dubai-page/ ---");
  try {
    const html = await fetchLive("/services/ai-production-dubai-page/");
    const domOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "");
    const title = decodeHtml(html.match(/<title>([^<]+)<\/title>/i)?.[1] || "");
    const h1 = decodeHtml(clean(domOnly.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ""));
    const ogTitle = decodeHtml(html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] || "");
    const twTitle = decodeHtml(html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i)?.[1] || "");
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || "";
    const robots = html.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1] || "";

    assert(
      "Title contains exact Dubai AI Video naming",
      title === "AI Video Production Agency in Dubai | AI Video Services | DGS",
      title
    );
    assert(
      "H1 contains exact Dubai AI Video naming",
      h1 === "AI Video Production Agency In Dubai For Ads, Reels & Brand Films",
      h1
    );
    assert(
      "OG Title matches Dubai AI Video naming",
      ogTitle === "AI Video Production Agency in Dubai | DGS",
      ogTitle
    );
    assert(
      "Twitter Title matches Dubai AI Video naming",
      twTitle === "AI Video Production Agency in Dubai | DGS",
      twTitle
    );
    assert(
      "Canonical URL is preserved",
      canonical === "https://www.dgeniussolutions.com/services/ai-production-dubai-page/",
      canonical
    );
    assert(
      "Robots allow indexing",
      robots.includes("index") && robots.includes("follow"),
      robots
    );
    // Breadcrumb schema validation
    const hasCleanBreadcrumb = html.includes('"name":"AI Video Production Dubai"') || html.includes('"name": "AI Video Production Dubai"');
    const hasLeakedBreadcrumb = html.includes('"name":"AI Production Dubai page"');
    assert(
      "Breadcrumb schema renders clean label 'AI Video Production Dubai'",
      hasCleanBreadcrumb && !hasLeakedBreadcrumb,
      "BreadcrumbList schema checked"
    );
    assert(
      "Eliminated editorial label '<small>Internal Link</small>'",
      !html.includes("<small>Internal Link</small>"),
      "Zero editorial leakages found"
    );

    // Schema validation
    const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
      .map((m) => m[1]);
    const serviceSchema = jsonLdBlocks.find((b) => b.includes('"@type":"Service"') || b.includes('"@type": "Service"'));
    const hasServiceName = serviceSchema && serviceSchema.includes("AI Video Production Services in Dubai");
    const hasServiceType = serviceSchema && serviceSchema.includes("AI Video Production");
    const hasAreaServed = serviceSchema && serviceSchema.includes("Dubai") && serviceSchema.includes("United Arab Emirates");

    assert("Schema includes Service @type", Boolean(serviceSchema));
    assert("Schema service name is 'AI Video Production Services in Dubai'", Boolean(hasServiceName));
    assert("Schema serviceType is 'AI Video Production'", Boolean(hasServiceType));
    assert("Schema areaServed specifies Dubai & UAE", Boolean(hasAreaServed));

    // Geographic integrity check
    const hasFakeAddress = /"addressLocality"\s*:\s*"Dubai"/i.test(html) || /based in dubai/i.test(html);
    const hasServingDubai = html.includes("for Dubai and UAE brands") || html.includes("serving Dubai and UAE brands");
    assert("Geographic honesty (honest areaServed UAE, no fake Dubai office address)", !hasFakeAddress && hasServingDubai);

  } catch (err) {
    assert("Fetch /services/ai-production-dubai-page/", false, err.message);
  }

  // 2. /services/dubai-seo/
  console.log("\n--- TEST SUITE 2: /services/dubai-seo/ ---");
  try {
    const html = await fetchLive("/services/dubai-seo/");
    const domOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "");
    const title = decodeHtml(html.match(/<title>([^<]+)<\/title>/i)?.[1] || "");
    const h1 = decodeHtml(clean(domOnly.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ""));

    assert(
      "Title contains Dubai SEO target keywords",
      title === "SEO Agency in Dubai | SEO Services & Local SEO UAE | DGS",
      title
    );
    assert(
      "H1 contains Dubai SEO target keywords",
      h1 === "SEO Agency in Dubai for Rankings, Leads & Local Growth",
      h1
    );

    // Mumbai locality contamination
    const mumbaiLocs = ["Andheri", "Worli", "Fort", "Churchgate", "Colaba"];
    const foundMumbai = mumbaiLocs.filter((m) => new RegExp(`\\b${m}\\b`, "i").test(domOnly));
    assert(
      "Mumbai localities completely removed from Dubai SEO page",
      foundMumbai.length === 0,
      foundMumbai.length > 0 ? `Contaminated with: ${foundMumbai.join(", ")}` : "All 5 cleaned"
    );

    // Grammar fix
    const grammarOk = domOnly.includes("businesses that want to improve Google rankings");
    assert(
      "Grammar fixed: 'for businesses that want to improve Google rankings'",
      grammarOk
    );

    // Natural anchor to Dubai AI Video
    const anchorMatch = domOnly.includes("Dubai AI video production");
    assert(
      "Natural anchor link to Dubai AI Video present",
      anchorMatch
    );

  } catch (err) {
    assert("Fetch /services/dubai-seo/", false, err.message);
  }

  // 3. /services/ & /our-services/ Hubs
  console.log("\n--- TEST SUITE 3: Services Hubs (/services/ and /our-services/) ---");
  try {
    const html1 = await fetchLive("/services/");
    const dom1 = html1.replace(/<script[\s\S]*?<\/script>/gi, "");
    const title1 = decodeHtml(html1.match(/<title>([^<]+)<\/title>/i)?.[1] || "");
    const h1_1 = decodeHtml(clean(dom1.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ""));

    assert(
      "/services/ Title is clean & free of CMS words",
      title1.includes("Digital Marketing, SEO & AI Services"),
      title1
    );
    assert(
      "/services/ H1 is 'Digital Marketing, SEO & AI Services'",
      h1_1 === "Digital Marketing, SEO & AI Services",
      h1_1
    );
    assert(
      "/services/ No 'Archives: Services' CMS leakage",
      !dom1.includes("Archives: Services") && !title1.includes("Archives:")
    );
    assert(
      "/services/ Dubai card title is 'AI Video Production Agency in Dubai'",
      dom1.includes("AI Video Production Agency in Dubai")
    );
    assert(
      "/services/ Pune card title is 'Website Development Company in Pune'",
      dom1.includes("Website Development Company in Pune")
    );
    assert(
      "/services/ No 'page' leakage in card titles",
      !dom1.includes("AI Production Dubai page") && !dom1.includes("Website Development Pune Page")
    );

    const html2 = await fetchLive("/our-services/");
    const dom2 = html2.replace(/<script[\s\S]*?<\/script>/gi, "");
    assert(
      "/our-services/ Dubai card title is 'AI Video Production Agency in Dubai'",
      dom2.includes("AI Video Production Agency in Dubai")
    );
    assert(
      "/our-services/ Pune card title is 'Website Development Company in Pune'",
      dom2.includes("Website Development Company in Pune")
    );
    assert(
      "/our-services/ No 'page' leakage in card titles",
      !dom2.includes("AI Production Dubai page") && !dom2.includes("Website Development Pune Page")
    );

  } catch (err) {
    assert("Fetch Services Hubs", false, err.message);
  }

  // 4. /aeo-dubai/
  console.log("\n--- TEST SUITE 4: /aeo-dubai/ ---");
  try {
    const html = await fetchLive("/aeo-dubai/");
    const domOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "");
    const title = decodeHtml(html.match(/<title>([^<]+)<\/title>/i)?.[1] || "");
    const h1 = decodeHtml(clean(domOnly.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ""));

    assert(
      "AEO Dubai Title is clean",
      title === "AEO Agency in Dubai | AI Search & Google AI Overviews | DGS",
      title
    );
    assert(
      "AEO Dubai H1 is clean",
      h1 === "AEO Agency in Dubai for AI Search Visibility, Google AI Overviews & Qualified Leads",
      h1
    );
    assert(
      "AEO Dubai eliminated '<small>Internal Link</small>'",
      !html.includes("<small>Internal Link</small>")
    );
    assert(
      "AEO Dubai natural anchor to AI Video Dubai ('AI-generated video production for UAE campaigns')",
      domOnly.includes("AI-generated video production for UAE campaigns")
    );

  } catch (err) {
    assert("Fetch /aeo-dubai/", false, err.message);
  }

  // 5. /services/social-media-marketing/
  console.log("\n--- TEST SUITE 5: /services/social-media-marketing/ ---");
  try {
    const html = await fetchLive("/services/social-media-marketing/");
    const domOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "");

    const hasDebug = html.includes("// Debug:");
    const hasLimit = domOnly.includes("Limited Client Availability");
    const hasSpots = domOnly.includes("Only 2 spots remaining");
    const hasGuarantee = domOnly.includes("60-Day Results Guarantee");

    assert("No inline debug comment scripts ('// Debug:')", !hasDebug);
    assert("No fake urgency 'Limited Client Availability'", !hasLimit);
    assert("No fake scarcity 'Only 2 spots remaining'", !hasSpots);
    assert("No unprovable '60-Day Results Guarantee'", !hasGuarantee);

  } catch (err) {
    assert("Fetch /services/social-media-marketing/", false, err.message);
  }

  // 6. /services/llm-seo-service/
  console.log("\n--- TEST SUITE 6: /services/llm-seo-service/ ---");
  try {
    const html = await fetchLive("/services/llm-seo-service/");
    const domOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "");

    const h2Tags = [...domOnly.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
      .map((m) => decodeHtml(clean(m[1])));

    const whatIsCount = h2Tags.filter((t) => t.includes("What Are LLM SEO Services?")).length;
    const hasWhyBrands = h2Tags.some((t) => t.includes("Why Brands Need LLM SEO in the Age of AI Search"));

    assert("Only ONE H2 heading 'What Are LLM SEO Services?'", whatIsCount === 1, `Found ${whatIsCount}`);
    assert("Second H2 converted to 'Why Brands Need LLM SEO in the Age of AI Search'", hasWhyBrands);

  } catch (err) {
    assert("Fetch /services/llm-seo-service/", false, err.message);
  }

  // 7. /services/branding/
  console.log("\n--- TEST SUITE 7: /services/branding/ ---");
  try {
    const html = await fetchLive("/services/branding/");
    const domOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "");

    const hasDrain = domOnly.includes("10-20% Annual Growth Drain");
    const hasCompounding = domOnly.includes("Compounding Growth Drain");

    assert("Removed unverified statistic heading '10-20% Annual Growth Drain'", !hasDrain);
    assert("Replaced with professional heading 'Compounding Growth Drain'", hasCompounding);

  } catch (err) {
    assert("Fetch /services/branding/", false, err.message);
  }

  // 8. /services/ai-video-production-agency/
  console.log("\n--- TEST SUITE 8: /services/ai-video-production-agency/ ---");
  try {
    const html = await fetchLive("/services/ai-video-production-agency/");
    const domOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "");

    const linksToDubai = domOnly.includes("/services/ai-production-dubai-page/");
    const anchorCheck = domOnly.includes("AI Video Services for Dubai Brands") || domOnly.includes("Dubai AI video production");

    assert("Contextual link to Dubai AI Video page exists", linksToDubai);
    assert("Anchor text is natural and distinct from Mumbai/National anchors", anchorCheck);

  } catch (err) {
    assert("Fetch /services/ai-video-production-agency/", false, err.message);
  }

  // Final tally
  console.log("\n================================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;

  console.log(`TOTAL CHECKS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failed === 0) {
    console.log("ALL V8.8.6 PRODUCTION ACCEPTANCE CHECKS PASSED (100% SUCCESS)");
  } else {
    console.log(`ATTENTION: ${failed} CHECK(S) FAILED`);
  }
  console.log("================================================================================\n");

  return failed === 0;
}

runAudit().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((err) => {
  console.error("Audit failure:", err);
  process.exit(1);
});
