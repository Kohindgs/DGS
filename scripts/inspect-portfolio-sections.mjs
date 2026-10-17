import fs from "node:fs";

const pages = [
  "data/wordpress/mirrors/pages/services__ai-video-production-agency.json",
  "data/wordpress/mirrors/pages/ai-production-videos-google-ads-landing-page.json",
  "data/wordpress/mirrors/pages/services__ai-production-dubai-page.json"
];

for (const p of pages) {
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  console.log(`\n============================================================`);
  console.log(`PAGE: ${p}`);
  console.log(`============================================================`);
  
  // Extract all sections
  const sections = data.body.match(/<section[\s\S]*?<\/section>/gi) || [];
  console.log(`Found ${sections.length} sections:`);
  if (p.includes("ai-video-production-agency")) {
    console.log("\n--- DETAILED SECTION BREAKDOWN FOR AI VIDEO AGENCY PAGE ---");
    sections.slice(0, 6).forEach((s, i) => {
      const id = (s.match(/id=["']([^"']+)["']/i) || [])[1] || "no-id";
      console.log(`\nSection [${i}] id="${id}" (length: ${s.length} chars)`);
      console.log(s.slice(0, 250));
    });
  }
}
