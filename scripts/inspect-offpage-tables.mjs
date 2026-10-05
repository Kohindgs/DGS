import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const remoteCode = `
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

  const [cits] = await conn.query("SELECT * FROM off_page_citations");
  console.log("CITATIONS (" + cits.length + "):");
  for (const c of cits) {
    console.log(" - " + c.platform_name + " | URL: " + c.listing_url + " | Status: " + c.status + " | NAP: " + c.nap_consistency_score);
  }

  const [backlinks] = await conn.query("SELECT * FROM off_page_backlinks");
  console.log("\\nBACKLINKS (" + backlinks.length + "):");
  for (const b of backlinks) {
    console.log(" - ID: " + b.id + " | Source: " + b.source_url + " | Target: " + b.target_url + " | Status: " + b.status);
  }

  const [mentions] = await conn.query("SELECT * FROM off_page_mentions");
  console.log("\\nMENTIONS (" + mentions.length + "):");
  for (const m of mentions) {
    console.log(" - ID: " + m.id + " | Source: " + m.source_url + " | HasLink: " + m.has_link + " | Status: " + m.status);
  }

  const [compDomains] = await conn.query("SELECT * FROM off_page_competitor_domains");
  console.log("\\nCOMPETITOR DOMAINS (" + compDomains.length + "):");
  for (const cd of compDomains) {
    console.log(" - " + cd.domain + " | " + cd.name + " | " + cd.region);
  }

  await conn.end();
}
run().catch(console.error);
`;

const localTmp = path.join(process.cwd(), "tmp-inspect-data.mjs");
fs.writeFileSync(localTmp, remoteCode, "utf8");

try {
  execSync(`scp -P 65002 "${localTmp}" u188101251@147.93.100.126:/home/u188101251/production-app/current/tmp-inspect-data.mjs`);
  const out = execSync(`ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node tmp-inspect-data.mjs && rm -f tmp-inspect-data.mjs"`, {
    encoding: "utf8"
  });
  console.log(out);
} finally {
  if (fs.existsSync(localTmp)) fs.unlinkSync(localTmp);
}
