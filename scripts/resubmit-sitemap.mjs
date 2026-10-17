import fs from "node:fs";

async function main() {
  const envContent = fs.readFileSync("/home/u188101251/production-app/shared/.env.production", "utf8");
  for (const line of envContent.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"](.*)['"]$/, "$1");
    }
  }

  // Import from compiled or ts-node/tsx or local module
  const { getFreshAccessToken } = await import("./lib/integrations/google.js").catch(async () => {
    // Alternatively dynamic import or use tsx
    return await import("./lib/integrations/google.ts");
  });

  const token = await getFreshAccessToken("gsc");
  console.log("Token available:", Boolean(token));
  if (!token) {
    console.error("No GSC token available");
    return;
  }

  const siteUrl = encodeURIComponent("https://www.dgeniussolutions.com/");
  const feedpath = encodeURIComponent("https://www.dgeniussolutions.com/sitemap.xml");

  // 1. Submit sitemap (PUT)
  console.log("Resubmitting sitemap to Google Search Console API...");
  const putRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${feedpath}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("PUT HTTP Status:", putRes.status, putRes.statusText);

  // 2. Query sitemap status (GET)
  const getRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${feedpath}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("GET HTTP Status:", getRes.status, getRes.statusText);
  const data = await getRes.json();
  console.log("GSC SITEMAP DATA:");
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
