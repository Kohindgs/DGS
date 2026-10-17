import fs from "node:fs";

async function main() {
  const url = process.argv[2] || "https://www.dgeniussolutions.com/services/ai-video-production-agency/";
  console.log("Auditing:", url);
  const res = await fetch(url);
  const html = await res.text();
  console.log("Status:", res.status, "HTML length:", html.length);

  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let scriptIndex = 0;
  const allEntities = [];

  while ((match = scriptRegex.exec(html)) !== null) {
    scriptIndex++;
    const raw = match[1].trim();
    try {
      const parsed = JSON.parse(raw);
      console.log(`\n=================== SCRIPT ${scriptIndex} ===================`);
      let entities = [];
      if (Array.isArray(parsed)) {
        entities = parsed;
      } else if (parsed["@graph"]) {
        entities = parsed["@graph"];
      } else {
        entities = [parsed];
      }
      for (const ent of entities) {
        allEntities.push({ scriptIndex, entity: ent });
        console.log(`Type: ${ent["@type"]} | @id: ${ent["@id"] || "none"} | Name: ${ent.name || ent.headline || "(no name)"}`);
        if (ent["@type"] === "Review" || (Array.isArray(ent["@type"]) && ent["@type"].includes("Review"))) {
          console.log("  -> Review entity detail:", JSON.stringify(ent, null, 2));
        }
        if (ent["@type"] === "VideoObject" || (Array.isArray(ent["@type"]) && ent["@type"].includes("VideoObject"))) {
          console.log(`  -> VideoObject: "${ent.name}" | uploadDate: ${ent.uploadDate} | contentUrl: ${ent.contentUrl} | thumbnailUrl: ${ent.thumbnailUrl}`);
        }
        if (ent["@type"] === "ProfessionalService" || ent["@type"] === "LocalBusiness") {
          console.log("  -> Business entity detail:", JSON.stringify(ent, null, 2));
        }
      }
    } catch (err) {
      console.error(`Script ${scriptIndex} JSON parse error:`, err.message);
    }
  }

  // Microdata check
  const itemtypeRegex = /itemtype=["']([^"']+)["']/gi;
  const itemtypes = [];
  let itMatch;
  while ((itMatch = itemtypeRegex.exec(html)) !== null) {
    itemtypes.push(itMatch[1]);
  }
  console.log("\n=================== MICRODATA ITEMTYPES ===================");
  console.log("Count:", itemtypes.length, "Unique:", [...new Set(itemtypes)]);

  const itempropRegex = /itemprop=["']([^"']+)["']/gi;
  const itemprops = [];
  let ipMatch;
  while ((ipMatch = itempropRegex.exec(html)) !== null) {
    itemprops.push(ipMatch[1]);
  }
  console.log("Itemprops count:", itemprops.length, "Unique:", [...new Set(itemprops)]);

  // Check specific keywords in HTML
  for (const kw of ["Dujon", "Chaitali", "Aparna", "Makar Sankranti", "Wonder AI Mascot", "Easter", "Hanuman", "Navratri"]) {
    const idx = html.indexOf(kw);
    if (idx !== -1) {
      console.log(`\nKeyword "${kw}" found at index ${idx}:`);
      console.log(html.substring(Math.max(0, idx - 200), Math.min(html.length, idx + 200)));
    } else {
      console.log(`Keyword "${kw}" NOT found in HTML`);
    }
  }

  // Summary counts
  const reviews = allEntities.filter(e => e.entity["@type"] === "Review");
  const videos = allEntities.filter(e => e.entity["@type"] === "VideoObject");
  console.log("\n=================== AUDIT SUMMARY ===================");
  console.log(`Total LD+JSON scripts: ${scriptIndex}`);
  console.log(`Total entities: ${allEntities.length}`);
  console.log(`Review entities: ${reviews.length}`);
  console.log(`VideoObject entities: ${videos.length}`);
  const videosWithoutUploadDate = videos.filter(v => !v.entity.uploadDate);
  console.log(`VideoObjects without uploadDate: ${videosWithoutUploadDate.length}`);
  if (videosWithoutUploadDate.length > 0) {
    console.log("Videos missing uploadDate:");
    videosWithoutUploadDate.forEach(v => console.log(`  - ${v.entity.name} (script ${v.scriptIndex})`));
  }

  fs.writeFileSync("scripts/_live_schema_audit.json", JSON.stringify({ allEntities, itemtypes, itemprops }, null, 2));
}

main().catch(console.error);

