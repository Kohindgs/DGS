#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const sourcePath = join(ROOT, "data/portfolio/homepage-gallery.json");
const outPath = join(ROOT, "data/portfolio/alt-review.json");

const source = JSON.parse(readFileSync(sourcePath, "utf8"));
const items = Array.isArray(source) ? source : source.items ?? [];

const review = items.map((item, index) => ({
  itemId: String(item.id ?? `portfolio-${index + 1}`),
  mediaUrl: item.media ?? item.mediaUrl ?? item.src ?? item.url ?? "",
  thumbnailUrl: item.thumbnail ?? item.thumbnailUrl ?? item.thumb ?? item.media ?? "",
  currentTitle: item.title ?? item.name ?? "",
  currentAlt: item.alt ?? item.title ?? "",
  status: "ALT_REVIEW_REQUIRED",
}));

writeFileSync(outPath, JSON.stringify(review, null, 2) + "\n");
console.log(`Wrote ${review.length} alt review entries to data/portfolio/alt-review.json`);
