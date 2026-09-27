import fs from "fs";
import path from "path";

const candidatePaths = [
  "/seo-pricing/",
  "/seo-executive-assessment/",
  "/seo-manager-assessment/",
  "/motion-graphics/",
  "/indriya-test/",
  "/social-media-executive/",
  "/ai-motion-graphic-designer/",
  "/wp-file-download-search/",
];

function scanDir(dir) {
  let hits = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!full.includes("node_modules") && !full.includes(".next") && !full.includes(".git") && !full.includes("data\\audit")) {
        hits = hits.concat(scanDir(full));
      }
    } else if (e.isFile() && (e.name.endsWith(".json") || e.name.endsWith(".tsx") || e.name.endsWith(".ts"))) {
      if (full.includes("data\\wordpress\\mirrors") || full.includes("components") || full.includes("app\\(site)") || full.includes("lib\\wordpress")) {
        const content = fs.readFileSync(full, "utf8");
        for (const cp of candidatePaths) {
          if (content.includes(`href="${cp}"`) || content.includes(`href='${cp}'`) || content.includes(`href=\\"${cp}\\"`)) {
            hits.push({ file: full, path: cp });
          }
        }
      }
    }
  }
  return hits;
}

const results = scanDir(".");
console.log(`Internal link references found: ${results.length}`);
results.forEach(r => console.log(`  ${r.file} links to ${r.path}`));
