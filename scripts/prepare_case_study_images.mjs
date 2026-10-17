import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

async function main() {
  // 1. Ensure 2025/12 directory exists for katherine
  const kathDir = path.join("public", "wp-content", "uploads", "2025", "12");
  if (!fs.existsSync(kathDir)) {
    fs.mkdirSync(kathDir, { recursive: true });
  }
  const kathTarget = path.join(kathDir, "katherinesgallery-scaled.webp");
  if (fs.existsSync("scripts/katherinesgallery_scaled.webp")) {
    fs.copyFileSync("scripts/katherinesgallery_scaled.webp", kathTarget);
    console.log("Copied Katherine image to", kathTarget);
  }

  // 2. Ensure 2026/08 directory exists for Better Ceasons
  const bcDir = path.join("public", "wp-content", "uploads", "2026", "08");
  if (!fs.existsSync(bcDir)) {
    fs.mkdirSync(bcDir, { recursive: true });
  }
  const bcTarget = path.join(bcDir, "better-ceasons-scaled.webp");
  if (fs.existsSync("scripts/better_ceasons_preview.png")) {
    const buf = fs.readFileSync("scripts/better_ceasons_preview.png");
    const webpBuf = await sharp(buf)
      .resize({ width: 1600, height: 1000, fit: "cover" })
      .webp({ quality: 85, effort: 4 })
      .toBuffer();
    fs.writeFileSync(bcTarget, webpBuf);
    console.log("Generated Better Ceasons WebP at", bcTarget, `(${webpBuf.length} bytes)`);
  }
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
