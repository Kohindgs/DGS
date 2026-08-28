import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const EVIDENCE_FILE = path.join(ROOT, "data/portfolio/evidence/galleries.generated.json");
const APPROVED_FILE = path.join(ROOT, "data/portfolio/collections.approved.json");
const SYSTEMS_FILE = path.join(ROOT, "data/work/systems.approved.json");

const errors = [];
const warnings = [];
const [evidence, approved, systems] = await Promise.all([
  readJson(EVIDENCE_FILE, "Envira public evidence"),
  readJson(APPROVED_FILE, "approved portfolio registry"),
  readJson(SYSTEMS_FILE, "work-system registry"),
]);

if (errors.length === 0) {
  const validSystems = new Set((systems.systems || []).map((item) => item.id));
  const evidenceKeys = new Set();
  for (const gallery of evidence) {
    for (const item of gallery.items || []) {
      evidenceKeys.add(`${gallery.galleryId}|${item.media}`);
      if (!item.media) errors.push(`Gallery ${gallery.galleryId}: evidence item has no media URL`);
      if (!item.title) warnings.push(`Gallery ${gallery.galleryId}: evidence item is missing a title`);
      if (!item.alt) warnings.push(`Gallery ${gallery.galleryId}: evidence item is missing alt text and needs explicit review`);
    }
  }

  const collectionIds = new Set();
  for (const collection of approved.collections || []) {
    if (!collection.id) errors.push("Approved portfolio collection is missing id");
    if (collectionIds.has(collection.id)) errors.push(`Duplicate portfolio collection id: ${collection.id}`);
    collectionIds.add(collection.id);
    if (!validSystems.has(collection.workSystem)) errors.push(`${collection.id}: invalid workSystem '${collection.workSystem}'`);
    if (collection.workSystem === "case-study") errors.push(`${collection.id}: case studies must not be stored as a portfolio collection`);
  }

  const itemIds = new Set();
  for (const item of approved.items || []) {
    if (!item.id) errors.push("Approved portfolio item is missing id");
    if (itemIds.has(item.id)) errors.push(`Duplicate portfolio item id: ${item.id}`);
    itemIds.add(item.id);
    if (!["ai-production", "brand-creative"].includes(item.workSystem)) errors.push(`${item.id}: portfolio workSystem must be ai-production or brand-creative`);
    if (!item.title) errors.push(`${item.id}: title is required`);
    if (!item.media) errors.push(`${item.id}: media is required`);
    if (!item.thumbnail) errors.push(`${item.id}: thumbnail is required`);
    if (!item.alt) errors.push(`${item.id}: alt text must be explicitly approved before production`);
    if (!item.verificationStatus || item.verificationStatus === "public-evidence-only") errors.push(`${item.id}: production item requires authenticated-wordpress or explicit-review verification`);
    if (item.sourceEnviraGalleryId && item.media) {
      const evidenceKey = `${item.sourceEnviraGalleryId}|${item.media}`;
      if (!evidenceKeys.has(evidenceKey) && item.verificationStatus !== "explicit-review") {
        errors.push(`${item.id}: approved Envira source does not match public evidence (${evidenceKey})`);
      }
    }
  }

  if (!(approved.items || []).length) errors.push("No production portfolio items are approved yet");
}

if (errors.length) {
  console.error(JSON.stringify({ ready: false, errors, warnings: warnings.slice(0, 100), warningCount: warnings.length }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ready: true, approvedItems: approved.items.length, approvedCollections: approved.collections.length, warnings: warnings.slice(0, 100), warningCount: warnings.length }, null, 2));
}

async function readJson(file, label) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    errors.push(`Missing or unreadable ${label}: ${file} (${error.message})`);
    return [];
  }
}
