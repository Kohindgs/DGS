import fs from "node:fs";
import * as cheerio from "cheerio";

const data = JSON.parse(
  fs.readFileSync("data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8")
);
const $ = cheerio.load(data.body);

$(".work-project-row").each((i, row) => {
  const name = $(row).find(".work-client-name").text().trim();
  const wImg = $(row).find(".w-img").html();
  console.log(`\nRow ${i+1}: ${name}`);
  console.log("w-img HTML:", wImg);
});
