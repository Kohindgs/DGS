import fs from "node:fs";

const html = fs.readFileSync("scripts/old_62c3ff7_body.html", "utf8");

const parts = html.split(/<section\b/i);

const target = process.argv[2] || "1";
const idx = parseInt(target, 10);
if (!isNaN(idx) && idx >= 1 && idx < parts.length) {
  const fullSec = "<section" + parts[idx].split("</section>")[0] + "</section>";
  console.log(`=== Section index ${idx} ===`);
  console.log(fullSec);
} else {
  const regex = new RegExp(`<section[^>]*id=["']${target}["'][^>]*>[\\s\\S]*?<\\/section>`, "i");
  const m = html.match(regex);
  if (m) {
    console.log(`=== Section id="${target}" ===`);
    console.log(m[0]);
  } else {
    console.log(`Section "${target}" not found`);
  }
}
