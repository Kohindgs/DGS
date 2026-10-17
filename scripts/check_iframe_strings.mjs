import fs from "node:fs";

const kathIframe = `<iframe aria-label="Live preview of Katherine's Gallery website" data-src="https://katherinesgallery.in/" title="Katherine's Gallery live website preview" src="about:blank" class="lazyload" data-load-mode="0"></iframe>`;
const bcIframe = `<iframe aria-label="Live preview of Better Ceasons website" data-src="https://betterceasons.com/" title="Better Ceasons live website preview" src="about:blank" class="lazyload" data-load-mode="0"></iframe>`;

const files = [
  "data/wordpress/mirrors/pages/services__website-development-amc.json",
  "data/wordpress/mirrors/pages/services__website-development-pune-page.json",
  "data/wordpress/mirrors/pages/case_studies.json"
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const d = JSON.parse(fs.readFileSync(f, "utf8"));
    console.log(f, "kath:", d.body?.includes(kathIframe), "bc:", d.body?.includes(bcIframe));
  }
}
