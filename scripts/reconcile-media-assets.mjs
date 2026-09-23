#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import mysql from "mysql2/promise";
import sharp from "sharp";

const CWD = process.cwd();

const DB_CONFIG = {
  host: process.env.DGS_MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.DGS_MYSQL_PORT || 3306),
  user: process.env.DGS_MYSQL_USER || "u188101251_nodtii",
  password: process.env.DGS_MYSQL_PASSWORD || "Yh5_S_6iTd",
  database: process.env.DGS_MYSQL_DATABASE || "u188101251_nodtii",
};

const SCAN_DIRS = [
  { dir: path.join(CWD, "public", "media"), category: "portfolio", basePublicUrl: "/media" },
  { dir: path.join(CWD, "public", "wp-content", "uploads"), category: "legacy", basePublicUrl: "/wp-content/uploads" },
  { dir: path.join(CWD, "public", "images"), category: "general", basePublicUrl: "/images" },
];

function getMimeType(ext) {
  switch (ext.toLowerCase()) {
    case ".webp": return "image/webp";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".png": return "image/png";
    case ".gif": return "image/gif";
    case ".svg": return "image/svg+xml";
    case ".mp4": return "video/mp4";
    case ".webm": return "video/webm";
    case ".mov": return "video/quicktime";
    case ".pdf": return "application/pdf";
    default: return "application/octet-stream";
  }
}

function getMediaType(ext) {
  const e = ext.toLowerCase();
  if ([".mp4", ".webm", ".mov"].includes(e)) return "video";
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(e)) return "image";
  return "document";
}

async function getDimensions(filePath, ext) {
  if (![".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext.toLowerCase())) {
    return { width: null, height: null };
  }
  try {
    const meta = await sharp(filePath).metadata();
    return { width: meta.width || null, height: meta.height || null };
  } catch {
    return { width: null, height: null };
  }
}

async function run() {
  console.log("=== RECONCILING DGS MEDIA ASSETS INTO DATABASE ===");
  const conn = await mysql.createConnection(DB_CONFIG);

  let inserted = 0;
  let skipped = 0;

  for (const { dir, category, basePublicUrl } of SCAN_DIRS) {
    if (!fs.existsSync(dir)) continue;

    function walk(currentDir) {
      const files = [];
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const ent of entries) {
        const full = path.join(currentDir, ent.name);
        if (ent.isDirectory()) {
          files.push(...walk(full));
        } else if (ent.isFile()) {
          files.push(full);
        }
      }
      return files;
    }

    const allFiles = walk(dir);
    console.log(`Scanning ${dir}: found ${allFiles.length} files`);

    for (const file of allFiles) {
      const ext = path.extname(file).toLowerCase();
      if (![".webp", ".png", ".jpg", ".jpeg", ".svg", ".gif", ".mp4", ".webm", ".pdf"].includes(ext)) {
        continue;
      }

      const relPath = path.relative(dir, file).replace(/\\/g, "/");
      const publicUrl = `${basePublicUrl}/${relPath}`;
      const filename = path.basename(file);
      const stats = fs.statSync(file);
      const buffer = fs.readFileSync(file);
      const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

      // Check if already in DB
      const [existing] = await conn.query("SELECT id FROM media_assets WHERE public_url = ? OR checksum = ? LIMIT 1", [
        publicUrl,
        checksum,
      ]);

      if (existing && existing.length > 0) {
        skipped++;
        continue;
      }

      const { width, height } = await getDimensions(file, ext);
      const mediaType = getMediaType(ext);
      const mime = getMimeType(ext);
      const id = crypto.randomUUID();

      // Clean title from filename
      const title = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

      await conn.query(
        `INSERT INTO media_assets (
          id, filename, original_filename, storage_path, public_url,
          mime_type, media_type, extension, width, height,
          file_size, original_file_size, optimised_file_size,
          alt_text, is_decorative, title, conversion_status,
          source, checksum, category
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          filename,
          filename,
          file,
          publicUrl,
          mime,
          mediaType,
          ext.replace(".", ""),
          width,
          height,
          stats.size,
          stats.size,
          stats.size,
          null, // alt_text initially null if unset
          0,
          title,
          "ready",
          "reconciled",
          checksum,
          category,
        ]
      );
      inserted++;
    }
  }

  const [totalRes] = await conn.query("SELECT COUNT(*) as total FROM media_assets WHERE deleted_at IS NULL");
  console.log(`Reconciliation complete. Inserted: ${inserted}, Skipped: ${skipped}, Total in DB: ${totalRes[0].total}`);
  await conn.end();
}

run().catch((err) => {
  console.error("Reconciliation error:", err);
  process.exit(1);
});
