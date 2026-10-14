import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import mysql from "mysql2/promise";

async function main() {
  const cmsMediaDir = "/home/u188101251/production-app/shared/cms-media";
  const originalsDir = path.join(cmsMediaDir, "originals");
  const uploadsDir = path.join(cmsMediaDir, "uploads");
  const thumbnailsDir = path.join(cmsMediaDir, "thumbnails");

  console.log("=== CHECKING DIRS ===");
  for (const d of [originalsDir, uploadsDir, thumbnailsDir]) {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  }

  const items = [
    {
      originalName: "Google September 2026 Spam Update What Website Owners Should Know.png",
      targetUploadWebp: "google-september-2026-spam-update-what-website-owners-should-know.webp",
      targetThumbWebp: "google-september-2026-spam-update-what-website-owners-should-know.webp",
      slug: "google-september-2026-spam-update-what-website-owners-should-know",
      alt: "Google September 2026 Spam Update What Website Owners Should Know — Comprehensive overview and analysis",
    },
    {
      originalName: "Google Ads for B2B Lead Generation How to Get Better Quality Leads.png",
      targetUploadWebp: "google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads.webp",
      targetThumbWebp: "google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads.webp",
      slug: "google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads",
      alt: "Google Ads for B2B Lead Generation How to Get Better Quality Leads — Comprehensive overview and analysis",
    },
  ];

  for (const item of items) {
    const origPath = path.join(originalsDir, item.originalName);
    console.log(`\nProcessing: ${item.originalName}`);
    if (!fs.existsSync(origPath)) {
      console.error(`ERROR: Original file not found at ${origPath}`);
      continue;
    }

    const buffer = fs.readFileSync(origPath);
    const meta = await sharp(buffer).metadata();
    console.log(`Original dimensions: ${meta.width}x${meta.height}, size: ${buffer.length} bytes`);

    // 1. Generate WebP for uploads/
    const uploadPath = path.join(uploadsDir, item.targetUploadWebp);
    const webpBuffer = await sharp(buffer)
      .rotate()
      .webp({ quality: 90, nearLossless: true, smartSubsample: true, effort: 4 })
      .toBuffer();
    fs.writeFileSync(uploadPath, webpBuffer);
    fs.chmodSync(uploadPath, 0o644);
    console.log(`Created uploads WebP: ${uploadPath} (${webpBuffer.length} bytes)`);

    // 2. Generate WebP for thumbnails/
    const thumbPath = path.join(thumbnailsDir, item.targetThumbWebp);
    const thumbBuffer = await sharp(buffer)
      .rotate()
      .resize({ width: 320, height: 240, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
    fs.writeFileSync(thumbPath, thumbBuffer);
    fs.chmodSync(thumbPath, 0o644);
    console.log(`Created thumbnail WebP: ${thumbPath} (${thumbBuffer.length} bytes)`);
  }

  // 3. Update MySQL DB records
  console.log("\n=== UPDATING MYSQL RECORDS ===");
  const env = fs.readFileSync("/home/u188101251/production-app/current/.env.production", "utf8");
  const cfg = {};
  for (const line of env.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      cfg[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }

  const conn = await mysql.createConnection({
    host: cfg.DGS_MYSQL_HOST || "127.0.0.1",
    user: cfg.DGS_MYSQL_USER,
    password: cfg.DGS_MYSQL_PASSWORD,
    database: cfg.DGS_MYSQL_DATABASE,
  });

  for (const item of items) {
    const publicUrl = `/cms-media/uploads/${item.targetUploadWebp}`;
    const [res] = await conn.query(
      "UPDATE blog_posts SET featured_image_url = ?, featured_image_alt = ? WHERE slug = ?",
      [publicUrl, item.alt, item.slug]
    );
    console.log(`Updated blog_posts for ${item.slug}: affectedRows=${res.affectedRows}`);
  }

  const [verifyRows] = await conn.query(
    "SELECT id, slug, featured_image_url, featured_image_alt FROM blog_posts WHERE slug IN (?, ?)",
    items.map(i => i.slug)
  );
  console.log("Verified DB rows:", JSON.stringify(verifyRows, null, 2));

  await conn.end();
  console.log("\nRepair completed successfully!");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
