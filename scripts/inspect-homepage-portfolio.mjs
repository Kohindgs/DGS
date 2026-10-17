import fs from "node:fs";

const p = JSON.parse(fs.readFileSync("data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json", "utf8"));
const idx = p.body.indexOf('id="portfolio"');
if (idx !== -1) {
  console.log("=== PORTFOLIO SECTION IN HOMEPAGE MIRROR ===");
  // find portfolio-gallery inside this section
  const galleryIdx = p.body.indexOf('id="portfolio-gallery"', idx);
  console.log("Found portfolio-gallery at:", galleryIdx);
  if (galleryIdx !== -1) {
    console.log(p.body.slice(galleryIdx, galleryIdx + 1500));
  } else {
    console.log(p.body.slice(idx, idx + 1000));
  }
} else {
  console.log("id='portfolio' not found in p.body");
}
