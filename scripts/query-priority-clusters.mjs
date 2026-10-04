import mysql from "mysql2/promise";
import fs from "node:fs";

function loadEnv() {
  const content = fs.readFileSync(".env.production", "utf8");
  const config = {};
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      config[m[1]] = val;
    }
  }
  return config;
}

const env = loadEnv();

const PRIORITY_CLUSTERS = {
  "AI Video Priority": {
    target: "/services/ai-video-production-agency/",
    keywords: [
      "ai video production agency in mumbai",
      "ai video production service in mumbai",
      "ai video production services in mumbai",
      "ai video production house in mumbai",
      "ai video production company in mumbai",
      "ai video agency in mumbai",
      "ai production agency",
      "ai production company",
      "ai production house",
      "AI Avatar Videos in Mumbai",
      "AI Festival Videos in Mumbai",
      "AI TV commercials in Mumbai",
      "AI OTT video series in Mumbai",
      "AI OTT video ads in Mumbai"
    ]
  },
  "SEO Priority": {
    target: "/services/seo-services-in-mumbai/",
    keywords: [
      "seo services in mumbai",
      "seo agency in mumbai",
      "seo company in mumbai"
    ]
  },
  "AEO Priority": {
    target: "/services/aeo-services-in-mumbai/",
    keywords: [
      "aeo services in mumbai",
      "aeo agency in mumbai"
    ]
  },
  "GEO Priority": {
    target: "/services/geo/",
    keywords: [
      "geo services in mumbai",
      "geo agency in mumbai",
      "generative engine optimization services in mumbai"
    ]
  },
  "LLM SEO Priority": {
    target: "/services/llm-seo-service/",
    keywords: [
      "llm seo services",
      "llm seo agency india",
      "llm seo company",
      "llm seo services in mumbai",
      "best llm seo agency in mumbai",
      "best llm seo agency in navi mumbai"
    ]
  },
  "Dubai Priority": {
    target: "/services/ai-production-dubai-page/",
    keywords: [
      "ai video production agency in dubai",
      "ai production agency in dubai",
      "ai video production company in dubai"
    ]
  }
};

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE,
  });

  console.log("Checking priority keywords across GSC tables...");

  for (const [clusterName, cluster] of Object.entries(PRIORITY_CLUSTERS)) {
    console.log(`\n==================================================`);
    console.log(`CLUSTER: ${clusterName} (Target: ${cluster.target})`);
    console.log(`==================================================`);

    for (const kw of cluster.keywords) {
      const kwLower = kw.toLowerCase().trim();
      const [rows] = await conn.query(`
        SELECT query_text, clicks, impressions, ctr, position, prev_position
        FROM gsc_query_metrics
        WHERE LOWER(TRIM(query_text)) = ? OR LOWER(TRIM(query_text)) LIKE ?
        ORDER BY impressions DESC
        LIMIT 3
      `, [kwLower, `%${kwLower}%`]);

      const [pqRows] = await conn.query(`
        SELECT page_url, clicks, impressions, position
        FROM gsc_page_query_metrics
        WHERE LOWER(TRIM(query_text)) = ?
        LIMIT 5
      `, [kwLower]);

      if (rows.length > 0) {
        const r = rows[0];
        const curPos = Number(r.position || 0);
        const prevPos = r.prev_position ? Number(r.prev_position) : null;
        let delta = 0;
        let trend = "STABLE";
        if (prevPos == null) {
          trend = "NEW";
        } else {
          delta = Number((prevPos - curPos).toFixed(1));
          if (delta > 0.2) trend = "UP";
          else if (delta < -0.2) trend = "DOWN";
        }
        const landingPages = pqRows.map(p => p.page_url.replace("https://www.dgeniussolutions.com", "")).join(", ") || cluster.target;
        console.log(`Keyword: "${kw}"`);
        console.log(`  Target: ${cluster.target} | Ranked URL(s): ${landingPages}`);
        console.log(`  Clicks: ${r.clicks} | Imp: ${r.impressions} | CTR: ${(Number(r.ctr || 0) * 100).toFixed(1)}%`);
        console.log(`  Current Pos: ${curPos.toFixed(1)} | Prev Pos: ${prevPos ? prevPos.toFixed(1) : 'None'} | Delta: ${delta > 0 ? '+' : ''}${delta.toFixed(1)} | Trend: ${trend}`);
      } else {
        console.log(`Keyword: "${kw}" -> [NOT IN GSC 28D LOGS / UNRANKED] (Target: ${cluster.target})`);
      }
    }
  }

  await conn.end();
}

main().catch(console.error);
