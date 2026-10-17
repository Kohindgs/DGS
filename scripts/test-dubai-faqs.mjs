import fs from "node:fs";

const raw = JSON.parse(fs.readFileSync("data/wordpress/blocks/content-blocks.generated.json", "utf8"));
const dubai = raw.blocks["/services/ai-production-dubai-page/"];
const blocks = dubai.blocks;

function blockText(block) {
  if (block.type === "heading") return block.text.trim();
  if (block.type === "paragraph") return block.content.map((span) => span.text).join("").trim();
  return "";
}

function cleanFaqQuestion(text) {
  return text.replace(/\s*\+\s*$/, "").trim();
}

function isFaqHeading(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return /^(?:frequently asked questions|common questions)$/i.test(normalized) || /\bfaqs?$/i.test(normalized);
}

const start = blocks.findIndex((b) => b.type === "heading" && isFaqHeading(b.text));
console.log("FAQ Heading start index:", start);
if (start >= 0) {
  console.log("FAQ Heading text:", blocks[start].text);
}

// Let's find all headings in Dubai blocks
blocks.forEach((b, i) => {
  if (b.type === "heading") {
    console.log(`Heading [${i}]: ${b.text}`);
  }
});
