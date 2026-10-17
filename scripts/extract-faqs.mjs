import fs from "node:fs";

const raw = fs.readFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8");
const data = JSON.parse(raw);
const body = data.body;

const faqItems = [...body.matchAll(/<div class="faq-item">([\s\S]*?)<\/div>\s*<\/div>/gi)].map(m => {
  const q = m[0].match(/<button[^>]*class="faq-q"[^>]*>([\s\S]*?)<\/button>/i)?.[1]?.replace(/<[^>]+>/g, "").replace(/\+$/, "").trim();
  const a = m[0].match(/<div class="faq-a">([\s\S]*?)<\/div>/i)?.[1]?.trim();
  return { q, a, raw: m[0] };
});

console.log(`Found ${faqItems.length} FAQs:`);
faqItems.forEach((f, i) => console.log(`${i+1}. ${f.q}`));

fs.writeFileSync("./scripts/extracted_faqs.json", JSON.stringify(faqItems, null, 2));
