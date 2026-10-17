import fs from "node:fs";

const mirrorPath = "data/wordpress/mirrors/pages/services__website-development-amc.json";
const mirror = JSON.parse(fs.readFileSync(mirrorPath, "utf8"));

// 1. Update Katherine's Gallery image tag in mirror.body
// Replace katherinesgallery-scaled.webp with katherinesgallery-full.webp and correct dimensions
const oldImgKath = '<img loading="lazy" class="live-preview-image e-lazyloaded" src="/wp-content/uploads/2025/12/katherinesgallery-scaled.webp" alt="Live preview of Katherine\'s Gallery website" width="2560" height="1385" decoding="async" referrerpolicy="no-referrer" />';
const newImgKath = '<img loading="lazy" class="live-preview-image e-lazyloaded" src="/wp-content/uploads/case-studies/katherinesgallery-full.webp" alt="Live preview of Katherine\'s Gallery website" width="1440" height="4748" decoding="async" referrerpolicy="no-referrer" />';

if (mirror.body.includes(oldImgKath)) {
  mirror.body = mirror.body.replace(oldImgKath, newImgKath);
  console.log("✓ Replaced Katherine's Gallery image in mirror.body");
} else if (mirror.body.includes("/wp-content/uploads/2025/12/katherinesgallery-scaled.webp")) {
  mirror.body = mirror.body.replace(
    /\/wp-content\/uploads\/2025\/12\/katherinesgallery-scaled\.webp/g,
    "/wp-content/uploads/case-studies/katherinesgallery-full.webp"
  );
  mirror.body = mirror.body.replace('width="2560" height="1385"', 'width="1440" height="4748"');
  console.log("✓ Updated Katherine's Gallery image path & dimensions by pattern match");
} else {
  console.log("Katherine's Gallery image already updated or not found in expected format");
}

// 2. Enhance fitLivePreviews in mirror.body to dynamically set --preview-max-scroll based on actual rendered dimensions
const oldFitSnippet = `      var width=frame.clientWidth;
      if(!width) return;
      frame.style.setProperty('--live-preview-scale',(width/1440).toFixed(6));`;

const newFitSnippet = `      var width=frame.clientWidth;
      if(!width) return;
      frame.style.setProperty('--live-preview-scale',(width/1440).toFixed(6));
      var img=frame.querySelector('.live-preview-image');
      if(img && img.naturalHeight && img.naturalWidth){
        var renderedH=(img.naturalHeight/img.naturalWidth)*width;
        var frameH=frame.clientHeight;
        var maxScroll=Math.max(0,renderedH-frameH);
        frame.style.setProperty('--preview-max-scroll',(-maxScroll).toFixed(2)+'px');
      }`;

if (mirror.body.includes(oldFitSnippet)) {
  mirror.body = mirror.body.replace(oldFitSnippet, newFitSnippet);
  console.log("✓ Enhanced fitLivePreviews with exact rendered dimension calculations");
}

// 3. Update CSS rules in mirror.styles:
// Ensure hover transform uses var(--preview-max-scroll, min(0px, calc(-100% + 100cqh)))
// and update Katherine's Gallery duration to 7s
const oldHoverRule = `html body.dgs-webdev-active #dgs-webdev-page .work-project-row:hover .w-img .live-preview-image,
html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img:hover .live-preview-image,
html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img.is-scrolling .live-preview-image {
  transform: translateY(min(0px, calc(-100% + 100cqh))) !important;
  transition: transform 12s linear !important;
}`;

const newHoverRule = `html body.dgs-webdev-active #dgs-webdev-page .work-project-row:hover .w-img .live-preview-image,
html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img:hover .live-preview-image,
html body.dgs-webdev-active #dgs-webdev-page .work-project-row .w-img.is-scrolling .live-preview-image {
  transform: translateY(var(--preview-max-scroll, min(0px, calc(-100% + 100cqh)))) !important;
  transition: transform 12s linear !important;
}`;

if (mirror.styles.includes(oldHoverRule)) {
  mirror.styles = mirror.styles.replace(oldHoverRule, newHoverRule);
  console.log("✓ Updated hover transform rule to use exact rendered dimension scroll variable with container query fallback");
}

// Update Katherine duration
const oldKathDuration = `html body.dgs-webdev-active #dgs-webdev-page .work-project-row:nth-child(3):hover .w-img .live-preview-image,
html body.dgs-webdev-active #dgs-webdev-page .work-project-row:nth-child(3) .w-img.is-scrolling .live-preview-image {
  transition-duration: 6s !important;  /* Katherine's Gallery */
}`;

const newKathDuration = `html body.dgs-webdev-active #dgs-webdev-page .work-project-row:nth-child(3):hover .w-img .live-preview-image,
html body.dgs-webdev-active #dgs-webdev-page .work-project-row:nth-child(3) .w-img.is-scrolling .live-preview-image {
  transition-duration: 7s !important;  /* Katherine's Gallery ~4748px */
}`;

if (mirror.styles.includes(oldKathDuration)) {
  mirror.styles = mirror.styles.replace(oldKathDuration, newKathDuration);
  console.log("✓ Updated Katherine's Gallery transition duration to 7s");
}

mirror.bodyBytes = Buffer.byteLength(mirror.body, "utf8");
mirror.styleBytes = Buffer.byteLength(mirror.styles, "utf8");

fs.writeFileSync(mirrorPath, JSON.stringify(mirror, null, 2), "utf8");
console.log("✓ Saved updated mirror JSON with byte counts:", mirror.bodyBytes, mirror.styleBytes);
