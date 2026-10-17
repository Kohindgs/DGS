import fs from "node:fs";

const page = JSON.parse(fs.readFileSync("data/wordpress/mirrors/pages/services__ai-video-production-agency.json", "utf8"));

// Find sections
const sectionMatches = [...page.body.matchAll(/<section([^>]*)>([\s\S]*?)<\/section>/gi)];
console.log(`Found ${sectionMatches.length} sections in services__ai-video-production-agency.json:`);

sectionMatches.forEach((s, i) => {
  const attrs = s[1];
  const content = s[2];
  const h = content.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i);
  const heading = h ? h[1].replace(/<[^>]+>/g, "").trim() : "No heading";
  console.log(`[Section ${i + 1}] attrs: ${attrs.trim().slice(0, 40)} | Heading: ${heading}`);
});
