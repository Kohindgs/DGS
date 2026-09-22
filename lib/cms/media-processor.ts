import { writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import sharp, { type Metadata } from "sharp";
import ffmpegPath from "ffmpeg-static";
import {
  ensureMediaDirectories,
  getStorageFilePath,
  getPublicMediaUrl,
  normalizeMediaFilename,
  getUniqueStorageFilename,
} from "./media-storage.ts";

export type ProcessedImageResult = {
  filename: string;
  originalFilename: string;
  storagePath: string;
  publicUrl: string;
  originalStoragePath: string;
  originalUrl: string;
  thumbnailUrl: string;
  mimeType: string;
  extension: string;
  width: number;
  height: number;
  fileSize: number;
  originalFileSize: number;
  optimisedFileSize: number;
  conversionStatus: "ready" | "failed" | "unconverted";
  conversionError?: string;
};

export type ProcessedVideoResult = {
  filename: string;
  originalFilename: string;
  storagePath: string;
  publicUrl: string;
  originalStoragePath: string;
  originalUrl: string;
  posterUrl: string;
  mimeType: string;
  extension: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  fileSize: number;
  originalFileSize: number;
  optimisedFileSize?: number;
  conversionStatus: "ready" | "failed" | "unconverted";
  conversionError?: string;
};

export async function processUploadedImage(
  buffer: Buffer,
  originalFilename: string,
  customTitle?: string
): Promise<ProcessedImageResult> {
  await ensureMediaDirectories();

  const originalFileSize = buffer.length;
  const originalExt = originalFilename.split(".").pop()?.toLowerCase() || "jpg";
  const shouldConvertToWebP = originalExt === "jpg" || originalExt === "jpeg" || originalExt === "png";

  // 1. Save original source file in originals/
  const originalStoreName = getUniqueStorageFilename("originals", originalFilename);
  const originalStoragePath = getStorageFilePath("originals", originalStoreName);
  await writeFile(originalStoragePath, buffer);
  const originalUrl = getPublicMediaUrl("originals", originalStoreName);

  // 2. Read image metadata
  let metadata: Metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch (err) {
    throw new Error(`Failed to parse image metadata: ${(err as Error).message}`);
  }

  const width = metadata.width || 0;
  const height = metadata.height || 0;

  // 3. Generate 320px WebP thumbnail
  let thumbnailUrl = "";
  try {
    const thumbTargetName = normalizeMediaFilename(originalFilename, "webp", customTitle);
    const thumbStoreName = getUniqueStorageFilename("thumbnails", thumbTargetName);
    const thumbPath = getStorageFilePath("thumbnails", thumbStoreName);
    const thumbBuf = await sharp(buffer)
      .rotate()
      .resize({ width: 320, height: 240, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
    await writeFile(thumbPath, thumbBuf);
    thumbnailUrl = getPublicMediaUrl("thumbnails", thumbStoreName);
  } catch (err) {
    console.warn("Thumbnail generation failed:", err);
  }

  // 4. Convert to WebP or retain
  if (shouldConvertToWebP) {
    try {
      const targetName = normalizeMediaFilename(originalFilename, "webp", customTitle);
      const storeName = getUniqueStorageFilename("uploads", targetName);
      const storagePath = getStorageFilePath("uploads", storeName);

      // Visually lossless WebP with high quality preservation
      const webpBuffer = await sharp(buffer)
        .rotate()
        .webp({ quality: 90, nearLossless: true, smartSubsample: true, effort: 4 })
        .toBuffer();

      await writeFile(storagePath, webpBuffer);
      const publicUrl = getPublicMediaUrl("uploads", storeName);
      const optimisedFileSize = webpBuffer.length;

      return {
        filename: storeName,
        originalFilename,
        storagePath,
        publicUrl,
        originalStoragePath,
        originalUrl,
        thumbnailUrl: thumbnailUrl || publicUrl,
        mimeType: "image/webp",
        extension: "webp",
        width,
        height,
        fileSize: optimisedFileSize,
        originalFileSize,
        optimisedFileSize,
        conversionStatus: "ready",
      };
    } catch (err) {
      console.error("WebP conversion failed, falling back to original format:", err);
      // Fallback: save original format into uploads/
      const storeName = getUniqueStorageFilename("uploads", originalFilename);
      const storagePath = getStorageFilePath("uploads", storeName);
      await writeFile(storagePath, buffer);
      const publicUrl = getPublicMediaUrl("uploads", storeName);

      return {
        filename: storeName,
        originalFilename,
        storagePath,
        publicUrl,
        originalStoragePath,
        originalUrl,
        thumbnailUrl: thumbnailUrl || publicUrl,
        mimeType: metadata.format ? `image/${metadata.format}` : "image/jpeg",
        extension: originalExt,
        width,
        height,
        fileSize: originalFileSize,
        originalFileSize,
        optimisedFileSize: originalFileSize,
        conversionStatus: "failed",
        conversionError: (err as Error).message,
      };
    }
  }

  // Already WebP or GIF
  const storeName = getUniqueStorageFilename("uploads", originalFilename);
  const storagePath = getStorageFilePath("uploads", storeName);
  await writeFile(storagePath, buffer);
  const publicUrl = getPublicMediaUrl("uploads", storeName);

  return {
    filename: storeName,
    originalFilename,
    storagePath,
    publicUrl,
    originalStoragePath,
    originalUrl,
    thumbnailUrl: thumbnailUrl || publicUrl,
    mimeType: originalExt === "webp" ? "image/webp" : "image/gif",
    extension: originalExt,
    width,
    height,
    fileSize: originalFileSize,
    originalFileSize,
    optimisedFileSize: originalFileSize,
    conversionStatus: "unconverted",
  };
}

// Inspect video metadata using FFmpeg
async function probeVideo(videoPath: string): Promise<{ duration?: number; width?: number; height?: number }> {
  const executable = ffmpegPath;
  if (!executable) return {};

  return new Promise((resolve) => {
    const child = spawn(executable, ["-i", videoPath], { windowsHide: true });
    let output = "";
    child.stderr.on("data", (chunk) => { output += String(chunk); });
    child.on("close", () => {
      let duration: number | undefined;
      let width: number | undefined;
      let height: number | undefined;

      const durMatch = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      if (durMatch) {
        const hours = Number(durMatch[1]);
        const mins = Number(durMatch[2]);
        const secs = Number(durMatch[3]);
        duration = Number((hours * 3600 + mins * 60 + secs).toFixed(2));
      }

      const resMatch = output.match(/Stream #\d+:\d+.*Video:.* (\d{2,5})x(\d{2,5})/);
      if (resMatch) {
        width = Number(resMatch[1]);
        height = Number(resMatch[2]);
      }

      resolve({ duration, width, height });
    });
    child.on("error", () => resolve({}));
  });
}

// Generate poster frame from video
async function generateVideoPoster(videoPath: string, posterPath: string): Promise<boolean> {
  const executable = ffmpegPath;
  if (!executable) return false;

  return new Promise((resolve) => {
    const child = spawn(
      executable,
      [
        "-y",
        "-ss", "00:00:01",
        "-i", videoPath,
        "-frames:v", "1",
        "-vf", "scale=640:-1",
        "-q:v", "3",
        posterPath,
      ],
      { windowsHide: true }
    );
    child.on("close", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

// Convert MP4 to WebM
async function convertMp4ToWebm(inputPath: string, outputPath: string): Promise<{ success: boolean; error?: string }> {
  const executable = ffmpegPath;
  if (!executable) return { success: false, error: "FFmpeg executable unavailable" };

  return new Promise((resolve) => {
    const child = spawn(
      executable,
      [
        "-y",
        "-i", inputPath,
        "-map_metadata", "-1",
        "-c:v", "libvpx-vp9",
        "-crf", "24",
        "-b:v", "0",
        "-deadline", "good",
        "-cpu-used", "2",
        "-row-mt", "1",
        "-pix_fmt", "yuv420p",
        "-c:a", "libopus",
        "-b:a", "128k",
        outputPath,
      ],
      { windowsHide: true }
    );
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk).slice(-2000); });
    child.on("close", (code) => {
      if (code === 0) resolve({ success: true });
      else resolve({ success: false, error: `FFmpeg exited with code ${code}: ${stderr.slice(-500)}` });
    });
    child.on("error", (err) => resolve({ success: false, error: err.message }));
  });
}

export async function processUploadedVideo(
  buffer: Buffer,
  originalFilename: string,
  customTitle?: string
): Promise<ProcessedVideoResult> {
  await ensureMediaDirectories();

  const originalFileSize = buffer.length;
  const originalExt = originalFilename.split(".").pop()?.toLowerCase() || "mp4";

  // 1. Save original source file in originals/
  const originalStoreName = getUniqueStorageFilename("originals", originalFilename);
  const originalStoragePath = getStorageFilePath("originals", originalStoreName);
  await writeFile(originalStoragePath, buffer);
  const originalUrl = getPublicMediaUrl("originals", originalStoreName);

  // 2. Probe video metadata
  const probe = await probeVideo(originalStoragePath);

  // 3. Generate poster frame in posters/
  const posterTargetName = normalizeMediaFilename(originalFilename, "jpg", customTitle);
  const posterStoreName = getUniqueStorageFilename("posters", posterTargetName);
  const posterPath = getStorageFilePath("posters", posterStoreName);
  const posterGenerated = await generateVideoPoster(originalStoragePath, posterPath);
  const posterUrl = posterGenerated ? getPublicMediaUrl("posters", posterStoreName) : "";

  // 4. Convert MP4 -> WebM if MP4
  if (originalExt === "mp4") {
    const tempDir = join(tmpdir(), "dgs-cms-video");
    const token = randomUUID();
    const tempWebmPath = join(tempDir, `${token}.webm`);

    try {
      const { mkdir } = await import("node:fs/promises");
      await mkdir(tempDir, { recursive: true });

      const convResult = await convertMp4ToWebm(originalStoragePath, tempWebmPath);

      if (convResult.success) {
        const webmTargetName = normalizeMediaFilename(originalFilename, "webm", customTitle);
        const webmStoreName = getUniqueStorageFilename("uploads", webmTargetName);
        const webmFinalPath = getStorageFilePath("uploads", webmStoreName);
        const webmBuf = await readFile(tempWebmPath);
        await writeFile(webmFinalPath, webmBuf);
        const publicUrl = getPublicMediaUrl("uploads", webmStoreName);

        return {
          filename: webmStoreName,
          originalFilename,
          storagePath: webmFinalPath,
          publicUrl,
          originalStoragePath,
          originalUrl,
          posterUrl,
          mimeType: "video/webm",
          extension: "webm",
          width: probe.width,
          height: probe.height,
          durationSeconds: probe.duration,
          fileSize: webmBuf.length,
          originalFileSize,
          optimisedFileSize: webmBuf.length,
          conversionStatus: "ready",
        };
      } else {
        console.warn("WebM conversion failed, retaining original MP4:", convResult.error);
        const storeName = getUniqueStorageFilename("uploads", originalFilename);
        const storagePath = getStorageFilePath("uploads", storeName);
        await writeFile(storagePath, buffer);
        const publicUrl = getPublicMediaUrl("uploads", storeName);

        return {
          filename: storeName,
          originalFilename,
          storagePath,
          publicUrl,
          originalStoragePath,
          originalUrl,
          posterUrl,
          mimeType: "video/mp4",
          extension: "mp4",
          width: probe.width,
          height: probe.height,
          durationSeconds: probe.duration,
          fileSize: originalFileSize,
          originalFileSize,
          optimisedFileSize: originalFileSize,
          conversionStatus: "failed",
          conversionError: convResult.error,
        };
      }
    } finally {
      await rm(tempWebmPath, { force: true }).catch(() => {});
    }
  }

  // Already WebM
  const storeName = getUniqueStorageFilename("uploads", originalFilename);
  const storagePath = getStorageFilePath("uploads", storeName);
  await writeFile(storagePath, buffer);
  const publicUrl = getPublicMediaUrl("uploads", storeName);

  return {
    filename: storeName,
    originalFilename,
    storagePath,
    publicUrl,
    originalStoragePath,
    originalUrl,
    posterUrl,
    mimeType: "video/webm",
    extension: "webm",
    width: probe.width,
    height: probe.height,
    durationSeconds: probe.duration,
    fileSize: originalFileSize,
    originalFileSize,
    optimisedFileSize: originalFileSize,
    conversionStatus: "unconverted",
  };
}
