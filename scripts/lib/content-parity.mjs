import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeText } from "./tier0-parity-compare.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APPROVED_HEADING_NORMALIZATIONS = JSON.parse(
  readFileSync(path.join(__dirname, "../../data/migration/approved-heading-normalizations.json"), "utf8"),
);

export function decodeHtmlEntities(text = "") {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&middot;/gi, "·")
    .replace(/&bull;/gi, "•")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&#x27;/gi, "'")
    .replace(/&#0*39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

export function collapseComparableText(value = "") {
  return normalizeText(decodeHtmlEntities(value))
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeHeadingText(text = "") {
  return collapseComparableText(text);
}

export function spanText(spans = []) {
  if (!spans.length) return "";
  if (spans.length === 1) return (spans[0].text || "").trim();
  return spans
    .map((s) => s.text || "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHeadingLevel(level) {
  if (!level) return "";
  const value = String(level).toLowerCase();
  return value.startsWith("h") ? value : `h${value}`;
}

export function findApprovedHeadingNormalization(routePath, sourceHeading) {
  const sourceText = normalizeHeadingText(sourceHeading.text);
  const sourceLevel = normalizeHeadingLevel(sourceHeading.level);
  return (
    APPROVED_HEADING_NORMALIZATIONS.normalizations.find(
      (entry) =>
        entry.route === routePath &&
        normalizeHeadingText(entry.sourceHeading) === sourceText &&
        normalizeHeadingLevel(entry.sourceLevel) === sourceLevel,
    ) || null
  );
}

export function headingIsPresent(routePath, sourceHeading, renderedHeadings) {
  const sourceText = normalizeHeadingText(sourceHeading.text);
  const sourceLevel = normalizeHeadingLevel(sourceHeading.level);
  const approved = findApprovedHeadingNormalization(routePath, sourceHeading);

  return renderedHeadings.some((rendered) => {
    const renderedText = normalizeHeadingText(rendered.text);
    if (renderedText !== sourceText) return false;
    const renderedLevel = normalizeHeadingLevel(rendered.level);
    if (renderedLevel === sourceLevel) return true;
    if (approved) return renderedLevel === normalizeHeadingLevel(approved.renderedLevel);
    return false;
  });
}

export function orderedSpanSequencePresent(spans = [], renderedComparable, { maxGap = 48 } = {}) {
  const normalizedSpans = spans
    .map((span) => collapseComparableText(span.text || ""))
    .filter((text) => text.length > 0);

  if (!normalizedSpans.length) return true;
  if (normalizedSpans.length === 1) {
    const needle = normalizedSpans[0];
    return needle.length <= 3 || renderedComparable.includes(needle);
  }

  let searchFrom = 0;
  for (let index = 0; index < normalizedSpans.length; index += 1) {
    const needle = normalizedSpans[index];
    if (needle.length <= 1) continue;
    const foundAt = renderedComparable.indexOf(needle, searchFrom);
    if (foundAt === -1) return false;
    if (index > 0 && foundAt - searchFrom > maxGap) return false;
    searchFrom = foundAt + needle.length;
  }

  return true;
}

export function textIsPresent(entry, renderedComparable, { minLength = 20, slice = 80, maxSpanGap = 48 } = {}) {
  const comparable = collapseComparableText(entry.text);
  const needle = comparable.slice(0, slice);
  if (needle.length <= minLength) return true;
  if (renderedComparable.includes(needle)) return true;

  const compactHaystack = renderedComparable.replace(/\s+/g, "");
  const compactNeedle = needle.replace(/\s+/g, "");
  if (compactNeedle.length > minLength && compactHaystack.includes(compactNeedle)) return true;

  if (entry.spans?.length > 1) {
    return orderedSpanSequencePresent(entry.spans, renderedComparable, { maxGap: maxSpanGap });
  }

  return false;
}

export function filterDuplicatePageH1Block(blocks, pageH1) {
  const normalizedPageH1 = pageH1.trim();
  let removedDuplicate = false;

  return blocks.filter((block) => {
    if (
      !removedDuplicate &&
      block.type === "heading" &&
      block.level === 1 &&
      block.text.trim() === normalizedPageH1
    ) {
      removedDuplicate = true;
      return false;
    }
    return true;
  });
}

export function listApprovedHeadingNormalizations() {
  return APPROVED_HEADING_NORMALIZATIONS.normalizations;
}

/** Strict internal link parity: visible anchor text alone is not sufficient. */
export function internalLinkIsPresent(expectedLink, renderedLinks) {
  const renderedPaths = new Set(renderedLinks.map((link) => link.path));
  return renderedPaths.has(expectedLink.path);
}
