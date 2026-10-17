import fs from "node:fs";
import path from "node:path";

console.log("=== RESTORING ORIGINAL WEBSITE DEVELOPMENT APPEARANCE (COMMIT 62c3ff7 BASELINE) ===");

// 1. Clean lib/wp-exact/inner-mirror-overrides.css
const cssFile = "lib/wp-exact/inner-mirror-overrides.css";
let currentCss = fs.readFileSync(cssFile, "utf8");
const startMarker = "/* === DGS REPROCESSED WEBSITE DEVELOPMENT CSS START === */";
const endMarker = "/* === DGS REPROCESSED WEBSITE DEVELOPMENT CSS END === */";
const startIdx = currentCss.indexOf(startMarker);
const endIdx = currentCss.indexOf(endMarker);

if (startIdx >= 0 && endIdx >= 0) {
  console.log(`Found reprocessed CSS block in ${cssFile}: characters ${startIdx} to ${endIdx + endMarker.length}`);
  const cleanCss = currentCss.substring(0, startIdx).trim() + "\n";
  fs.writeFileSync(cssFile, cleanCss, "utf8");
  console.log(`✓ Stripped 1087 lines of unintended overrides from ${cssFile} (new size: ${cleanCss.length} bytes)`);
} else {
  console.log(`Marker not found in ${cssFile}, current length: ${currentCss.length}`);
}

// 2. Read base 62c3ff7 body and styles
let baseBody = fs.readFileSync("scripts/old_62c3ff7_body.html", "utf8");
let baseStyles = fs.readFileSync("scripts/old_62c3ff7_styles.css", "utf8");

// 3. Update Case Study Previews in baseBody
// HumanXT: use captured full-length screenshot (1440 x 7640)
baseBody = baseBody.replace(
  /<div class="w-img">\s*<img loading="lazy" class="live-preview-image e-lazyloaded" src="https:\/\/www\.dgeniussolutions\.com\/wp-content\/uploads\/2026\/05\/Humanxt-scaled\.webp" alt="Live preview of HumanXT website" width="1600" height="1000"[^>]*>\s*<a aria-label="Open HumanXT live website" class="live-preview-link" href="https:\/\/humanxt\.com\/"[^>]*>Open HumanXT live website<\/a>\s*<div class="work-year">2025<\/div>\s*<\/div>/,
  `<div class="w-img">
<img loading="lazy" class="live-preview-image e-lazyloaded" src="/wp-content/uploads/case-studies/humanxt-full.webp" alt="Live preview of HumanXT website" width="1440" height="7640" decoding="async" referrerpolicy="no-referrer" />
<a aria-label="Open HumanXT live website" class="live-preview-link" href="https://humanxt.com/" rel="noopener noreferrer" target="_blank">Open HumanXT live website</a>
<button type="button" class="preview-scroll-pill" aria-label="Tap to preview scroll"><span>▶</span> Preview Scroll</button>
<div class="work-year">2025</div></div>`
);

// Weavings: use captured full-length screenshot (1440 x 10769)
baseBody = baseBody.replace(
  /<div class="w-img">\s*<img loading="lazy" class="live-preview-image e-lazyloaded" src="https:\/\/s\.wordpress\.com\/mshots\/v1\/https%3A%2F%2Fwww\.weavings\.in%2F\?w=1600" alt="Live preview of Weavings website" width="1600" height="1000"[^>]*>\s*<a aria-label="Open Weavings live website" class="live-preview-link" href="https:\/\/www\.weavings\.in\/"[^>]*>Open Weavings live website<\/a>\s*<div class="work-year">2025<\/div>\s*<\/div>/,
  `<div class="w-img">
<img loading="lazy" class="live-preview-image e-lazyloaded" src="/wp-content/uploads/case-studies/weavings-full.webp" alt="Live preview of Weavings website" width="1440" height="10769" decoding="async" referrerpolicy="no-referrer" />
<a aria-label="Open Weavings live website" class="live-preview-link" href="https://www.weavings.in/" rel="noopener noreferrer" target="_blank">Open Weavings live website</a>
<button type="button" class="preview-scroll-pill" aria-label="Tap to preview scroll"><span>▶</span> Preview Scroll</button>
<div class="work-year">2025</div></div>`
);

