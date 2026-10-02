const protectedPages = [
  {
    url: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
    expectedTitle: "AI Video Production Agency in Mumbai | D'Genius Solutions",
    expectedH1: "AI Video Production House In Mumbai For AI Ads, Brand Films & Product Videos",
    expectedCanonical: "https://www.dgeniussolutions.com/services/ai-video-production-agency/"
  },
  {
    url: "https://www.dgeniussolutions.com/services/llm-seo-service/",
    expectedTitle: "LLM SEO Services in Mumbai: 7 Proven Ways to Win AI Search",
    expectedH1: "LLM SEO Services in Mumbai for AI Search Visibility",
    expectedCanonical: "https://www.dgeniussolutions.com/services/llm-seo-service/"
  },
  {
    url: "https://www.dgeniussolutions.com/services/geo/",
    expectedTitle: "GEO Services in Mumbai | D'Genius Solutions",
    expectedH1: "Generative Engine Optimization (GEO) Services in Mumbai",
    expectedCanonical: "https://www.dgeniussolutions.com/services/geo/"
  },
  {
    url: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
    expectedTitle: "SEO Services in Mumbai | SEO Agency for Rankings & Leads | DGS",
    expectedH1: "SEO Agency in Mumbai for SEO Services, AI Search Visibility and Qualified Leads",
    expectedCanonical: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/"
  },
  {
    url: "https://www.dgeniussolutions.com/services/website-development-amc/",
    expectedCanonical: "https://www.dgeniussolutions.com/services/website-development-amc/"
  },
  {
    url: "https://www.dgeniussolutions.com/blogs/aeo-in-2026/",
    expectedCanonical: "https://www.dgeniussolutions.com/blogs/aeo-in-2026/"
  },
  {
    url: "https://www.dgeniussolutions.com/blogs/google-ads-ai-max-2026/",
    expectedCanonical: "https://www.dgeniussolutions.com/blogs/google-ads-ai-max-2026/"
  },
  {
    url: "https://www.dgeniussolutions.com/blogs/google-august-2026-spam-update/",
    expectedCanonical: "https://www.dgeniussolutions.com/blogs/google-august-2026-spam-update/"
  },
  {
    url: "https://www.dgeniussolutions.com/blogs/seo-company-in-mumbai/",
    expectedCanonical: "https://www.dgeniussolutions.com/blogs/seo-company-in-mumbai/"
  }
];

function decodeEntities(s) {
  return s
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function verifyProtectedPages() {
  console.log("=== VERIFYING PROTECTED PAGES INTEGRITY ===");
  let failed = 0;
  for (const p of protectedPages) {
    const res = await fetch(p.url);
    const html = await res.text();
    const status = res.status;
    
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const rawTitle = titleMatch ? titleMatch[1].trim() : "";
    const title = decodeEntities(rawTitle);
    
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const rawH1 = h1Match ? h1Match[1] : "";
    const h1 = decodeEntities(stripTags(rawH1));
    
    const canMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) ||
                     html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);
    const canonical = canMatch ? canMatch[1] : "";
    
    const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
    const robots = robotsMatch ? robotsMatch[1] : "";

    console.log(`\nPage: ${p.url}`);
    console.log(`  HTTP Status: ${status}`);
    console.log(`  Title: ${title}`);
    console.log(`  H1: ${h1}`);
    console.log(`  Canonical: ${canonical}`);
    console.log(`  Robots: ${robots}`);

    if (status !== 200) {
      console.log("  ❌ Error: Status is not 200");
      failed++;
    }
    if (p.expectedTitle && title !== p.expectedTitle) {
      console.log(`  ❌ Error: Title mismatch! Expected: "${p.expectedTitle}", got: "${title}"`);
      failed++;
    }
    if (p.expectedH1 && h1 !== p.expectedH1) {
      console.log(`  ❌ Error: H1 mismatch! Expected: "${p.expectedH1}", got: "${h1}"`);
      failed++;
    }
    if (p.expectedCanonical && canonical !== p.expectedCanonical) {
      console.log(`  ❌ Error: Canonical mismatch! Expected: ${p.expectedCanonical}`);
      failed++;
    }
    if (!robots.includes("index") || robots.includes("noindex")) {
      console.log("  ❌ Error: Robots meta is not indexable!");
      failed++;
    }
  }
  console.log(`\n=== PROTECTED PAGES VERIFICATION: ${failed === 0 ? "100% PASSED (0 FAILURES)" : failed + " FAILURES"} ===`);
}

verifyProtectedPages();
