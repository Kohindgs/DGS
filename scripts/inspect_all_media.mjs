import fs from "node:fs";
import * as cheerio from "cheerio";

const data = JSON.parse(
  fs.readFileSync("data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8")
);
const $ = cheerio.load(data.body);

console.log("Total iframes:", $("iframe").length);
$("iframe").each((i, el) => {
  console.log(`iframe ${i+1}: src="${$(el).attr("src")}" data-src="${$(el).attr("data-src")}" class="${$(el).attr("class")}"`);
});

console.log("\nTotal images:", $("img").length);
$("img").each((i, el) => {
  console.log(`img ${i+1}: src="${$(el).attr("src")}" alt="${$(el).attr("alt")}"`);
});
