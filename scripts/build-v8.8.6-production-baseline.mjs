import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://www.dgeniussolutions.com";

const FORBIDDEN_LABELS = [
  "Internal Link",
  "Target Keyword",
  "AI Overview Answer",
  "SEO Notes",
  "SEO Note",
  "Case Signal",
  "India SEO",
  "Mumbai SEO",
  "Local SEO",
  "Crawler Notes",
  "Editor Note",
  "CMS Note",
  "Debug",
  "Internal Only",
];

const MUMBAI_LOCALITIES = [
  "Andheri",
  "Worli",
  "Fort",
  "Churchgate",
  "Colaba",
  "Bandra",
  "BKC",
  "Juhu",
  "Powai",
  "Lower Parel",
  "Dadar",
  "Malad",
  "Borivali",
  "Thane",
  "Navi Mumbai",
];

function cleanText(str) {
  if (!str) return "";
  return str.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseJsonLd(html) {
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocks = [];
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        blocks.push(...parsed);
      } else if (parsed["@graph"] && Array.isArray(parsed["@graph"])) {
        blocks.push(...parsed["@graph"]);
      } else {
        blocks.push(parsed);
      }
    } catch {}
  }
  return blocks;
}

function extractSchemaFields(jsonLdBlocks) {
  const types = new Set();
  const names = [];
  const headlines = [];
  const serviceTypes = [];
  const areasServed = [];

  function walk(obj) {
    if (!obj || typeof obj !== "object") return;
    if (obj["@type"]) {
      if (Array.isArray(obj["@type"])) obj["@type"].forEach((t) => types.add(t));
      else types.add(obj["@type"]);
    }
    if (obj.name && typeof obj.name === "string") names.push(obj.name);
    if (obj.headline && typeof obj.headline === "string") headlines.push(obj.headline);
    if (obj.serviceType) {
      if (Array.isArray(obj.serviceType)) serviceTypes.push(...obj.serviceType);
      else serviceTypes.push(obj.serviceType);
    }
    if (obj.areaServed) {
      if (Array.isArray(obj.areaServed)) {
        for (const item of obj.areaServed) {
          if (typeof item === "string") areasServed.push(item);
          else if (item && item.name) areasServed.push(item.name);
        }
      } else if (typeof obj.areaServed === "string") {
        areasServed.push(obj.areaServed);
      } else if (obj.areaServed.name) {
        areasServed.push(obj.areaServed.name);
      }
    }

    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) {
        obj[key].forEach(walk);
      } else if (typeof obj[key] === "object") {
        walk(obj[key]);
      }
    }
  }

  jsonLdBlocks.forEach(walk);

  return {
    schemaTypes: Array.from(types),
    schemaNames: names,
    schemaHeadlines: headlines,
    schemaServiceTypes: serviceTypes,
    schemaAreaServed: areasServed,
  };
}

function extractBreadcrumbs(html, jsonLdBlocks) {
  // Try BreadcrumbList schema
  for (const block of jsonLdBlocks) {
    if (block["@type"] === "BreadcrumbList" && Array.isArray(block.itemListElement)) {
      const items = block.itemListElement
        .map((el) => el.name || el.item?.name)
        .filter(Boolean);
      if (items.length > 0) return items.join(" > ");
    }
  }
  // Try DOM breadcrumb
  const domBreadcrumbMatch = html.match(/<nav[^>]*aria-label=["']breadcrumb["'][^>]*>([\s\S]*?)<\/nav>/i);
  if (domBreadcrumbMatch) {
    return cleanText(domBreadcrumbMatch[1]);
  }
  return null;
}

async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "DGS-Baseline-Crawler/1.0",
        },
      });
      const html = await res.text();
      return { status: res.status, headers: res.headers, html };
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}