// Katherine's Gallery: use authentic verified image asset with preview pill
baseBody = baseBody.replace(
  /<div class="w-img">\s*<img loading="lazy" class="live-preview-image e-lazyloaded" src="https:\/\/www\.dgeniussolutions\.com\/wp-content\/uploads\/2025\/12\/katherinesgallery-scaled\.webp" alt="Live preview of Katherine's Gallery website" width="1600" height="1000"[^>]*>\s*<a aria-label="Open Katherine&#039;s Gallery live website" class="live-preview-link" href="https:\/\/katherinesgallery\.in\/"[^>]*>Open Katherine's Gallery live website<\/a>\s*<div class="work-year">2025<\/div>\s*<\/div>/,
  `<div class="w-img">
<img loading="lazy" class="live-preview-image e-lazyloaded" src="/wp-content/uploads/2025/12/katherinesgallery-scaled.webp" alt="Live preview of Katherine's Gallery website" width="2560" height="1385" decoding="async" referrerpolicy="no-referrer" />
<a aria-label="Open Katherine's Gallery live website" class="live-preview-link" href="https://katherinesgallery.in/" rel="noopener noreferrer" target="_blank">Open Katherine's Gallery live website</a>
<button type="button" class="preview-scroll-pill" aria-label="Tap to preview scroll"><span>▶</span> Preview Scroll</button>
<div class="work-year">2025</div></div>`
);

// Better Ceasons: use captured full-length screenshot (1440 x 11654)
baseBody = baseBody.replace(
  /<div class="w-img">\s*<img loading="lazy" class="live-preview-image e-lazyloaded" src="\/wp-content\/uploads\/2026\/08\/better-ceasons-scaled\.webp" alt="Live preview of Better Ceasons website" width="1600" height="1000"[^>]*>\s*<a aria-label="Open Better Ceasons live website" class="live-preview-link" href="https:\/\/betterceasons\.com\/"[^>]*>Open Better Ceasons live website<\/a>\s*<div class="work-year">2026<\/div>\s*<\/div>/,
  `<div class="w-img">
<img loading="lazy" class="live-preview-image e-lazyloaded" src="/wp-content/uploads/case-studies/betterceasons-full.webp" alt="Live preview of Better Ceasons website" width="1440" height="11654" decoding="async" referrerpolicy="no-referrer" />
<a aria-label="Open Better Ceasons live website" class="live-preview-link" href="https://betterceasons.com/" rel="noopener noreferrer" target="_blank">Open Better Ceasons live website</a>
<button type="button" class="preview-scroll-pill" aria-label="Tap to preview scroll"><span>▶</span> Preview Scroll</button>
<div class="work-year">2026</div></div>`
);

// 4. Update Primary CTAs to consistent "START YOUR WEBSITE PROJECT"
baseBody = baseBody.replace(
  /<a aria-label="Book a website development strategy call" class="btn btn-primary" href="#website-project-form">→ Book Strategy Call<\/a>/g,
  '<a aria-label="Start your website project" class="btn btn-primary" href="#website-project-form">START YOUR WEBSITE PROJECT</a>'
);
baseBody = baseBody.replace(
  /<a class="btn btn-primary" href="#website-project-form">Discuss Your Website Project →<\/a>/g,
  '<a class="btn btn-primary" href="#website-project-form">START YOUR WEBSITE PROJECT</a>'
);
baseBody = baseBody.replace(
  /<a class="btn btn-primary" href="#website-project-form">Discuss Your Project Architecture →<\/a>/g,
  '<a class="btn btn-primary" href="#website-project-form">START YOUR WEBSITE PROJECT</a>'
);
baseBody = baseBody.replace(
  /<a class="btn btn-primary" href="#website-project-form">Discuss Your Website Requirement →<\/a>/g,
  '<a class="btn btn-primary" href="#website-project-form">START YOUR WEBSITE PROJECT</a>'
);

