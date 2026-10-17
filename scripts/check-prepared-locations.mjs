import fs from "node:fs";

const m = JSON.parse(fs.readFileSync("./data/wordpress/mirrors/pages/services__seo-service-in-gurugram.json", "utf8"));
const starts = [
  "D'Genius Solutions serves businesses across",
  "We focus on terms that connect to real services",
  "Our local SEO services in",
  "We improve service pages, FAQs, comparison content",
  "We map solutions, industries, use cases",
  "We create clear answer structures",
  "Slow pages, poor structure, crawl errors",
  "The best SEO company for your business should explain",
  "Your website should help people understand your services",
  "Professional SEO services in",
  "Yes. DGS creates practical local SEO plans",
  "DGS focuses on clear strategy",
  "We improve signals that help customers find you",
  "The aim is not just traffic"
];

for (const s of starts) {
  const esc = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const strictRe = new RegExp(`(<p\\b[^>]*>)${esc}[\\s\\S]*?(<\\/p>)`, "i");
  const flexEsc = esc.replace(/'/g, "['’&#8217;]+");
  const flexRe = new RegExp(`(<p\\b[^>]*>)\\s*(?:<(?:strong|span|em|b)\\b[^>]*>\\s*)*${flexEsc}[\\s\\S]*?(<\\/p>)`, "i");
  console.log(s.slice(0, 42).padEnd(44), "Strict:", strictRe.test(m.body), "| Flex:", flexRe.test(m.body));
}
