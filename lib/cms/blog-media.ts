import "server-only";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";
import { imageMatchesSlug, type BlogImportImage } from "@/lib/cms/blog-import";

const IMAGE_ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_ALLOWED = new Set(["video/mp4"]);
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 250 * 1024 * 1024;

function safeStem(name: string) {
  return name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "media";
}

function buildAltText(title: string, filename: string, featured: boolean, index: number) {
  const role = featured ? "featured image" : `supporting media ${index + 1}`;
  const hint = safeStem(filename).replace(/-/g, " ").replace(/\b(featured|hero|cover|image|img|video|vid|\d+)\b/g, " ").replace(/\s+/g, " ").trim();
  return hint ? `${title} - ${hint}`.slice(0, 160) : `${title} - ${role}`.slice(0, 160);
}

export function getCmsMediaRoot() {
  return process.env.DGS_CMS_MEDIA_DIR || join(process.cwd(), "data", "cms-media");
}
export type StoredBlogImage = {
  filename: string;
  url: string;
  mimeType: "image/webp" | "video/webm";
  featured: boolean;
  altText: string;
  width?: number;
  height?: number;
  bytes: number;
};

async function convertMp4ToWebm(input: Buffer) {
  const executable = ffmpegPath;
  if (!executable) throw new Error("Bundled FFmpeg is unavailable");
  const workDir = await mkdtemp(join(tmpdir(), "dgs-cms-video-"));
  const source = join(workDir, "source.mp4");
  const output = join(workDir, "output.webm");
  try {
    await writeFile(source, input);
    await new Promise<void>((resolve, reject) => {
      const child = spawn(executable, [
        "-y", "-i", source,
        "-map_metadata", "0",
        "-c:v", "libvpx-vp9", "-crf", "18", "-b:v", "0",
        "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
        "-c:a", "libopus", "-b:a", "160k",
        output,
      ], { windowsHide: true });
      let stderr = "";
      child.stderr.on("data", (chunk: Buffer) => { stderr = (stderr + String(chunk)).slice(-8000); });
      child.on("error", reject);
      child.on("close", (code: number | null) => code === 0 ? resolve() : reject(new Error(`FFmpeg WebM conversion failed (${code}): ${stderr}`)));
    });
    return await readFile(output);
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

export async function storeBlogImages(slug: string, title: string, media: BlogImportImage[]) {
  const matched = media.filter((item) => imageMatchesSlug(item.filename, slug));
  const dir = join(getCmsMediaRoot(), "blogs", slug);
  await mkdir(dir, { recursive: true });

  const imageCandidates = matched.filter((item) => IMAGE_ALLOWED.has(item.mimeType));
  const preferred = imageCandidates.find((item) => /-(featured|hero|cover)\.[^.]+$/i.test(item.filename)) || imageCandidates[0];
  const stored: StoredBlogImage[] = [];

  for (const [index, item] of matched.entries()) {
    if (IMAGE_ALLOWED.has(item.mimeType)) {
      if (item.buffer.length > MAX_IMAGE_BYTES) continue;
      const featured = item === preferred;
      const filename = `${safeStem(item.filename)}.webp`;
      const converted = sharp(item.buffer).rotate().resize({ width: featured ? 2000 : 1800, withoutEnlargement: true }).webp({ quality: 92, effort: 5, smartSubsample: true });
      const metadata = await converted.metadata();
      const output = await converted.toBuffer();
      await writeFile(join(dir, filename), output);
      stored.push({
        filename,
        url: `/cms-media/blogs/${encodeURIComponent(slug)}/${encodeURIComponent(filename)}`,
        mimeType: "image/webp",
        featured,
        altText: buildAltText(title, item.filename, featured, index),
        width: metadata.width,
        height: metadata.height,
        bytes: output.length,
      });
      continue;
    }

    if (VIDEO_ALLOWED.has(item.mimeType) && item.buffer.length <= MAX_VIDEO_BYTES) {
      const filename = `${safeStem(item.filename)}.webm`;
      const output = await convertMp4ToWebm(item.buffer);
      await writeFile(join(dir, filename), output);
      stored.push({
        filename,
        url: `/cms-media/blogs/${encodeURIComponent(slug)}/${encodeURIComponent(filename)}`,
        mimeType: "video/webm",
        featured: false,
        altText: buildAltText(title, item.filename, false, index),
        bytes: output.length,
      });
    }
  }

  return stored;
}
export async function removeStoredBlogImages(slug: string) {
  await rm(join(getCmsMediaRoot(), "blogs", slug), { recursive: true, force: true });
}

function renderInlineMedia(media: StoredBlogImage) {
  if (media.mimeType === "video/webm") {
    return `<figure class="dgs-blog-inline-video"><video controls playsinline preload="metadata" aria-label="${media.altText.replace(/"/g, "&quot;")}"><source src="${media.url}" type="video/webm" /></video></figure>`;
  }
  return `<figure class="dgs-blog-inline-image"><img src="${media.url}" alt="${media.altText.replace(/"/g, "&quot;")}" width="${media.width || 1400}" height="${media.height || 788}" loading="lazy" decoding="async" /></figure>`;
}

export function injectInlineBlogImages(bodyHtml: string, media: StoredBlogImage[]) {
  const inline = media.filter((item) => !item.featured);
  if (!inline.length) return bodyHtml;
  let index = 0;
  const output = bodyHtml.replace(/(<\/h2>)/gi, (match) => {
    const item = inline[index++];
    return item ? `${match}${renderInlineMedia(item)}` : match;
  });
  if (index < inline.length) {
    return `${output}${inline.slice(index).map(renderInlineMedia).join("")}`;
  }
  return output;
}
