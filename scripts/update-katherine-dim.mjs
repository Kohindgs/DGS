import fs from "node:fs";

const p = "data/wordpress/mirrors/pages/services__website-development-amc.json";
const m = JSON.parse(fs.readFileSync(p, "utf8"));
m.body = m.body.replace(
  /katherinesgallery-full\.webp" alt="Live preview of Katherine's Gallery website" width="\d+" height="\d+"/,
  'katherinesgallery-full.webp" alt="Live preview of Katherine\'s Gallery website" width="1440" height="5163"'
);
m.bodyBytes = Buffer.byteLength(m.body, "utf8");
fs.writeFileSync(p, JSON.stringify(m, null, 2), "utf8");
console.log("Updated mirror JSON with 1440x5163");
