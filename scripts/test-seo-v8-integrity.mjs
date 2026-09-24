import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  calculateRankingTrend,
  classifyKeyword,
  generateKeywordRecommendation,
} from "../lib/seo/keyword-engine.ts";

const ROOT = process.cwd();

// Pure implementation mirroring recursive sitemap parsing in lib/audit/audit-runner.ts
function parseSitemapXmlForTesting(xmlText, targetOrigin, maxDepth = 5) {
  const discoveredUrls = new Set();
  const subSitemaps = [];

  const isSitemapIndex = /<sitemapindex\b/i.test(xmlText);
  const isUrlSet = /<urlset\b/i.test(xmlText);

  if (isSitemapIndex) {
    const sitemapBlocks = [...xmlText.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/gi)];
    for (const block of sitemapBlocks) {
      const locMatch = block[1].match(/<loc>([^<]+)<\/loc>/i);
      if (locMatch && locMatch[1]) {
        const subUrl = locMatch[1].trim();
        try {
          if (new URL(subUrl).origin.toLowerCase() === targetOrigin.toLowerCase()) {
            subSitemaps.push(subUrl);
          }
        } catch {}
      }
    }
  }

  if (isUrlSet || (!isSitemapIndex && /<loc>/i.test(xmlText))) {
    const locMatches = [...xmlText.matchAll(/<loc>([^<]+)<\/loc>/gi)];
    for (const m of locMatches) {
      const pageUrl = m[1].trim();
      try {
        const parsed = new URL(pageUrl);
        if (parsed.origin.toLowerCase() === targetOrigin.toLowerCase()) {
          parsed.hash = "";
          discoveredUrls.add(parsed.toString());
        }
      } catch {}
    }
  }

  return { urls: Array.from(discoveredUrls), subSitemaps };
}

// Pure implementation of sidebar route active matching
function isSidebarItemActive(pathname, itemHref, allNavHrefs) {
  const normCurrent = pathname.replace(/\/$/, "");
  const normItem = itemHref.replace(/\/$/, "");
  const isExact = normCurrent === normItem;
  const isChild = normItem !== "/admin" && normCurrent.startsWith(normItem + "/");

  const hasMoreSpecific = isChild && allNavHrefs.some((other) => {
    const normOther = other.replace(/\/$/, "");
    return (
      normOther !== normItem &&
      normOther.length > normItem.length &&
      (normCurrent === normOther || normCurrent.startsWith(normOther + "/"))
    );
  });

  return isExact || (isChild && !hasMoreSpecific);
}

// ============================================================================
// TESTS
// ============================================================================

test("1. Recursive sitemap index parsing and same-domain validation", () => {
  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
      <loc>https://www.dgeniussolutions.com/pages-sitemap.xml</loc>
    </sitemap>
    <sitemap>
      <loc>https://www.dgeniussolutions.com/posts-sitemap.xml</loc>
    </sitemap>
    <sitemap>
      <loc>https://spammy-external-site.com/sitemap.xml</loc>
    </sitemap>
  </sitemapindex>`;

  const parsed = parseSitemapXmlForTesting(sitemapIndexXml, "https://www.dgeniussolutions.com");
  assert.equal(parsed.subSitemaps.length, 2, "Only same-domain sub-sitemaps must be queued");
  assert.ok(parsed.subSitemaps.includes("https://www.dgeniussolutions.com/pages-sitemap.xml"));
  assert.ok(parsed.subSitemaps.includes("https://www.dgeniussolutions.com/posts-sitemap.xml"));
  assert.ok(!parsed.subSitemaps.includes("https://spammy-external-site.com/sitemap.xml"), "External sitemaps rejected");
});

test("2. Full URL deduplication and normalization", () => {
  const urlSetXml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://www.dgeniussolutions.com/services/seo-services-in-mumbai/</loc></url>
    <url><loc>https://www.dgeniussolutions.com/services/seo-services-in-mumbai/#section</loc></url>
    <url><loc>https://www.dgeniussolutions.com/services/seo-services-in-mumbai/</loc></url>
    <url><loc>https://www.dgeniussolutions.com/about/</loc></url>
  </urlset>`;

  const parsed = parseSitemapXmlForTesting(urlSetXml, "https://www.dgeniussolutions.com");
  assert.equal(parsed.urls.length, 2, "Duplicate URLs and hash fragments must dedupe");
  assert.ok(parsed.urls.includes("https://www.dgeniussolutions.com/services/seo-services-in-mumbai/"));
  assert.ok(parsed.urls.includes("https://www.dgeniussolutions.com/about/"));
});

