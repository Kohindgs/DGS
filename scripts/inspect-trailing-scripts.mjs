import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8"));
const lastSecEndIdx = data.body.lastIndexOf("</section>") + 10;
const trailingHtml = data.body.substring(lastSecEndIdx);

const scriptTags = trailingHtml.match(/<script[\s\S]*?<\/script>/gi) || [];
console.log(`Found ${scriptTags.length} script tags in trailing HTML:`);
scriptTags.forEach((s, idx) => {
  console.log(`--- Script ${idx + 1} (${s.length} chars) ---`);
  console.log(s.substring(0, 300) + "...\n");
});
