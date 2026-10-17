import fs from "node:fs";

const raw = fs.readFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8");
const data = JSON.parse(raw);
const body = data.body;

const rwStart = body.indexOf('<section class="section" id="recent-work">');
const rwEnd = body.indexOf('</section>', rwStart) + 10;
const rwHtml = body.substring(rwStart, rwEnd);

console.log("Recent work HTML length:", rwHtml.length);
fs.writeFileSync("./scripts/exact_case_studies.html", rwHtml);
