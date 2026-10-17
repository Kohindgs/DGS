import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8"));
const firstSecIdx = data.body.indexOf("<section");
console.log("Before first section (last 300 chars):");
console.log(data.body.substring(Math.max(0, firstSecIdx - 300), firstSecIdx));

const lastSecEndIdx = data.body.lastIndexOf("</section>") + 10;
console.log("\nAfter last section (first 300 chars):");
console.log(data.body.substring(lastSecEndIdx, lastSecEndIdx + 300));
