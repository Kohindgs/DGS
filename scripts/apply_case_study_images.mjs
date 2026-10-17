import fs from "node:fs";

const kathIframe = `<iframe aria-label="Live preview of Katherine's Gallery website" data-src="https://katherinesgallery.in/" title="Katherine's Gallery live website preview" src="about:blank" class="lazyload" data-load-mode="0"></iframe>`;
const bcIframe = `<iframe aria-label="Live preview of Better Ceasons website" data-src="https://betterceasons.com/" title="Better Ceasons live website preview" src="about:blank" class="lazyload" data-load-mode="0"></iframe>`;

const kathImg = `<img loading="lazy" class="live-preview-image e-lazyloaded" src="https://www.dgeniussolutions.com/wp-content/uploads/2025/12/katherinesgallery-scaled.webp" alt="Live preview of Katherine's Gallery website" width="1600" height="1000" decoding="async" referrerpolicy="no-referrer">`;
const bcImg = `<img loading="lazy" class="live-preview-image e-lazyloaded" src="/wp-content/uploads/2026/08/better-ceasons-scaled.webp" alt="Live preview of Better Ceasons website" width="1600" height="1000" decoding="async" referrerpolicy="no-referrer">`;

const files = [
  "data/wordpress/mirrors/pages/services__website-development-amc.json",
  "data/wordpress/mirrors/pages/services__website-development-pune-page.json"
];

for (const file of files) {
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, "utf8");
    const json = JSON.parse(raw);
    let updatedBody = json.body;

    if (updatedBody.includes(kathIframe)) {
      updatedBody = updatedBody.replace(kathIframe, kathImg);
      console.log(`Replaced Katherine iframe in ${file}`);
    } else {
      console.warn(`Katherine iframe NOT found in ${file}`);
    }

    if (updatedBody.includes(bcIframe)) {
      updatedBody = updatedBody.replace(bcIframe, bcImg);
      console.log(`Replaced Better Ceasons iframe in ${file}`);
    } else {
      console.warn(`Better Ceasons iframe NOT found in ${file}`);
    }

    json.body = updatedBody;
    json.bodyBytes = Buffer.byteLength(updatedBody, "utf8");
    fs.writeFileSync(file, JSON.stringify(json, null, 2), "utf8");
    console.log(`Saved updated ${file}`);
  }
}
