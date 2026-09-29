import https from "node:https";
import fs from "node:fs";

function fetchRawHtml(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; DGS-AIVisibilityAuditor/3.0)" } }, (res) => {
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

function stripHtml(html) {
  return (html || "")
    .replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, "")
    .replace(/<style[^>]*>([\S\s]*?)<\/style>/gmi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Universal JSON-LD Parser: handles single objects, arrays, and @graph
 */
export function extractAndParseJsonLd(html) {
  const scriptRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const rawBlocks = [];
  const allObjects = [];
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    const rawContent = match[1].trim();
    rawBlocks.push(rawContent);
    try {
      const parsed = JSON.parse(rawContent);
      flattenJsonLd(parsed, allObjects);
    } catch {}
  }

  return { rawBlocks, allObjects };
}

function flattenJsonLd(node, collector) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) flattenJsonLd(item, collector);
    return;
  }
  if (node["@graph"] && Array.isArray(node["@graph"])) {
    for (const item of node["@graph"]) flattenJsonLd(item, collector);
  }
  if (node["@type"]) {
    collector.push(node);
  }
}

export function evaluateBlogPage(url, html, status) {
  const { rawBlocks, allObjects } = extractAndParseJsonLd(html);

  // 1. JSON-LD Structured Data
  const hasJsonLd = rawBlocks.length > 0 && allObjects.length > 0;

  // 2. BlogPosting / Article Schema
  const blogPosting = allObjects.find(
    (o) => {
      const t = String(o["@type"] || "").toLowerCase();
      return t === "blogposting" || t === "article";
    }
  );

  let schemaBlogPostingValid = false;
  let schemaAuthorName = "";
  let schemaPublisherValid = false;
  let schemaPublisherLogoUrl = "";
  let schemaDatePublished = "";
  let schemaDateModified = "";
  let schemaImages = [];

  if (blogPosting) {
    const hasId = Boolean(blogPosting["@id"]);
    const hasHeadline = Boolean(blogPosting.headline);
    const hasDesc = Boolean(blogPosting.description);
    const hasMainEntity = Boolean(blogPosting.mainEntityOfPage);

    // Author
    if (blogPosting.author) {
      if (typeof blogPosting.author === "object") {
        schemaAuthorName = blogPosting.author.name || "";
      } else if (typeof blogPosting.author === "string") {
        schemaAuthorName = blogPosting.author;
      }
    }

    // Publisher
    if (blogPosting.publisher && typeof blogPosting.publisher === "object") {
      const pubName = blogPosting.publisher.name;
      const pubLogo = blogPosting.publisher.logo;
      schemaPublisherLogoUrl = typeof pubLogo === "object" ? (pubLogo.url || "") : String(pubLogo || "");
      const isNativeLogo = schemaPublisherLogoUrl.includes("/images/dgs-logo.webp") || !schemaPublisherLogoUrl.includes("wp-content");
      schemaPublisherValid = Boolean(pubName && pubLogo && isNativeLogo);
    }

    // Dates
    schemaDatePublished = blogPosting.datePublished || "";
    schemaDateModified = blogPosting.dateModified || "";

    // Image
    if (Array.isArray(blogPosting.image)) {
      schemaImages = blogPosting.image;
    } else if (typeof blogPosting.image === "string") {
      schemaImages = [blogPosting.image];
    } else if (blogPosting.image?.url) {
      schemaImages = [blogPosting.image.url];
    }

    schemaBlogPostingValid = Boolean(
      hasId && hasHeadline && hasDesc && hasMainEntity &&
      schemaAuthorName && schemaDatePublished && schemaDateModified
    );
  }

  // 3. BreadcrumbList Schema
  const breadcrumb = allObjects.find((o) => String(o["@type"] || "").toLowerCase() === "breadcrumblist");
  const hasBreadcrumbSchema = Boolean(breadcrumb);

  // 4. Visible Author / E-E-A-T
  const authorNameSpanMatch = html.match(/class=["'][^"']*author-name[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  const bylineMatch = html.match(/(?:by|written by)\s+([A-Za-z0-9\s'&.-]{3,50})/i);
  const visibleAuthorName = authorNameSpanMatch
    ? authorNameSpanMatch[1].replace(/<[^>]+>/g, "").trim()
    : bylineMatch
    ? bylineMatch[1].trim()
    : "";
  const hasVisibleAuthor = Boolean(visibleAuthorName);

  // 5. Visible Dates
  const timeTags = [...html.matchAll(/<time\b[^>]*datetime=["']([^"']*)["'][^>]*>([\s\S]*?)<\/time>/gi)];
  const hasVisibleDatePublished = timeTags.length > 0 && Boolean(schemaDatePublished);
  const hasVisibleDateModified = Boolean(schemaDateModified);

  // 6. Canonical
  const canonicalMatch =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
  const canonicalHref = canonicalMatch ? canonicalMatch[1].trim() : "";
  const cleanTargetUrl = url.split("?")[0].replace(/\/$/, "");
  const cleanCanonical = canonicalHref.replace(/\/$/, "");
  const isCanonicalValid = Boolean(canonicalHref && cleanCanonical === cleanTargetUrl);

  // 7. Robots Meta
  const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
  const robotsContent = robotsMatch ? robotsMatch[1].toLowerCase() : "index,follow";
  const isIndexable = !robotsContent.includes("noindex");

  // 8. HTTPS & HTTP 200
  const isHttps = url.startsWith("https://") && status === 200;

  // 9. H1
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Count = h1Matches.length;
  const isH1Valid = h1Count === 1;

  // 10. Headings Hierarchy
  const h2Count = (html.match(/<h2\b/gi) || []).length;
  const hasSemanticHeadings = h2Count >= 2;

  // 11. Content Body
  const plainText = stripHtml(html);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const hasCrawlableBody = wordCount >= 300;

  // 12. Structured Lists
  const hasStructuredLists = /<ul\b|<ol\b/i.test(html);

  // 13. Direct Answers & Definitions
  const first150Words = plainText.split(/\s+/).slice(0, 150).join(" ").toLowerCase();
  const hasDirectAnswer =
    first150Words.includes("is ") ||
    first150Words.includes("refers to") ||
    first150Words.includes("means") ||
    first150Words.includes("definition") ||
    first150Words.includes("guide");

  // 14. Entity Clarity
  const entityMatches = ["dubai", "mumbai", "uae", "dgs", "d'genius solutions", "agency", "marketing"]
    .filter((e) => plainText.toLowerCase().includes(e));
  const hasEntityClarity = entityMatches.length >= 2;

  // ---------------------------------------------------------------------------
  // FAQ RECONCILIATION
  // ---------------------------------------------------------------------------
  // A. Detect Visible FAQ Section
  const headingTags = [...html.matchAll(/<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
  let visibleFaqHeadingIdx = -1;
  let visibleFaqHeadingText = "";

  for (const h of headingTags) {
    const text = stripHtml(h[2]).trim();
    if (/\bfaqs?\b|frequently asked questions|people also ask/i.test(text)) {
      visibleFaqHeadingIdx = h.index ?? html.indexOf(h[0]);
      visibleFaqHeadingText = text;
      break;
    }
  }

  if (visibleFaqHeadingIdx === -1) {
    const pFaqIdx = html.search(/frequently asked questions/i);
    if (pFaqIdx !== -1) {
      visibleFaqHeadingIdx = pFaqIdx;
      visibleFaqHeadingText = "Frequently Asked Questions";
    }
  }

  const hasVisibleFaqSection = visibleFaqHeadingIdx !== -1;
  const visibleFaqQuestions = [];
  if (hasVisibleFaqSection) {
    const faqSnippet = html.slice(visibleFaqHeadingIdx);
    const qMatches = [...faqSnippet.matchAll(/<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)];
    for (const qm of qMatches) {
      const q = stripHtml(qm[2]).trim();
      const a = stripHtml(qm[3]).trim();
      if (q && a && !q.toLowerCase().includes("faq") && !q.toLowerCase().includes("related post") && !q.toLowerCase().includes("accelerate your digital")) {
        visibleFaqQuestions.push(q);
      }
    }
  }

  // B. Detect Schema FAQPage
  const faqSchema = allObjects.find((o) => String(o["@type"] || "").toLowerCase() === "faqpage");
  const hasSchemaFaqPage = Boolean(faqSchema);
  const schemaFaqQuestions = [];
  if (faqSchema && Array.isArray(faqSchema.mainEntity)) {
    for (const item of faqSchema.mainEntity) {
      if (item && item.name) {
        schemaFaqQuestions.push(stripHtml(item.name).trim());
      }
    }
  }

  const visibleFaqQuestionCount = visibleFaqQuestions.length;
  const schemaFaqQuestionCount = schemaFaqQuestions.length;

  // C. Question Matching
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  let exactFaqMatch = false;
  if (visibleFaqQuestionCount > 0 && schemaFaqQuestionCount > 0) {
    const schemaNorm = schemaFaqQuestions.map(norm);
    const allMatch = visibleFaqQuestions.every((vq) => schemaNorm.includes(norm(vq)));
    exactFaqMatch = visibleFaqQuestionCount === schemaFaqQuestionCount && allMatch;
  } else if (visibleFaqQuestionCount === 0 && schemaFaqQuestionCount === 0) {
    exactFaqMatch = true; // Both 0 -> exact agreement
  }

  const isOverMarked = !hasVisibleFaqSection && hasSchemaFaqPage;
  const isMissing = hasVisibleFaqSection && !hasSchemaFaqPage;
  const isFaqValid = (hasVisibleFaqSection && hasSchemaFaqPage && exactFaqMatch) || (!hasVisibleFaqSection && !hasSchemaFaqPage);

  let faqStatus = "N/A";
  if (hasVisibleFaqSection) {
    faqStatus = hasSchemaFaqPage && exactFaqMatch ? "PASS" : "FAIL";
  } else if (isOverMarked) {
    faqStatus = "OVER-MARKED";
  }

  // ---------------------------------------------------------------------------
  // HowTo & Tables Conditionals
  // ---------------------------------------------------------------------------
  const hasVisibleHowToSteps = /<ol\b[^>]*class=["'][^"']*steps?[^"']*["']/i.test(html);
  const howToSchema = allObjects.find((o) => String(o["@type"] || "").toLowerCase() === "howto");
  let howToStatus = "N/A";
  if (hasVisibleHowToSteps) {
    howToStatus = howToSchema ? "PASS" : "FAIL";
  }

  const tableCount = (html.match(/<table\b/gi) || []).length;
  const tableStatus = tableCount > 0 ? "PASS" : "OPTIONAL/N/A";

  // ---------------------------------------------------------------------------
  // DGS AI VISIBILITY READINESS SCORE CALCULATION
  // ---------------------------------------------------------------------------
  // Mandatory technical items: 10 items (6 points each = 60 max)
  // Content quality items: 4 items (5 points each = 20 max)
  // Conditional items: up to 20 max points when applicable
  let earnedPoints = 0;
  let totalApplicablePoints = 80; // 60 tech + 20 content base

  // Technical (6 pts each)
  if (hasJsonLd) earnedPoints += 6;
  if (schemaBlogPostingValid) earnedPoints += 6;
  if (schemaPublisherValid) earnedPoints += 6;
  if (hasVisibleAuthor) earnedPoints += 6;
  if (hasVisibleDatePublished) earnedPoints += 6;
  if (hasVisibleDateModified) earnedPoints += 6;
  if (isCanonicalValid) earnedPoints += 6;
  if (isIndexable) earnedPoints += 6;
  if (isHttps) earnedPoints += 6;
  if (isH1Valid) earnedPoints += 6;

  // Content Quality (5 pts each)
  if (hasCrawlableBody) earnedPoints += 5;
  if (hasStructuredLists) earnedPoints += 5;
  if (hasDirectAnswer) earnedPoints += 5;
  if (hasEntityClarity) earnedPoints += 5;

  // Conditionals: FAQ
  if (faqStatus === "PASS") {
    earnedPoints += 10;
    totalApplicablePoints += 10;
  } else if (faqStatus === "FAIL" || faqStatus === "OVER-MARKED") {
    totalApplicablePoints += 10;
  }

  // Conditionals: HowTo
  if (howToStatus === "PASS") {
    earnedPoints += 5;
    totalApplicablePoints += 5;
  } else if (howToStatus === "FAIL") {
    totalApplicablePoints += 5;
  }

  // Conditionals: Tables
  if (tableStatus === "PASS") {
    earnedPoints += 5;
    totalApplicablePoints += 5;
  }

  const dgsAiVisibilityReadinessScore = Math.min(100, Math.round((earnedPoints / totalApplicablePoints) * 100));

  const issues = [];
  if (!hasJsonLd) issues.push("Missing JSON-LD structured data script");
  if (!schemaBlogPostingValid) issues.push("Incomplete or missing BlogPosting/Article schema");
  if (!schemaPublisherValid) issues.push("Publisher missing or uses non-native legacy WordPress logo URL");
  if (!hasVisibleAuthor) issues.push("Visible author byline missing");
  if (!hasVisibleDatePublished) issues.push("Visible published date missing or unparsed");
  if (!isCanonicalValid) issues.push(`Canonical URL mismatch: ${canonicalHref} !== ${url}`);
  if (!isH1Valid) issues.push(`Expected 1 H1 heading, found ${h1Count}`);
  if (faqStatus === "FAIL") issues.push("Page has visible FAQ section but is missing FAQPage schema or question match");
  if (faqStatus === "OVER-MARKED") issues.push("Page emitted FAQPage schema without a visible FAQ section");
  if (howToStatus === "FAIL") issues.push("Page has visible multi-step tutorial but is missing HowTo schema");

  return {
    url,
    status,
    hasJsonLd: hasJsonLd ? "PASS" : "FAIL",
    blogPosting: schemaBlogPostingValid ? "PASS" : "FAIL",
    author: hasVisibleAuthor ? "PASS" : "FAIL",
    publisher: schemaPublisherValid ? "PASS" : "FAIL",
    publisherLogoUrl: schemaPublisherLogoUrl,
    datePublished: hasVisibleDatePublished ? "PASS" : "FAIL",
    dateModified: hasVisibleDateModified ? "PASS" : "FAIL",
    canonical: isCanonicalValid ? "PASS" : "FAIL",
    indexable: isIndexable ? "PASS" : "FAIL",
    https: isHttps ? "PASS" : "FAIL",
    h1: isH1Valid ? "PASS" : "FAIL",
    headings: hasSemanticHeadings ? "PASS" : "FAIL",
    content: hasCrawlableBody ? "PASS" : "FAIL",
    structuredLists: hasStructuredLists ? "PASS" : "FAIL",
    breadcrumb: hasBreadcrumbSchema ? "PASS" : "FAIL",

    // FAQ Detailed Reconciliation
    visibleFaqSection: hasVisibleFaqSection ? "YES" : "NO",
    visibleFaqQuestionCount,
    visibleFaqQuestions,
    faqSchemaPresent: hasSchemaFaqPage ? "YES" : "NO",
    faqSchemaQuestionCount,
    schemaFaqQuestions,
    exactFaqMatch: exactFaqMatch ? "YES" : "NO",
    faqStatus,
    isOverMarked: isOverMarked ? "YES" : "NO",
    isMissing: isMissing ? "YES" : "NO",
    isFaqValid: isFaqValid ? "YES" : "NO",

    // Conditionals
    howToApplicable: hasVisibleHowToSteps ? "YES" : "NO",
    howToSchema: howToStatus,
    tableApplicable: tableCount > 0 ? "YES" : "NO",
    tableStatus,

    wordCount,
    dgsAiVisibilityReadinessScore,
    issues,
    extracted: {
      authorName: schemaAuthorName || visibleAuthorName,
      datePublished: schemaDatePublished,
      dateModified: schemaDateModified,
      imagesCount: schemaImages.length,
      publisherValid: schemaPublisherValid,
    }
  };
}

async function run() {
  console.log("================================================================================");
  console.log("DGS V8.8.8C — FINAL RECONCILIATION & AI READINESS AUDITOR (ALL 68 BLOGS)");
  console.log("================================================================================\n");

  const baseUrl = "https://www.dgeniussolutions.com";

  console.log("Fetching live sitemap.xml...");
  const sitemapRes = await fetchRawHtml(`${baseUrl}/sitemap.xml`);
  const blogUrls = [...sitemapRes.html.matchAll(/<loc>(https:\/\/www\.dgeniussolutions\.com\/blogs\/[^<]+)<\/loc>/g)].map(m => m[1]);

  console.log(`Discovered ${blogUrls.length} blog URLs in live sitemap.\n`);

  const results = [];
  for (let i = 0; i < blogUrls.length; i++) {
    const url = blogUrls[i];
    const slug = url.replace(/^https:\/\/www\.dgeniussolutions\.com\/blogs\/|\/$/g, "");
    process.stdout.write(`[${i + 1}/${blogUrls.length}] Auditing: ${slug}... `);

    try {
      const pageRes = await fetchRawHtml(url);
      const evalResult = evaluateBlogPage(url, pageRes.html, pageRes.status);
      results.push(evalResult);
      console.log(`Readiness: ${evalResult.dgsAiVisibilityReadinessScore}/100 | BlogPosting: ${evalResult.blogPosting} | Publisher: ${evalResult.publisher} | FAQ: ${evalResult.faqStatus} (Vis: ${evalResult.visibleFaqQuestionCount}, Schema: ${evalResult.faqSchemaQuestionCount})`);
    } catch (err) {
      console.log(`❌ ERROR: ${err.message}`);
      results.push({
        url,
        status: 500,
        dgsAiVisibilityReadinessScore: 0,
        blogPosting: "FAIL",
        author: "FAIL",
        publisher: "FAIL",
        datePublished: "FAIL",
        dateModified: "FAIL",
        canonical: "FAIL",
        indexable: "FAIL",
        https: "FAIL",
        issues: [err.message]
      });
    }
  }

  // Summary Metrics
  const total = results.length;
  const validBlogPostings = results.filter(r => r.blogPosting === "PASS").length;
  const validAuthors = results.filter(r => r.author === "PASS").length;
  const validPublishers = results.filter(r => r.publisher === "PASS").length;
  const validDatePublished = results.filter(r => r.datePublished === "PASS").length;
  const validDateModified = results.filter(r => r.dateModified === "PASS").length;
  const validCanonicals = results.filter(r => r.canonical === "PASS").length;
  const validIndexable = results.filter(r => r.indexable === "PASS").length;
  const validHttps = results.filter(r => r.https === "PASS").length;

  // FAQ Metrics
  const faqApplicableCount = results.filter(r => r.visibleFaqSection === "YES").length;
  const faqSchemaPresentCount = results.filter(r => r.faqSchemaPresent === "YES").length;
  const faqValidCount = results.filter(r => r.isFaqValid === "YES").length;
  const faqOverMarkedCount = results.filter(r => r.isOverMarked === "YES").length;
  const faqMissingCount = results.filter(r => r.isMissing === "YES").length;

  const avgScore = Math.round(results.reduce((acc, r) => acc + r.dgsAiVisibilityReadinessScore, 0) / total);

  console.log("\n================================================================================");
  console.log("FINAL AUDIT & RECONCILIATION REPORT");
  console.log("================================================================================");
  console.log(`Total Published Blogs Audited:         ${total}`);
  console.log(`Average DGS AI Visibility Readiness:   ${avgScore}/100`);
  console.log(`(Note: Internal readiness/audit score - does not imply Google, AI Overview, Search Console, or ChatGPT ranking score)`);
  console.log("--------------------------------------------------------------------------------");
  console.log("MANDATORY 68/68 REQUIREMENTS:");
  console.log(`  BlogPosting:                         ${validBlogPostings}/${total} (${Math.round((validBlogPostings / total) * 100)}%)`);
  console.log(`  Author (E-E-A-T):                    ${validAuthors}/${total} (${Math.round((validAuthors / total) * 100)}%)`);
  console.log(`  Publisher (Native Logo):             ${validPublishers}/${total} (${Math.round((validPublishers / total) * 100)}%)`);
  console.log(`  datePublished:                       ${validDatePublished}/${total} (${Math.round((validDatePublished / total) * 100)}%)`);
  console.log(`  dateModified:                        ${validDateModified}/${total} (${Math.round((validDateModified / total) * 100)}%)`);
  console.log(`  Canonical (Self-Referencing):        ${validCanonicals}/${total} (${Math.round((validCanonicals / total) * 100)}%)`);
  console.log(`  Indexable (robots index,follow):     ${validIndexable}/${total} (${Math.round((validIndexable / total) * 100)}%)`);
  console.log(`  HTTP 200 (HTTPS):                    ${validHttps}/${total} (${Math.round((validHttps / total) * 100)}%)`);
  console.log("--------------------------------------------------------------------------------");
  console.log("FAQ SCHEMA RECONCILIATION:");
  console.log(`  FAQ Applicable Count:                ${faqApplicableCount}`);
  console.log(`  FAQ Schema Present Count:            ${faqSchemaPresentCount}`);
  console.log(`  FAQ Valid Count:                     ${faqValidCount}`);
  console.log(`  FAQ Over-Marked Count:               ${faqOverMarkedCount}`);
  console.log(`  FAQ Missing Count:                   ${faqMissingCount}`);
  console.log("================================================================================\n");

  fs.writeFileSync("data/audit/ai-visibility-68-blogs.json", JSON.stringify(results, null, 2));
  console.log("Audit saved to: data/audit/ai-visibility-68-blogs.json\n");
}

run().catch(console.error);
