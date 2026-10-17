import fs from "node:fs";

const page = JSON.parse(fs.readFileSync("data/wordpress/mirrors/pages/services__ai-video-production-agency.json", "utf8"));
const sectionMatches = [...page.body.matchAll(/<section([^>]*)>([\s\S]*?)<\/section>/gi)];

const targetIds = ["featured-ai-work"];

const faqMatches = [...page.body.matchAll(/class="faq-q"[^>]*><span[^>]*>(.*?)<\/span>/gi)];
console.log(`Current FAQs on AI Video page (${faqMatches.length} questions):`);
faqMatches.forEach((m, i) => console.log(`${i + 1}: ${m[1]}`));
