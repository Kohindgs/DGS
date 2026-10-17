import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8"));
console.log("Keys in json:", Object.keys(data));
console.log("scripts property:", data.scripts ? (typeof data.scripts === 'string' ? data.scripts.substring(0, 300) : Array.isArray(data.scripts) ? data.scripts.length : typeof data.scripts) : 'none');

const allScriptsInBody = data.body.match(/<script[\s\S]*?<\/script>/gi) || [];
console.log(`Total script tags in entire body: ${allScriptsInBody.length}`);
allScriptsInBody.forEach((s, idx) => {
  console.log(`Script ${idx + 1}: ${s.substring(0, 150)}...`);
});
