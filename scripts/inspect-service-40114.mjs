import fs from "node:fs";

async function main() {
  const services = JSON.parse(fs.readFileSync("data/wordpress/raw/services.json", "utf8"));
  const match = services.find((s) => s.slug === "ai-video-production-agency");
  const text = match.content?.rendered || "";

  // Extract all <script type="application/ld+json">
  const ldRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  let count = 0;
  while ((m = ldRegex.exec(text)) !== null) {
    count++;
    console.log(`\n=== Service 40114 LD+JSON ${count} ===`);
    try {
      const parsed = JSON.parse(m[1].trim());
      if (parsed["@graph"]) {
        console.log("@graph count:", parsed["@graph"].length);
        parsed["@graph"].forEach((e) => console.log(`  @type: ${e["@type"]} | name: ${e.name || e["@id"]}`));
      } else {
        console.log(`Single entity: ${parsed["@type"]} | name: ${parsed.name || parsed["@id"]}`);
      }
    } catch (err) {
      console.log("Parse error:", err.message);
      console.log(m[1].substring(0, 300));
    }
  }

  // Check itemscope/itemtype
  const isRegex = /itemtype=["']([^"']+)["']/gi;
  const itemtypes = [];
  while ((m = isRegex.exec(text)) !== null) {
    itemtypes.push(m[1]);
  }
  console.log("\n=== Service 40114 Microdata itemtypes ===", [...new Set(itemtypes)]);

  // Check Dujon context
  const dIdx = text.indexOf("Dujon");
  if (dIdx !== -1) {
    console.log("\n=== Dujon context ===");
    console.log(text.substring(Math.max(0, dIdx - 400), Math.min(text.length, dIdx + 400)));
  }

  // Check Chaitali context
  const cIdx = text.indexOf("Chaitali");
  if (cIdx !== -1) {
    console.log("\n=== Chaitali context ===");
    console.log(text.substring(Math.max(0, cIdx - 400), Math.min(text.length, cIdx + 400)));
  }

  // Check Aparna context
  const aIdx = text.indexOf("Aparna");
  if (aIdx !== -1) {
    console.log("\n=== Aparna context ===");
    console.log(text.substring(Math.max(0, aIdx - 400), Math.min(text.length, aIdx + 400)));
  }
}

main().catch(console.error);
