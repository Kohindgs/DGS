import fs from "node:fs";

const cssToAdd = fs.readFileSync("./scripts/webdev-reprocessed.css", "utf8");

// 1. Update inner-mirror-overrides.css
const overridesPath = "./lib/wp-exact/inner-mirror-overrides.css";
let overridesContent = fs.readFileSync(overridesPath, "utf8");

// Remove any prior webdev-reprocessed block if present
const markerStart = "/* === DGS REPROCESSED WEBSITE DEVELOPMENT CSS START === */";
const markerEnd = "/* === DGS REPROCESSED WEBSITE DEVELOPMENT CSS END === */";
if (overridesContent.includes(markerStart)) {
  const startIdx = overridesContent.indexOf(markerStart);
  const endIdx = overridesContent.indexOf(markerEnd) + markerEnd.length;
  overridesContent = overridesContent.slice(0, startIdx) + overridesContent.slice(endIdx);
}

const taggedCss = `\n${markerStart}\n${cssToAdd}\n${markerEnd}\n`;
fs.writeFileSync(overridesPath, overridesContent.trimEnd() + "\n" + taggedCss);
console.log("Updated lib/wp-exact/inner-mirror-overrides.css");

// 2. Also append to data.styles in services__website-development-amc.json
const mirrorPath = "./data/wordpress/mirrors/pages/services__website-development-amc.json";
const mirrorData = JSON.parse(fs.readFileSync(mirrorPath, "utf8"));
if (!mirrorData.styles.includes(markerStart)) {
  mirrorData.styles += `\n${taggedCss}`;
} else {
  const sStart = mirrorData.styles.indexOf(markerStart);
  const sEnd = mirrorData.styles.indexOf(markerEnd) + markerEnd.length;
  mirrorData.styles = mirrorData.styles.slice(0, sStart) + taggedCss + mirrorData.styles.slice(sEnd);
}
mirrorData.styleBytes = Buffer.byteLength(mirrorData.styles, "utf8");
fs.writeFileSync(mirrorPath, JSON.stringify(mirrorData, null, 2));
console.log("Updated data.styles in services__website-development-amc.json");
