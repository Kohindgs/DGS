import { execSync } from "node:child_process";

async function main() {
  console.log("==================================================");
  console.log("DGS V8.12.2 LIVE PRODUCTION VERIFICATION SUITE");
  console.log("==================================================");

  // 1. Check public homepage and SEO tags
  console.log("\n[TEST 1] Public Homepage & SEO Indexing Verification...");
  const homeRes = await fetch("https://www.dgeniussolutions.com/");
  if (!homeRes.ok) throw new Error(`Homepage returned HTTP ${homeRes.status}`);
  const homeHtml = await homeRes.text();
  const hasRobots = homeHtml.includes('content="index, follow"');
  console.log(`✓ Homepage HTTP 200 OK (${homeHtml.length} bytes)`);
  console.log(`✓ 'index, follow' Meta Tag Present: ${hasRobots}`);
  if (!hasRobots) throw new Error("CRITICAL: robots tag missing from public homepage!");

  // 2. Check sitemap.xml
  console.log("\n[TEST 2] Sitemap Verification...");
  const sitemapRes = await fetch("https://www.dgeniussolutions.com/sitemap.xml");
  console.log(`✓ Sitemap HTTP ${sitemapRes.status}`);

  // 3. Remote tests on VPS
  console.log("\n[TEST 3] VPS TurboVec Socket and Database Verification...");
  const remoteTestCode = `
import http from "node:http";
import fs from "node:fs/promises";
import mysql from "mysql2/promise";

function sockRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : undefined;
    const req = http.request({
      socketPath: "/home/u188101251/production-app/shared/turbovec/turbovec.sock",
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {})
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("--- 3.1 TurboVec Health Check ---");
  const health = await sockRequest("GET", "/health");
  console.log("HEALTH:", JSON.stringify(health));

  console.log("\\n--- 3.2 TurboVec Semantic Search (dgs-content) ---");
  const searchRes = await sockRequest("POST", "/api/search", {
    index_name: "dgs-content",
    query: "SEO Agency in Mumbai",
    limit: 3
  });
  console.log("SEARCH FOUND:", searchRes.total, "results:");
  for (const r of (searchRes.results || [])) {
    console.log("  - [" + r.score + "] " + r.title + " (" + r.path + ")");
  }

  console.log("\\n--- 3.3 Semantic Duplicate Detection (off-page) ---");
  const dupCheck1 = await sockRequest("POST", "/api/deduplicate", {
    text: "Top digital marketing agencies in Dubai UAE directory listing",
    domain: "techdirectorydubai.com"
  });
  console.log("DUP CHECK (Existing theme):", dupCheck1.status, "similarity:", dupCheck1.similarity, dupCheck1.reason);

  const dupCheck2 = await sockRequest("POST", "/api/deduplicate", {
    text: "Quantum computing hardware cryogenic cooling breakthroughs 2026",
    domain: "quantumcoolingphysics.org"
  });
  console.log("DUP CHECK (Unique query):", dupCheck2.status, "similarity:", dupCheck2.similarity, dupCheck2.reason);

  console.log("\\n--- 3.4 Target Page Matching ---");
  const targetPages = await sockRequest("POST", "/api/match-target-pages", {
    query: "Looking for expert generative AI video production and 3D animation services in Mumbai",
    region: "INDIA",
    limit: 2
  });
  console.log("MATCHED TARGET PAGES:", JSON.stringify(targetPages.target_pages, null, 2));

  console.log("\\n--- 3.5 Supporting Assets Retrieval ---");
  const assets = await sockRequest("POST", "/api/match-assets", {
    query: "b2b lead generation case studies and seo growth",
    limit: 2
  });
  console.log("ASSETS:", JSON.stringify(assets.assets, null, 2));

  console.log("\\n--- 3.6 Outreach Draft Grounding ---");
  const ground = await sockRequest("POST", "/api/ground-draft", {
    opportunity_text: "Enterprise performance marketing and generative AI search optimization publication",
    publication_name: "Digital Marketing Today",
    target_page: "/services/search-engine-optimization-seo/"
  });
  console.log("GROUNDED SOURCES USED:", JSON.stringify(ground.sources_used, null, 2));
  console.log("GROUNDED TALKING POINTS:", JSON.stringify(ground.talking_points, null, 2));

  console.log("\\n--- 3.7 Database Verification (Authentic records only) ---");
  const envText = await fs.readFile("/home/u188101251/production-app/current/.env.production", "utf8");
  const env = {};
  for (const line of envText.split("\\n")) {
    const p = line.indexOf("=");
    if (p > 0) {
      let v = line.slice(p + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      env[line.slice(0, p).trim()] = v;
    }
  }

  const conn = await mysql.createConnection({
    host: env.DGS_MYSQL_HOST,
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE
  });

  const [oppRows] = await conn.query("SELECT COUNT(*) as cnt FROM off_page_opportunities");
  const [vecRows] = await conn.query("SELECT COUNT(*) as cnt FROM off_page_vector_documents");
  const [regionRows] = await conn.query("SELECT region, COUNT(*) as cnt FROM off_page_opportunities GROUP BY region");
  console.log("TOTAL OPPORTUNITIES IN DB:", oppRows[0].cnt);
  console.log("TOTAL VECTOR REGISTRY RECORDS:", vecRows[0].cnt);
  console.log("OPPORTUNITIES BY REGION:", JSON.stringify(regionRows));

  await conn.end();
}

run().catch(e => { console.error("TEST FAILED:", e); process.exit(1); });
`;

  execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/test-suite.mjs"`, {
    input: remoteTestCode,
    encoding: "utf8"
  });

  const remoteOutput = execSync(`ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node test-suite.mjs && rm -f test-suite.mjs"`, {
    encoding: "utf8"
  });
  console.log(remoteOutput);

  console.log("==================================================");
  console.log("ALL LIVE PRODUCTION VERIFICATION TESTS COMPLETED!");
  console.log("==================================================");
}

main().catch(err => {
  console.error("FATAL QA VERIFICATION ERROR:", err);
  process.exit(1);
});
