import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const files = [
  "data/wordpress/mirrors/pages/services__ai-video-production-agency.json",
  "data/wordpress/mirrors/pages/services__ai-production-dubai-page.json",
  "data/wordpress/mirrors/pages/ai-production-videos-google-ads-landing-page.json"
];

const replacement = `<div class="dgs-ai-portfolio-cta" id="portfolio-cta-section">
  <div class="dgs-ai-cta-content">
    <div class="dgs-ai-cta-eyebrow">START A PROJECT</div>
    <h3 class="dgs-ai-cta-heading">Ready To Create Your Next AI Video?</h3>
    <p class="dgs-ai-cta-desc">Tell us what you want to create and we'll help you plan the right AI video approach for your brand, campaign or product.</p>
  </div>
  <div class="dgs-ai-cta-action">
    <a href="#ai-video-enquiry-form" class="dgs-ai-cta-btn">START YOUR AI VIDEO PROJECT</a>
  </div>
</div>`;

console.log("=== Updating CTA Conversion Card HTML in Mirror JSONs ===");

for (const relPath of files) {
  const fullPath = path.join(ROOT, relPath);
  const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  
  const startMarker = '<div class="dgs-ai-portfolio-cta" id="portfolio-cta-section">';
  const startIdx = data.body.indexOf(startMarker);
  
  if (startIdx === -1) {
    console.error(`Missing ${startMarker} in ${relPath}`);
    continue;
  }
  
  // Find where the CTA div closes (after the anchor tag)
  const aIdx = data.body.indexOf('</a>', startIdx);
  if (aIdx === -1) {
    console.error(`Cannot find </a> after startMarker in ${relPath}`);
    continue;
  }
  const closeDivIdx = data.body.indexOf('</div>', aIdx);
  if (closeDivIdx === -1) {
    console.error(`Cannot find </div> after </a> in ${relPath}`);
    continue;
  }
  const endIdx = closeDivIdx + '</div>'.length;
  
  const oldCta = data.body.substring(startIdx, endIdx);
  console.log(`\nFound old CTA in ${relPath} (${oldCta.length} chars):`);
  console.log(oldCta);
  
  data.body = data.body.substring(0, startIdx) + replacement + data.body.substring(endIdx);
  data.bodyBytes = Buffer.byteLength(data.body, "utf8");
  
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
  console.log(`✓ Updated ${relPath}`);
}

console.log("\n=== CTA Mirror Update Complete ===");
