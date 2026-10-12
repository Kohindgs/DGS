import fs from "node:fs";
import path from "node:path";

console.log("================================================================================");
console.log("=== APPLYING DGS AI PORTFOLIO ZERO-CROP, REORDERING & SECTION POSITION FIXES ===");
console.log("================================================================================\n");

// -----------------------------------------------------------------------------
// 1. REORDER SECTIONS IN services__ai-video-production-agency.json
// Move <section id="portfolio" ...> directly below Hero (<section class="dgs-hero" id="top">)
// -----------------------------------------------------------------------------
const agencyPath = "data/wordpress/mirrors/pages/services__ai-video-production-agency.json";
const agencyData = JSON.parse(fs.readFileSync(agencyPath, "utf8"));

const heroRegex = /<section class="dgs-hero" id="top">[\s\S]*?<\/section>/i;
const portfolioSectionRegex = /<section id="portfolio" class="dgs-section" itemscope itemtype="https:\/\/schema\.org\/CollectionPage">[\s\S]*?<\/section>/i;

const heroMatch = agencyData.body.match(heroRegex);
const portfolioMatch = agencyData.body.match(portfolioSectionRegex);

if (heroMatch && portfolioMatch) {
  // Remove portfolio from its old position
  let newBody = agencyData.body.replace(portfolioSectionRegex, "");
  // Insert portfolio immediately after Hero
  newBody = newBody.replace(heroRegex, `${heroMatch[0]}\n\n${portfolioMatch[0]}`);
  agencyData.body = newBody;
  fs.writeFileSync(agencyPath, JSON.stringify(agencyData, null, 2), "utf8");
  console.log("✓ services__ai-video-production-agency.json: Moved #portfolio directly below Hero");
} else {
  console.error("❌ Could not match Hero or Portfolio in agency page!");
}

// -----------------------------------------------------------------------------
// 2. REORDER SECTIONS IN ai-production-videos-google-ads-landing-page.json
// Move <section class="dgs-ai-section" id="ai-production-portfolio"> directly below Hero / Logo Strip
// -----------------------------------------------------------------------------
const adsPath = "data/wordpress/mirrors/pages/ai-production-videos-google-ads-landing-page.json";
const adsData = JSON.parse(fs.readFileSync(adsPath, "utf8"));

const adsHeroLogoRegex = /(<section class="dgs-ai-hero" id="dgs-ai-production-lead-form">[\s\S]*?<\/section>\s*<section class="dgs-ai-clients">[\s\S]*?<\/section>)/i;
const adsPortfolioRegex = /<section class="dgs-ai-section" id="ai-production-portfolio">[\s\S]*?<\/section>/i;

const adsHeroLogoMatch = adsData.body.match(adsHeroLogoRegex);
const adsPortfolioMatch = adsData.body.match(adsPortfolioRegex);

if (adsHeroLogoMatch && adsPortfolioMatch) {
  let newBody = adsData.body.replace(adsPortfolioRegex, "");
  newBody = newBody.replace(adsHeroLogoRegex, `${adsHeroLogoMatch[0]}\n\n${adsPortfolioMatch[0]}`);
  adsData.body = newBody;
  fs.writeFileSync(adsPath, JSON.stringify(adsData, null, 2), "utf8");
  console.log("✓ ai-production-videos-google-ads-landing-page.json: Moved #ai-production-portfolio directly below Hero & Logo strip");
} else {
  console.error("❌ Could not match Hero or Portfolio in Google Ads page!");
}

// -----------------------------------------------------------------------------
// 3. REORDER SECTIONS IN services__ai-production-dubai-page.json
// Move <section id="portfolio" ...> directly below Hero / Logo strip
// -----------------------------------------------------------------------------
const dubaiPath = "data/wordpress/mirrors/pages/services__ai-production-dubai-page.json";
const dubaiData = JSON.parse(fs.readFileSync(dubaiPath, "utf8"));

const dubaiHeroLogoRegex = /(<section class="dgs-hero" id="top">[\s\S]*?<\/section>\s*<section class="dgs-logo-strip">[\s\S]*?<\/section>)/i;
const dubaiPortfolioRegex = /<section id="portfolio" class="dgs-section" itemscope itemtype="https:\/\/schema\.org\/CollectionPage">[\s\S]*?<\/section>/i;

const dubaiHeroLogoMatch = dubaiData.body.match(dubaiHeroLogoRegex);
const dubaiPortfolioMatch = dubaiData.body.match(dubaiPortfolioRegex);

if (dubaiHeroLogoMatch && dubaiPortfolioMatch) {
  let newBody = dubaiData.body.replace(dubaiPortfolioRegex, "");
  newBody = newBody.replace(dubaiHeroLogoRegex, `${dubaiHeroLogoMatch[0]}\n\n${dubaiPortfolioMatch[0]}`);
  dubaiData.body = newBody;
  fs.writeFileSync(dubaiPath, JSON.stringify(dubaiData, null, 2), "utf8");
  console.log("✓ services__ai-production-dubai-page.json: Moved #portfolio directly below Hero & Logo strip");
} else {
  console.error("❌ Could not match Hero or Portfolio in Dubai page!");
}

