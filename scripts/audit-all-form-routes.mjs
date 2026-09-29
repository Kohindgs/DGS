import fs from "fs";
import path from "path";

const mirrorDir = "data/wordpress/mirrors/pages";
const files = fs.readdirSync(mirrorDir);
const defs = JSON.parse(fs.readFileSync("data/forms/definitions.approved.json", "utf8"));

const formRouteMap = new Map();
for (const form of defs.forms) {
  const routes = form.sourceRoutes?.length ? form.sourceRoutes : form.sourceRoute ? [form.sourceRoute] : [];
  for (const r of routes) {
    formRouteMap.set(r, form.fluentFormId);
  }
}

console.log("=== Auditing Form Routes across Mirror Pages ===");

for (const file of files) {
  const content = fs.readFileSync(path.join(mirrorDir, file), "utf8");
  const data = JSON.parse(content);
  const route = data.path;
  const formIds = data.fluentFormIds || [];

  if (formIds.length > 0) {
    for (const fId of formIds) {
      const numId = Number(fId);
      const mappedId = formRouteMap.get(route);
      if (!mappedId) {
        console.log(`MISSING ROUTE MAPPING: route "${route}" has Form ${numId} in HTML, but is NOT mapped in definitions.approved.json! (file: ${file})`);
      } else if (mappedId !== numId) {
        console.log(`MISMATCH: route "${route}" has Form ${numId} in HTML, but is mapped to Form ${mappedId} in definitions!`);
      } else {
        // OK
      }
    }
  }
}
