import fs from "fs";
import path from "path";

// 1. Check definitions.approved.json
const approvedDef = JSON.parse(fs.readFileSync("data/forms/definitions.approved.json", "utf8"));
console.log("=== APPROVED FORM DEFINITIONS ===");
for (const form of approvedDef.forms) {
  const routes = form.sourceRoutes || [form.sourceRoute];
  console.log(`ID: ${form.fluentFormId} | Key: ${form.key} | Title: "${form.title}" | Enabled: ${form.activationEnabled} | Routes: ${routes.join(", ")}`);
}

// 2. Scan all mirror pages for forms and form placeholders
console.log("\n=== MIRROR PAGES WITH FORMS / PLACEHOLDERS ===");
const mirrorDir = "data/wordpress/mirrors/pages";
const mirrorFiles = fs.readdirSync(mirrorDir);

for (const file of mirrorFiles) {
  const content = fs.readFileSync(path.join(mirrorDir, file), "utf8");
  const formIds = new Set();
  
  // Regex matches for fluentform IDs
  const r1 = /fluentform(?:_wrapper)?_(\d+)/gi;
  for (const m of content.matchAll(r1)) formIds.add(m[1]);
  
  const r2 = /data-form(?:_id|-id)=["'](\d+)["']/gi;
  for (const m of content.matchAll(r2)) formIds.add(m[1]);

  const hasFormTag = /<form\b/i.test(content);
  const hasPlaceholder = /replace with your fluent form|shortcode/i.test(content);

  if (formIds.size > 0 || hasFormTag || hasPlaceholder) {
    console.log(`File: ${file} | Form IDs: [${[...formIds].join(", ")}] | Has <form>: ${hasFormTag} | Has placeholder: ${hasPlaceholder}`);
  }
}

// 3. Scan Next.js app routes for native forms (e.g. Career, Contact, Assessment, etc.)
console.log("\n=== APP DIRECTORY FORMS ===");
function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      const src = fs.readFileSync(fullPath, "utf8");
      if (/<form\b/i.test(src) || /handleSubmit/i.test(src) || /api\/(?:forms|career|assessment)/i.test(src)) {
        console.log(`Route/Component: ${fullPath.replace(/\\/g, "/")}`);
      }
    }
  }
}
scanDir("app");
scanDir("components");
