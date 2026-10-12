import { mkdir, access } from "node:fs/promises";
import { existsSync, constants } from "node:fs";
import { join, parse } from "node:path";
import { createHash, randomBytes } from "node:crypto";

export function getCmsMediaRoot(): string {
  if (process.env.NODE_ENV === "production") {
    const configured = process.env.DGS_CMS_MEDIA_DIR;
    if (!configured || !configured.trim()) {
      throw new Error(
        "FATAL PRODUCTION CMS ERROR: DGS_CMS_MEDIA_DIR is not configured in production environment! Silently storing media in release directory is forbidden."
      );
    }
    const clean = configured.trim();
    if (clean.includes("/releases/")) {
      throw new Error(
        `FATAL PRODUCTION CMS ERROR: DGS_CMS_MEDIA_DIR (${clean}) points to an atomic release directory! It must point to persistent shared storage (/home/u188101251/production-app/shared/cms-media).`
      );
    }
    return clean;
  }
  return process.env.DGS_CMS_MEDIA_DIR || join(process.cwd(), "data", "cms-media");
}

export type MediaHealthStatus = {
  configured: boolean;
  writable: boolean;
  readable: boolean;
  persistent: boolean;
  rootPath: string;
  error?: string;
};

export async function getCmsMediaHealth(): Promise<MediaHealthStatus> {
  const isProd = process.env.NODE_ENV === "production";
  const configured = Boolean(process.env.DGS_CMS_MEDIA_DIR && process.env.DGS_CMS_MEDIA_DIR.trim());
  let rootPath = "";
  try {
    rootPath = getCmsMediaRoot();
  } catch (err: any) {
    return {
      configured: false,
      writable: false,
      readable: false,
      persistent: false,
      rootPath: process.env.DGS_CMS_MEDIA_DIR || "",
      error: err?.message,
    };
  }

  const persistent = !rootPath.includes("/releases/");
  let readable = false;
  let writable = false;
  let error: string | undefined;

  try {
    await access(rootPath, constants.R_OK);
    readable = true;
  } catch (e: any) {
    error = `Not readable: ${e.message}`;
  }

  try {
    await access(rootPath, constants.W_OK);
    writable = true;
  } catch (e: any) {
    error = error ? `${error} | Not writable: ${e.message}` : `Not writable: ${e.message}`;
  }

  return {
    configured: isProd ? configured : true,
    writable,
    readable,
    persistent,
    rootPath,
    error,
  };
}

export const MEDIA_SUBDIRS = ["uploads", "originals", "thumbnails", "posters", "blogs"] as const;
export type MediaSubdir = typeof MEDIA_SUBDIRS[number];

export async function ensureMediaDirectories(): Promise<void> {
  const root = getCmsMediaRoot();
  for (const sub of MEDIA_SUBDIRS) {
    await mkdir(join(root, sub), { recursive: true });
  }
}

export function getStorageFilePath(subdir: MediaSubdir, filename: string): string {
  return join(getCmsMediaRoot(), subdir, filename);
}

export function getPublicMediaUrl(subdir: MediaSubdir, filename: string): string {
  return `/cms-media/${subdir}/${encodeURIComponent(filename)}`;
}

export function normalizeMediaStem(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "") // remove extension
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, "") // trim hyphens
    .slice(0, 100) || "asset";
}

export function normalizeMediaFilename(originalFilename: string, targetExt: string, customTitle?: string): string {
  const cleanExt = targetExt.startsWith(".") ? targetExt.slice(1).toLowerCase() : targetExt.toLowerCase();
  const stem = customTitle?.trim()
    ? normalizeMediaStem(customTitle)
    : normalizeMediaStem(originalFilename);
  return `${stem}.${cleanExt}`;
}

export function getUniqueStorageFilename(subdir: MediaSubdir, targetFilename: string): string {
  const dir = join(getCmsMediaRoot(), subdir);
  const parsed = parse(targetFilename);
  const stem = parsed.name;
  const ext = parsed.ext;

  if (!existsSync(join(dir, targetFilename))) {
    return targetFilename;
  }

  let counter = 2;
  while (counter < 1000) {
    const candidate = `${stem}-${counter}${ext}`;
    if (!existsSync(join(dir, candidate))) {
      return candidate;
    }
    counter++;
  }

  const randomSuffix = randomBytes(4).toString("hex");
  return `${stem}-${randomSuffix}${ext}`;
}

export function computeFileChecksum(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export const calculateBufferChecksum = computeFileChecksum;
