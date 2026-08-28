#!/usr/bin/env node
/**
 * Validates homepage stack constraints:
 * - Native HomePageTemplate (not WP HTML mirror)
 * - OGL for GPU particles only (no Three.js on homepage path)
 * - No Tailwind, Framer Motion, PixiJS, tsParticles, Watermelon UI
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

const HOMEPAGE_PATHS = [
  "app/(site)/page.tsx",
  "components/templates/HomePage.tsx",
  "components/home",
  "components/background/DgsOglParticleBackground.tsx",
  "components/background/DgsOglParticleBackground.module.css",
  "components/portfolio/HomePortfolioPreview.tsx",
];

const BANNED_PATTERNS = [
  { label: "Three.js", pattern: /\bthree\b|from\s+["']three["']|THREE\./i },
  { label: "Tailwind", pattern: /\btailwindcss\b|@tailwind\b|className=["'][^"']*\b(?:flex|grid|px-|py-|text-)/ },
  { label: "Framer Motion", pattern: /framer-motion|from\s+["']motion["']/ },
  { label: "PixiJS", pattern: /\bpixi(?:\.js)?\b/i },
  { label: "tsParticles", pattern: /tsparticles|@tsparticles/i },
  { label: "Watermelon UI", pattern: /watermelon/i },
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
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      out.push(...collectFiles(join(target, entry.name)));
    } else {
      const ext = entry.name.slice(entry.name.lastIndexOf("."));
      if (EXTENSIONS.has(ext)) out.push(full);
    }
  }
  return out;
}

function main() {
  const errors = [];

  const pageSource = readFileSync(join(ROOT, "app/(site)/page.tsx"), "utf8");
  if (pageSource.includes("HomeWpMirrorPage")) {
    errors.push("app/(site)/page.tsx must use HomePageTemplate, not HomeWpMirrorPage");
  }
  if (!pageSource.includes("HomePageTemplate")) {
    errors.push("app/(site)/page.tsx must import HomePageTemplate");
  }

  const templateSource = readFileSync(join(ROOT, "components/templates/HomePage.tsx"), "utf8");
  if (!templateSource.includes("HomeV1215Shell")) {
    errors.push("components/templates/HomePage.tsx must wrap content in HomeV1215Shell");
  }
  if (!templateSource.includes("DgsOglParticleBackground") && !templateSource.includes("HomeV1215Shell")) {
    errors.push("Homepage must use OGL particle background via HomeV1215Shell");
  }

  const files = HOMEPAGE_PATHS.flatMap((target) => collectFiles(target));

  for (const file of files) {
    const rel = relative(ROOT, file);
    const source = readFileSync(file, "utf8");

    for (const { label, pattern } of BANNED_PATTERNS) {
      if (pattern.test(source)) {
        errors.push(`${rel}: banned ${label} reference`);
      }
    }
  }

  if (errors.length) {
    console.error("validate-homepage-stack: FAIL\n");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("validate-homepage-stack: PASS");
}

main();
