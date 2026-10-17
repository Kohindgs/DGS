import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8"));
const html = data.body || "";

// Find each work-project-row
const parts = html.split('<div class="work-project-row');
console.log("Total work-project-row parts:", parts.length - 1);

for (let i = 1; i < parts.length; i++) {
  const chunk = parts[i];
  const nameMatch = chunk.match(/<h3 class="work-client-name">([^<]+)<\/h3>/);
  const imgMatch = chunk.match(/<img[^>]+>/);
  const linkMatch = chunk.match(/<a class="live-preview-link"[^>]+href="([^"]+)"/);
  console.log(`\nRow ${i}: ${nameMatch ? nameMatch[1].trim() : "Unknown"}`);
  console.log("  Live Link:", linkMatch ? linkMatch[1] : "None");
  console.log("  IMG:", imgMatch ? imgMatch[0] : "None");
}
