import fs from "node:fs";

const raw = fs.readFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8");
const data = JSON.parse(raw);
const body = data.body;

const sectionMatches = [...body.matchAll(/<section([\s\S]*?)<\/section>/gi)];

const extracted = sectionMatches.map((m, idx) => {
  const full = m[0];
  const idMatch = full.match(/id="([^"]+)"/i);
  const classMatch = full.match(/class="([^"]+)"/i);
  const h = [...full.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)].map(x => ({
    tag: x[1],
    text: x[2].replace(/<[^>]+>/g, "").trim()
  }));
  return {
    index: idx + 1,
    id: idMatch ? idMatch[1] : null,
    className: classMatch ? classMatch[1] : null,
    headings: h,
    charLength: full.length,
    html: full
  };
});

fs.writeFileSync("./scripts/webdev_sections_extracted.json", JSON.stringify(extracted, null, 2));
console.log(`Extracted ${extracted.length} sections to scripts/webdev_sections_extracted.json`);
