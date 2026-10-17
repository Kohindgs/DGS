import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8"));
const html = data.body;
console.log("Total HTML length:", html.length);

// Extract headings with context
const headings = [...html.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)].map(m => ({
  tag: m[1],
  text: m[2].replace(/<[^>]+>/g, "").trim(),
  raw: m[0]
}));

console.log(`Found ${headings.length} headings:`);
headings.forEach((h, idx) => {
  console.log(`${idx + 1}. [${h.tag.toUpperCase()}] ${h.text}`);
});
