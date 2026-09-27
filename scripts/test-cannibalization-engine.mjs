import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const ROOT = process.cwd();
const envCandidates = [
  path.join(ROOT, ".env.production"),
  "/home/u188101251/production-app/.env.production",
];
for (const envFile of envCandidates) {
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim().replace(/^['"](.*)['"]$/, "$1");
      }
    }
  }
}

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
      "ai video agency mumbai",
      "ai video marketing agency",
    ],
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
  },
  {
    family: "GEO (Generative Engine Optimisation)",
    primaryUrl: "/services/geo/",
    coreKeywords: [
      "geo services in mumbai",
      "generative engine optimization agency",
      "geo agency mumbai",
      "generative engine optimisation company",
      "geo services",
    ],
  },
  {
    family: "LLM SEO / Optimization",
    primaryUrl: "/services/llm-seo-service/",
    coreKeywords: [
      "llm seo service",
      "llm optimization agency",
      "llm search optimization mumbai",
      "ai search optimization agency",
      "llm seo agency india",
    ],
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
  },
];

async function run() {
  const pool = mysql.createPool({
    host: process.env.DGS_MYSQL_HOST,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD,
    database: process.env.DGS_MYSQL_DATABASE,
  });

  const [rows] = await pool.query(`
    SELECT page_url, query_text, clicks, impressions, position, prev_clicks, prev_impressions, prev_position
    FROM gsc_page_query_metrics
    WHERE period_type = '28d'
  `);

  function normalPath(u) {
    let p = u.replace("https://www.dgeniussolutions.com", "") || "/";
    p = p.split("?")[0].split("#")[0];
    if (p !== "/" && !p.endsWith("/") && !/\.[a-z0-9]+$/i.test(p)) p += "/";
    return p;
  }

  const queryToPages = new Map();
  for (const r of rows) {
    const q = (r.query_text || "").trim().toLowerCase();
    if (!q) continue;
    const p = normalPath(r.page_url);

    if (!queryToPages.has(q)) queryToPages.set(q, new Map());
    const pageMap = queryToPages.get(q);

    if (!pageMap.has(p)) {
      pageMap.set(p, {
        page: p,
        clicks: 0,
        impressions: 0,
        posSum: 0,
        posCount: 0,
        prevClicks: 0,
        prevImpressions: 0,
        prevPosSum: 0,
        prevPosCount: 0,
      });
    }
    const d = pageMap.get(p);
    d.clicks += Number(r.clicks || 0);
    d.impressions += Number(r.impressions || 0);
    d.prevClicks += Number(r.prev_clicks || 0);
    d.prevImpressions += Number(r.prev_impressions || 0);
    if (r.position) {
      d.posSum += Number(r.position) * Number(r.impressions || 1);
      d.posCount += Number(r.impressions || 1);
    }
    if (r.prev_position) {
      d.prevPosSum += Number(r.prev_position) * Number(r.prev_impressions || 1);
      d.prevPosCount += Number(r.prev_impressions || 1);
    }
  }

  const candidateRecords = [];
  let falseSelfRecordsExcluded = 0;

  for (const [q, pageMap] of queryToPages.entries()) {
    if (pageMap.size < 2) continue; // Only 1 distinct URL, no collision possible

    const pages = Array.from(pageMap.values()).map((p) => ({
      page: p.page,
      clicks: p.clicks,
      impressions: p.impressions,
      position: p.posCount > 0 ? Number((p.posSum / p.posCount).toFixed(2)) : 0,
      prevClicks: p.prevClicks,
      prevImpressions: p.prevImpressions,
      prevPosition: p.prevPosCount > 0 ? Number((p.prevPosSum / p.prevPosCount).toFixed(2)) : 0,
    }));

    pages.sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks);

    const actualTopRanking = pages[0];
    const competing = pages[1];

    if (actualTopRanking.page === competing.page) {
      falseSelfRecordsExcluded++;
      continue;
    }

    const family = QUERY_OWNERSHIP.find((f) =>
      f.coreKeywords.some((k) => k.toLowerCase() === q)
    );
    const intendedPrimaryUrl = family ? family.primaryUrl : actualTopRanking.page;

    // Classification
    let classification = "INCIDENTAL_OVERLAP";
    const isBrand = /d[\s'-]?genius|dgeniussolutions/i.test(q);
    const lowVolume = actualTopRanking.impressions < 5 && competing.impressions < 5;

    if (lowVolume) {
      classification = "INSUFFICIENT_EVIDENCE";
    } else if (isBrand) {
      classification = "BRAND_OVERLAP";
    } else if (
      (actualTopRanking.page.startsWith("/blogs/") && !competing.page.startsWith("/blogs/")) ||
      (!actualTopRanking.page.startsWith("/blogs/") && competing.page.startsWith("/blogs/"))
    ) {
      classification = "SUPPORTING_PAGE";
    } else if (
      (actualTopRanking.page === "/" || actualTopRanking.page.startsWith("/services/")) &&
      (competing.page === "/" || competing.page.startsWith("/services/"))
    ) {
      const competingShare = competing.impressions / (actualTopRanking.impressions + competing.impressions);
      if (competingShare >= 0.25 || (family && family.primaryUrl === competing.page)) {
        classification = "TRUE_CANNIBALIZATION";
      } else {
        classification = "POTENTIAL_CANNIBALIZATION";
      }
    }

    candidateRecords.push({
      query: q,
      intendedPrimaryUrl,
      actualTopRankingUrl: actualTopRanking.page,
      competingUrl: competing.page,
      primaryMetrics: actualTopRanking,
      competingMetrics: competing,
      classification,
    });
  }

  console.log(`=== CANNIBALIZATION RE-CALCULATION RESULTS ===`);
  console.log(`Total Valid Candidates (primaryUrl != competingUrl): ${candidateRecords.length}`);
  console.log(`False Self-Records Excluded: ${falseSelfRecordsExcluded}`);

  const counts = {};
  for (const c of candidateRecords) {
    counts[c.classification] = (counts[c.classification] || 0) + 1;
  }
  console.log("Classifications Summary:", counts);

  console.log("\nAI VIDEO SPECIFIC CANNIBALIZATION CANDIDATES:");
  const aiVideoCandidates = candidateRecords.filter(
    (c) =>
      c.intendedPrimaryUrl === "/services/ai-video-production-agency/" ||
      c.actualTopRankingUrl === "/services/ai-video-production-agency/" ||
      c.competingUrl === "/services/ai-video-production-agency/" ||
      c.query.includes("ai video")
  );
  console.table(aiVideoCandidates.map((c) => ({
    query: c.query,
    intended: c.intendedPrimaryUrl,
    topRankUrl: c.actualTopRankingUrl,
    competingUrl: c.competingUrl,
    topImp: c.primaryMetrics.impressions,
    compImp: c.competingMetrics.impressions,
    class: c.classification,
  })));

  await pool.end();
}

run().catch(console.error);
