#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const sourcePath = join(ROOT, "data/portfolio/homepage-gallery.json");
const csvPath = join(ROOT, "data/portfolio/portfolio-review.csv");
const htmlPath = join(ROOT, "tooling/portfolio-review/contact-sheet.html");

const source = JSON.parse(readFileSync(sourcePath, "utf8"));
const items = Array.isArray(source) ? source : source.items ?? [];
const galleryId = source.galleryId ?? "";

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

const header = [
  "itemId",
  "sourceGalleryId",
  "thumbnail",
  "media",
  "currentTitle",
  "currentAlt",
  "approvedTitle",
  "approvedAlt",
  "approvedWorkSystem",
  "approvedCategory",
  "reviewStatus",
].join(",");

const rows = items.map((item, index) => {
  const itemId = String(item.id ?? `portfolio-${index + 1}`);
  return [
    itemId,
    galleryId,
    item.thumbnail ?? "",
    item.media ?? "",
    item.title ?? "",
    item.alt ?? "",
    "",
    "",
    "",
    "",
    "PENDING_REVIEW",
  ]
    .map(csvEscape)
    .join(",");
});

mkdirSync(join(ROOT, "tooling/portfolio-review"), { recursive: true });
writeFileSync(csvPath, `${header}\n${rows.join("\n")}\n`);

const htmlRows = items
  .map((item, index) => {
    const itemId = String(item.id ?? `portfolio-${index + 1}`);
    const thumb = item.thumbnail ?? item.media ?? "";
    const title = item.title ?? "";
    const alt = item.alt ?? "";
    return `
      <article class="card">
        <img src="${thumb}" alt="${alt.replace(/"/g, "&quot;")}" loading="lazy" width="320" height="180" />
        <dl>
          <div><dt>itemId</dt><dd>${itemId}</dd></div>
          <div><dt>currentTitle</dt><dd>${title}</dd></div>
          <div><dt>currentAlt</dt><dd>${alt}</dd></div>
          <div><dt>reviewStatus</dt><dd>PENDING_REVIEW</dd></div>
        </dl>
      </article>`;
  })
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Portfolio Review Contact Sheet (Internal)</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #111; color: #eee; margin: 0; padding: 24px; }
    h1 { font-size: 1.25rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .card { border: 1px solid #333; border-radius: 8px; overflow: hidden; background: #1a1a1a; }
    .card img { width: 100%; aspect-ratio: 16/10; object-fit: cover; display: block; background: #000; }
    dl { margin: 0; padding: 12px; font-size: 0.85rem; }
    dt { color: #888; }
    dd { margin: 0 0 8px; word-break: break-word; }
  </style>
</head>
<body>
  <h1>Portfolio Review Contact Sheet (${items.length} items)</h1>
  <p>Internal tooling only. Not for production deployment or indexing.</p>
  <div class="grid">${htmlRows}</div>
</body>
</html>
`;

writeFileSync(htmlPath, html);
console.log(`Wrote ${items.length} rows to data/portfolio/portfolio-review.csv`);
console.log(`Wrote contact sheet to tooling/portfolio-review/contact-sheet.html`);
