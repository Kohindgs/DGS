import fs from "node:fs";

const html = fs.readFileSync("scripts/old_62c3ff7_body.html", "utf8");

// Split by <section
const parts = html.split(/<section\b/i);
console.log(`Total section parts: ${parts.length - 1}`);

parts.slice(1).forEach((part, idx) => {
  const fullSec = "<section" + part.split("</section>")[0] + "</section>";
  const idMatch = fullSec.match(/id=["']([^"']*)["']/i);
  const classMatch = fullSec.match(/class=["']([^"']*)["']/i);
  const h1Match = fullSec.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h2Match = fullSec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const heading = (h1Match ? "H1: " + h1Match[1].replace(/<[^>]+>/g, "").trim() : "") ||
                  (h2Match ? "H2: " + h2Match[1].replace(/<[^>]+>/g, "").trim() : "");
  
  console.log(`\n--- Section ${idx + 1} ---`);
  console.log(`ID: ${idMatch ? idMatch[1] : "(none)"}`);
  console.log(`Class: ${classMatch ? classMatch[1] : "(none)"}`);
  console.log(`Heading: ${heading}`);
  console.log(`Length: ${fullSec.length} chars`);
  
  // Show first 200 chars of inner content
  const preview = fullSec.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 150);
  console.log(`Content Preview: ${preview}...`);
});
