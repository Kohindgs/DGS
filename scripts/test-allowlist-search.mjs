import http from "node:http";
import fs from "node:fs/promises";
import mysql from "mysql2/promise";
import { execSync } from "node:child_process";

const remoteTest = `
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

async function testAllowlist() {
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
    database: env.DGS_MYSQL_DATABASE,
    supportBigNumbers: true,
    bigNumberStrings: true
  });

  console.log("=== NATIVE TURBOVEC ALLOWLIST SEARCH TEST (SECTION 19) ===");

  // 1. Fetch UAE vector_ids from registry
  const [uaeRows] = await conn.query("SELECT vector_id, entity_id, region FROM off_page_vector_documents WHERE region = 'UAE'");
  const uaeVectorIds = uaeRows.map(r => String(r.vector_id));
  console.log("UAE Vector IDs in Registry:", uaeVectorIds.length);

  // 2. Search off-page index with query 'AI video opportunity' and UAE allowlist
  const resUae = await sockRequest("POST", "/api/search", {
    index_name: "off-page",
    query: "AI video opportunity",
    allowlist: uaeVectorIds,
    limit: 10
  });

  console.log("Results returned with UAE allowlist:", resUae.results.length);
  let crossRegionCount = 0;
  for (const item of resUae.results) {
    const region = item.region || item.site_region;
    console.log("  - [" + item.score + "] " + (item.title || item.site_name) + " | Region: " + region);
    if (region && region.toUpperCase() !== "UAE") {
      crossRegionCount++;
    }
  }
  console.log("Cross-region results count:", crossRegionCount);
  if (crossRegionCount > 0) {
    console.error("FAIL: Cross-region results found in UAE allowlist search!");
    process.exit(1);
  }
  console.log("PASS: UAE Allowlist strict isolation (0 cross-region results)!");

  // 3. Repeat for INDIA only
  const [indiaRows] = await conn.query("SELECT vector_id FROM off_page_vector_documents WHERE region = 'INDIA'");
  const indiaVectorIds = indiaRows.map(r => String(r.vector_id));
  const resIndia = await sockRequest("POST", "/api/search", {
    index_name: "off-page",
    query: "SEO agency directory",
    allowlist: indiaVectorIds,
    limit: 5
  });
  let crossIndia = 0;
  for (const item of resIndia.results) {
    if (item.region && item.region.toUpperCase() !== "INDIA") crossIndia++;
  }
  console.log("Cross-region results for INDIA allowlist:", crossIndia);
  if (crossIndia > 0) throw new Error("FAIL: Cross-region results in India search!");
  console.log("PASS: India Allowlist strict isolation!");

  await conn.end();
}

testAllowlist().catch(e => { console.error("TEST FAILED:", e); process.exit(1); });
`;

execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/test-allowlist.mjs"`, {
  input: remoteTest,
  encoding: "utf8"
});

const out = execSync(`ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node test-allowlist.mjs && rm -f test-allowlist.mjs"`, {
  encoding: "utf8"
});
console.log(out);
