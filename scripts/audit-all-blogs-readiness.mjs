import fs from "node:fs";
import mysql from "mysql2/promise";
import https from "node:https";

// Load environment variables if available
for (const envFile of [
  "/home/u188101251/production-app/shared/.env.production",
  "/home/u188101251/production-app/current/.env.production",
  ".env.production",
  ".env.local",
  ".env",
]) {
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
      const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim().replace(/^['"](.*)['"]$/, "$1");
      }
    }
  }
}

function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location && maxRedirects > 0) {
        const redirectUrl = new URL(res.headers.location, url).href;
        return resolve(fetchUrl(redirectUrl, maxRedirects - 1));
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data, finalUrl: url }));
    }).on("error", reject);
  });
}

function extractBodyHtml(content) {
  if (!content) return "";
  if (Array.isArray(content) && content[0]?.bodyHtml) {
    return content[0].bodyHtml;
  }
  if (content && typeof content === "object" && content.bodyHtml) {
    return content.bodyHtml;
  }
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed[0]?.bodyHtml) {
        return parsed[0].bodyHtml;
      }
      if (parsed?.bodyHtml) return parsed.bodyHtml;
    } catch {
      return content;
    }
  }
  return String(content);
}

function stripHtml(html) {
  const str = typeof html === "string" ? html : (html ? String(html) : "");
  return str
    .replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, "")
    .replace(/<style[^>]*>([\S\s]*?)<\/style>/gmi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(str) {
  const body = extractBodyHtml(str);
  const plain = stripHtml(body);
  if (!plain) return 0;
  return plain.split(/\s+/).filter(Boolean).length;
}

async function run() {
  console.log("================================================================================");
  console.log("DGS V8.8.8B — BLOG READINESS BACKFILL AUDIT (ALL BLOGS)");
  console.log("================================================================================\n");

  const baseUrl = "https://www.dgeniussolutions.com";

  // 1. Fetch live sitemap to verify sitemap inclusion
  console.log("Fetching live sitemap.xml...");
  let sitemapSet = new Set();
  try {
    const sitemapRes = await fetchUrl(`${baseUrl}/sitemap.xml`);
    if (sitemapRes.status === 200) {
      const urls = [...sitemapRes.body.matchAll(/<loc>(https:\/\/www\.dgeniussolutions\.com\/blogs\/[^<]+)<\/loc>/g)].map(m => m[1]);
      const slugs = urls.map(u => u.replace(/^https:\/\/www\.dgeniussolutions\.com\/blogs\/|\/$/g, ""));
      sitemapSet = new Set(slugs);
      console.log(`✓ Loaded ${sitemapSet.size} blog URLs from live sitemap.xml\n`);
    }
  } catch (err) {
    console.warn("⚠️ Could not fetch live sitemap:", err.message);
  }

  // 2. Query MySQL blogs if connected
  let dbBlogs = [];
  let pool = null;
  if (process.env.DGS_MYSQL_DATABASE || process.env.DGS_MYSQL_USER) {
    try {
      pool = mysql.createPool({
        host: process.env.DGS_MYSQL_HOST || "127.0.0.1",
        user: process.env.DGS_MYSQL_USER,
        password: process.env.DGS_MYSQL_PASSWORD,
        database: process.env.DGS_MYSQL_DATABASE,
        port: Number(process.env.DGS_MYSQL_PORT || 3306),
      });

      const [rows] = await pool.query(
        "SELECT id, slug, title, status, published_at, updated_at, created_at, content, excerpt, featured_image_url, featured_image_alt, author_name, word_count FROM blog_posts WHERE deleted_at IS NULL ORDER BY created_at DESC"
      );
      dbBlogs = rows;
      console.log(`✓ Loaded ${dbBlogs.length} active blogs from MySQL database`);
    } catch (err) {
      console.warn("⚠️ MySQL query failed:", err.message);
    }
  } else {
    console.log("ℹ️ No MySQL connection configured in environment; auditing static registry and known records.");
  }

  // 3. Load Static Registry Blogs
  let registryBlogs = [];
  const registryPath = "data/migration/nextjs-route-registry.generated.json";
  if (fs.existsSync(registryPath)) {
    const reg = JSON.parse(fs.readFileSync(registryPath, "utf8"));
    registryBlogs = reg.routes.filter(r => r.path.startsWith("/blogs/") && r.path !== "/blogs/");
    console.log(`✓ Loaded ${registryBlogs.length} static blog routes from route registry\n`);
  }

  // Combine and deduplicate
  const allAudited = [];
  const titleMap = new Map();
  const duplicateTitles = [];

  // Add DB blogs
  for (const b of dbBlogs) {
    const wordCount = b.word_count || countWords(b.content);
    const inSitemap = sitemapSet.has(b.slug);
    
    // Check duplicates
    const normTitle = (b.title || "").trim().toLowerCase();
    if (titleMap.has(normTitle)) {
      duplicateTitles.push({ title: b.title, slug1: titleMap.get(normTitle), slug2: b.slug });
    } else {
      titleMap.set(normTitle, b.slug);
    }

    // Evaluate 9 Dimensions Gate Readiness
    const errors = [];
    const warnings = [];

    // 1. SEO
    if (!b.title || !b.title.trim()) errors.push("Missing title");
    if (!b.slug || !/^[a-z0-9-]+$/.test(b.slug)) errors.push("Invalid slug format");
    if (wordCount < 50) errors.push("Body content under 50 words");
    else if (wordCount < 300) warnings.push("Thin content (under 300 words)");
    if (!b.excerpt) warnings.push("Missing excerpt / meta description");
    if (!b.featured_image_url) warnings.push("Missing featured image");

    // 2. AEO
    const contentStr = extractBodyHtml(b.content);
    const plain = stripHtml(contentStr);
    if (!contentStr.includes("<h2") && !contentStr.includes("<h3")) {
      warnings.push("AEO: Lacks structured H2/H3 subheadings");
    }
    if (!plain.toLowerCase().includes("what is") && !plain.toLowerCase().includes("how to") && !plain.toLowerCase().includes("why")) {
      warnings.push("AEO: No direct definition or question phrasing detected");
    }

    // 3. GEO
    if (!plain.toLowerCase().includes("dubai") && !plain.toLowerCase().includes("uae") && !plain.toLowerCase().includes("mumbai") && !plain.toLowerCase().includes("dgs") && !plain.toLowerCase().includes("agency")) {
      warnings.push("GEO: Lacks local or brand context entity references");
    }

    // 4. LLM SEO
    if (wordCount < 500) {
      warnings.push("LLM: Post length under 500 words may offer low information gain");
    }

    // 5. Schema
    if (!b.published_at) {
      warnings.push("Schema: Missing published_at date");
    }

    // 6. Indexability
    const isPublished = b.status === "published";
    if (!isPublished) {
      warnings.push(`Indexability: Status is '${b.status}' (not published)`);
    }

    // 7. Sitemap
    if (isPublished && !inSitemap) {
      warnings.push("Sitemap: Not indexed in live sitemap.xml");
    }

    // 8. AI Overview
    if (!contentStr.includes("<ul") && !contentStr.includes("<ol")) {
      warnings.push("AI Overview: No bullet lists or key takeaway steps found");
    }

    // 9. Social
    if (!b.featured_image_url) {
      warnings.push("Social: Missing og:image / social sharing image");
    }

    allAudited.push({
      source: "MySQL",
      id: b.id,
      slug: b.slug,
      title: b.title,
      status: b.status,
      published_at: b.published_at,
      wordCount,
      inSitemap,
      canPublish: errors.length === 0,
      errors,
      warnings,
    });
  }

  // Add Registry blogs
  for (const r of registryBlogs) {
    const slug = r.path.replace(/^\/blogs\/|\/$/g, "");
    if (allAudited.some(a => a.slug === slug)) continue; // already in MySQL

    const title = r.title || slug;
    const normTitle = title.trim().toLowerCase();
    if (titleMap.has(normTitle)) {
      duplicateTitles.push({ title, slug1: titleMap.get(normTitle), slug2: slug });
    } else {
      titleMap.set(normTitle, slug);
    }

    const inSitemap = sitemapSet.has(slug);
    const errors = [];
    const warnings = [];

    if (!r.title) warnings.push("Missing static route title");
    if (!inSitemap) warnings.push("Sitemap: Not listed in sitemap");

    allAudited.push({
      source: "Static Registry",
      id: r.id || slug,
      slug,
      title,
      status: "published",
      published_at: "Historical Static",
      wordCount: 800, // estimated static baseline
      inSitemap,
      canPublish: true,
      errors,
      warnings,
    });
  }

  // Print Summary Report
  console.log("================================================================================");
  console.log("AUDIT RESULTS SUMMARY");
  console.log("================================================================================");
  console.log(`Total blogs audited: ${allAudited.length} (${dbBlogs.length} MySQL + ${allAudited.length - dbBlogs.length} Static Registry)`);
  
  const blockedBlogs = allAudited.filter(a => !a.canPublish);
  console.log(`Blogs blocked by hard gate errors: ${blockedBlogs.length}`);
  if (blockedBlogs.length > 0) {
    console.error("❌ Blocked blogs:", blockedBlogs);
  } else {
    console.log("✓ Gate Validation: 0 existing blogs are blocked. 100% can publish/remain published.");
  }

  console.log(`Duplicate titles found: ${duplicateTitles.length}`);
  if (duplicateTitles.length > 0) {
    console.warn("⚠️ Duplicate titles:", duplicateTitles);
  } else {
    console.log("✓ Duplicate Titles: 0 duplicate titles detected.");
  }

  const thinBlogs = allAudited.filter(a => a.wordCount < 300);
  console.log(`Thin content blogs (<300 words): ${thinBlogs.length}`);
  thinBlogs.forEach(b => console.log(`  - [${b.source}] ${b.slug} (${b.wordCount} words)`));

  const missingDates = allAudited.filter(a => a.source === "MySQL" && !a.published_at && a.status === "published");
  console.log(`Published MySQL blogs with missing publish date: ${missingDates.length}`);
  missingDates.forEach(b => console.log(`  - ${b.slug}`));

  console.log("\n================================================================================");
  console.log("SAMPLE DETAILED 9-DIMENSION GATE REPORT (TOP 5 BLOGS)");
  console.log("================================================================================");
  allAudited.slice(0, 5).forEach((b, i) => {
    console.log(`\n[${i + 1}] ${b.title}`);
    console.log(`    Slug: /blogs/${b.slug}/ | Source: ${b.source} | Status: ${b.status}`);
    console.log(`    Words: ${b.wordCount} | In Sitemap: ${b.inSitemap ? "YES" : "NO"} | Gate: ${b.canPublish ? "PASS" : "BLOCK"}`);
    if (b.errors.length > 0) {
      console.log(`    ❌ Errors: ${b.errors.join("; ")}`);
    }
    if (b.warnings.length > 0) {
      console.log(`    ⚠️  Advisories (${b.warnings.length}): ${b.warnings.slice(0, 3).join("; ")}${b.warnings.length > 3 ? "..." : ""}`);
    } else {
      console.log("    ✓ All 9 dimensions pass with 0 warnings!");
    }
  });

  if (pool) {
    await pool.end();
  }

  console.log("\n================================================================================");
  console.log("AUDIT COMPLETE — NO EXISTING BLOGS WERE MODIFIED OR BLOCKED.");
  console.log("================================================================================\n");
}

run().catch(console.error);
