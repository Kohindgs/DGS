#!/usr/bin/env node
/**
 * ONE-TIME utility to generate visual-source-manifest.json at approved SHA.
 * Do NOT call from validate:ui-lock — the manifest is frozen once committed.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const APPROVED_SHA = "5002966";
const OUT = path.resolve(`tooling/ui-lock/${APPROVED_SHA}/visual-source-manifest.json`);

const VISUAL_FILES = [
  "app/(site)/page.tsx",
  "app/(site)/layout.tsx",
  "components/layout/ConditionalSiteChrome.tsx",
  "components/layout/ChromeProvider.tsx",
  "components/layout/LetsTalkModal.tsx",
  "components/layout/LetsTalkModal.module.css",
  "components/layout/useFocusTrap.ts",
  "components/forms/PublicLeadForm.tsx",
  "components/forms/PublicLeadForm.module.css",
  "components/mirror/HomeWpMirrorPage.tsx",
  "components/wp-exact/DgsWpBoot.tsx",
  "components/wp-exact/WpMirrorCreativeGallery.tsx",
  "components/wp-exact/WpMirrorHomeForm.tsx",
  "lib/wordpress/load-homepage-mirror.ts",
  "lib/wordpress/prepare-homepage-mirror.ts",
  "lib/wp-exact/rewrite-wp-urls.ts",
  "lib/wp-exact/load-extracted-assets.ts",
  "lib/wp-exact/build-mirror-swap-html.ts",
  "lib/wp-exact/wp-mirror-overrides.css",
  "lib/wp-exact/extracted/nav.html",
  "lib/wp-exact/extracted/nav-styles.css",
  "lib/wp-exact/extracted/footer.html",
  "lib/wp-exact/extracted/footer-styles.css",
  "lib/wp-exact/extracted/fluentform-styles.css",
  "lib/wp-exact/extracted/home-fluentform-styles.css",
  "lib/wp-exact/extracted/boot-nav.js",
  "lib/wp-exact/extracted/boot-v1215-particles-only.js",
  "lib/wp-exact/extracted/boot-0.js",
  "lib/wp-exact/extracted/boot-portfolio-home.js",
  "lib/wp-exact/extracted/boot-1.js",
  "lib/portfolio/load-homepage-gallery.ts",
  "lib/portfolio/types.ts",
  "data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json",
  "data/portfolio/homepage-gallery.json",
];

function sha256(filePath) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

const files = [];
const missing = [];

for (const rel of VISUAL_FILES) {
  const abs = path.resolve(rel);
  if (!fs.existsSync(abs)) {
    missing.push(rel);
    continue;
  }
  files.push({ path: rel, sha256: sha256(abs) });
}

if (missing.length) {
  console.error("Missing visual files:", missing);
  process.exit(1);
}

const manifest = {
  approvedSha: APPROVED_SHA,
  generatedAt: new Date().toISOString(),
  purpose: "SHA-256 integrity lock for homepage mirror visual implementation",
  fileCount: files.length,
  files,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${OUT} (${files.length} files)`);
