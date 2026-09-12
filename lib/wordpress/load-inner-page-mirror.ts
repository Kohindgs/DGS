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
    parsed.body.includes('id="ai-avatar-gallery"')
  ) {
    const fragment = await loadOptionalFragment("shirdi-avatar-gallery.html");
    if (fragment) {
      const start = parsed.body.indexOf('<div id="ai-avatar-gallery"');
      const end = parsed.body.indexOf('<div id="lightbox"', start);
      if (start !== -1 && end !== -1) {
        parsed.body = `${parsed.body.slice(0, start)}<div id="ai-avatar-gallery" class="ai-avatar-gallery">${fragment}</div>${parsed.body.slice(end)}`;
      }
    }
  }

  cache.set(routePath, parsed);
  return parsed;
}
