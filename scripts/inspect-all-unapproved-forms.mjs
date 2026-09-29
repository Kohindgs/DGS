import fs from "fs";

const pages = [
  { file: "australia-page.json", id: 27 },
  { file: "services__website-development-pune-page.json", id: 28 },
  { file: "seo-services-mumbai-google-ads-landing-page.json", id: 22 },
  { file: "aeo-services-mumbai-google-ads-landing-page.json", id: 23 },
  { file: "ai-production-videos-google-ads-landing-page.json", id: 24 }
];

for (const p of pages) {
  const data = JSON.parse(fs.readFileSync("data/wordpress/mirrors/pages/" + p.file, "utf8"));
  const formHtml = data.body.match(new RegExp(`<form[^>]*fluentform_${p.id}[^>]*>([\\s\\S]*?)<\\/form>`))?.[1] || "";
  const inputs = [...formHtml.matchAll(/name="([^"]+)"/g)].map(m => m[1]);
  console.log(`\n=== Form ${p.id} on ${data.path} ===`);
  console.log("Inputs:", [...new Set(inputs)]);
}
