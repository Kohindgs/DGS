import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8"));
const idx = data.body.indexOf('id="recent-work"');
console.log("recent-work snippet:");
console.log(data.body.slice(idx, idx + 4000));
