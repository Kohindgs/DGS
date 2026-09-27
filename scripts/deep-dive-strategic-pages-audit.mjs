import fs from "node:fs";
import path from "node:path";

const TARGET_URLS = [
  "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
  "https://www.dgeniussolutions.com/services/dubai-seo/",
  "https://www.dgeniussolutions.com/aeo-dubai/",
  "https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/",
  "https://www.dgeniussolutions.com/services/geo/",
  "https://www.dgeniussolutions.com/services/llm-seo-service/",
];

console.log("=== EXECUTING LIVE STRATEGIC PAGES FORENSIC AUDIT ===");

async function auditPage(url) {
  const t0 = performance.now();
  let res, html, ttfb;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": "DGS-DeepDive-Auditor/1.0 (+https://www.dgeniussolutions.com)",
      },
      redirect: "follow",
    });
    ttfb = Math.round(performance.now() - t0);
    html = await res.text();
  } catch (err) {
    return { url, error: err.message };
  }

  // 1. HTTP & Latency
  const status = res.status;
  const contentType = res.headers.get("content-type") || "";

  // 2. Title & Meta
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : null;

  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)
    || html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : null;

  const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
  const robots = robotsMatch ? robotsMatch[1].trim() : null;

  // OpenGraph
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
  const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i);
  const ogUrlMatch = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']*)["']/i);

  // 3. Headings
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").trim());
  const h2Matches = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").trim());
  const h3Matches = [...html.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").trim());

  // 4. Schema (JSON-LD)
  const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const schemas = [];
  for (const block of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(block[1]);
      if (Array.isArray(parsed)) {
        parsed.forEach(s => schemas.push(s["@type"]));
      } else if (parsed["@graph"]) {
        parsed["@graph"].forEach(s => schemas.push(s["@type"]));
      } else if (parsed["@type"]) {
        schemas.push(parsed["@type"]);
      }
    } catch {
      schemas.push("INVALID_JSON");
    }
  }

  // 5. Images
  const imgMatches = [...html.matchAll(/<img[^>]+>/gi)];
  let missingAlts = 0;
  for (const m of imgMatches) {
    const tag = m[0];
    const src = (tag.match(/src=["']([^"']*)["']/i) || [])[1] || "";
    const altMatch = tag.match(/alt=["']([^"']*)["']/i);
    const isDecorativeAttr = tag.includes('aria-hidden="true"') || tag.includes('role="presentation"');
    const looksDecorative = isDecorativeAttr || /icon|bullet|arrow|decor|divider|separator|bg-|shape/i.test(src);

    if (!altMatch || (!altMatch[1].trim() && !looksDecorative)) {
      missingAlts++;
    }
  }

  return {
    url,
    status,
    ttfb: `${ttfb}ms`,
    title,
    titleLen: title ? title.length : 0,
    description: description ? description.slice(0, 100) + "..." : null,
    descLen: description ? description.length : 0,
    canonical,
    canonicalMatch: canonical === url,
    robots: robots || "index, follow (default)",
    og: {
      hasTitle: Boolean(ogTitleMatch),
      hasDesc: Boolean(ogDescMatch),
      hasImage: Boolean(ogImageMatch),
      hasUrl: Boolean(ogUrlMatch),
    },
    h1Count: h1Matches.length,
    h1s: h1Matches,
    h2Count: h2Matches.length,
    h3Count: h3Matches.length,
    schemas,
    totalImages: imgMatches.length,
    missingAlts,
  };
}

async function run() {
  const results = [];
  for (const url of TARGET_URLS) {
    console.log(`Auditing: ${url}...`);
    const r = await auditPage(url);
    results.push(r);
  }

  console.log("\n==================== STRATEGIC AUDIT SUMMARY ====================");
  results.forEach((r, idx) => {
    console.log(`\n[PAGE ${idx + 1}] ${r.url}`);
    console.log(`  HTTP:        ${r.status} (TTFB: ${r.ttfb})`);
    console.log(`  Title:       "${r.title}" (${r.titleLen} chars)`);
    console.log(`  Description: "${r.description}" (${r.descLen} chars)`);
    console.log(`  Canonical:   ${r.canonical} (Self-referential: ${r.canonicalMatch})`);
    console.log(`  Robots:      ${r.robots}`);
    console.log(`  OpenGraph:   Title:${r.og.hasTitle} | Desc:${r.og.hasDesc} | Img:${r.og.hasImage} | Url:${r.og.hasUrl}`);
    console.log(`  H1 (${r.h1Count}):     ${r.h1s.join(" | ")}`);
    console.log(`  Headings:    H2: ${r.h2Count} | H3: ${r.h3Count}`);
    console.log(`  Schemas:     ${r.schemas.join(", ")}`);
    console.log(`  Images:      Total: ${r.totalImages} | Missing Alt: ${r.missingAlts}`);
  });

  fs.writeFileSync("./data/audit/strategic-pages-audit.json", JSON.stringify(results, null, 2), "utf8");
  console.log("\nSaved detailed report to data/audit/strategic-pages-audit.json");
}

run();
