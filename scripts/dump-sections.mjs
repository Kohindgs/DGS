import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8"));
const html = data.body;

// Let's identify the top-level sections in the body
// Typically in Elementor or WordPress mirrors, sections are marked with <section class="..." or <div class="elementor-section... or similar.
const sectionRegex = /<section[\s\S]*?<\/section>/gi;
const matches = [...html.matchAll(/<section([\s\S]*?)<\/section>/gi)];

console.log(`Found ${matches.length} <section> elements.`);
matches.forEach((m, idx) => {
  const openTag = m[0].match(/<section[^>]*>/i)?.[0] || "";
  const h = m[0].match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
  console.log(`\nSection ${idx + 1}: ${openTag}`);
  console.log(`  Heading: ${h ? h[1].replace(/<[^>]+>/g, "").trim() : "None"}`);
  console.log(`  Length: ${m[0].length} chars`);
});
