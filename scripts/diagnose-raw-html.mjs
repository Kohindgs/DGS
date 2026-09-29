import https from "node:https";

function fetchRawHtml(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; DGS-Diagnostic/1.0)" } }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location && maxRedirects > 0) {
        const redirectUrl = new URL(res.headers.location, url).href;
        return resolve(fetchRawHtml(redirectUrl, maxRedirects - 1));
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, html: data, finalUrl: url }));
    }).on("error", reject);
  });
}

const targetUrls = [
  // 1. Newest native MySQL blog
  "https://www.dgeniussolutions.com/blogs/google-september-2026-spam-update-what-website-owners-should-know/",
  // 2. Google September 2026 Spam Update
  "https://www.dgeniussolutions.com/blogs/google-september-2026-spam-update-what-website-owners-should-know/",
  // 3. Google Ads for B2B Lead Generation
  "https://www.dgeniussolutions.com/blogs/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads/",
  // 4. 3 migrated/static blogs
  "https://www.dgeniussolutions.com/blogs/seo-company-in-mumbai/",
  "https://www.dgeniussolutions.com/blogs/3-3-3-rule-in-marketing/",
  "https://www.dgeniussolutions.com/blogs/aeo-in-2026/",
  // 5. 10 random blogs
  "https://www.dgeniussolutions.com/blogs/aeo-business/",
  "https://www.dgeniussolutions.com/blogs/ai-content-optimization/",
  "https://www.dgeniussolutions.com/blogs/ai-generated-summaries-in-search-ads/",
  "https://www.dgeniussolutions.com/blogs/ai-seo-services-mumbai/",
  "https://www.dgeniussolutions.com/blogs/google-ads-ai-max-2026/",
  "https://www.dgeniussolutions.com/blogs/llm-seo-mumbai/",
  "https://www.dgeniussolutions.com/blogs/brand-mentions-ai-tools/",
  "https://www.dgeniussolutions.com/blogs/geo-agency-mumbai/",
  "https://www.dgeniussolutions.com/blogs/how-to-rank-on-chatgpt-search/",
  "https://www.dgeniussolutions.com/blogs/voice-search-optimization-2026/"
];

// Deduplicate
const uniqueUrls = [...new Set(targetUrls)];

function extractJsonLdObjects(html) {
  const scriptRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocks = [];
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const rawContent = match[1].trim();
    try {
      const parsed = JSON.parse(rawContent);
      blocks.push({ raw: rawContent, parsed, isDoubleEncoded: typeof parsed === "string" });
    } catch (e) {
      blocks.push({ raw: rawContent, error: e.message });
    }
  }
  return blocks;
}

function traverseTypes(obj, types = []) {
  if (!obj || typeof obj !== "object") return types;
  if (Array.isArray(obj)) {
    for (const item of obj) traverseTypes(item, types);
    return types;
  }
  if (obj["@type"]) {
    if (Array.isArray(obj["@type"])) {
      types.push(...obj["@type"]);
    } else {
      types.push(obj["@type"]);
    }
  }
  if (obj["@graph"] && Array.isArray(obj["@graph"])) {
    for (const item of obj["@graph"]) traverseTypes(item, types);
  }
  return types;
}

function findObjectsOfType(obj, targetType) {
  const matches = [];
  function search(item) {
    if (!item || typeof item !== "object") return;
    if (Array.isArray(item)) {
      for (const i of item) search(i);
      return;
    }
    const t = item["@type"];
    const isMatch = Array.isArray(t) ? t.includes(targetType) : t === targetType;
    if (isMatch) matches.push(item);
    if (item["@graph"] && Array.isArray(item["@graph"])) {
      for (const g of item["@graph"]) search(g);
    }
  }
  search(obj);
  return matches;
}

