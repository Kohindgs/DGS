import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { getCmsMediaRoot } from "@/lib/cms/blog-media";
import { imageMatchesSlug, type BlogImportImage } from "@/lib/cms/blog-import";

const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4"]);

export type StoredBlogVideo = {
  filename: string;
  url: string;
  mimeType: "video/webm";
  bytes: number;
};

function safeStem(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "video";
}
async function runFfmpeg(inputPath: string, outputPath: string) {
  const executable = ffmpegPath;
  if (!executable) throw new Error("Bundled FFmpeg binary is unavailable");

  const args = [
    "-y",
    "-i", inputPath,
    "-map_metadata", "-1",
    "-c:v", "libvpx-vp9",
    "-crf", process.env.DGS_CMS_WEBM_CRF || "18",
    "-b:v", "0",
    "-deadline", "good",
    "-cpu-used", "2",
    "-row-mt", "1",
    "-pix_fmt", "yuv420p",
    "-c:a", "libopus",
    "-b:a", "160k",
    outputPath,
  ];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(executable, args, {
      windowsHide: true,
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => { stderr += String(chunk).slice(-4000); });
    child.once("error", reject);
    child.once("close", (code: number | null) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-1500)}`));
    });
  });
}

export async function storeBlogVideos(
  slug: string,
  videos: BlogImportImage[],
): Promise<StoredBlogVideo[]> {
  const matched = videos.filter((video) => imageMatchesSlug(video.filename, slug));
  if (!matched.length) return [];

  const destinationDir = join(getCmsMediaRoot(), "blogs", slug);
  const tempDir = join(tmpdir(), "dgs-cms-video");
  await Promise.all([
    mkdir(destinationDir, { recursive: true }),
    mkdir(tempDir, { recursive: true }),
  ]);

  const stored: StoredBlogVideo[] = [];
  for (const video of matched) {
    if (!ALLOWED_VIDEO_TYPES.has(video.mimeType) || video.buffer.length > MAX_VIDEO_BYTES) continue;

    const token = randomUUID();
    const sourcePath = join(tempDir, `${token}.mp4`);
    const filename = `${safeStem(video.filename)}.webm`;
    const tempOutputPath = join(tempDir, `${token}.webm`);
    const finalPath = join(destinationDir, filename);

    try {
      await writeFile(sourcePath, video.buffer);
      await runFfmpeg(sourcePath, tempOutputPath);
      const output = await readFile(tempOutputPath);
      await writeFile(finalPath, output);
      stored.push({
        filename,
        url: `/cms-media/blogs/${encodeURIComponent(slug)}/${encodeURIComponent(filename)}`,
        mimeType: "video/webm",
        bytes: output.length,
      });
    } finally {
      await Promise.all([
        rm(sourcePath, { force: true }),
        rm(tempOutputPath, { force: true }),
      ]);
    }
  }

  return stored;
}

export function injectInlineBlogVideos(bodyHtml: string, videos: StoredBlogVideo[]) {
  if (!videos.length) return bodyHtml;
  const markup = videos.map((video) =>
    `<figure class="dgs-blog-inline-video"><video controls playsinline preload="metadata"><source src="${video.url}" type="video/webm" /></video></figure>`
  ).join("");
  return `${bodyHtml}${markup}`;
}
