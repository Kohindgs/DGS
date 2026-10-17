import fs from "node:fs";
import path from "node:path";

const dir = "data/wordpress/mirrors/pages";
const files = fs.readdirSync(dir);

console.log("=== CHECKING INTERNAL LINKS TO DUBAI PAGE ===");
for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), "utf8");
  if (content.includes("ai-production-dubai-page")) {
    const matches = [...content.matchAll(/<a\b[^>]*href=["']([^"']*ai-production-dubai-page[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    if (matches.length > 0) {
      console.log(`\nFile: ${file}`);
      matches.forEach(m => {
        const text = m[2].replace(/<[^>]+>/g, "").trim();
        console.log(`  - Target: ${m[1]} | Anchor Text: "${text}"`);
      });
    }
  }
}
