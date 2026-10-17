import fs from "node:fs";

const files = [
  "data/wordpress/mirrors/pages/ai-production-videos-google-ads-landing-page.json",
  "data/wordpress/mirrors/pages/australia-page.json",
  "data/wordpress/mirrors/pages/services__ai-production-dubai-page.json",
  "data/wordpress/mirrors/pages/services__ai-video-production-agency.json",
];

for (const f of files) {
  const b = fs.readFileSync(f, "utf8");
  console.log(f);
  console.log("  schema.org/Review:", b.includes("schema.org/Review"));
  console.log("  itemprop author:", b.includes('itemprop="author"') || b.includes("itemprop='author'"));
  console.log("  reviewBody:", b.includes("reviewBody"));
  console.log("  itemReviewed:", b.includes("itemReviewed"));
}
