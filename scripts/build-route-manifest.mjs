import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const regPath = path.join(ROOT, "data/migration/nextjs-route-registry.generated.json");
const blocksPath = path.join(ROOT, "data/wordpress/blocks/content-blocks.generated.json");
const retiredPath = path.join(ROOT, "data/migration/retired-routes.approved.json");
const decisionsPath = path.join(ROOT, "data/migration/route-decisions.approved.json");

const rawReg = JSON.parse(fs.readFileSync(regPath, "utf8"));
const rawBlocks = JSON.parse(fs.readFileSync(blocksPath, "utf8"));
const retiredRoutes = JSON.parse(fs.readFileSync(retiredPath, "utf8"));
const routeDecisions = JSON.parse(fs.readFileSync(decisionsPath, "utf8"));

const retiredList = retiredRoutes.retired || retiredRoutes;
const retiredSet = new Set(retiredList.map(r => typeof r === "string" ? r : r.path));
const decisionsMap = new Map((routeDecisions.decisions || routeDecisions).map(d => [d.path, d]));

console.log("================================================================================");
console.log("   GENERATING CANONICAL PUBLIC ROUTE MANIFEST & FRESHNESS HASHES");
console.log("================================================================================");

// Load existing hash registry if exists
const hashRegistryPath = path.join(ROOT, "data/seo/route-content-hashes.json");
let hashRegistry = {};
if (fs.existsSync(hashRegistryPath)) {
  try {
    hashRegistry = JSON.parse(fs.readFileSync(hashRegistryPath, "utf8"));
  } catch {}
}

// Function to classify content type
function getContentType(p) {
  if (p === "/") return "home";
  if (p.startsWith("/blogs/")) return "blog";
  if (p.startsWith("/career/")) return "career";
  if (p === "/portfolio/" || p.includes("case-study") || p === "/case_studies/") return "case-study";
  if (p.includes("banglore") || p.includes("gurugram") || p.includes("pune") || p.includes("hyderabad")) return "location";
  if (p.includes("dubai") || p.includes("australia") || p.includes("us-landing")) return "international";
  if (p.startsWith("/services/")) return "service";
  if (p === "/about-us/" || p === "/contact-us/" || p === "/our-services/" || p === "/privacy-policy/" || p === "/seo-pricing/") return "company";
  return "general";
}

// Function to classify service cluster
function getServiceCluster(p) {
  const lp = p.toLowerCase();
  if (lp.includes("aeo") || lp.includes("geo") || lp.includes("llm")) return "ai-search";
  if (lp.includes("ai-video") || lp.includes("video") || lp.includes("motion-graphics")) return "creative-video";
  if (lp.includes("seo")) return "seo";
  if (lp.includes("website") || lp.includes("web-dev") || lp.includes("amc")) return "web-dev";
  if (lp.includes("performance") || lp.includes("ads") || lp.includes("marketing-strategy")) return "performance";
  if (lp.includes("branding")) return "branding";
  if (lp.includes("content")) return "content";
  if (lp === "/" || lp === "/about-us/" || lp === "/contact-us/" || lp === "/our-services/" || lp === "/career/" || lp === "/portfolio/") return "company";
  return "general";
}

// Function to classify market
function getMarket(p) {
  const lp = p.toLowerCase();
  if (lp.includes("dubai")) return "AE";
  if (lp.includes("us-landing")) return "US";
  if (lp.includes("australia")) return "AU";
  if (lp.includes("mumbai") || lp.includes("banglore") || lp.includes("pune") || lp.includes("hyderabad") || lp.includes("gurugram")) return "IN";
  return "GLOBAL";
}

// Truthful modification date determination:
function determineMeaningfulDate(routePath, currentHash, existingEntry, r) {
  // 1. Pages with proven git commit modifications:
  if (
    routePath === "/" ||
    routePath === "/services/ai-video-production-agency/" ||
    routePath === "/seo-pricing/" ||
    routePath === "/contact-us/" ||
    routePath === "/career/"
  ) {
    return "2026-10-06";
  }

  // 2. Dubai pages with verified commits in a592d01
  if (
    routePath === "/services/dubai-seo/" ||
    routePath === "/services/ai-production-dubai-page/" ||
    routePath === "/aeo-dubai/"
  ) {
    return "2026-10-01";
  }

  // 3. If content hash changed after baseline was recorded: record change date
  if (existingEntry && existingEntry.contentHash && existingEntry.contentHash !== currentHash) {
    return new Date().toISOString().slice(0, 10);
  }

  // 4. Authentic historical modified date from source content registry:
  if (r && r.modified) {
    const d = new Date(r.modified);
    if (!isNaN(d.getTime())) {
      const iso = d.toISOString().slice(0, 10);
      if (iso <= "2026-10-12") {
        return iso;
      }
    }
  }

  // 5. If meaningful date cannot be proven: return null (never fabricate dates!)
  return null;
}

const manifestRoutes = [];
fs.mkdirSync(path.join(ROOT, "data/seo"), { recursive: true });

for (const r of rawReg.routes) {
  if (retiredSet.has(r.path)) continue;

  const decision = decisionsMap.get(r.path);
  const isIndexable = decision?.indexable ?? r.indexable;
  const inSitemap = (r.proposedAction === "KEEP_SAME_URL" || r.proposedAction === "PROTECTED") && isIndexable;

  const canonicalPath = r.desiredCanonicalPath || r.canonical || r.path;
  const canonicalUrl = canonicalPath.startsWith("http")
    ? canonicalPath
    : `https://www.dgeniussolutions.com${canonicalPath}`;

  const blockData = rawBlocks.blocks[r.path];
  const visibleTextSha = blockData?.visibleTextSha256 || "";

  // Content Hash calculation (sensitive to meaningful content, metadata, schema, and text)
  const hashMaterial = `${r.path}|${r.title || ""}|${r.description || ""}|${canonicalUrl}|${visibleTextSha}|${(r.headings || []).map(h=>h.text).join(",")}|${(r.faqItems || []).map(f=>f.question).join(",")}`;
  const currentContentHash = crypto.createHash("sha256").update(hashMaterial).digest("hex").slice(0, 16);

  const existingEntry = hashRegistry[r.path];
  const lastModified = determineMeaningfulDate(r.path, currentContentHash, existingEntry, r);

  hashRegistry[r.path] = {
    contentHash: currentContentHash,
    lastModified: lastModified || null,
    title: r.title || "",
    updatedAt: new Date().toISOString(),
  };

  const item = {
    path: r.path,
    canonical: canonicalUrl,
    indexable: isIndexable,
    includeInSitemap: inSitemap,
    title: r.title || "",
    description: r.description || "",
    contentType: getContentType(r.path),
    serviceCluster: getServiceCluster(r.path),
    market: getMarket(r.path),
  };
  if (lastModified) {
    item.lastModified = lastModified;
  }
  manifestRoutes.push(item);
}

// Write updated hash registry
fs.writeFileSync(hashRegistryPath, JSON.stringify(hashRegistry, null, 2), "utf8");
console.log(`✓ Wrote ${Object.keys(hashRegistry).length} route content hashes to data/seo/route-content-hashes.json`);

// Summary metrics
const sitemapRoutes = manifestRoutes.filter(r => r.includeInSitemap);
console.log(`Total public routes evaluated: ${manifestRoutes.length}`);
console.log(`Total sitemap-eligible routes: ${sitemapRoutes.length}`);

const dateDist = {};
for (const r of sitemapRoutes) {
  dateDist[r.lastModified] = (dateDist[r.lastModified] || 0) + 1;
}
console.log("Sitemap Lastmod Date Distribution:", dateDist);
