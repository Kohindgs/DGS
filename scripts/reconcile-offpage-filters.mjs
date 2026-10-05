import mysql from "mysql2/promise";
import fs from "node:fs";

async function main() {
  console.log("==================================================");
  console.log("DGS OFF-PAGE FILTER RECONCILIATION AUDIT (SQL vs API)");
  console.log("==================================================");

  // Read production env for credentials
  const envContent = fs.readFileSync(".env.production", "utf8");
  let email = "";
  let password = "";
  for (const line of envContent.split(/\r?\n/)) {
    if (line.startsWith("DGS_ADMIN_EMAIL=")) {
      email = line.slice("DGS_ADMIN_EMAIL=".length).trim().replace(/^['"](.*)['"]$/, "$1");
    }
    if (line.startsWith("DGS_ADMIN_PASSWORD=")) {
      password = line.slice("DGS_ADMIN_PASSWORD=".length).trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }

  // 1. Authenticate to get session
  const loginParams = new URLSearchParams();
  loginParams.set("email", email);
  loginParams.set("password", password);

  const loginRes = await fetch("https://www.dgeniussolutions.com/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: loginParams.toString(),
    redirect: "manual",
  });
  const cookieHeader = loginRes.headers.get("set-cookie");
  const sessionCookie = cookieHeader ? cookieHeader.split(";")[0] : "";
  const authHeaders = { Cookie: sessionCookie };

  // 2. Define filter test cases
  const filterCases = [
    { name: "Total All", query: "", sqlWhere: "1=1", sqlParams: [] },
    { name: "UAE", query: "region=UAE", sqlWhere: "region = ?", sqlParams: ["UAE"] },
    { name: "India", query: "region=INDIA", sqlWhere: "region = ?", sqlParams: ["INDIA"] },
    { name: "USA", query: "region=USA", sqlWhere: "region = ?", sqlParams: ["USA"] },
    { name: "Global", query: "region=GLOBAL", sqlWhere: "region = ?", sqlParams: ["GLOBAL"] },
    { name: "FREE", query: "free_status=FREE", sqlWhere: "free_status = ?", sqlParams: ["FREE"] },
    { name: "QUALIFIED", query: "status=QUALIFIED", sqlWhere: "status = ?", sqlParams: ["QUALIFIED"] },
    { name: "DIRECTORY", query: "category=AGENCY_DIRECTORY", sqlWhere: "category = ?", sqlParams: ["AGENCY_DIRECTORY"] },
    { name: "P0", query: "priority=P0", sqlWhere: "priority_tier = ?", sqlParams: ["P0"] },
    { name: "UAE + FREE", query: "region=UAE&free_status=FREE", sqlWhere: "region = ? AND free_status = ?", sqlParams: ["UAE", "FREE"] },
    { name: "India + DIRECTORY", query: "region=INDIA&category=AGENCY_DIRECTORY", sqlWhere: "region = ? AND category = ?", sqlParams: ["INDIA", "AGENCY_DIRECTORY"] },
    { name: "USA + FREE", query: "region=USA&free_status=FREE", sqlWhere: "region = ? AND free_status = ?", sqlParams: ["USA", "FREE"] },
    { name: "P0 + QUALIFIED", query: "priority=P0&status=QUALIFIED", sqlWhere: "priority_tier = ? AND status = ?", sqlParams: ["P0", "QUALIFIED"] },
  ];

  // 3. Connect to remote MariaDB via SSH runner to get true SQL counts
  const remoteSqlCode = `
import mysql from "mysql2/promise";
import fs from "node:fs/promises";

async function run() {
  const envText = await fs.readFile(".env.production", "utf8");
  const env = {};
  for (const line of envText.split("\\n")) {
    const p = line.indexOf("=");
    if (p > 0) env[line.slice(0, p).trim()] = line.slice(p + 1).trim().replace(/^['"](.*)['"]$/, "$1");
  }
  const conn = await mysql.createConnection({
    host: env.DGS_MYSQL_HOST,
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE
  });

  const cases = ${JSON.stringify(filterCases.map(c => ({ name: c.name, sqlWhere: c.sqlWhere, sqlParams: c.sqlParams })))};
  const results = {};
  for (const c of cases) {
    const [rows] = await conn.query(\`SELECT COUNT(*) as cnt FROM off_page_opportunities WHERE \${c.sqlWhere}\`, c.sqlParams);
    results[c.name] = rows[0].cnt;
  }
  await conn.end();
  console.log("SQL_COUNTS_JSON:" + JSON.stringify(results));
}
run().catch(console.error);
`;

  const { execSync } = await import("node:child_process");
  execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/run-sql-counts.mjs"`, {
    input: remoteSqlCode,
    encoding: "utf8"
  });
  const remoteOut = execSync(`ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node run-sql-counts.mjs && rm -f run-sql-counts.mjs"`, {
    encoding: "utf8"
  });
  const sqlCountsMatch = remoteOut.match(/SQL_COUNTS_JSON:(.+)/);
  const sqlCounts = JSON.parse(sqlCountsMatch[1]);

  console.log("\n| Filter | SQL Count | API Count | Result |");
  console.log("|---|---:|---:|---|");

  let allPass = true;
  for (const c of filterCases) {
    const apiRes = await fetch(`https://www.dgeniussolutions.com/api/admin/off-page/opportunities?${c.query}`, {
      headers: authHeaders
    });
    const apiJson = await apiRes.json();
    const apiCount = apiJson.total ?? apiJson.opportunities?.length ?? 0;
    const sqlCount = sqlCounts[c.name];
    const match = sqlCount === apiCount;
    if (!match) allPass = false;
    console.log(`| ${c.name} | ${sqlCount} | ${apiCount} | ${match ? "PASS" : "FAIL"} |`);
  }

  if (allPass) {
    console.log("\n✓ ALL 13 FILTER COMBINATIONS PERFECTLY RECONCILE (SQL === API)!");
  } else {
    throw new Error("One or more filter counts did not reconcile!");
  }
}

main().catch(console.error);