async function run() {
  console.log("================================================================================");
  console.log("PHASE 1: DIAGNOSE RAW PRODUCTION HTML FOR SCHEMA & VISIBLE METADATA");
  console.log("================================================================================\n");

  for (const url of uniqueUrls) {
    const slug = url.split("/blogs/")[1]?.replace(/\/$/, "") || url;
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`URL: ${url}`);
    
    try {
      const res = await fetchRawHtml(url);
      console.log(`HTTP Status: ${res.status} | Final URL: ${res.finalUrl}`);
      const html = res.html;

      // 1. JSON-LD Scripts
      const jsonLdBlocks = extractJsonLdObjects(html);
      console.log(`JSON-LD Scripts Found: ${jsonLdBlocks.length}`);

      const allTypes = [];
      const allParsed = [];
      for (const [idx, b] of jsonLdBlocks.entries()) {
        if (b.error) {
          console.log(`  Block #${idx + 1}: ❌ JSON PARSE ERROR (${b.error})`);
        } else if (b.isDoubleEncoded) {
          console.log(`  Block #${idx + 1}: ❌ DOUBLE ENCODED STRING!`);
        } else {
          allParsed.push(b.parsed);
          const types = traverseTypes(b.parsed);
          allTypes.push(...types);
          console.log(`  Block #${idx + 1} Types: ${types.join(", ") || "(none)"}`);
        }
      }

      // Check specific schemas
      const blogPostings = allParsed.flatMap(p => findObjectsOfType(p, "BlogPosting"));
      const articles = allParsed.flatMap(p => findObjectsOfType(p, "Article"));
      const webPages = allParsed.flatMap(p => findObjectsOfType(p, "WebPage"));
      const breadcrumbs = allParsed.flatMap(p => findObjectsOfType(p, "BreadcrumbList"));

      console.log(`Schema Types Present: [${[...new Set(allTypes)].join(", ")}]`);
      console.log(`BlogPosting present? ${blogPostings.length > 0 ? `YES (${blogPostings.length})` : "NO"}`);
      console.log(`Article present? ${articles.length > 0 ? `YES (${articles.length})` : "NO"}`);
      console.log(`WebPage present? ${webPages.length > 0 ? "YES" : "NO"}`);
      console.log(`BreadcrumbList present? ${breadcrumbs.length > 0 ? "YES" : "NO"}`);

      const targetPost = blogPostings[0] || articles[0];
      if (targetPost) {
        console.log(`\nDetailed inspection of ${targetPost["@type"]}:`);
        console.log(`  @id: ${targetPost["@id"] || "(none)"}`);
        console.log(`  headline: ${targetPost.headline ? `"${targetPost.headline.slice(0, 50)}..."` : "(missing)"}`);
        console.log(`  datePublished: ${targetPost.datePublished || "(MISSING)"}`);
        console.log(`  dateModified: ${targetPost.dateModified || "(MISSING)"}`);
        console.log(`  author: ${JSON.stringify(targetPost.author || "(MISSING)")}`);
        console.log(`  publisher: ${JSON.stringify(targetPost.publisher || "(MISSING)")}`);
        console.log(`  mainEntityOfPage: ${JSON.stringify(targetPost.mainEntityOfPage || "(MISSING)")}`);
        console.log(`  image: ${JSON.stringify(targetPost.image || "(MISSING)")}`);
      } else {
        console.log(`❌ NO BlogPosting OR Article FOUND IN RAW SERVER HTML!`);
      }

      // 2. Visible HTML Elements
      console.log(`\nVisible HTML Elements:`);
      const timeMatches = [...html.matchAll(/<time\b[^>]*datetime=["']([^"']*)["'][^>]*>([\s\S]*?)<\/time>/gi)];
      console.log(`  <time> tags count: ${timeMatches.length}`);
      for (const tm of timeMatches) {
        console.log(`    - datetime="${tm[1]}": "${tm[2].replace(/<[^>]+>/g, "").trim()}"`);
      }

      const bylineMatch = html.match(/(?:by|written by|author[:\s])\s*([A-Za-z0-9\s'&.-]{3,50})/i);
      console.log(`  Byline detected: ${bylineMatch ? bylineMatch[0].trim() : "(none found)"}`);

      const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
      console.log(`  H1 count: ${h1Matches.length} | First H1: ${h1Matches[0] ? `"${h1Matches[0][1].replace(/<[^>]+>/g, "").trim()}"` : "(none)"}`);

      const hasFaqSection = /frequently asked questions|\bfaqs?\b/i.test(html);
      console.log(`  FAQ section in visible text? ${hasFaqSection ? "YES" : "NO"}`);

      const hasHowToSection = /how to|step-by-step|\bstep 1\b/i.test(html);
      console.log(`  HowTo keywords in visible text? ${hasHowToSection ? "YES" : "NO"}`);

      const tableCount = (html.match(/<table\b/gi) || []).length;
      console.log(`  Tables on page: ${tableCount}`);

    } catch (err) {
      console.error(`❌ Error fetching ${url}:`, err.message);
    }
  }

  console.log("\n================================================================================");
  console.log("PHASE 1 DIAGNOSTIC COMPLETE");
  console.log("================================================================================\n");
}

run().catch(console.error);