async function main() {
  console.log("=== DGS V8.8.6 — PRODUCTION BASELINE CRAWLER ===");

  // 1. Fetch live sitemap
  console.log("Fetching live sitemap from production...");
  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`, {
    headers: { "User-Agent": "DGS-Baseline-Crawler/1.0" },
  });
  const sitemapXml = await sitemapRes.text();
  const sitemapUrls = new Set([...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()));
  console.log(`Live sitemap contains ${sitemapUrls.size} URLs.`);

  // 2. Build complete URL list to audit
  const additionalUrls = [
    `${BASE_URL}/services/`,
    `${BASE_URL}/our-services/`,
  ];

  const allUrlsSet = new Set([...sitemapUrls, ...additionalUrls]);
  const urlList = Array.from(allUrlsSet).sort();
  console.log(`Total URLs to crawl: ${urlList.length}`);

  // 3. Concurrency pool
  const concurrency = 5;
  const rawResults = [];
  const linkGraph = new Map(); // targetUrl -> array of { fromUrl, anchor }
  const archiveCardTitles = new Map(); // targetUrl -> cardTitle

  for (let i = 0; i < urlList.length; i += concurrency) {
    const chunk = urlList.slice(i, i + concurrency);
    const chunkPromises = chunk.map(async (url) => {
      try {
        const { status, headers, html } = await fetchWithRetry(url);
        return { url, status, headers, html };
      } catch (err) {
        return { url, status: 0, error: err.message, html: "" };
      }
    });

    const chunkResults = await Promise.all(chunkPromises);
    rawResults.push(...chunkResults);
    process.stdout.write(`\rCrawled ${rawResults.length}/${urlList.length} pages...`);
  }
  console.log("\nCrawl complete. Processing page signals and link graph...");

  // 4. First pass: extract links and archive card titles
  for (const item of rawResults) {
    if (!item.html) continue;

    // Check archive card titles on /services/ and /our-services/
    const isServiceHub = item.url.endsWith("/services/") || item.url.endsWith("/our-services/");
    if (isServiceHub) {
      // Look for article or card links
      const cardRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
      let cardMatch;
      while ((cardMatch = cardRegex.exec(item.html)) !== null) {
        const cardHtml = cardMatch[1];
        const linkMatch = cardHtml.match(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
        const headingMatch = cardHtml.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
        if (linkMatch) {
          const href = linkMatch[1];
          const fullHref = href.startsWith("http") ? href : new URL(href, BASE_URL).href;
          const cardTitle = cleanText(headingMatch ? headingMatch[1] : linkMatch[2]);
          if (cardTitle) {
            archiveCardTitles.set(fullHref, cardTitle);
          }
        }
      }
    }

    // Extract all links for internal anchor mapping
    const anchorRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let anchorMatch;
    while ((anchorMatch = anchorRegex.exec(item.html)) !== null) {
      const href = anchorMatch[1];
      const anchor = cleanText(anchorMatch[2]);
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
        continue;
      }
      try {
        const resolved = new URL(href, item.url).href;
        if (resolved.startsWith(BASE_URL) && anchor) {
          if (!linkGraph.has(resolved)) linkGraph.set(resolved, []);
          linkGraph.get(resolved).push({ fromUrl: item.url, anchor });
        }
      } catch {}
    }
  }

  // 5. Second pass: build comprehensive baseline report per URL
  const pagesAudit = [];

  for (const item of rawResults) {
    const { url, status, html } = item;
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    if (status !== 200) {
      pagesAudit.push({
        url,
        pathname,
        httpStatus: status,
        indexability: "NON_200",
        sitemapPresence: sitemapUrls.has(url),
      });
      continue;
    }

    // Canonical
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1].trim() : null;

    // Robots
    const metaRobotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)["']/i);
    const metaRobots = metaRobotsMatch ? metaRobotsMatch[1].trim() : null;
    const xRobotsTag = item.headers?.get ? item.headers.get("x-robots-tag") : null;
    const robotsDirectives = metaRobots || xRobotsTag || "index, follow (default)";

    const isNoindex = (metaRobots && metaRobots.toLowerCase().includes("noindex")) ||
                      (xRobotsTag && xRobotsTag.toLowerCase().includes("noindex"));
    const isSelfCanonical = canonical === url;
    const indexability = !isNoindex && status === 200 ? (isSelfCanonical ? "INDEXABLE_SELF_CANONICAL" : "INDEXABLE_CROSS_CANONICAL") : "NOINDEX";

    // Titles & Headings
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const htmlTitle = titleMatch ? titleMatch[1].trim() : null;

    const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : null;

    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? cleanText(h1Match[1]) : null;

    const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => cleanText(m[1]));

    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : null;

    const twitterTitleMatch = html.match(/<meta[^>]+name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
    const twitterTitle = twitterTitleMatch ? twitterTitleMatch[1].trim() : null;

    // Schema
    const jsonLdBlocks = parseJsonLd(html);
    const schemaData = extractSchemaFields(jsonLdBlocks);
    const breadcrumbLabel = extractBreadcrumbs(html, jsonLdBlocks);

    // CMS / Archive card title
    const servicesArchiveCardTitle = archiveCardTitles.get(url) || null;

    // Internal anchors pointing to this page
    const incomingLinks = linkGraph.get(url) || [];
    const uniqueAnchors = Array.from(new Set(incomingLinks.map((l) => l.anchor))).slice(0, 20);

    // Editorial labels scan
    const editorialLabelsFound = [];
    for (const label of FORBIDDEN_LABELS) {
      if (html.includes(label)) {
        editorialLabelsFound.push(label);
      }
    }

    // CMS name leakage check (" page")
    const cmsPageNameLeakage = [];
    if (htmlTitle && /\b\w+\s+page\b/i.test(htmlTitle)) {
      cmsPageNameLeakage.push(`Title: "${htmlTitle}"`);
    }
    if (h1 && /\b\w+\s+page\b/i.test(h1)) {
      cmsPageNameLeakage.push(`H1: "${h1}"`);
    }
    if (servicesArchiveCardTitle && /\b\w+\s+page\b/i.test(servicesArchiveCardTitle)) {
      cmsPageNameLeakage.push(`Card: "${servicesArchiveCardTitle}"`);
    }

    // Mumbai / India template contamination check (only on Dubai/UAE pages)
    const isDubaiPage = pathname.includes("dubai") || pathname.includes("uae") || pathname === "/aeo-dubai/";
    const mumbaiContamination = [];
    if (isDubaiPage) {
      for (const loc of MUMBAI_LOCALITIES) {
        const regex = new RegExp(`\\b${loc}\\b`, "i");
        if (regex.test(html)) {
          mumbaiContamination.push(loc);
        }
      }
    }

    pagesAudit.push({
      url,
      pathname,
      httpStatus: status,
      indexability,
      canonical,
      htmlTitle,
      metaDescription,
      h1,
      h2s: h2Matches,
      ogTitle,
      twitterTitle,
      breadcrumbLabel,
      servicesArchiveCardTitle,
      schemaTypes: schemaData.schemaTypes,
      schemaNames: schemaData.schemaNames,
      schemaHeadlines: schemaData.schemaHeadlines,
      schemaServiceTypes: schemaData.schemaServiceTypes,
      schemaAreaServed: schemaData.schemaAreaServed,
      internalAnchors: uniqueAnchors,
      incomingLinksCount: incomingLinks.length,
      robotsDirectives,
      sitemapPresence: sitemapUrls.has(url),
      editorialLabelsFound,
      cmsPageNameLeakage,
      mumbaiContamination: isDubaiPage ? mumbaiContamination : undefined,
    });
  }

  // Summary statistics
  const summary = {
    crawledAt: new Date().toISOString(),
    totalUrls: pagesAudit.length,
    sitemapUrlsCount: sitemapUrls.size,
    pagesWithEditorialLabels: pagesAudit.filter((p) => p.editorialLabelsFound && p.editorialLabelsFound.length > 0).map((p) => ({
      pathname: p.pathname,
      labels: p.editorialLabelsFound,
    })),
    pagesWithCmsPageLeakage: pagesAudit.filter((p) => p.cmsPageNameLeakage && p.cmsPageNameLeakage.length > 0).map((p) => ({
      pathname: p.pathname,
      leakage: p.cmsPageNameLeakage,
    })),
    dubaiPagesContamination: pagesAudit.filter((p) => p.mumbaiContamination && p.mumbaiContamination.length > 0).map((p) => ({
      pathname: p.pathname,
      contamination: p.mumbaiContamination,
    })),
  };

  const finalOutput = {
    summary,
    pages: pagesAudit,
  };

  const outPath = path.join(process.cwd(), "data/audit/v8.8.6-before-production-baseline.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(finalOutput, null, 2), "utf8");

  console.log(`\n=== BASELINE CRAWL COMPLETE ===`);
  console.log(`Saved baseline to: ${outPath}`);
  console.log(`Summary:`);
  console.log(`- Total URLs: ${summary.totalUrls}`);
  console.log(`- Pages with editorial labels: ${summary.pagesWithEditorialLabels.length}`);
  console.log(JSON.stringify(summary.pagesWithEditorialLabels, null, 2));
  console.log(`- Pages with CMS 'page' leakage: ${summary.pagesWithCmsPageLeakage.length}`);
  console.log(JSON.stringify(summary.pagesWithCmsPageLeakage, null, 2));
  console.log(`- Dubai pages with Mumbai contamination: ${summary.dubaiPagesContamination.length}`);
  console.log(JSON.stringify(summary.dubaiPagesContamination, null, 2));
}

main().catch(console.error);
