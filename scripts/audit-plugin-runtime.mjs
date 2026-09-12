#!/usr/bin/env node
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "data/audit/plugin-runtime-dependency-audit.json");
const SCAN_DIRS = ["app", "components", "lib", "styles", "middleware.ts"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".mjs", ".html"]);
const UPLOADS_ALLOW = /wp-content\/uploads/i;

const PATTERNS = {
  elementor: {
    label: "Elementor runtime",
    class: "A",
    regex: /elementor-|data-elementor|ElementorFrontend|elementorFrontend/gi,
  },
  envira: {
    label: "Envira runtime",
    class: "A",
    regex: /envira[-_]?gallery|enviraGallery|data-envira|\[envira-gallery/gi,
  },
  rankMath: {
    label: "Rank Math runtime",
    class: "A",
    regex: /rank[\s-]?math\.js|schema\.rankmath|rank-math-|rank_math_/gi,
  },
  fluentFrontend: {
    label: "Fluent Forms frontend runtime",
    class: "A",
    regex: /fluentform\.js|fluent-form-public|ff-el-form-top.*fluentform_wrapper|frm-fluent-form/gi,
  },
  simpleicons: {
    label: "SimpleIcons CDN",
    class: "A",
    regex: /cdn\.simpleicons\.org/gi,
  },
  mshots: {
    label: "WordPress mshots runtime",
    class: "A",
    regex: /s\.wordpress\.com\/mshots/gi,
    approvalRequired: "ASSET_APPROVAL_REQUIRED — /services/website-development-amc/ and /services/website-development-pune-page/",
  },
  wpThemeRuntime: {
    label: "WordPress theme frontend runtime",
    class: "A",
    regex: /wp-includes\/js|wp-content\/themes\/.*\.js/gi,
  },
  adminAjax: {
    label: "admin-ajax.php runtime",
    class: "A",
    regex: /admin-ajax\.php/gi,
  },
  wpUploadsAsset: {
    label: "wp-content/uploads asset",
    class: "C",
    regex: /wp-content\/uploads/gi,
  },
  fluentStylesSnapshot: {
    label: "Fluent Forms static legacy snapshot",
    class: "B",
    regex: /fluentform-styles\.css|home-fluentform-styles\.css/gi,
  },
};

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
    if (entry.name === "node_modules") continue;
    const full = join(abs, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(join(target, entry.name)));
    else {
      const ext = entry.name.slice(entry.name.lastIndexOf("."));
      if (EXTENSIONS.has(ext)) out.push(full);
    }
  }
  return out;
}

const findings = Object.fromEntries(Object.keys(PATTERNS).map((key) => [key, []]));

for (const dir of SCAN_DIRS) {
  for (const file of collectFiles(dir)) {
    const rel = file.replace(ROOT + "/", "");
    if (rel.includes("data/audit/") || rel.includes("data/wordpress/") || rel.includes("scripts/")) continue;
    let content = "";
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const [key, pattern] of Object.entries(PATTERNS)) {
      pattern.regex.lastIndex = 0;
      if (!pattern.regex.test(content)) continue;
      if (key === "wpUploadsAsset" && UPLOADS_ALLOW.test(content)) {
        findings[key].push({ file: rel, note: "allowed content asset reference" });
        continue;
      }
      if (key === "fluentStylesSnapshot" && rel.includes("lib/wp-exact/extracted/")) {
        findings[key].push({ file: rel, note: "local static snapshot" });
        continue;
      }
      if (key === "fluentFrontend" && rel.includes("lib/wp-exact/extracted/")) {
        findings[key].push({ file: rel, note: "static HTML snapshot — review for runtime activation" });
        continue;
      }
      findings[key].push({ file: rel });
    }
  }
}

const classA = Object.entries(findings)
  .filter(([key]) => PATTERNS[key].class === "A")
  .flatMap(([key, hits]) => hits.map((hit) => ({ type: key, ...hit, label: PATTERNS[key].label })));

const report = {
  generatedAt: new Date().toISOString(),
  patterns: PATTERNS,
  findings,
  summary: {
    classAForbiddenRuntime: classA.length,
    elementorRuntime: findings.elementor.length,
    enviraRuntime: findings.envira.length,
    rankMathRuntime: findings.rankMath.length,
    fluentFrontendRuntime: findings.fluentFrontend.length,
    simpleiconsRuntime: findings.simpleicons.length,
    mshotsRuntime: findings.mshots.length,
    mshotsApprovalStatus: findings.mshots.length ? "ASSET_APPROVAL_REQUIRED" : "none",
    wpUploadsAssets: findings.wpUploadsAsset.length,
  },
  classAFindings: classA,
};

writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary, null, 2));
