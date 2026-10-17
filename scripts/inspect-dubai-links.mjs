import fs from "node:fs";

const files = [
  "data/wordpress/mirrors/pages/our-services.json",
  "data/wordpress/mirrors/pages/services.json",
  "data/wordpress/mirrors/pages/aeo-dubai.json",
  "data/wordpress/mirrors/pages/services__dubai-seo.json",
  "data/wordpress/mirrors/pages/services__ai-video-production-agency.json",
  "data/wordpress/mirrors/pages/services__ai-production-dubai-page.json",
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, "utf8");
  const regex = /.{0,100}ai-production-dubai-page.{0,100}/g;
  let match;
  console.log(`\n=== File: ${f} ===`);
  while ((match = regex.exec(content)) !== null) {
    console.log("Snippet:", match[0].replace(/\\"/g, '"').replace(/\n/g, " "));
  }
}
