import fs from "node:fs";
import mysql from "mysql2/promise";

const ROOT = process.cwd();
const envCandidates = [
  pathJoin(ROOT, ".env.production"),
  "/home/u188101251/production-app/current/.env.production"
];

function pathJoin(...args) {
  return args.join("/");
}

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

async function main() {
  const slugs = [
    "ai-content-optimization",
    "ai-marketing-strategies-2026",
    "ai-tools-marketing-agencies",
    "content-strategy-high-intent-traffic",
    "google-ai-overviews-and-the-growth-of-zero-click-searches",
    "seo-services-india-2026",
    "topical-authority-seo",
    "website-development-leads",
    "website-development-mistakes",
    "website-performance-conversions"
  ];

  let pool = null;
  try {
    pool = mysql.createPool(process.env.DGS_DATABASE_URL || {
      host: process.env.DGS_MYSQL_HOST,
      user: process.env.DGS_MYSQL_USER,
      password: process.env.DGS_MYSQL_PASSWORD,
      database: process.env.DGS_MYSQL_DATABASE,
    });
  } catch (e) {
    console.warn("Could not connect to MySQL:", e.message);
  }

  // Fetch sitemap
  let sitemapXml = "";
  try {
    const smRes = await fetch("https://www.dgeniussolutions.com/sitemap.xml");
    sitemapXml = await smRes.text();
  } catch (e) {
    console.warn("Could not fetch sitemap:", e.message);
  }

  const results = [];

  for (const slug of slugs) {
    const url = `https://www.dgeniussolutions.com/blogs/${slug}/`;
    let liveStatus = 0;
    let liveCanonical = "";
    let liveRobots = "";

    try {
      const res = await fetch(url, { redirect: "manual" });
      liveStatus = res.status;
      if (liveStatus === 200) {
        const html = await res.text();
        const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
        liveCanonical = canonMatch ? canonMatch[1] : "";
        const robotsMatch = html.match(/<meta\s+name=["'](?:robots|googlebot)["']\s+content=["']([^"']+)["']/i);
        liveRobots = robotsMatch ? robotsMatch[1] : "index, follow";
      }
    } catch (e) {
      liveStatus = "ERROR";
    }

    let cmsStatus = "UNKNOWN";
    if (pool) {
      try {
        const [rows] = await pool.query("SELECT slug, status FROM blog_posts WHERE slug = ?", [slug]);
        if (rows.length > 0) {
          cmsStatus = rows[0].status;
        } else {
          cmsStatus = "NOT_IN_BLOG_POSTS";
        }
      } catch (e) {
        cmsStatus = "DB_ERROR";
      }
    }

    const inSitemap = sitemapXml.includes(url) || sitemapXml.includes(url.replace(/\/$/, ""));

    let gscImp = 0;
    let gscClicks = 0;
    let gscPos = "N/A";
    if (pool) {
      try {
        const [pm] = await pool.query(
          "SELECT clicks, impressions, position FROM gsc_page_metrics WHERE page_url LIKE ? OR page_url LIKE ?",
          [`%${url}`, `%${url.replace(/\/$/, "")}`]
        );
        if (pm.length > 0) {
          gscImp = pm[0].impressions || 0;
          gscClicks = pm[0].clicks || 0;
          gscPos = pm[0].position || "N/A";
        }
      } catch (e) {}
    }

    results.push({
      url,
      slug,
      httpStatus: liveStatus,
      canonical: liveCanonical,
      robots: liveRobots,
      cmsStatus,
      inSitemap,
      gscImpressions: gscImp,
      gscClicks,
      gscPos
    });
  }

  console.log("=== 10 DYNAMIC CMS BLOGS AUDIT ===");
  console.log(JSON.stringify(results, null, 2));

  if (pool) await pool.end();
}

main().catch(console.error);
