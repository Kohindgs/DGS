import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { WpMirrorContent } from "./mirror-types";

const CONTENT_PATH = join(
  process.cwd(),
  "data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json",
);

let cached: WpMirrorContent | null = null;

export async function loadHomepageMirrorContent(): Promise<WpMirrorContent> {
  if (cached) return cached;
  const raw = await readFile(CONTENT_PATH, "utf8");
  cached = JSON.parse(raw) as WpMirrorContent;
  return cached;
}
