import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { imageMatchesSlug, type BlogImportImage } from "@/lib/cms/blog-import";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

function safeStem(name: string) {
  return name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
}

function buildAltText(title: string, filename: string, featured: boolean, index: number) {
  const role = featured ? "featured image" : `supporting image ${index + 1}`;
  const hint = safeStem(filename).replace(/-/g, " ").replace(/\b(featured|hero|cover|image|img|\d+)\b/g, " ").replace(/\s+/g, " ").trim();
  return hint ? `${title} - ${hint}`.slice(0, 160) : `${title} - ${role}`.slice(0, 160);
}

export function getCmsMediaRoot() {
  return process.env.DGS_CMS_MEDIA_DIR || join(process.cwd(), "data", "cms-media");
}
export type StoredBlogImage = {
  filename: string;
  url: string;
  mimeType: "image/webp";
  featured: boolean;
  altText: string;
  width?: number;
  height?: number;
  bytes: number;
};

export async function storeBlogImages(slug: string, title: string, images: BlogImportImage[]) {
  const matched = images.filter((img) => imageMatchesSlug(img.filename, slug));
  const dir = join(getCmsMediaRoot(), "blogs", slug);
  await mkdir(dir, { recursive: true });

  const preferred = matched.find((img) => /-(featured|hero|cover)\.[^.]+$/i.test(img.filename)) || matched[0];
  const stored: StoredBlogImage[] = [];

  for (const [index, image] of matched.entries()) {
    if (!ALLOWED.has(image.mimeType) || image.buffer.length > MAX_IMAGE_BYTES) continue;
    const featured = image === preferred;
    const filename = `${safeStem(image.filename)}.webp`;
    const converted = sharp(image.buffer)
      .rotate()
      .resize({ width: featured ? 1600 : 1400, withoutEnlargement: true })
      .webp({ quality: 92, nearLossless: true, smartSubsample: true, effort: 5 });
    const metadata = await converted.metadata();
    const output = await converted.toBuffer();
    await writeFile(join(dir, filename), output);
    stored.push({
      filename,
      url: `/cms-media/blogs/${encodeURIComponent(slug)}/${encodeURIComponent(filename)}`,
      mimeType: "image/webp",
      featured,
      altText: buildAltText(title, image.filename, featured, index),
      width: metadata.width,
      height: metadata.height,
      bytes: output.length,
    });
  }

  return stored;
}
export async function removeStoredBlogImages(slug: string) {
  const { rm } = await import("node:fs/promises");
  await rm(join(getCmsMediaRoot(), "blogs", slug), { recursive: true, force: true });
}
export function injectInlineBlogImages(bodyHtml: string, images: StoredBlogImage[]) {
  const inline = images.filter((image) => !image.featured);
  if (!inline.length) return bodyHtml;
  let index = 0;
  const output = bodyHtml.replace(/(<\/h2>)/gi, (match) => {
    const image = inline[index++];
    if (!image) return match;
    const figure = `<figure class="dgs-blog-inline-image"><img src="${image.url}" alt="${image.altText.replace(/"/g, "&quot;")}" width="${image.width || 1400}" height="${image.height || 788}" loading="lazy" decoding="async" /></figure>`;
    return `${match}${figure}`;
  });
  if (index < inline.length) {
    return `${output}${inline.slice(index).map((image) => `<figure class="dgs-blog-inline-image"><img src="${image.url}" alt="${image.altText.replace(/"/g, "&quot;")}" width="${image.width || 1400}" height="${image.height || 788}" loading="lazy" decoding="async" /></figure>`).join("")}`;
  }
  return output;
}
