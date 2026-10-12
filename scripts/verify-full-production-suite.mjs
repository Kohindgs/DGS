import mysql from "mysql2/promise";
import fs from "node:fs";

async function fetchStatus(url, options = {}) {
  try {
    const res = await fetch(url, options);
    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      text: res.status === 200 ? await res.text() : "",
    };
  } catch (err) {
    return { status: 500, error: err.message };
  }
}

async function main() {
  console.log("================================================================================");
  console.log("=== DGS COMBINED PRODUCTION P0 — COMPREHENSIVE LIVE VERIFICATION SUITE ===");
  console.log("================================================================================\n");

  const envContent = fs.readFileSync(".env.production", "utf8");
  const cfg = {};
  for (const line of envContent.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      cfg[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }

  // ---------------------------------------------------------
  // 1. DATABASE CMS BLOG POSTS & MEDIA ASSETS INSPECTION
  // ---------------------------------------------------------
  console.log("--------------------------------------------------------------------------------");
  console.log("STEP 1: DATABASE CMS BLOG POSTS INSPECTION");
  console.log("--------------------------------------------------------------------------------");

  const conn = await mysql.createConnection({
    host: cfg.DGS_MYSQL_HOST || "127.0.0.1",
    port: parseInt(cfg.DGS_MYSQL_PORT || "3306"),
    user: cfg.DGS_MYSQL_USER,
    password: cfg.DGS_MYSQL_PASSWORD,
    database: cfg.DGS_MYSQL_DATABASE,
  });

  const [posts] = await conn.execute(
    "SELECT id, title, slug, status, needs_review, featured_image_url, published_at, deleted_at, created_at, updated_at FROM blog_posts ORDER BY id DESC LIMIT 10"
  );

  console.log(`Found ${posts.length} latest blog posts in production MariaDB:`);
  console.table(
    posts.map((p) => ({
      id: p.id ? p.id.slice(0, 8) + "..." : "null",
      title: p.title ? p.title.slice(0, 35) + "..." : "Untitled",
      slug: p.slug ? p.slug.slice(0, 35) + "..." : "no-slug",
      status: p.status,
      review: p.needs_review,
      has_image: !!p.featured_image_url,
      published_at: p.published_at ? new Date(p.published_at).toISOString().slice(0, 10) : "null",
    }))
  );

  // ---------------------------------------------------------
  // 2. LIVE BLOG CMS URL & FEATURED IMAGE VERIFICATION
  // ---------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("STEP 2: LIVE BLOG CMS URL & FEATURED IMAGE VERIFICATION");
  console.log("--------------------------------------------------------------------------------");

  for (const post of posts.slice(0, 5)) {
    const blogUrl = `https://www.dgeniussolutions.com/blogs/${post.slug}/`;
    const blogRes = await fetchStatus(blogUrl, { redirect: "manual" });

    let imgStatus = "N/A";
    if (post.featured_image_url) {
      const imgUrl = post.featured_image_url.startsWith("http")
        ? post.featured_image_url
        : `https://www.dgeniussolutions.com${post.featured_image_url}`;
      const imgRes = await fetchStatus(imgUrl, { method: "HEAD" });
      imgStatus = `HTTP ${imgRes.status}`;
    }

    const expected = post.status === "published" ? "HTTP 200" : post.status === "trashed" ? "HTTP 301/404" : "HTTP 404";
    const actual = `HTTP ${blogRes.status}`;
    const match =
      (post.status === "published" && blogRes.status === 200) ||
      (post.status !== "published" && (blogRes.status === 404 || blogRes.status === 301 || blogRes.status === 308));

    console.log(`[BLOG] ${post.slug}`);
    console.log(`  - DB Status: ${post.status} | Needs Review: ${post.needs_review}`);
    console.log(`  - Public URL: ${blogUrl} -> ${actual} (Expected: ${expected}) => ${match ? "✓ PASS" : "❌ FAIL"}`);
    console.log(`  - Featured Image: ${post.featured_image_url || "none"} -> ${imgStatus}`);
  }

  // Preview route protection test
  console.log("\nChecking Draft Preview Route Protection (/admin/blogs/<id>/preview/)...");
  const testPost = posts[0];
  const previewUrl = `https://www.dgeniussolutions.com/admin/blogs/${testPost.id}/preview/`;
  const previewRes = await fetchStatus(previewUrl, { redirect: "manual" });
  console.log(`  - Unauthenticated GET ${previewUrl} -> HTTP ${previewRes.status} (Location: ${previewRes.headers.location || "none"})`);
  if (previewRes.status === 307 || previewRes.status === 401 || previewRes.status === 403) {
    console.log("  ✓ PASS: Preview route is strictly protected from public indexing and unauthenticated visitors");
  } else {
    console.log("  ❌ WARNING: Preview route is not redirecting unauthenticated users!");
  }

  // ---------------------------------------------------------
  // 3. AI VIDEO ASSET STREAMING & HTTP 206 VERIFICATION
  // ---------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("STEP 3: AI VIDEO ASSETS & HTTP 206 BYTE-RANGE STREAMING VERIFICATION");
  console.log("--------------------------------------------------------------------------------");

  const sampleVideos = [
    // Hyundai
    { name: "Hyundai Creta 1 (MP4)", url: "https://www.dgeniussolutions.com/media/portfolio/videos/hyundai_creta_1.mp4" },
    { name: "Hyundai Creta 1 (WebM)", url: "https://www.dgeniussolutions.com/media/portfolio/videos/hyundai_creta_1.webm" },
    { name: "Hyundai Creta 1 Poster (WebP)", url: "https://www.dgeniussolutions.com/media/portfolio/posters/hyundai_creta_1_poster.webp" },
    { name: "Hyundai Creta 1 Poster (AVIF)", url: "https://www.dgeniussolutions.com/media/portfolio/posters/hyundai_creta_1_poster.avif" },
    // Sundaram
    { name: "Sundaram Bal 3 (MP4)", url: "https://www.dgeniussolutions.com/media/portfolio/videos/sundaram_bal_3_1.mp4" },
    { name: "Sundaram Bal 3 Poster (WebP)", url: "https://www.dgeniussolutions.com/media/portfolio/posters/sundaram_bal_3_1_poster.webp" },
    // Clarion Agro
    { name: "Clarion Jasmine Atta Hindi (MP4)", url: "https://www.dgeniussolutions.com/media/portfolio/videos/clarion_jasmine_atta_hindi.mp4" },
    { name: "Clarion Poster (WebP)", url: "https://www.dgeniussolutions.com/media/portfolio/posters/clarion_jasmine_atta_hindi_poster.webp" },
    // Better Ceasons
    { name: "Better Ceasons Chaturthi (MP4)", url: "https://www.dgeniussolutions.com/media/portfolio/videos/better_ceasons_chaturthi.mp4" },
    { name: "Better Ceasons Poster (WebP)", url: "https://www.dgeniussolutions.com/media/portfolio/posters/better_ceasons_chaturthi_poster.webp" },
  ];

  for (const item of sampleVideos) {
    const res = await fetchStatus(item.url, { method: "HEAD" });
    const cl = res.headers["content-length"] || "unknown";
    const ct = res.headers["content-type"] || "unknown";
    console.log(`[MEDIA] ${item.name}`);
    console.log(`  - URL: ${item.url}`);
    console.log(`  - Status: HTTP ${res.status} | Content-Type: ${ct} | Size: ${cl} bytes => ${res.status === 200 ? "✓ PASS" : "❌ FAIL"}`);
  }

  // Byte range test
  console.log("\nTesting HTTP 206 Partial Content Range Streaming...");
  const rangeRes = await fetchStatus("https://www.dgeniussolutions.com/media/portfolio/videos/clarion_jasmine_atta_hindi.mp4", {
    method: "GET",
    headers: { Range: "bytes=0-1023" },
  });
  console.log(`  - Range bytes=0-1023 -> HTTP ${rangeRes.status}`);
  console.log(`  - Content-Range: ${rangeRes.headers["content-range"] || "none"}`);
  console.log(`  - Content-Length: ${rangeRes.headers["content-length"] || "none"}`);
  if (rangeRes.status === 206) {
    console.log("  ✓ PASS: HTTP 206 Byte-Range streaming is active and functioning correctly!");
  } else {
    console.log("  ❌ FAIL: Expected HTTP 206 Partial Content!");
  }

  // ---------------------------------------------------------
  // 4. PORTFOLIO & HOMEPAGE PROOF DISTRIBUTION
  // ---------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("STEP 4: PORTFOLIO & HOMEPAGE PROOF DISTRIBUTION");
  console.log("--------------------------------------------------------------------------------");

  const portfolioPage = await fetchStatus("https://www.dgeniussolutions.com/portfolio/");
  if (portfolioPage.status === 200) {
    const hasHyundai = portfolioPage.text.includes("Hyundai") || portfolioPage.text.includes("hyundai");
    const hasSundaram = portfolioPage.text.includes("Sundaram") || portfolioPage.text.includes("sundaram");
    const hasClarion = portfolioPage.text.includes("Clarion") || portfolioPage.text.includes("clarion");
    const hasBetterCeasons = portfolioPage.text.includes("Better Ceasons") || portfolioPage.text.includes("better_ceasons");
    console.log(`[PORTFOLIO PAGE] https://www.dgeniussolutions.com/portfolio/ -> HTTP ${portfolioPage.status}`);
    console.log(`  - Contains Hyundai Motors: ${hasHyundai ? "✓ YES" : "❌ NO"}`);
    console.log(`  - Contains Sundaram E-Learning: ${hasSundaram ? "✓ YES" : "❌ NO"}`);
    console.log(`  - Contains Clarion Agro: ${hasClarion ? "✓ YES" : "❌ NO"}`);
    console.log(`  - Contains Better Ceasons: ${hasBetterCeasons ? "✓ YES" : "❌ NO"}`);
  } else {
    console.log(`[PORTFOLIO PAGE] Failed to fetch: HTTP ${portfolioPage.status}`);
  }

  const homePage = await fetchStatus("https://www.dgeniussolutions.com/");
  if (homePage.status === 200) {
    const hasPoster = homePage.text.includes("hyundai_creta_1_poster") || homePage.text.includes("sundaram_bal_3_1_poster");
    console.log(`[HOMEPAGE] https://www.dgeniussolutions.com/ -> HTTP ${homePage.status}`);
    console.log(`  - Gallery includes new AI Video posters: ${hasPoster ? "✓ YES" : "❌ NO"}`);
  }

  // ---------------------------------------------------------
  // 5. SEARCH CONSOLE REGRESSION FREEZE AUDIT
  // ---------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("STEP 5: SEARCH CONSOLE BASELINE REGRESSION FREEZE AUDIT");
  console.log("--------------------------------------------------------------------------------");

  const [gscMetrics] = await conn.execute(
    "SELECT count(*) as total_rows, SUM(clicks) as total_clicks, SUM(impressions) as total_impressions FROM gsc_page_query_metrics"
  );
  console.log("GSC Page Query Metrics in DB:", gscMetrics[0]);

  // Check code for any forbidden synthetic formulas
  const prohibitedPatterns = [
    /delta\s*\*\s*0\.6/,
    /delta\s*\*\s*0\.3/,
    /currentClicks\s*\*\s*0\.9/,
    /currentImpressions\s*\*\s*0\.9/,
  ];
  let syntheticViolations = 0;
  function searchDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      if (f.name === "node_modules" || f.name === ".next" || f.name === ".git") continue;
      const full = `${dir}/${f.name}`;
      if (f.isDirectory()) {
        searchDir(full);
      } else if (f.name.endsWith(".ts") || f.name.endsWith(".tsx") || f.name.endsWith(".js") || f.name.endsWith(".mjs")) {
        const c = fs.readFileSync(full, "utf8");
        for (const pat of prohibitedPatterns) {
          if (pat.test(c)) {
            console.log(`  ❌ VIOLATION found in ${full}: matches ${pat}`);
            syntheticViolations++;
          }
        }
      }
    }
  }
  if (fs.existsSync("lib")) searchDir("lib");
  if (fs.existsSync("app")) searchDir("app");
  console.log(`Synthetic metric multipliers check across codebase: ${syntheticViolations} violations found => ${syntheticViolations === 0 ? "✓ 100% CLEAN" : "❌ CONTAMINATED"}`);

  await conn.end();
  console.log("\n================================================================================");
  console.log("=== COMPREHENSIVE PRODUCTION VERIFICATION COMPLETED ===");
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