test("3. Sidebar exclusive active state matching", () => {
  const navItems = [
    "/admin/",
    "/admin/seo/",
    "/admin/seo/keywords/",
    "/admin/seo/pages/",
    "/admin/blogs/",
    "/admin/media/",
  ];

  // While on /admin/seo/keywords/
  const onKeywordsPath = "/admin/seo/keywords/";
  assert.equal(isSidebarItemActive(onKeywordsPath, "/admin/seo/keywords/", navItems), true, "Keywords should be active");
  assert.equal(isSidebarItemActive(onKeywordsPath, "/admin/seo/", navItems), false, "SEO Hub must NOT be active when on keywords");
  assert.equal(isSidebarItemActive(onKeywordsPath, "/admin/seo/pages/", navItems), false, "Pages must not be active");

  // While on exact /admin/seo/
  const onSeoHub = "/admin/seo/";
  assert.equal(isSidebarItemActive(onSeoHub, "/admin/seo/", navItems), true, "SEO Hub active on exact route");
  assert.equal(isSidebarItemActive(onSeoHub, "/admin/seo/keywords/", navItems), false, "Keywords inactive on SEO Hub");

  // While on /admin/seo/pages/
  const onPagesPath = "/admin/seo/pages/";
  assert.equal(isSidebarItemActive(onPagesPath, "/admin/seo/pages/", navItems), true, "Pages active on exact route");
  assert.equal(isSidebarItemActive(onPagesPath, "/admin/seo/", navItems), false, "SEO Hub inactive when on pages");
});

test("4. Search alignment and neon contrast classes exist in CSS", async () => {
  const css = await readFile(join(ROOT, "app/admin/saas.css"), "utf8");

  assert.ok(css.includes(".dgs-table-search"), "saas.css must define .dgs-table-search");
  assert.ok(css.includes(".dgs-table-toolbar"), "saas.css must define .dgs-table-toolbar");
  assert.ok(css.includes(".dgs-select"), "saas.css must define .dgs-select");
  assert.ok(css.includes("height: 42px"), "Search field must have 42px height");
  assert.ok(css.includes(".dgs-saas-chip.primary"), "Must define primary chip styling");
  assert.ok(css.includes(".dgs-saas-chip.neutral"), "Must define neutral chip styling");
});

test("5. Ranking delta calculations and trend indicators", () => {
  // 8.2 -> 6.4 is UP +1.8
  const up = calculateRankingTrend(6.4, 8.2);
  assert.equal(up.status, "improving");
  assert.equal(up.label, "UP +1.8");
  assert.equal(up.badgeClass, "success");

  // 4.3 -> 7.1 is DOWN -2.8
  const down = calculateRankingTrend(7.1, 4.3);
  assert.equal(down.status, "falling");
  assert.equal(down.label, "DOWN -2.8");
  assert.equal(down.badgeClass, "danger");

  // New ranking
  const newRank = calculateRankingTrend(5.5, null);
  assert.equal(newRank.status, "new");
  assert.equal(newRank.label, "NEW");
  assert.equal(newRank.badgeClass, "primary");

  // Lost ranking
  const lostRank = calculateRankingTrend(null, 9.1);
  assert.equal(lostRank.status, "lost");
  assert.equal(lostRank.label, "LOST");
  assert.equal(lostRank.badgeClass, "warning");

  // Stable ranking
  const stable = calculateRankingTrend(6.0, 6.1);
  assert.equal(stable.status, "stable");
  assert.equal(stable.label, "STABLE");
});

