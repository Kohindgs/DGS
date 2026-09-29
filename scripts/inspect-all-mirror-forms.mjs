import fs from "fs";
import path from "path";

const mirrorDir = "data/wordpress/mirrors/pages";
const files = fs.readdirSync(mirrorDir);

for (const file of files) {
  const content = fs.readFileSync(path.join(mirrorDir, file), "utf8");
  const formMatches = [...content.matchAll(/<form\b([^>]*)>/gi)];
  if (formMatches.length > 0) {
    console.log(`\n=== File: ${file} (forms: ${formMatches.length}) ===`);
    formMatches.forEach((m, idx) => {
      console.log(`  Form #${idx + 1} attrs: ${m[1].replace(/\s+/g, " ").trim()}`);
    });
  }
}