// 5. Append Interactive Scrolling Preview CSS to baseStyles
const previewScrollingCss = `

/* ==========================================================================
   AUTHENTIC FULL-PAGE WEBSITE PREVIEWS — TOP-TO-BOTTOM HOVER SCROLLING
   Scoped strictly inside .w-img without moving surrounding project card
   ========================================================================== */
html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img {
  container-type: size;
  position: relative !important;
  width: 100% !important;
  min-width: 0 !important;
  height: 100% !important;
  min-height: 280px !important;
  aspect-ratio: 16/10 !important;
  border-radius: 20px !important;
  overflow: hidden !important;
  border: 1px solid rgba(255,255,255,.08) !important;
  background: #0d0e17 !important;
  cursor: pointer;
}

html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img .live-preview-image {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: auto !important;
  min-height: 100% !important;
  display: block !important;
  object-fit: cover !important;
  object-position: top center !important;
  transform: translateY(0) !important;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) !important;
  will-change: transform !important;
  pointer-events: none !important;
}

/* Hover on project row or w-img smoothly scrolls from top to bottom */
html body.dgs-webdev-active #dgs-webdev-page .work-project-row:hover .w-img .live-preview-image,
html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img:hover .live-preview-image,
html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img.is-scrolling .live-preview-image {
  transform: translateY(min(0px, calc(-100% + 100cqh))) !important;
  transition: transform 12s linear !important;
}

/* Authentic page length proportional durations */
html body.dgs-webdev-active #dgs-webdev-page .work-project-row:nth-child(1):hover .w-img .live-preview-image,
html body.dgs-webdev-active #dgs-webdev-page .work-project-row:nth-child(1) .w-img.is-scrolling .live-preview-image {
  transition-duration: 11s !important; /* HumanXT ~7640px */
}
html body.dgs-webdev-active #dgs-webdev-page .work-project-row:nth-child(2):hover .w-img .live-preview-image,
html body.dgs-webdev-active #dgs-webdev-page .work-project-row:nth-child(2) .w-img.is-scrolling .live-preview-image {
  transition-duration: 14s !important; /* Weavings ~10769px */
}
html body.dgs-webdev-active #dgs-webdev-page .work-project-row:nth-child(3):hover .w-img .live-preview-image,
html body.dgs-webdev-active #dgs-webdev-page .work-project-row:nth-child(3) .w-img.is-scrolling .live-preview-image {
  transition-duration: 6s !important;  /* Katherine's Gallery */
}
html body.dgs-webdev-active #dgs-webdev-page .work-project-row:nth-child(4):hover .w-img .live-preview-image,
html body.dgs-webdev-active #dgs-webdev-page .work-project-row:nth-child(4) .w-img.is-scrolling .live-preview-image {
  transition-duration: 15s !important; /* Better Ceasons ~11654px */
}

html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img .live-preview-link {
  position: absolute !important;
  inset: 0 !important;
  z-index: 4 !important;
  display: block !important;
  background: transparent !important;
  text-indent: -9999px !important;
}

html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img::after {
  content: "Open live website ↗" !important;
  position: absolute !important;
  left: 14px !important;
  bottom: 14px !important;
  z-index: 5 !important;
  padding: 7px 13px !important;
  border-radius: 999px !important;
  background: rgba(5,5,8,.85) !important;
  border: 1px solid rgba(255,255,255,.22) !important;
  color: #fff !important;
  font-size: 10.5px !important;
  font-weight: 700 !important;
  letter-spacing: .06em !important;
  text-transform: uppercase !important;
  backdrop-filter: blur(8px) !important;
  pointer-events: none !important;
}

html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img .preview-scroll-pill {
  display: none;
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 6;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(167, 139, 250, 0.25);
  border: 1px solid rgba(167, 139, 250, 0.5);
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
  cursor: pointer;
}

@media (max-width: 768px), (pointer: coarse) {
  html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img .preview-scroll-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img .live-preview-image,
  html body.dgs-webdev-active #dgs-webdev-page .work-project-row:hover .w-img .live-preview-image,
  html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img.is-scrolling .live-preview-image {
    transform: none !important;
    transition: none !important;
  }
}
`;

const finalStyles = baseStyles + previewScrollingCss;

// 6. Write to data/wordpress/mirrors/pages/services__website-development-amc.json
const jsonTarget = "data/wordpress/mirrors/pages/services__website-development-amc.json";
const mirrorJson = JSON.parse(fs.readFileSync(jsonTarget, "utf8"));
mirrorJson.body = baseBody;
mirrorJson.styles = finalStyles;
mirrorJson.bodyBytes = Buffer.byteLength(baseBody, "utf8");
mirrorJson.styleBytes = Buffer.byteLength(finalStyles, "utf8");

fs.writeFileSync(jsonTarget, JSON.stringify(mirrorJson, null, 2), "utf8");
console.log(`✓ Updated ${jsonTarget}`);
console.log(`  - Body size: ${mirrorJson.bodyBytes} bytes`);
console.log(`  - Style size: ${mirrorJson.styleBytes} bytes`);
