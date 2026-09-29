const BASE_URL = process.env.VERIFY_URL || "https://www.dgeniussolutions.com";

async function fetchLive(path) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "DGS-V8.8.7A-Verifier/1.0",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
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

async function run() {
  console.log("================================================================================");
  console.log("DGS V8.8.7A — REMOVE ALL 'AI PRODUCTION DUBAI PAGE' SEARCH SIGNALS");
  console.log("Target Base URL: " + BASE_URL);
  console.log("Timestamp: " + new Date().toISOString());
  console.log("================================================================================\n");

  const results = [];
  function assert(name, condition, details = "") {
    results.push({ name, pass: Boolean(condition), details });
    const status = condition ? "PASS" : "FAIL";
    console.log(`  [${status}] ${name} ${details ? `(${details})` : ""}`);
  }

  // TEST 1: Primary Dubai AI Video Page signals
  console.log("\n--- TEST 1: /services/ai-production-dubai-page/ Signals ---");
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
      "HTML Title matches target search signal",
      title === "AI Video Production Agency in Dubai | AI Video Services | DGS",
      title
    );
    assert(
      "H1 matches required commercial headline with proper casing",
      h1 === "AI Video Production Agency in Dubai for Ads, Reels & Brand Films",
      h1
    );
    assert(
      "OG Title is 'AI Video Production Agency in Dubai | DGS'",
      ogTitle === "AI Video Production Agency in Dubai | DGS",
      ogTitle
    );
    assert(
      "Twitter Title is 'AI Video Production Agency in Dubai | DGS'",
      twTitle === "AI Video Production Agency in Dubai | DGS",
      twTitle
    );
    assert(
      "Canonical URL preserves /services/ai-production-dubai-page/ intact",
      canonical === "https://www.dgeniussolutions.com/services/ai-production-dubai-page/",
      canonical
    );
    assert(
      "Robots allow indexing",
      robots.includes("index") && robots.includes("follow"),
      robots
    );

    // Schema assertions
    const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
    const serviceSchema = jsonLdBlocks.find(b => b.includes('"@type":"Service"') || b.includes('"@type": "Service"'));
    const hasServiceSchemaName = serviceSchema && serviceSchema.includes('"name":"AI Video Production Services in Dubai"');
    const hasServiceType = serviceSchema && serviceSchema.includes('"serviceType":"AI Video Production"');
    assert("Service Schema @type present", Boolean(serviceSchema));
    assert("Service Schema Name is 'AI Video Production Services in Dubai'", Boolean(hasServiceSchemaName));
    assert("Service Schema serviceType is 'AI Video Production'", Boolean(hasServiceType));

    // BreadcrumbList schema assertion
    const breadcrumbSchema = jsonLdBlocks.find(b => b.includes('"@type":"BreadcrumbList"') || b.includes('"@type": "BreadcrumbList"'));
    const hasCleanBreadcrumb = breadcrumbSchema && (breadcrumbSchema.includes('"name":"AI Video Production Dubai"') || breadcrumbSchema.includes('"name": "AI Video Production Dubai"'));
    const noLeakedBreadcrumb = !breadcrumbSchema || !breadcrumbSchema.includes("AI Production Dubai page");
    assert("Breadcrumb Schema renders 'AI Video Production Dubai'", Boolean(hasCleanBreadcrumb));
    assert("Breadcrumb Schema has 0 leakage of 'AI Production Dubai page'", noLeakedBreadcrumb);

    // Visible text assertion on page
    // Strip URL occurrences from text to check visible labels
    const textWithoutUrls = domOnly.replace(/\/services\/ai-production-dubai-page\/?/gi, "");
    const leakedLabels = textWithoutUrls.match(/AI Production Dubai page/gi) || [];
    assert("0 visible occurrences of 'AI Production Dubai page' outside URL", leakedLabels.length === 0, `Found ${leakedLabels.length}`);

  } catch (err) {
    assert("Fetch /services/ai-production-dubai-page/", false, err.message);
  }

  // TEST 2: Services Archive & Hub Cards
  console.log("\n--- TEST 2: Services Hubs Cards & Titles ---");
  for (const hubPath of ["/services/", "/our-services/"]) {
    try {
      const html = await fetchLive(hubPath);
      const domOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "");
      const hasDubaiCard = domOnly.includes("AI Video Production Agency in Dubai");
      const hasPuneCard = domOnly.includes("Website Development Company in Pune");
      const textWithoutUrls = domOnly.replace(/\/services\/ai-production-dubai-page\/?/gi, "");
      const hasLeak = textWithoutUrls.includes("AI Production Dubai page") || textWithoutUrls.includes("AI Production Dubai Page");

      assert(`${hubPath} Card Title is 'AI Video Production Agency in Dubai'`, hasDubaiCard);
      assert(`${hubPath} Pune Card is 'Website Development Company in Pune'`, hasPuneCard);
      assert(`${hubPath} 0 'AI Production Dubai page' card leakage`, !hasLeak);
    } catch (err) {
      assert(`Fetch ${hubPath}`, false, err.message);
    }
  }

  // TEST 3: Internal Anchors Across Connected Pages
  console.log("\n--- TEST 3: Internal Anchors Pointing to Dubai AI Video Page ---");
  const connectedPages = [
    { path: "/services/ai-video-production-agency/", expectedAnchor: "AI Video Services for Dubai Brands" },
    { path: "/services/dubai-seo/", expectedAnchor: "Dubai AI video production" },
    { path: "/aeo-dubai/", expectedAnchor: "AI-generated video production for UAE campaigns" },
    { path: "/blogs/ai-video-production-for-business/", expectedAnchor: "AI video production in Dubai" },
    { path: "/blogs/ai-video-vs-traditional-video/", expectedAnchor: "AI video services for Dubai brands" },
  ];

  for (const cp of connectedPages) {
    try {
      const html = await fetchLive(cp.path);
      const domOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "");
      const linkRegex = /<a\b[^>]*href=["']\/services\/ai-production-dubai-page\/?["'][^>]*>([\s\S]*?)<\/a>/gi;
      const matches = [...domOnly.matchAll(linkRegex)].map(m => clean(m[1]));

      const hasExpected = matches.some(a => a.toLowerCase().includes(cp.expectedAnchor.toLowerCase()));
      const hasBanned = matches.some(a => /ai production dubai page/i.test(a));

      assert(`${cp.path} natural anchor contains '${cp.expectedAnchor}'`, hasExpected, matches.join(" | "));
      assert(`${cp.path} 0 banned 'AI Production Dubai page' anchors`, !hasBanned);
    } catch (err) {
      assert(`Fetch ${cp.path}`, false, err.message);
    }
  }

  // TEST 4: Sitemap Freshness
  console.log("\n--- TEST 4: Sitemap Metadata & Freshness ---");
  try {
    const xml = await fetchLive("/sitemap.xml");
    const entryMatch = xml.match(/<url>(?:(?!<url>)[\s\S])*?<loc>https:\/\/www\.dgeniussolutions\.com\/services\/ai-production-dubai-page\/<\/loc>[\s\S]*?<\/url>/i);
    const hasEntry = Boolean(entryMatch);
    const lastmod = entryMatch ? entryMatch[0].match(/<lastmod>([^<]+)<\/lastmod>/i)?.[1] : null;

    assert("Sitemap contains entry for /services/ai-production-dubai-page/", hasEntry);
    assert("Sitemap <lastmod> reflects recent update (2026-09-29)", lastmod === "2026-09-29", `Current lastmod: ${lastmod}`);
  } catch (err) {
    assert("Fetch /sitemap.xml", false, err.message);
  }

  // Summary
  console.log("\n================================================================================");
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`TOTAL AUDIT CHECKS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failed === 0) {
    console.log("ALL V8.8.7A SEARCH SIGNAL AUDIT CHECKS PASSED!");
  } else {
    console.log(`ATTENTION: ${failed} CHECK(S) FAILED`);
  }
  console.log("================================================================================\n");

  return failed === 0;
}

run().then(success => {
  if (!success) process.exit(1);
}).catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});
