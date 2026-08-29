import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizePath } from "./tier0-parity-compare.mjs";

const APPROVED_PATH = path.join(process.cwd(), "data/migration/technical-link-corrections.approved.json");
const WP_ORIGIN = "https://www.dgeniussolutions.com";

let cache = null;

export async function loadTechnicalLinkCorrections() {
  if (cache) return cache;
  cache = JSON.parse(await readFile(APPROVED_PATH, "utf8"));
  return cache;
}

export function correctionsForPath(approved, routePath) {
  return (approved.corrections || []).filter((item) => item.path === routePath);
}

function normalizeHref(href) {
  if (!href) return "";
  return normalizePath(href, WP_ORIGIN);
}

function findCorrection(corrections, href, anchor) {
  const normalized = normalizeHref(href);
  return (
    corrections.find((item) => {
      if (normalizeHref(item.wordpressDestination) !== normalized) return false;
      if (item.anchor && anchor && item.anchor !== anchor) return false;
      return true;
    }) || null
  );
}

function applyHrefValue(href, correction) {
  if (!correction) return href;
  if (correction.action === "REMOVE_BROKEN_HREF") return null;
  if (correction.requiredNextDestination) return correction.requiredNextDestination;
  return href;
}

function mapSpans(spans, corrections) {
  let changed = false;
  const next = (spans || []).map((span) => {
    if (!span.href) return span;
    const correction = findCorrection(corrections, span.href, span.text?.trim());
    const nextHref = applyHrefValue(span.href, correction);
    if (nextHref === null) {
      changed = true;
      const { href: _removed, ...rest } = span;
      return rest;
    }
    if (nextHref !== span.href) {
      changed = true;
      return { ...span, href: nextHref };
    }
    return span;
  });
  return changed ? next : spans;
}

export function applyTechnicalLinkCorrections(routePath, blocks, approved) {
  const corrections = correctionsForPath(approved, routePath);
  if (!corrections.length) return blocks;

  return blocks.map((block) => {
    if (block.type === "heading" && block.href) {
      const correction = findCorrection(corrections, block.href, block.text);
      const nextHref = applyHrefValue(block.href, correction);
      if (nextHref === null) {
        const { href: _removed, ...rest } = block;
        return rest;
      }
      if (nextHref !== block.href) return { ...block, href: nextHref };
      return block;
    }

    if (block.type === "paragraph") {
      const content = mapSpans(block.content, corrections);
      return content === block.content ? block : { ...block, content };
    }

    if (block.type === "list") {
      let changed = false;
      const items = (block.items || []).map((item) => {
        const nextItem = mapSpans(item, corrections);
        if (nextItem !== item) changed = true;
        return nextItem;
      });
      return changed ? { ...block, items } : block;
    }

    if (block.type === "faq") {
      let changed = false;
      const items = (block.items || []).map((item) => {
        const answer = mapSpans(item.answer, corrections);
        if (answer !== item.answer) changed = true;
        return answer === item.answer ? item : { ...item, answer };
      });
      return changed ? { ...block, items } : block;
    }

    return block;
  });
}

export function sourceDefectRemovals(approved) {
  return (approved.corrections || []).filter((item) => item.action === "REMOVE_BROKEN_HREF");
}
