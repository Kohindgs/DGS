import fs from "node:fs";
import * as cheerio from "cheerio";

const d = JSON.parse(fs.readFileSync("data/wordpress/mirrors/pages/case_studies.json", "utf8"));
const $ = cheerio.load(d.body);
console.log("case_studies.json iframes:", $("iframe").map((_, el) => $(el).attr("src") || $(el).attr("data-src")).get());
