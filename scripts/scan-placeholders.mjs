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

const matches = [];

function searchDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      searchDir(fullPath);
    } else if (entry.isFile()) {
      try {
        const text = fs.readFileSync(fullPath, "utf8");
        for (const term of searchTerms) {
          let idx = 0;
          while ((idx = text.toLowerCase().indexOf(term.toLowerCase(), idx)) !== -1) {
            matches.push({
              file: fullPath.replace(/\\/g, "/"),
              term,
              snippet: text.slice(Math.max(0, idx - 40), Math.min(text.length, idx + 80)).replace(/\s+/g, " "),
            });
            idx += term.length;
          }
        }
      } catch (err) {
        // ignore binary
      }
    }
  }
}

searchDir(".");
console.log(`Found ${matches.length} term occurrences:`);
for (const m of matches) {
  console.log(`- [${m.term}] in ${m.file}: "...${m.snippet}..."`);
}
