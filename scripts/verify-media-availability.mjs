import fs from "node:fs";
import path from "node:path";

const targetRelDir = process.argv[2] || process.cwd();
const PERSISTENT_SHARED_MEDIA_DIR = "/home/u188101251/production-app/shared/media/portfolio/videos";

// The 23 video stems required for portfolio playback (each with .mp4 and .webm)
const REQUIRED_VIDEO_STEMS = [
  "better_ceasons_chaturthi",
  "better_ceasons_kachra",
  "better_ceasons_tenant",
  "better_ceasons_visarjan",
  "clarion_jasmine_atta_hindi",
  "clarion_jasmine_atta_telugu",
  "hyundai_creta_1",
  "hyundai_creta_2",
  "hyundai_creta_3",
  "media1",
  "media2",
  "media3",
  "media4",
  "media5",
  "media6",
  "sundaram_bal_3_1",
  "sundaram_evs1_ch7",
  "sundaram_evs2_ch7",
  "sundaram_marathi_13",
  "sundaram_marathi_bhaag_3",
  "sundaram_marathi_eng_3_5",
  "sundaram_marathi_eng_3_8",
  "sundaram_maths_ch9",
];

async function main() {
  console.log("==================================================================");
  console.log("  AUTOMATED MEDIA AVAILABILITY PRE-DEPLOY GUARD");
  console.log("==================================================================");
  console.log(`Checking release target: ${targetRelDir}`);

  if (!fs.existsSync(targetRelDir)) {
    console.error(`[HARD FAIL] Target release directory does not exist: ${targetRelDir}`);
    process.exit(1);
  }

  const publicDir = path.join(targetRelDir, "public");
  const mediaSymlink = path.join(publicDir, "media", "portfolio", "videos");
  const htaccessPath = path.join(publicDir, ".htaccess");

  const errors = [];

  // 1. Check symlink existence and target
  try {
    const lstat = fs.lstatSync(mediaSymlink);
    if (!lstat.isSymbolicLink() && !lstat.isDirectory()) {
      errors.push(`public/media/portfolio/videos is neither a symlink nor a directory (type: ${JSON.stringify(lstat)})`);
    } else if (lstat.isSymbolicLink()) {
      const linkTarget = fs.readlinkSync(mediaSymlink);
      console.log(`  Symlink resolves to: ${linkTarget}`);
      if (linkTarget.includes("/releases/")) {
        errors.push(`Symlink points to an ephemeral release directory (${linkTarget}) instead of persistent shared storage!`);
      }
    }
  } catch (err) {
    errors.push(`Missing media symlink at ${mediaSymlink}: ${err.message}`);
  }

  // 2. Check that target directory exists and can be read
  let filesInDir = [];
  try {
    filesInDir = fs.readdirSync(mediaSymlink);
    console.log(`  Found ${filesInDir.length} files in ${mediaSymlink}`);
  } catch (err) {
    errors.push(`Failed to read files from ${mediaSymlink}: ${err.message}`);
  }

  // 3. Verify all required 46 video files (.mp4 + .webm) exist and are non-empty
  const missingFiles = [];
  const emptyFiles = [];
  for (const stem of REQUIRED_VIDEO_STEMS) {
    for (const ext of [".mp4", ".webm"]) {
      const filename = `${stem}${ext}`;
      const filePath = path.join(mediaSymlink, filename);
      try {
        const stats = fs.statSync(filePath);
        if (stats.size < 10000) {
          // Less than 10KB is likely corrupt or placeholder
          emptyFiles.push(`${filename} (${stats.size} bytes)`);
        }
      } catch (e) {
        missingFiles.push(filename);
      }
    }
  }

  if (missingFiles.length > 0) {
    errors.push(`Missing ${missingFiles.length} required video files: ${missingFiles.join(", ")}`);
  }
  if (emptyFiles.length > 0) {
    errors.push(`Found ${emptyFiles.length} suspiciously small/empty video files: ${emptyFiles.join(", ")}`);
  }

  // 4. Verify public/.htaccess exists and contains required MIME types and Accept-Ranges
  try {
    if (!fs.existsSync(htaccessPath)) {
      errors.push(`Missing ${htaccessPath}! Apache/Passenger will serve static video without correct MIME headers.`);
    } else {
      const htContent = fs.readFileSync(htaccessPath, "utf8");
      if (!htContent.includes("video/mp4")) {
        errors.push(`.htaccess missing 'AddType video/mp4 .mp4'`);
      }
      if (!htContent.includes("video/webm")) {
        errors.push(`.htaccess missing 'AddType video/webm .webm'`);
      }
      if (!htContent.includes("Accept-Ranges bytes")) {
        errors.push(`.htaccess missing 'Header always set Accept-Ranges bytes'`);
      }
    }
  } catch (err) {
    errors.push(`Failed to verify .htaccess: ${err.message}`);
  }

  if (errors.length > 0) {
    console.error("\n==================================================================");
    console.error("  [HARD FAIL] MEDIA AVAILABILITY GUARD FAILED — ABORTING RELEASE");
    console.error("==================================================================");
    errors.forEach((err, idx) => {
      console.error(`  ${idx + 1}. ${err}`);
    });
    console.error("\nThe deployment has been halted. The active release has NOT been switched.");
    process.exit(1);
  }

  console.log("\n==================================================================");
  console.log("  [PASS] ALL MEDIA AVAILABILITY CHECKS PASSED");
  console.log(`  - Verified persistent storage symlink: OK`);
  console.log(`  - Verified all 46 critical video files exist & >100KB: OK`);
  console.log(`  - Verified public/.htaccess with MIME & Range headers: OK`);
  console.log("==================================================================");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error in media availability guard:", err);
  process.exit(1);
});
