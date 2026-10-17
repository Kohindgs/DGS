import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8"));
const html = data.body;

const sectionMatches = [...html.matchAll(/<section([\s\S]*?)<\/section>/gi)];

sectionMatches.forEach((m, idx) => {
  const openTag = m[0].match(/<section[^>]*>/i)?.[0] || "";
  const h = m[0].match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi) || [];
  const p = m[0].match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  console.log(`\n========================================`);
  console.log(`SECTION ${idx + 1}: ${openTag}`);
  console.log(`HEADINGS:`, h.map(x => x.replace(/<[^>]+>/g, "").trim()));
  console.log(`PARAGRAPHS COUNT:`, p.length);
  p.slice(0, 3).forEach((par, pidx) => {
    console.log(`  P${pidx + 1}: ${par.replace(/<[^>]+>/g, "").trim().substring(0, 150)}...`);
  });
});
