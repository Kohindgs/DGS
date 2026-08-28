#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const RUNTIME_DIRS = ["app", "components", "lib", "styles"];

const EXCLUDE_PATTERNS = [
  /(?:^|\/)docs\//,
  /(?:^|\/)audit\//,
  /(?:^|\/)scripts\//,
  /(?:^|\/)data\//,
  /(?:^|\/)components\/mirror\//,
  /(?:^|\/)lib\/wordpress\//,
  /(?:^|\/)lib\/work\//,
  /validate-envira/,
];

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".mjs"]);

function collectFiles(target) {
  const abs = join(ROOT, target);
  try {
    const stat = statSync(abs);
    if (stat.isFile()) return [abs];
  } catch {
    return [];
  }

  const out = [];
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    const full = join(abs, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "mirror") continue;
      out.push(...collectFiles(join(target, entry.name)));
    } else if (EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf(".")))) {
      out.push(full);
    }
  }
  return out;
}

function isExcluded(filePath) {
  const rel = filePath.replace(ROOT + "/", "");
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(rel));
}

const patterns = {
  js: /envira[-_]?gallery|enviraGallery|EnviraGallery|envira\.js|from\s+['"]envira/i,
  css: /envira[-_]?gallery|\.envira-/i,
  html: /envira-gallery|envira-item|data-envira|envira-wrap/i,
  shortcode: /\[envira-gallery/i,
};

const hits = { js: [], css: [], html: [], shortcode: [] };

for (const dir of RUNTIME_DIRS) {
  for (const file of collectFiles(dir)) {
    if (isExcluded(file)) continue;
    const content = readFileSync(file, "utf8");
    const rel = file.replace(ROOT + "/", "");
    for (const [key, regex] of Object.entries(patterns)) {
      if (regex.test(content)) hits[key].push(rel);
    }
  }
}

const middlewarePath = join(ROOT, "middleware.ts");
if (statSync(middlewarePath).isFile()) {
  const content = readFileSync(middlewarePath, "utf8");
  const rel = "middleware.ts";
  for (const [key, regex] of Object.entries(patterns)) {
    if (regex.test(content)) hits[key].push(rel);
  }
}

const counts = Object.fromEntries(Object.entries(hits).map(([key, arr]) => [key, arr.length]));
const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

console.log("Envira runtime validation");
for (const [key, count] of Object.entries(counts)) {
  console.log(`  ${key}: ${count}`);
  for (const file of hits[key]) console.log(`    - ${file}`);
}

if (total > 0) {
  console.error("\nFAIL: Envira runtime references found.");
  process.exit(1);
}

console.log("\nPASS: zero Envira runtime references.");
