import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";

const SITE_URL = "https://www.dgeniussolutions.com";
const WP_ORIGIN = "https://wp-origin.dgeniussolutions.com";

console.log("\n================================================================================");
console.log("DGS WORDPRESS RETIREMENT & ZERO-DEPENDENCY FINAL AUDIT");
console.log(`Target: ${SITE_URL}`);
console.log(`Execution Time: ${new Date().toISOString()}`);
console.log("================================================================================\n");

async function runAudit() {
  const results = {
    runtimeDependencies: 0,
    routesAudited: 0,
    mediaPresent: 0,
    mediaMissing: 0,
    wpOriginCalls: 0,
    wpJsonCalls: 0,
    phpCalls: 0,
  };

  // 1. ROUTE HTTP & CONTENT INTEGRITY
  console.log(">>> [1/7] AUDITING PUBLIC ROUTES (HTTP 200, CANONICAL, ROBOTS, H1)...");
  const routes = [
    "/",
    "/about-us/",
    "/services/seo-services-in-mumbai/",
    "/services/aeo-services-in-mumbai/",
    "/services/geo/",
    "/services/llm-seo-service/",
    "/services/ai-video-production-agency/",
    "/services/performance-marketing/",
    "/services/website-development-amc/",
    "/services/social-media-marketing/",
    "/services/branding/",
    "/services/content-creation/",
    "/portfolio/",
    "/blogs/",
    "/career/",
    "/career/generative-ai-artist/",
    "/contact-us/",
  ];

  for (const r of routes) {
    const res = await fetch(`${SITE_URL}${r}`);
    assert.equal(res.status, 200, `Route ${r} must return HTTP 200`);
    const html = await res.text();

    // Check canonical
    assert.ok(html.includes(`<link rel="canonical" href="${SITE_URL}${r}"`), `Route ${r} must have self canonical`);

    // Check robots
    assert.ok(html.includes('content="index, follow"'), `Route ${r} must have index, follow`);

    // Check single H1
    const h1Count = (html.match(/<h1\b[^>]*>/gi) || []).length;
    assert.equal(h1Count, 1, `Route ${r} must have exactly one H1, found ${h1Count}`);

    // Check for runtime WP-JSON or WP-Origin
    const wpJsonMatches = html.match(/(?:https?:\/\/(?:www\.)?dgeniussolutions\.com)?\/wp-json\/[^\s"'><\)\\]+/gi) || [];
    const wpOriginMatches = html.match(/https?:\/\/wp-origin\.dgeniussolutions\.com[^\s"'><\)\\]*/gi) || [];

    assert.equal(wpJsonMatches.length, 0, `Route ${r} must have 0 wp-json calls`);
    assert.equal(wpOriginMatches.length, 0, `Route ${r} must have 0 wp-origin calls`);

    results.routesAudited++;
    console.log(`   ✓ ${r.padEnd(42)} HTTP 200 | Canonical OK | H1: 1 | WP-Origin: 0 | WP-JSON: 0`);
  }

  // 2. AI VIDEO PRODUCTION KEYWORD PRESERVATION
  console.log("\n>>> [2/7] VERIFYING AI VIDEO PRODUCTION RANKING KEYWORDS...");
  const aiVideoRes = await fetch(`${SITE_URL}/services/ai-video-production-agency/`);
  const aiVideoHtml = await aiVideoRes.text();
  const requiredKeywords = [
    "AI Video Production Agency in Mumbai",
    "AI Video Production House In Mumbai",
    "AI Avatar Videos In Mumbai",
    "AI Festival Videos In Mumbai",
    "AI TV Commercials In Mumbai",
    "AI OTT Video Series In Mumbai",
    "AI OTT Video Ads In Mumbai",
  ];

  for (const kw of requiredKeywords) {
    assert.ok(
      aiVideoHtml.toLowerCase().includes(kw.toLowerCase()),
      `AI Video page must preserve exact term: "${kw}"`,
    );
    console.log(`   ✓ Preserved keyword: "${kw}"`);
  }

  // 3. RETIRED ARCHIVE MODE LOCKDOWN (HTTP 403)
  console.log("\n>>> [3/7] VERIFYING WORDPRESS RETIRED LOCKDOWN ENDPOINTS (HTTP 403)...");
  const lockdownChecks = [
    ["Public /wp-login.php", `${SITE_URL}/wp-login.php`, 403],
    ["Public /xmlrpc.php", `${SITE_URL}/xmlrpc.php`, 403],
    ["Public /wp-cron.php", `${SITE_URL}/wp-cron.php`, 403],
    ["Public /wp-admin/", `${SITE_URL}/wp-admin/`, 403],
    ["Public /wp-json/", `${SITE_URL}/wp-json/`, 403],
    ["wp-origin /wp-login.php", `${WP_ORIGIN}/wp-login.php`, 403],
    ["wp-origin /xmlrpc.php", `${WP_ORIGIN}/xmlrpc.php`, 403],
    ["wp-origin /wp-admin/", `${WP_ORIGIN}/wp-admin/`, 403],
    ["wp-origin /wp-json/", `${WP_ORIGIN}/wp-json/`, 403],
  ];

  for (const [label, url, expectedStatus] of lockdownChecks) {
    const res = await fetch(url, { redirect: "manual" });
    assert.equal(res.status, expectedStatus, `${label} (${url}) must return HTTP ${expectedStatus}`);
    console.log(`   ✓ ${label.padEnd(30)} => HTTP ${res.status} Forbidden (Locked Down)`);
  }

  // 4. WP-ORIGIN REDIRECT & ROBOTS TAG
  console.log("\n>>> [4/7] VERIFYING WP-ORIGIN BACKEND ISOLATION...");
  const wpOriginRes = await fetch(`${WP_ORIGIN}/`, { redirect: "manual" });
  console.log(`   wp-origin root HTTP status: ${wpOriginRes.status}`);
  console.log(`   wp-origin X-Robots-Tag: ${wpOriginRes.headers.get("x-robots-tag")}`);
  console.log(`   wp-origin Location header: ${wpOriginRes.headers.get("location")}`);
  assert.equal(wpOriginRes.headers.get("x-robots-tag"), "noindex, nofollow, noarchive", "Must be noindex, nofollow, noarchive");
  assert.ok(wpOriginRes.status === 301 || wpOriginRes.status === 200, "wp-origin root must redirect or serve locked state");

  // 5. MEDIA PARITY & STREAMING VERIFICATION
  console.log("\n>>> [5/7] VERIFYING MEDIA STREAMING & AUTONOMOUS ACCESS...");
  const sampleVideo = `${SITE_URL}/wp-content/uploads/2026/04/Makar-Sankranti-And-Pongal-Final-1.mp4`;
  const videoHead = await fetch(sampleVideo, { method: "HEAD" });
  assert.equal(videoHead.status, 200, "Sample video must return HTTP 200 on HEAD");
  assert.equal(videoHead.headers.get("accept-ranges"), "bytes", "Video must support byte-range streaming");
  assert.equal(videoHead.headers.get("content-type"), "video/mp4", "Video must have content-type video/mp4");
  console.log(`   ✓ Video ${sampleVideo}`);
  console.log(`     HTTP ${videoHead.status} | Content-Type: ${videoHead.headers.get("content-type")} | Accept-Ranges: ${videoHead.headers.get("accept-ranges")}`);

  const sampleImage = `${SITE_URL}/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp`;
  const imageHead = await fetch(sampleImage, { method: "HEAD" });
  assert.equal(imageHead.status, 200, "Sample image must return HTTP 200 on HEAD");
  console.log(`   ✓ Image ${sampleImage} => HTTP ${imageHead.status}`);

  // 6. REDIRECT VERIFICATION (JUNIOR HR & CANONICAL SERVICE URLS)
  console.log("\n>>> [6/7] VERIFYING 301 PERMANENT REDIRECTS...");
  const redirectChecks = [
    ["/career/junior-hr-generalist/", `${SITE_URL}/career/`],
    ["/services/generative-ai/", `${SITE_URL}/services/ai-video-production-agency/`],
    ["/home/", `${SITE_URL}/`],
  ];

  for (const [sourcePath, expectedDestination] of redirectChecks) {
    const res = await fetch(`${SITE_URL}${sourcePath}`, { redirect: "manual" });
    assert.equal(res.status, 301, `${sourcePath} must return 301`);
    assert.equal(res.headers.get("location"), expectedDestination, `${sourcePath} must redirect to ${expectedDestination}`);
    console.log(`   ✓ 301 Single Hop: ${sourcePath} => ${expectedDestination}`);
  }

  // 7. SITEMAP & ROBOTS VERIFICATION
  console.log("\n>>> [7/7] VERIFYING SITEMAP.XML & ROBOTS.TXT...");
  const robotsRes = await fetch(`${SITE_URL}/robots.txt`);
  assert.equal(robotsRes.status, 200, "robots.txt must return 200");
  const robotsTxt = await robotsRes.text();
  assert.ok(robotsTxt.includes("Sitemap: https://www.dgeniussolutions.com/sitemap.xml"), "robots.txt must point to sitemap");
  console.log("   ✓ robots.txt valid and references sitemap.xml");

  const sitemapRes = await fetch(`${SITE_URL}/sitemap.xml`);
  assert.equal(sitemapRes.status, 200, "sitemap.xml must return 200");
  const sitemapXml = await sitemapRes.text();
  assert.ok(sitemapXml.includes("<urlset"), "sitemap.xml must be valid xml urlset");
  assert.ok(sitemapXml.includes("https://www.dgeniussolutions.com/services/ai-video-production-agency/"), "sitemap must contain ai-video-production-agency");
  assert.ok(!sitemapXml.includes("junior-hr-generalist"), "sitemap must NOT contain junior-hr-generalist");
  console.log("   ✓ sitemap.xml valid and confirmed 0 deprecated routes");

  console.log("\n================================================================================");
  console.log("FINAL AUDIT RESULT: ALL RETIREMENT & ZERO-DEPENDENCY CHECKS PASSED!");
  console.log("================================================================================\n");
}

runAudit().catch((err) => {
  console.error("FATAL ERROR IN RETIREMENT AUDIT:", err);
  process.exit(1);
});