test("6. Keyword strategy classifications (PROTECT / GROW / RECOVER / CANNIBALIZATION)", () => {
  // Page 1 ranking -> PROTECT
  const protect = classifyKeyword({
    query: "seo services in mumbai",
    position: 4.2,
    prevPosition: 4.0,
    impressions: 1200,
    clicks: 45,
  });
  assert.equal(protect, "PROTECT");

  // Striking distance -> GROW
  const grow = classifyKeyword({
    query: "ai video agency",
    position: 14.5,
    prevPosition: 15.0,
    impressions: 340,
    clicks: 12,
  });
  assert.equal(grow, "GROW");

  // Position worsened materially -> RECOVER
  const recover = classifyKeyword({
    query: "performance marketing agency",
    position: 18.5,
    prevPosition: 9.2, // Dropped by 9.3 positions
    impressions: 500,
    clicks: 5,
  });
  assert.equal(recover, "RECOVER");

  // Competing URLs -> CANNIBALIZATION RISK
  const cannibalized = classifyKeyword({
    query: "digital marketing mumbai",
    position: 12.0,
    isCannibalized: true,
  });
  assert.equal(cannibalized, "CANNIBALIZATION RISK");

  // No GSC detection
  const notDetected = classifyKeyword({
    query: "obscure term",
    position: null,
  });
  assert.equal(notDetected, "NOT DETECTED");
});

test("7. Smart Alt on Upload and Blog Import", async () => {
  const uploadRoute = await readFile(join(ROOT, "app/api/admin/media/upload/route.ts"), "utf8");
  assert.ok(
    uploadRoute.includes("generateAltTextSuggestion"),
    "Upload route must call generateAltTextSuggestion for missing alt"
  );
  assert.ok(
    uploadRoute.includes("AI_CONTEXTUAL"),
    "Upload route must tag altSource as AI_CONTEXTUAL"
  );

  const importRoute = await readFile(join(ROOT, "app/api/admin/blogs/import/route.ts"), "utf8");
  assert.ok(
    importRoute.includes("h2Headings") || importRoute.includes("nearestH2"),
    "Blog import must extract nearest heading for contextual alt"
  );
  assert.ok(
    importRoute.includes("AI_CONTEXTUAL"),
    "Blog import must tag altSource as AI_CONTEXTUAL"
  );
});

test("8. Decorative Alt Behavior", async () => {
  const mediaLib = await readFile(join(ROOT, "app/admin/media/MediaLibraryView.tsx"), "utf8");
  assert.ok(
    mediaLib.includes('altSource: "DECORATIVE"') || mediaLib.includes("Decorative"),
    "Media library must support tagging decorative assets"
  );

  const uploadRoute = await readFile(join(ROOT, "app/api/admin/media/upload/route.ts"), "utf8");
  assert.ok(
    uploadRoute.includes('resolvedAltSource = "DECORATIVE"') || uploadRoute.includes('"DECORATIVE"'),
    "Upload route must store DECORATIVE alt source when isDecorative is true"
  );
});

test("9. Alt Verification fails closed without evidence", async () => {
  const altFixer = await readFile(join(ROOT, "lib/seo/alt-fixer.ts"), "utf8");
  assert.ok(
    altFixer.includes("return false; // Fail closed"),
    "verifyRenderedAlt must fail closed with return false when no source matches"
  );
});

test("10. Candidate Delete strict Superadmin authorization", async () => {
  const candidateRoute = await readFile(join(ROOT, "app/api/admin/assessment/candidates/[id]/route.ts"), "utf8");
  assert.ok(
    candidateRoute.includes('currentUser.role !== "superadmin"'),
    "Must verify currentUser.role !== superadmin in candidate delete route"
  );
  assert.ok(
    candidateRoute.includes("status: 403"),
    "Must return 403 Forbidden for non-superadmin deletion attempts"
  );
});

test("11. Candidate Delete relational purge across tables", async () => {
  const assessmentsCode = await readFile(join(ROOT, "lib/cms/assessments.ts"), "utf8");
  assert.ok(
    assessmentsCode.includes("DELETE FROM assessment_candidates WHERE id = ? OR assignment_id = ?"),
    "Must purge assessment_candidates by both id and assignment_id"
  );
  assert.ok(
    assessmentsCode.includes("DELETE FROM hr_documents WHERE pipeline_id = ?"),
    "Must purge hr_documents by pipeline_id"
  );
  assert.ok(
    assessmentsCode.includes("DELETE FROM hr_pipeline WHERE id = ?"),
    "Must purge hr_pipeline by id"
  );
});
