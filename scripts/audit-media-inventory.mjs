import fs from "node:fs";
import path from "node:path";

const CWD = process.cwd();

// Directories to scan for references
const MIRRORS_DIR = path.join(CWD, "data", "wordpress", "mirrors", "pages");
const PORTFOLIO_DIR = path.join(CWD, "data", "portfolio");
const CONTENT_BLOCKS_DIR = path.join(CWD, "data", "content-blocks");
const PUBLIC_MEDIA_DIR = path.join(CWD, "public", "media");

function collectFiles(dir, exts = [".json", ".html", ".js", ".mjs", ".tsx", ".ts"]) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, exts));
    } else if (entry.isFile() && exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function extractUrlsFromText(text) {
  const urls = new Set();

  // img / video / source src
  const srcMatches = text.matchAll(/(?:src|href|poster)=["']([^"']+)["']/gi);
  for (const m of srcMatches) {
    if (m[1] && isMediaUrl(m[1])) urls.add(m[1]);
  }

  // url(...) inside css/inline styles
  const cssMatches = text.matchAll(/url\(["']?([^"')]+)["']?\)/gi);
  for (const m of cssMatches) {
    if (m[1] && isMediaUrl(m[1])) urls.add(m[1]);
  }

  // JSON string values ending in media extensions
  const jsonMatches = text.matchAll(/"([^"]+\.(?:jpg|jpeg|png|webp|gif|svg|mp4|webm|mov)(?:\?[^"]*)?)"/gi);
  for (const m of jsonMatches) {
    if (m[1] && isMediaUrl(m[1])) urls.add(m[1]);
  }

  return Array.from(urls);
}

function isMediaUrl(url) {
  const clean = url.split("?")[0].toLowerCase();
  return (
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.endsWith(".png") ||
    clean.endsWith(".webp") ||
    clean.endsWith(".gif") ||
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".svg") ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com")
  );
}

async function runInventoryAudit() {
  console.log("=== DGS MEDIA MIGRATION INVENTORY AUDIT ===\n");

  const scanFiles = [
    ...collectFiles(MIRRORS_DIR),
    ...collectFiles(PORTFOLIO_DIR),
    ...collectFiles(CONTENT_BLOCKS_DIR),
  ];

  console.log(`Scanned ${scanFiles.length} source files for media references.`);

  const allUrls = new Map(); // url -> count
  for (const file of scanFiles) {
    const text = fs.readFileSync(file, "utf8");
    const urls = extractUrlsFromText(text);
    for (const u of urls) {
      allUrls.set(u, (allUrls.get(u) || 0) + 1);
    }
  }

  const nativeMedia = [];
  const wpImages = [];
  const wpVideos = [];
  const externalMedia = [];
  const brokenMedia = [];
  const duplicateMedia = [];

  for (const [url, count] of allUrls.entries()) {
    if (count > 1) {
      duplicateMedia.push({ url, count });
    }

    const clean = url.split("?")[0].toLowerCase();

    // 1. Native media
    if (url.startsWith("/media/") || url.startsWith("/cms-media/") || url.startsWith("https://www.dgeniussolutions.com/media/")) {
      nativeMedia.push(url);
    }
    // 2. WordPress media
    else if (url.includes("/wp-content/uploads/")) {
      if (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov")) {
        wpVideos.push(url);
      } else {
        wpImages.push(url);
      }
    }
    // 3. External hosted media
    else if (url.startsWith("http://") || url.startsWith("https://")) {
      externalMedia.push(url);
    }
    // 4. Broken / unresolved relative
    else if (!url.startsWith("/")) {
      brokenMedia.push(url);
    } else {
      // Local static
      nativeMedia.push(url);
    }
  }

  // 5. Potentially unused assets in public/media
  const physicalPublicMedia = collectFiles(PUBLIC_MEDIA_DIR, [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".webm"]);
  const potentiallyUnused = [];
  for (const abs of physicalPublicMedia) {
    const rel = "/" + path.relative(path.join(CWD, "public"), abs).replace(/\\/g, "/");
    if (!allUrls.has(rel)) {
      potentiallyUnused.push(rel);
    }
  }

  const report = {
    totalDistinctMediaUrls: allUrls.size,
    nativeMediaCount: nativeMedia.length,
    wpImagesCount: wpImages.length,
    wpVideosCount: wpVideos.length,
    externalMediaCount: externalMedia.length,
    brokenMediaCount: brokenMedia.length,
    duplicateReferencedMediaCount: duplicateMedia.length,
    potentiallyUnusedPhysicalMediaCount: potentiallyUnused.length,
    samples: {
      nativeMedia: nativeMedia.slice(0, 3),
      wpImages: wpImages.slice(0, 3),
      wpVideos: wpVideos.slice(0, 3),
      externalMedia: externalMedia.slice(0, 3),
      duplicates: duplicateMedia.slice(0, 3),
      potentiallyUnused: potentiallyUnused.slice(0, 3),
    },
  };

  console.log("INVENTORY REPORT SUMMARY:");
  console.log(`- Native Media (already on Next.js/CMS): ${report.nativeMediaCount}`);
  console.log(`- WordPress-Hosted Images: ${report.wpImagesCount}`);
  console.log(`- WordPress-Hosted Videos: ${report.wpVideosCount}`);
  console.log(`- External Hosted Media: ${report.externalMediaCount}`);
  console.log(`- Broken / Invalid Relative: ${report.brokenMediaCount}`);
  console.log(`- Duplicate-Referenced Assets: ${report.duplicateReferencedMediaCount}`);
  console.log(`- Potentially Unused Physical Media: ${report.potentiallyUnusedPhysicalMediaCount}\n`);

  fs.writeFileSync(
    path.join(CWD, "data", "media-migration-inventory.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );
  console.log("Saved full report to data/media-migration-inventory.json");
}

runInventoryAudit().catch(console.error);
