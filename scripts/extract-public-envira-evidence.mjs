import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "data/wordpress/raw");
const OUT_DIR = path.join(ROOT, "data/portfolio/evidence");
const SITE = "https://www.dgeniussolutions.com";

const sourceGroups = await Promise.all([
  readJsonIfExists(path.join(RAW_DIR, "pages.json")),
  readJsonIfExists(path.join(RAW_DIR, "services.json")),
  readJsonIfExists(path.join(RAW_DIR, "posts.json")),
]);
const records = sourceGroups.flat();

function decode(value = "") {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function stripTags(value = "") {
  return decode(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decode(match[1].trim()) : "";
}

function firstAttr(tag, names) {
  for (const name of names) {
    const value = attr(tag, name);
    if (value) return value;
  }
  return "";
}

function absoluteUrl(value) {
  if (!value) return "";
  try {
    return new URL(value, SITE).href;
  } catch {
    return value;
  }
}

function inferGalleryIds(html = "") {
  const ids = new Set();
  const patterns = [
    /envira-gallery(?:-wrap)?-(\d+)/gi,
    /data-(?:envira-)?gallery-id=["'](\d+)["']/gi,
    /envira_gallery(?:_id)?["'=:\s]+(\d+)/gi,
    /\[envira-gallery[^\]]*id=["']?(\d+)/gi,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html))) ids.add(Number(match[1]));
  }
  return [...ids].filter(Number.isFinite).sort((a, b) => a - b);
}

function candidateEnviraAnchors(html = "") {
  const items = [];
  const regex = /<a\b[^>]*(?:envira|data-envira|envira-gallery)[^>]*>[\s\S]*?<\/a>/gi;
  let match;
  while ((match = regex.exec(html))) items.push(match[0]);
  return items;
}

function galleryIdFromTag(tag = "", fallbackIds = []) {
  const explicit = firstAttr(tag, ["data-gallery-id", "data-envira-gallery-id", "data-envira-id"]);
  if (/^\d+$/.test(explicit)) return Number(explicit);
  const match = tag.match(/envira-gallery(?:-wrap)?-(\d+)/i);
  if (match) return Number(match[1]);
  return fallbackIds.length === 1 ? fallbackIds[0] : null;
}

function parseEnviraItem(anchorTag, fallbackGalleryIds) {
  const imgTag = anchorTag.match(/<img\b[^>]*>/i)?.[0] || "";
  const galleryId = galleryIdFromTag(anchorTag, fallbackGalleryIds);
  const href = absoluteUrl(firstAttr(anchorTag, ["href", "data-envirabox-href", "data-src"]));
  const thumbnail = absoluteUrl(firstAttr(imgTag, ["src", "data-src", "data-lazy-src", "data-envira-src"]));
  const title = stripTags(
    firstAttr(anchorTag, ["data-title", "title", "data-caption"]) ||
      firstAttr(imgTag, ["title", "data-title"]) ||
      "",
  );
  const alt = stripTags(attr(imgTag, "alt"));
  const width = Number.parseInt(attr(imgTag, "width"), 10) || null;
  const height = Number.parseInt(attr(imgTag, "height"), 10) || null;
  const itemIdRaw = firstAttr(anchorTag, ["data-envira-item-id", "data-item-id", "data-image-id", "id"]);
  const itemIdMatch = itemIdRaw.match(/(\d+)/);
  const sourceMediaId = itemIdMatch ? Number(itemIdMatch[1]) : null;

  if (!href && !thumbnail) return null;

  return {
    galleryId,
    sourceMediaId,
    title,
    alt,
    thumbnail,
    media: href || thumbnail,
    width,
    height,
    classification: "UNCLASSIFIED_AUTH_REQUIRED",
  };
}

const evidenceByGallery = new Map();
const occurrences = [];

for (const record of records) {
  const html = record.content?.rendered || "";
  if (!/envira/i.test(html)) continue;

  const galleryIds = inferGalleryIds(html);
  const anchors = candidateEnviraAnchors(html);
  const pagePath = (() => {
    try {
      return new URL(record.link).pathname;
    } catch {
      return null;
    }
  })();

  occurrences.push({
    wordpressId: record.id,
    wordpressType: record.type || null,
    path: pagePath,
    title: stripTags(record.title?.rendered || ""),
    galleryIds,
    candidateItemCount: anchors.length,
  });

  for (const galleryId of galleryIds) {
    if (!evidenceByGallery.has(galleryId)) {
      evidenceByGallery.set(galleryId, {
        galleryId,
        sources: [],
        items: [],
        classification: "UNCLASSIFIED_AUTH_REQUIRED",
      });
    }
    const gallery = evidenceByGallery.get(galleryId);
    if (!gallery.sources.some((source) => source.wordpressId === record.id)) {
      gallery.sources.push({ wordpressId: record.id, wordpressType: record.type || null, path: pagePath });
    }
  }

  for (const anchor of anchors) {
    const item = parseEnviraItem(anchor, galleryIds);
    if (!item?.galleryId) continue;
    if (!evidenceByGallery.has(item.galleryId)) {
      evidenceByGallery.set(item.galleryId, {
        galleryId: item.galleryId,
        sources: [{ wordpressId: record.id, wordpressType: record.type || null, path: pagePath }],
        items: [],
        classification: "UNCLASSIFIED_AUTH_REQUIRED",
      });
    }
    const gallery = evidenceByGallery.get(item.galleryId);
    const key = `${item.media}|${item.thumbnail}|${item.title}`;
    if (!gallery.items.some((existing) => `${existing.media}|${existing.thumbnail}|${existing.title}` === key)) {
      gallery.items.push(item);
    }
  }
}

const galleries = [...evidenceByGallery.values()].sort((a, b) => a.galleryId - b.galleryId);
for (const gallery of galleries) {
  gallery.items = gallery.items.map((item, index) => ({ ...item, sourceOrder: index }));
}

const summary = {
  generatedAt: new Date().toISOString(),
  source: "Public WordPress content.rendered",
  warning: "Public Envira markup is evidence only. Client/category/project-type classification requires authenticated Envira/WordPress data or explicit review. Do not invent metadata.",
  totals: {
    sourceRecordsWithEnvira: occurrences.length,
    galleries: galleries.length,
    items: galleries.reduce((sum, gallery) => sum + gallery.items.length, 0),
    itemsMissingAlt: galleries.reduce((sum, gallery) => sum + gallery.items.filter((item) => !item.alt).length, 0),
    itemsMissingTitle: galleries.reduce((sum, gallery) => sum + gallery.items.filter((item) => !item.title).length, 0),
    unclassifiedItems: galleries.reduce((sum, gallery) => sum + gallery.items.filter((item) => item.classification === "UNCLASSIFIED_AUTH_REQUIRED").length, 0),
  },
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "summary.generated.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(path.join(OUT_DIR, "occurrences.generated.json"), `${JSON.stringify(occurrences, null, 2)}\n`, "utf8");
await writeFile(path.join(OUT_DIR, "galleries.generated.json"), `${JSON.stringify(galleries, null, 2)}\n`, "utf8");

console.log(JSON.stringify(summary, null, 2));

async function readJsonIfExists(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}
