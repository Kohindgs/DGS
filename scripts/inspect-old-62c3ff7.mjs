import fs from "node:fs";

const html = fs.readFileSync("scripts/old_62c3ff7_body.html", "utf8");

// Find all sections
const regex = /<section\b([^>]*)>/gi;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null) {
  count++;
  const attrs = match[1];
  const idMatch = attrs.match(/id=["']([^"']*)["']/i);
  const classMatch = attrs.match(/class=["']([^"']*)["']/i);
  console.log(`${count}. ID: ${idMatch ? idMatch[1] : "(none)"} | Class: ${classMatch ? classMatch[1] : "(none)"}`);
}
console.log(`Total sections in 62c3ff7: ${count}`);
