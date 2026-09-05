import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { InnerPageMirrorContent } from "./inner-mirror-types";
import innerMirrorIndex from "@/data/wordpress/mirrors/index.json";

const PAGES_DIR = join(process.cwd(), "data/wordpress/mirrors/pages");
const cache = new Map<string, InnerPageMirrorContent>();

export function pathToMirrorFilename(routePath: string): string {
  const fromIndex = (innerMirrorIndex as { pages?: Record<string, string> }).pages?.[routePath];
  if (fromIndex) return fromIndex;
  const trimmed = routePath.replace(/^\/+|\/+$/g, "").replaceAll("/", "__");
  return `${trimmed || "root"}.json`;
}

export function hasInnerPageMirror(routePath: string): boolean {
  if (routePath === "/") return false;
  return Boolean((innerMirrorIndex as { pages?: Record<string, string> }).pages?.[routePath]);
}

const FRAGMENTS_DIR = join(process.cwd(), "data/wordpress/fragments");

async function loadOptionalFragment(filename: string): Promise<string> {
  try {
    return await readFile(join(FRAGMENTS_DIR, filename), "utf8");
  } catch {
    return "";
  }
}

export async function loadInnerPageMirror(routePath: string): Promise<InnerPageMirrorContent> {
  const cached = cache.get(routePath);
  if (cached) return cached;
  const filename = pathToMirrorFilename(routePath);
  const raw = await readFile(join(PAGES_DIR, filename), "utf8");
  const parsed = JSON.parse(raw) as InnerPageMirrorContent;

  if (
    routePath === "/services/shirdi-se-sai-tak-case-study/" &&
    parsed.body &&
    parsed.body.includes('<div id="ai-avatar-gallery" class="ai-avatar-gallery"></div>')
  ) {
    const fragment = await loadOptionalFragment("shirdi-avatar-gallery.html");
    if (fragment) {
      parsed.body = parsed.body.replace(
        '<div id="ai-avatar-gallery" class="ai-avatar-gallery"></div>',
        `<div id="ai-avatar-gallery" class="ai-avatar-gallery">${fragment}</div>`,
      );
    }
  }

  cache.set(routePath, parsed);
  return parsed;
}
