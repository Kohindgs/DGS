import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8"));
const sections = data.body.match(/<section[\s\S]*?<\/section>/g) || [];
console.log(`Total sections: ${sections.length}`);
sections.forEach((s, i) => {
  const mId = s.match(/id=["']([^"']+)["']/);
  const mH = s.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/);
  console.log(`${i + 1}. ID: ${mId ? mId[1] : 'none'} | Heading: ${mH ? mH[1].replace(/<[^>]+>/g, '').trim() : 'no heading'}`);
});
