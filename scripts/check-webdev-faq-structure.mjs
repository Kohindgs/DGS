import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('data/wordpress/mirrors/pages/services__website-development-amc.json', 'utf8'));
const html = data.body;
const itemIdx = html.indexOf('faq-item');
if (itemIdx !== -1) {
  console.log("Found faq-item snippet:");
  console.log(html.slice(itemIdx - 50, itemIdx + 600));
} else {
  console.log("No faq-item found in body!");
}

const styles = data.styles || "";
const styleIdx = styles.indexOf('.faq-');
if (styleIdx !== -1) {
  console.log("\nStyles snippet:");
  console.log(styles.slice(styleIdx, styleIdx + 600));
}

const overrides = fs.readFileSync('lib/wp-exact/inner-mirror-overrides.css', 'utf8');
const oIdx = overrides.indexOf('.faq');
if (oIdx !== -1) {
  console.log("\nOverrides snippet:");
  console.log(overrides.slice(oIdx, oIdx + 600));
}
