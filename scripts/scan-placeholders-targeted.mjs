import fs from "fs";
import path from "path";

const searchTerms = [
  "Replace with your Fluent Form shortcode",
  "Fluent Form shortcode",
  "form shortcode",
  "FORM_ID",
  "test form",
  "debug form",
  "wpforms",
];

const targetDirs = ["app", "components", "lib", "data/wordpress/mirrors/pages"];
const matches = [];

for (const relDir of targetDirs) {
  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(full);
      } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".json") || entry.name.endsWith(".js") || entry.name.endsWith(".mjs") || entry.name.endsWith(".html"))) {
        const text = fs.readFileSync(full, "utf8");
        for (const term of searchTerms) {
          let idx = 0;
          while ((idx = text.toLowerCase().indexOf(term.toLowerCase(), idx)) !== -1) {
            matches.push({
              file: full.replace(/\\/g, "/"),
              term,
              snippet: text.slice(Math.max(0, idx - 40), Math.min(text.length, idx + 80)).replace(/\s+/g, " "),
            });
            idx += term.length;
          }
        }
      }
    }
  }
  scan(relDir);
}

console.log(`Scan completed. Found ${matches.length} occurrences:`);
for (const m of matches) {
  console.log(`- [${m.term}] in ${m.file}:\n    "...${m.snippet}..."`);
}
