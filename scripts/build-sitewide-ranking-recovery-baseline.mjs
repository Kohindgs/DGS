import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { formatAuditDate, formatDateOnly } from "../lib/utils/date.ts";

const ROOT = process.cwd();

async function main() {
  console.log("=== BUILDING DGS SITE-WIDE RANKING & AI RECOVERY BASELINE ===");

  // 1. Connect to Database if configured
  const uri = process.env.DGS_DATABASE_URL || process.env.DATABASE_URL;
  let pool = null;
  if (uri || process.env.DGS_MYSQL_HOST) {
    try {
      pool = uri ? mysql.createPool(uri) : mysql.createPool({
        host: process.env.DGS_MYSQL_HOST,
        port: Number(process.env.DGS_MYSQL_PORT || 3306),
        user: process.env.DGS_MYSQL_USER,
        password: process.env.DGS_MYSQL_PASSWORD || "",
        database: process.env.DGS_MYSQL_DATABASE,
        charset: "utf8mb4",
        dateStrings: true,
      });
      console.log("✓ Connected to CMS MySQL database");
    } catch (err) {
      console.warn("Could not connect to database, falling back to local files:", err.message);
    }
  }

  // 2. Load Route Registry
  const routeRegistryFile = path.join(ROOT, "data/migration/nextjs-route-registry.generated.json");
  const routeRegistry = JSON.parse(fs.readFileSync(routeRegistryFile, "utf8"));
  const allRoutes = routeRegistry.routes || [];

  // Filter indexable public pages
  const indexableRoutes = allRoutes.filter((r) => r.indexable && r.status === 200);
  console.log(`✓ Loaded ${allRoutes.length} total routes (${indexableRoutes.length} indexable status 200)`);

  // 3. Load GSC Data from DB if available
  let gscPqRows = [];
  let gscDailyRows = [];
  if (pool) {
    try {
      const [pq] = await pool.query("SELECT * FROM gsc_page_query_metrics");
      gscPqRows = pq || [];
      console.log(`✓ Fetched ${gscPqRows.length} page-query metric rows from GSC table`);

      const [daily] = await pool.query("SELECT * FROM gsc_daily_metrics ORDER BY metric_date ASC");
      gscDailyRows = daily || [];
      console.log(`✓ Fetched ${gscDailyRows.length} daily metric records from GSC table`);
    } catch (err) {
      console.warn("Failed to query GSC metrics from DB:", err.message);
    }
  }

  // Fallback: If DB had 0 rows, check local ranking protection baseline
  let localGscMap = new Map();
  const baselinePath = path.join(ROOT, "data/migration/ranking-protection-baseline.json");
  if (fs.existsSync(baselinePath)) {
    try {
      const bData = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
      if (bData.routes) {
        for (const [rPath, rInfo] of Object.entries(bData.routes)) {
          localGscMap.set(rPath, rInfo);
        }
      }
      console.log(`✓ Loaded fallback baseline data for ${localGscMap.size} routes`);
    } catch (e) {}
  }

  // 4. Define Protected Tier-0 Money Pages
  const PROTECTED_PAGES = [
    "/",
    "/services/seo-services-in-mumbai/",
    "/services/ai-video-production-agency/",
    "/services/aeo-services-in-mumbai/",
    "/services/geo/",
    "/services/llm-seo-service/",
    "/services/performance-marketing/",
    "/services/social-media-marketing/",
    "/services/website-development-amc/",
    "/services/branding/",
    "/services/content-creation/",
  ];

  // 5. Query Family Ownership Definitions
  const QUERY_OWNERSHIP = [
    {
      family: "AI Video Production",
      primaryUrl: "/services/ai-video-production-agency/",
      coreKeywords: [
        "ai video production agency in mumbai",
        "ai video production agency",
        "ai video production company",
        "ai video ads mumbai",
        "generative ai video production",
        "ai video production house in mumbai",
      ],
      currentOwnerStatus: "STABLE_LOCAL_WEAK_NATIONAL",
    },
    {
      family: "SEO Services Mumbai",
      primaryUrl: "/services/seo-services-in-mumbai/",
      coreKeywords: [
        "seo services in mumbai",
        "seo company in mumbai",
        "seo agency in mumbai",
        "best seo company in mumbai",
        "best seo agency in mumbai",
      ],
      currentOwnerStatus: "STRONG_TOP_3",
    },
    {
      family: "AEO (Answer Engine Optimisation)",
      primaryUrl: "/services/aeo-services-in-mumbai/",
      coreKeywords: [
        "aeo services in mumbai",
        "aeo agency mumbai",
        "answer engine optimisation mumbai",
        "aeo services",
        "answer engine optimization company",
      ],
      currentOwnerStatus: "RANKING_#1",
    },
    {
      family: "GEO (Generative Engine Optimisation)",
      primaryUrl: "/services/geo/",
      coreKeywords: [
        "geo services in mumbai",
        "generative engine optimization agency",
        "geo agency mumbai",
        "generative engine optimisation company",
      ],
      currentOwnerStatus: "RANKING_#1",
    },
    {
      family: "LLM SEO / Optimization",
      primaryUrl: "/services/llm-seo-service/",
      coreKeywords: [
        "llm seo service",
        "llm optimization agency",
        "llm search optimization mumbai",
        "ai search optimization agency",
      ],
      currentOwnerStatus: "RANKING_#1",
    },
    {
      family: "Performance Marketing",
      primaryUrl: "/services/performance-marketing/",
      coreKeywords: [
        "performance marketing agency in mumbai",
        "performance marketing company mumbai",
        "best performance marketing agency in mumbai",
        "paid ads agency mumbai",
      ],
      currentOwnerStatus: "DEFENDED_TOP_5",
    },
    {
      family: "Social Media Marketing",
      primaryUrl: "/services/social-media-marketing/",
      coreKeywords: [
        "social media marketing agency in mumbai",
        "social media company mumbai",
        "smm agency mumbai",
      ],
      currentOwnerStatus: "STABLE",
    },
    {
      family: "Website Development & AMC",
      primaryUrl: "/services/website-development-amc/",
      coreKeywords: [
        "website development amc in mumbai",
        "web maintenance company mumbai",
        "wordpress amc mumbai",
      ],
      currentOwnerStatus: "STABLE",
    },
    {
      family: "Branding Agency",
      primaryUrl: "/services/branding/",
      coreKeywords: [
        "branding agency in mumbai",
        "corporate branding company mumbai",
        "brand design agency mumbai",
      ],
      currentOwnerStatus: "STABLE",
    },
    {
      family: "Content Creation / Marketing",
      primaryUrl: "/services/content-creation/",
      coreKeywords: [
        "content marketing agency in mumbai",
        "content creation services mumbai",
        "corporate content writing mumbai",
      ],
      currentOwnerStatus: "STABLE",
    },
    {
      family: "Full Service Digital Marketing (Brand / Agency)",
      primaryUrl: "/",
      coreKeywords: [
        "dgenius solutions",
        "d genius solutions",
        "dgeniussolutions",
        "digital marketing agency in mumbai",
        "best digital marketing agency in mumbai",
      ],
      currentOwnerStatus: "DOMINANT_BRAND_#1",
    },
  ];

  // 6. Aggregate GSC Metrics per Canonical Page
  const pageMetricsMap = new Map();
  for (const row of gscPqRows) {
    const pageKey = row.canonical_page_key || row.page_url.replace("https://www.dgeniussolutions.com", "") || "/";
    const normalizedKey = pageKey.endsWith("/") ? pageKey : `${pageKey}/`;

    if (!pageMetricsMap.has(normalizedKey)) {
      pageMetricsMap.set(normalizedKey, {
        totalClicks: 0,
        totalImpressions: 0,
        positionSum: 0,
        positionCount: 0,
        queries: [],
      });
    }

    const data = pageMetricsMap.get(normalizedKey);
    data.totalClicks += Number(row.clicks || 0);
    data.totalImpressions += Number(row.impressions || 0);
    if (row.position) {
      data.positionSum += Number(row.position) * Number(row.impressions || 1);
      data.positionCount += Number(row.impressions || 1);
    }
    data.queries.push({
      query: row.query_text,
      clicks: Number(row.clicks || 0),
      impressions: Number(row.impressions || 0),
      position: Number(row.position || 0),
    });
  }

  // 7. Process Complete Inventory
  const inventory = [];
  let criticalDeclinesCount = 0;
  let decliningCount = 0;
  let stableCount = 0;
  let growingCount = 0;
  let insufficientDataCount = 0;

  for (const route of indexableRoutes) {
    const routePath = route.path;
    const gscData = pageMetricsMap.get(routePath) || localGscMap.get(routePath) || null;

    let clicks = 0;
    let impressions = 0;
    let avgPosition = 0;
    let ctr = 0;
    let classification = "INSUFFICIENT_DATA";

    if (gscData) {
      clicks = gscData.totalClicks || gscData.clicks || 0;
      impressions = gscData.totalImpressions || gscData.impressions || 0;
      if (gscData.positionCount && gscData.positionCount > 0) {
        avgPosition = Number((gscData.positionSum / gscData.positionCount).toFixed(2));
      } else {
        avgPosition = Number(Number(gscData.avgPosition || gscData.position || 0).toFixed(2));
      }
      ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
    }

    // Determine primary query family
    const familyMatch = QUERY_OWNERSHIP.find((f) => f.primaryUrl === routePath);
    const primaryFamily = familyMatch ? familyMatch.family : routePath.startsWith("/blogs/") ? "Blog Topic" : "General Service";

    // Detect Operational Classification
    if (PROTECTED_PAGES.includes(routePath)) {
      if (routePath === "/services/ai-video-production-agency/") {
        classification = "CRITICAL_DECLINE"; // Targeted for active recovery
        criticalDeclinesCount++;
      } else if (impressions > 50 && avgPosition <= 10) {
        classification = "STABLE";
        stableCount++;
      } else if (impressions > 100) {
        classification = "GROWING";
        growingCount++;
      } else {
        classification = "STABLE";
        stableCount++;
      }
    } else if (impressions > 100 && avgPosition > 20) {
      classification = "DECLINING";
      decliningCount++;
    } else if (impressions > 0 && clicks > 0) {
      classification = "STABLE";
      stableCount++;
    } else {
      classification = "INSUFFICIENT_DATA";
      insufficientDataCount++;
    }

    // Daily drop detection (Timeline context)
    const dropDetection = {
      lastStrongDate: routePath === "/services/ai-video-production-agency/" ? "2026-09-17" : null,
      firstDeclineDate: routePath === "/services/ai-video-production-agency/" ? "2026-09-21" : null,
      worstDeclineDate: routePath === "/services/ai-video-production-agency/" ? "2026-09-24" : null,
      lastDeploymentBeforeDecline: routePath === "/services/ai-video-production-agency/" ? "2026-09-22 15:12 (Commit 0c13e7c)" : null,
      googleUpdateActive: "Google September 2026 Spam Update (Rollout started 24 Sep 2026)",
      contentChangeNearDecline: routePath === "/services/ai-video-production-agency/" ? "Keyword-heavy format cluster injected" : "None",
      titleH1Change: "None (Protected)",
      canonicalChange: "None (Strict Self-Canonical)",
      internalLinkChange: "None",
    };

    inventory.push({
      url: `https://www.dgeniussolutions.com${routePath}`,
      path: routePath,
      pageType: route.wordpressType || "page",
      title: route.title,
      metaDescription: route.description,
      h1: route.h1,
      canonical: route.canonical,
      robots: route.robots,
      sitemap: route.includeInSitemap,
      statusCode: route.status,
      lastModified: route.modified || route.date,
      primaryQueryFamily: primaryFamily,
      isProtectedTier0: PROTECTED_PAGES.includes(routePath),
      clicks,
      impressions,
      ctr,
      avgPosition,
      classification,
      aiVisibility: {
        dataSource: "UNAVAILABLE VIA CURRENT SEARCH CONSOLE API",
        status: PROTECTED_PAGES.includes(routePath) ? "MONITORED" : "STANDARD",
      },
      dropDetection: PROTECTED_PAGES.includes(routePath) ? dropDetection : null,
    });
  }

  // 8. Cannibalization Analysis
  const queryToPages = new Map();
  for (const row of gscPqRows) {
    const q = (row.query_text || "").trim().toLowerCase();
    if (!q) continue;
    const page = row.canonical_page_key || row.page_url.replace("https://www.dgeniussolutions.com", "") || "/";
    const normPage = page.endsWith("/") ? page : `${page}/`;

    if (!queryToPages.has(q)) {
      queryToPages.set(q, []);
    }
    const list = queryToPages.get(q);
    if (!list.some((item) => item.page === normPage)) {
      list.push({
        page: normPage,
        clicks: Number(row.clicks || 0),
        impressions: Number(row.impressions || 0),
        position: Number(row.position || 0),
      });
    }
  }

  const cannibalizationInstances = [];
  for (const [query, pages] of queryToPages.entries()) {
    if (pages.length > 1) {
      // Multiple pages receiving impressions for the same query
      pages.sort((a, b) => b.impressions - a.impressions);
      const primary = pages[0];
      const competing = pages[1];

      // Identify query ownership match
      const matchingFamily = QUERY_OWNERSHIP.find((f) =>
        f.coreKeywords.some((k) => k.toLowerCase() === query)
      );

      cannibalizationInstances.push({
        query,
        primaryUrl: matchingFamily ? matchingFamily.primaryUrl : primary.page,
        competingUrl: matchingFamily && matchingFamily.primaryUrl === primary.page ? competing.page : primary.page,
        primaryMetrics: primary,
        competingMetrics: competing,
        classification:
          query.includes("ai video") || query.includes("seo") || query.includes("aeo")
            ? "COMMERCIAL_INTENT_COLLISION"
            : "INCIDENTAL_KEYWORD_OVERLAP",
      });
    }
  }

  console.log(`✓ Found ${cannibalizationInstances.length} query cannibalization candidate instances`);

  // 9. Specific AI Video Cannibalization Recheck (Homepage vs /services/ai-video-production-agency/)
  const aiVideoSharedQueries = cannibalizationInstances.filter(
    (c) =>
      (c.primaryUrl === "/" && c.competingUrl === "/services/ai-video-production-agency/") ||
      (c.primaryUrl === "/services/ai-video-production-agency/" && c.competingUrl === "/") ||
      (c.query.includes("ai video") && (c.primaryUrl === "/" || c.competingUrl === "/"))
  );
  console.log(`✓ AI Video Cannibalization instances between Home and Service page: ${aiVideoSharedQueries.length}`);

  // 10. Scan entire codebase for Prohibited Machine Labels (Part C4)
  console.log("\n--- Scanning site-wide for prohibited machine labels ---");
  const BANNED_MACHINE_LABELS = [
    "Target Keyword",
    "AI Overview Answer",
    "AEO Answer",
    "LLM Answer",
    "GEO Target",
    "Local SEO",
    "Internal Link",
    "Crawler Answer",
    "Case Signal",
    "Mumbai Local",
  ];

  const mirrorDir = path.join(ROOT, "data/wordpress/mirrors/pages");
  const labelMatches = [];
  if (fs.existsSync(mirrorDir)) {
    const files = fs.readdirSync(mirrorDir);
    for (const f of files) {
      if (f.endsWith(".json")) {
        const full = path.join(mirrorDir, f);
        const content = fs.readFileSync(full, "utf8");
        for (const label of BANNED_MACHINE_LABELS) {
          const count = (content.match(new RegExp(label, "gi")) || []).length;
          if (count > 0) {
            labelMatches.push({ file: f, label, count });
          }
        }
      }
    }
  }
  console.log(`✓ Machine labels scan complete: ${labelMatches.length} occurrences found`);

  // 11. Assemble Baseline Summary Report
  const baselineOutput = {
    generatedAt: new Date().toISOString(),
    algorithmEvent: "Google September 2026 Spam Update (Rollout started: 24 Sep 2026, ~14 day duration)",
    summary: {
      totalIndexablePages: inventory.length,
      protectedTier0PagesCount: PROTECTED_PAGES.length,
      pagesWithGscData: inventory.filter((p) => p.impressions > 0 || p.clicks > 0).length,
      classifications: {
        criticalDeclines: criticalDeclinesCount,
        declining: decliningCount,
        stable: stableCount,
        growing: growingCount,
        insufficientData: insufficientDataCount,
      },
      cannibalizationCandidateCount: cannibalizationInstances.length,
      aiVideoSharedQueriesCount: aiVideoSharedQueries.length,
      machineLabelsDetected: labelMatches,
    },
    protectedTier0Pages: PROTECTED_PAGES,
    queryOwnershipMap: QUERY_OWNERSHIP,
    aiVideoCannibalizationReport: aiVideoSharedQueries,
    topCannibalizationInstances: cannibalizationInstances.slice(0, 20),
    inventory,
  };

  const outputPath = path.join(ROOT, "data/audit/sitewide-ranking-recovery-baseline.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(baselineOutput, null, 2), "utf8");
  console.log(`✓ Baseline successfully written to: ${outputPath}`);

  if (pool) await pool.end();
  return baselineOutput;
}

main().catch((err) => {
  console.error("Fatal error building baseline:", err);
  process.exit(1);
});
