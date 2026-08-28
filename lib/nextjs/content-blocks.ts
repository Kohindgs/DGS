import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ContentBlock } from "@/lib/content/types";
import { normalizePath } from "./path";

const BLOCKS_PATH = path.join(process.cwd(), "data/wordpress/blocks/content-blocks.generated.json");

export type RouteBlocks = {
  wordpressId: number;
  wordpressType: string;
  path: string;
  blocks: ContentBlock[];
  visibleTextSha256: string;
};

let cache: Record<string, RouteBlocks> = {};

export async function loadContentBlocks(): Promise<Record<string, RouteBlocks>> {
  if (cache && Object.keys(cache).length > 0) return cache;
  const raw = JSON.parse(await readFile(BLOCKS_PATH, "utf8"));
  cache = raw.blocks;
  return cache;
}

export function getBlocksForPath(input: string): ContentBlock[] {
  return cache?.[normalizePath(input)]?.blocks || [];
}
