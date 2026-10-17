import fs from "node:fs";
import * as cheerio from "cheerio";

const data = JSON.parse(
  fs.readFileSync("data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8")
);
const $ = cheerio.load(data.body);

console.log("=== CASE STUDY CARDS ===");
const section = $("#recent-work");
console.log("Found #recent-work:", section.length);
section.find(".project-card, .case-card, .portfolio-card, div").each((i, el) => {
  const text = $(el).text();
  if (text.includes("HumanXT") || text.includes("Weavings") || text.includes("Katherine") || text.includes("Better Ceasons")) {
    if ($(el).find("h3").length > 0) {
      console.log("\nCard found:");
      console.log("h3:", $(el).find("h3").text().trim());
      console.log("Images:", $(el).find("img").map((_, im) => ({
        src: $(im).attr("src"),
        alt: $(im).attr("alt"),
        class: $(im).attr("class")
      })).get());
      console.log("Outer HTML snippet:", $.html(el).slice(0, 500));
    }
  }
});
