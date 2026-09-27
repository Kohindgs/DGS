import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const mirrorDir = path.join(ROOT, "data/wordpress/mirrors/pages");
const labels = [
  "Target Keyword",
  "AI Overview Answer",
  "AEO Answer",
  "LLM Answer",
  "GEO Target",
  "Local SEO",
  "Internal Link",
  "Crawler Answer",
  "Case Signal",
  "Mumbai Local",
];

const categories = {
  PUBLICLY_RENDERED: 0,
  SOURCE_COMMENT_ONLY: 0,
  INTERNAL_METADATA: 0,
  HIDDEN_NON_RENDERED: 0,
};

const occurrences = [];

if (fs.existsSync(mirrorDir)) {
  for (const f of fs.readdirSync(mirrorDir)) {
    if (!f.endsWith(".json")) continue;
    const content = fs.readFileSync(path.join(mirrorDir, f), "utf8");
    let data;
    try {
      data = JSON.parse(content);
    } catch {
      continue;
    }

    for (const label of labels) {
      if (!content.includes(label)) continue;

      // Extract HTML content from JSON
      const rawHtml = String(data.content?.rendered || data.content || "");
      if (rawHtml.includes(label)) {
        // Is it inside HTML comments? e.g. <!-- ... --> or /* ... */
        const commentsRemoved = rawHtml
          .replace(/<!--[\s\S]*?-->/g, "")
          .replace(/\/\*[\s\S]*?\*\//g, "");

        if (commentsRemoved.includes(label)) {
          // Check if it is inside script, style, or attribute
          const textOnly = commentsRemoved
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ");

          if (textOnly.includes(label)) {
            categories.PUBLICLY_RENDERED++;
            occurrences.push({ file: f, label, type: "PUBLICLY_RENDERED" });
          } else {
            categories.INTERNAL_METADATA++;
            occurrences.push({ file: f, label, type: "INTERNAL_METADATA" });
          }
        } else {
          categories.SOURCE_COMMENT_ONLY++;
          occurrences.push({ file: f, label, type: "SOURCE_COMMENT_ONLY" });
        }
      } else {
        categories.INTERNAL_METADATA++;
        occurrences.push({ file: f, label, type: "INTERNAL_METADATA" });
      }
    }
  }
}

console.log("=== MACHINE LABELS CLASSIFICATION ANALYSIS ===");
console.log("Categories Summary:", categories);
console.log(`Total Occurrences Analyzed: ${occurrences.length}`);
const publicRendered = occurrences.filter((o) => o.type === "PUBLICLY_RENDERED");
console.log(`Publicly Rendered Count: ${publicRendered.length}`);
if (publicRendered.length > 0) {
  console.log("Publicly Rendered Sample:", publicRendered.slice(0, 10));
} else {
  console.log("✓ ZERO machine labels are publicly rendered in visible text!");
}
