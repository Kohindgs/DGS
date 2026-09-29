import fs from "node:fs/promises";
import path from "node:path";

async function getAllHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllHtmlFiles(fullPath)));
    } else if (entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

async function run() {
  const files = await getAllHtmlFiles(".next/server/app");
  console.log(`Scanning ${files.length} built HTML files for unintended editorial/CMS labels...`);

  const checks = [
    { label: "Target Keyword Label", regex: /(?:<small>[^<]*Target Keyword|Target Keyword:)/i },
    { label: "AI Overview Answer", regex: /\bAI Overview Answer\b/i },
    { label: "SEO Notes", regex: /\bSEO Notes?\b/i },
    { label: "Case Signal", regex: /\bCase Signal\b/i },
    { label: "India SEO", regex: /\bIndia SEO\b/i },
    { label: "Archives: Services", regex: /Archives:\s*Services/i },
    { label: "AI Production Dubai page", regex: /\bAI Production Dubai page\b/i },
    { label: "<small>Internal Link</small>", regex: /<small>\s*Internal Link\s*<\/small>/i },
  ];

  let issues = 0;
  for (const f of files) {
    const html = await fs.readFile(f, "utf8");
    for (const c of checks) {
      if (c.regex.test(html)) {
        console.log(`ISSUE in ${f}: matches "${c.label}"`);
        issues++;
      }
    }
  }

  if (issues === 0) {
    console.log("✓ ACCEPTANCE CONDITION MET: ZERO unintended public editorial/CMS labels across all built pages!");
  } else {
    console.log(`Found ${issues} issues.`);
  }
}

run();
