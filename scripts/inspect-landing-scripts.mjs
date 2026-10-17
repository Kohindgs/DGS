import fs from "node:fs";

const page = JSON.parse(fs.readFileSync("data/wordpress/mirrors/pages/ai-production-videos-google-ads-landing-page.json", "utf8"));
const matches = [...page.body.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
console.log(`Scripts in Ads landing page: ${matches.length}`);
matches.forEach((m, i) => {
  const content = m[1];
  console.log(`Script ${i + 1} (len ${content.length}): ${content.trim().slice(0, 150).replace(/\s+/g, " ")}`);
});
