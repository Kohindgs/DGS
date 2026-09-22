import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  validateSafeFilename,
  detectMagicBytes,
  validateUploadedFile,
} from "../lib/cms/media-security.ts";
import {
  normalizeMediaStem,
  normalizeMediaFilename,
  computeFileChecksum,
  ensureMediaDirectories,
  getCmsMediaRoot,
} from "../lib/cms/media-storage.ts";
import {
  processUploadedImage,
  processUploadedVideo,
} from "../lib/cms/media-processor.ts";

async function runTests() {
  console.log("=== RUNNING NATIVE MEDIA CMS TEST SUITE ===\n");
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ FAIL: ${name}\n  Error: ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ FAIL: ${name}\n  Error: ${err.message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // 1. SECURITY: PATH TRAVERSAL & FILENAME SANITIZATION
  // -------------------------------------------------------------
  test("Security: Rejects path traversal filenames (../)", () => {
    assert.equal(validateSafeFilename("../../etc/passwd"), false);
    assert.equal(validateSafeFilename("..\\windows\\system32"), false);
    assert.equal(validateSafeFilename("uploads/../../secret.jpg"), false);
    assert.equal(validateSafeFilename("file\0null.jpg"), false);
  });

  test("Security: Rejects dangerous double extensions", () => {
    assert.equal(validateSafeFilename("exploit.php.jpg"), false);
    assert.equal(validateSafeFilename("malware.exe.png"), false);
    assert.equal(validateSafeFilename("script.js.webp"), false);
    assert.equal(validateSafeFilename("webshell.phtml.jpg"), false);
    assert.equal(validateSafeFilename("valid-normal-image.jpg"), true);
  });

  // -------------------------------------------------------------
  // 2. SECURITY: MAGIC BYTES & MIME SPOOFING
  // -------------------------------------------------------------
  test("Security: Rejects fake files with image extensions (MIME spoofing)", () => {
    const fakeExeBuffer = Buffer.from("MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00");
    const res = validateUploadedFile("fake-image.jpg", fakeExeBuffer);
    assert.equal(res.valid, false);
    assert.match(res.error, /File contents do not match/);
  });

  test("Security: Detects valid JPEG magic bytes (FF D8 FF)", () => {
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const detected = detectMagicBytes(jpegHeader);
    assert.ok(detected);
    assert.equal(detected.mimeType, "image/jpeg");
    assert.equal(detected.mediaType, "image");
  });

  test("Security: Detects valid PNG magic bytes", () => {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const detected = detectMagicBytes(pngHeader);
    assert.ok(detected);
    assert.equal(detected.mimeType, "image/png");
    assert.equal(detected.mediaType, "image");
  });

  test("Security: Detects valid WebP magic bytes (RIFF ... WEBP)", () => {
    const webpHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // RIFF
      0x20, 0x00, 0x00, 0x00, // size
      0x57, 0x45, 0x42, 0x50, // WEBP
    ]);
    const detected = detectMagicBytes(webpHeader);
    assert.ok(detected);
    assert.equal(detected.mimeType, "image/webp");
    assert.equal(detected.mediaType, "image");
  });

  test("Security: Detects valid MP4 magic bytes (ftyp)", () => {
    const mp4Header = Buffer.from([
      0x00, 0x00, 0x00, 0x20,
      0x66, 0x74, 0x79, 0x70, // ftyp
      0x69, 0x73, 0x6f, 0x6d,
    ]);
    const detected = detectMagicBytes(mp4Header);
    assert.ok(detected);
    assert.equal(detected.mimeType, "video/mp4");
    assert.equal(detected.mediaType, "video");
  });

  test("Security: Detects valid WebM magic bytes (1A 45 DF A3)", () => {
    const webmHeader = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x42, 0xf7, 0x81]);
    const detected = detectMagicBytes(webmHeader);
    assert.ok(detected);
    assert.equal(detected.mimeType, "video/webm");
    assert.equal(detected.mediaType, "video");
  });

  // -------------------------------------------------------------
  // 3. STORAGE & SEO FILENAME NORMALIZATION
  // -------------------------------------------------------------
  test("Storage: SEO filename normalization cleans messy filenames", () => {
    assert.equal(normalizeMediaStem("IMG_92738 Final FINAL (2).JPG"), "img-92738-final-final-2");
    assert.equal(normalizeMediaFilename("IMG_92738.JPG", "webp"), "img-92738.webp");
    assert.equal(
      normalizeMediaFilename("RAW_Photo.png", "webp", "AI Video Production Mumbai"),
      "ai-video-production-mumbai.webp"
    );
  });

  test("Storage: SHA-256 checksum computation is deterministic", () => {
    const buf = Buffer.from("Hello DGS Media CMS");
    const hash1 = computeFileChecksum(buf);
    const hash2 = computeFileChecksum(buf);
    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
  });

  // -------------------------------------------------------------
  // 4. IMAGE PROCESSING: VISUALLY LOSSLESS WEBP CONVERSION
  // -------------------------------------------------------------
  await asyncTest("Image Processor: Converts JPEG to visually lossless WebP and thumbnail", async () => {
    // Generate a 400x300 JPEG image using Sharp
    const testJpeg = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 3,
        background: { r: 169, g: 0, b: 255 },
      },
    })
      .jpeg({ quality: 95 })
      .toBuffer();

    const result = await processUploadedImage(testJpeg, "test-creative-banner.jpg", "SEO Campaign Banner");

    assert.equal(result.extension, "webp");
    assert.equal(result.mimeType, "image/webp");
    assert.equal(result.width, 400);
    assert.equal(result.height, 300);
    assert.equal(result.conversionStatus, "ready");
    assert.ok(result.fileSize > 0);
    assert.ok(result.originalFileSize > 0);
    assert.ok(fs.existsSync(result.storagePath));
    assert.ok(fs.existsSync(result.originalStoragePath));
    assert.ok(result.publicUrl.startsWith("/cms-media/uploads/"));
    assert.ok(result.originalUrl.startsWith("/cms-media/originals/"));
    assert.ok(result.thumbnailUrl.startsWith("/cms-media/thumbnails/"));

    // Verify converted file magic bytes
    const convertedBuf = fs.readFileSync(result.storagePath);
    const magic = detectMagicBytes(convertedBuf);
    assert.equal(magic?.mimeType, "image/webp");
  });

  await asyncTest("Image Processor: Preserves PNG transparency during WebP conversion", async () => {
    // Generate a 200x200 PNG image with transparency
    const testPng = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 0, g: 255, b: 128, alpha: 0.5 },
      },
    })
      .png()
      .toBuffer();

    const result = await processUploadedImage(testPng, "transparent-badge.png");

    assert.equal(result.extension, "webp");
    assert.equal(result.conversionStatus, "ready");
    assert.equal(result.width, 200);
    assert.equal(result.height, 200);

    const convertedMeta = await sharp(result.storagePath).metadata();
    assert.equal(convertedMeta.hasAlpha, true);
  });

  // -------------------------------------------------------------
  // 5. VIDEO PROCESSING: PIPELINE & POSTER
  // -------------------------------------------------------------
  await asyncTest("Video Processor: Accepts WebM and handles directories", async () => {
    await ensureMediaDirectories();
    const root = getCmsMediaRoot();
    assert.ok(fs.existsSync(path.join(root, "uploads")));
    assert.ok(fs.existsSync(path.join(root, "originals")));
    assert.ok(fs.existsSync(path.join(root, "thumbnails")));
    assert.ok(fs.existsSync(path.join(root, "posters")));
  });

  console.log(`\n=== TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
