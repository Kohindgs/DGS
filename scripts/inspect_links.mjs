import fs from "node:fs";
import * as cheerio from "cheerio";

const file = "data/wordpress/mirrors/pages/services__website-development-amc.json";
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const $ = cheerio.load(data.body);

const links = $("a[href]").map((_, a) => ({
  text: $(a).text().trim(),
  href: $(a).attr("href")
})).get();

console.log(`Total links in webdev body: ${links.length}`);
console.log("External or unusual links:", links.filter(l => !l.href.startsWith("#") && !l.href.includes("dgeniussolutions.com")));
console.log("\nSample internal links:", links.filter(l => l.href.includes("dgeniussolutions.com") || l.href.startsWith("/")).slice(0, 15));