// -----------------------------------------------------------------------------
// 4. FIX ZERO-CROP IN ai-production-videos-google-ads-landing-page.json
// Remove max-height: 480px, replace object-fit: cover with object-fit: contain, background: #050505
// -----------------------------------------------------------------------------
let updatedAdsBody = adsData.body;
// Replace card inner containers: remove max-height: 480px, set background #050505
updatedAdsBody = updatedAdsBody.replaceAll(
  'max-height:480px;',
  ''
);
updatedAdsBody = updatedAdsBody.replaceAll(
  'object-fit:cover',
  'object-fit:contain;object-position:center;background:#050505'
);
adsData.body = updatedAdsBody;
fs.writeFileSync(adsPath, JSON.stringify(adsData, null, 2), "utf8");
console.log("✓ ai-production-videos-google-ads-landing-page.json: Removed max-height: 480px and applied object-fit: contain");

// -----------------------------------------------------------------------------
// 5. UPDATE inner-mirror-overrides.css AND wp-mirror-overrides.css
// Enforce Zero-Crop: object-fit: contain, background: #050505, lightbox max dimensions
// -----------------------------------------------------------------------------
const innerCssPath = "lib/wp-exact/inner-mirror-overrides.css";
let innerCss = fs.readFileSync(innerCssPath, "utf8");

// Change object-fit: cover on video.thumb-video, .gallery-item video, .case-study-item video to contain
innerCss = innerCss.replace(
  /\.dgs-wp-mirror-inner video\.thumb-video,\s*\.dgs-wp-mirror-inner \.gallery-item video,\s*\.dgs-wp-mirror-inner \.case-study-item video\s*\{[\s\S]*?\}/,
  `.dgs-wp-mirror-inner video.thumb-video,
.dgs-wp-mirror-inner .gallery-item video,
.dgs-wp-mirror-inner .case-study-item video,
.gallery-item video,
.case-study-item video {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
  object-position: center !important;
  background: #050505 !important;
}`
);

// Add zero-crop rules for gallery items, lightbox player, and prevent any cropping
const zeroCropCssAdditions = `
/* =====================================================
   DGS ZERO-CROP PORTFOLIO & RESPONSIVE ASPECT RATIO RULES
   Source frame is authority: object-fit: contain, no forced crop
===================================================== */
.gallery-item,
.case-study-item {
  background: #050505 !important;
  overflow: hidden !important;
}

.gallery-item:not(.wide-item),
.case-study-item:not(.wide-item) {
  aspect-ratio: 9/16 !important;
}

.gallery-item.wide-item,
.case-study-item.wide-item {
  aspect-ratio: 16/9 !important;
}

.gallery-item video,
.case-study-item video,
.thumb-video {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
  object-position: center !important;
  background: #050505 !important;
}

.portfolio-lightbox-content {
  width: min(92vw, 1440px) !important;
  max-width: 92vw !important;
  height: min(88vh, calc(100dvh - 80px)) !important;
  max-height: 88vh !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: auto !important;
  overflow: hidden !important;
}

#lightbox-player {
  max-width: 92vw !important;
  max-height: 88vh !important;
  width: auto !important;
  height: auto !important;
  object-fit: contain !important;
  object-position: center !important;
  background: #000 !important;
}

#lightbox-player.is-portrait {
  max-height: 88vh !important;
  height: auto !important;
  width: auto !important;
  aspect-ratio: 9 / 16 !important;
}

#lightbox-player.is-landscape {
  max-width: 92vw !important;
  width: auto !important;
  height: auto !important;
  aspect-ratio: 16 / 9 !important;
}
`;

if (!innerCss.includes("DGS ZERO-CROP PORTFOLIO")) {
  innerCss += zeroCropCssAdditions;
}
fs.writeFileSync(innerCssPath, innerCss, "utf8");
console.log("✓ inner-mirror-overrides.css: Enforced object-fit: contain and lightbox zero-crop rules");

// Also add to wp-mirror-overrides.css for homepage mirror
const homeCssPath = "lib/wp-exact/wp-mirror-overrides.css";
let homeCss = fs.readFileSync(homeCssPath, "utf8");
if (!homeCss.includes("DGS ZERO-CROP PORTFOLIO")) {
  homeCss += zeroCropCssAdditions;
}
fs.writeFileSync(homeCssPath, homeCss, "utf8");
console.log("✓ wp-mirror-overrides.css: Enforced object-fit: contain and lightbox zero-crop rules");

console.log("\n=== COMPLETED INITIAL SECTION & CSS ZERO-CROP UPDATES ===");
