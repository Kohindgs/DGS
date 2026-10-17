import fs from "fs";

async function main() {
  const definitions = JSON.parse(fs.readFileSync("data/forms/definitions.approved.json", "utf8"));
  console.log("Approved forms count:", definitions.forms.length);
  
  const contentBlocksRaw = JSON.parse(fs.readFileSync("data/wordpress/blocks/content-blocks.generated.json", "utf8"));
  const contentBlocks = contentBlocksRaw.blocks || contentBlocksRaw;
  console.log("Total routes in content-blocks:", Object.keys(contentBlocks).length);

  const foundFormsByRoute = {};
  for (const [route, data] of Object.entries(contentBlocks)) {
    const html = JSON.stringify(data);
    if (html.includes("fluentform")) {
      const ids = new Set();
      let pos = 0;
      while ((pos = html.indexOf("fluentform_", pos)) !== -1) {
        const slice = html.slice(pos + "fluentform_".length, pos + 25);
        const match = slice.match(/^(\d+)/);
        if (match) ids.add(match[1]);
        pos += "fluentform_".length;
      }
      foundFormsByRoute[route] = [...ids];
    }
  }

  console.log("\nRoutes in content-blocks with embedded fluentform IDs:");
  for (const [route, ids] of Object.entries(foundFormsByRoute)) {
    console.log(`  ${route} -> Form IDs: ${ids.join(", ")}`);
  }

  console.log("\nChecking definitions.approved.json mappings:");
  const mappedRoutes = new Set();
  for (const f of definitions.forms) {
    const rs = f.sourceRoutes || (f.sourceRoute ? [f.sourceRoute] : []);
    for (const r of rs) {
      mappedRoutes.add(r);
      const inBlocks = foundFormsByRoute[r];
      console.log(`  [Form ${f.fluentFormId}] ${f.key} mapped to ${r} (found in blocks: ${inBlocks ? inBlocks.join(",") : "none"})`);
    }
  }

  console.log("\nChecking if any route has fluentform in content-blocks BUT is not in definitions.approved.json:");
  let unmappedCount = 0;
  for (const [route, ids] of Object.entries(foundFormsByRoute)) {
    if (!mappedRoutes.has(route)) {
      console.log(`  UNMAPPED ROUTE: ${route} has Form IDs: ${ids.join(", ")}`);
      unmappedCount++;
    }
  }
  if (unmappedCount === 0) {
    console.log("  ALL routes with embedded fluent forms in content-blocks are accounted for in definitions.approved.json!");
  }
}

main().catch(console.error);
