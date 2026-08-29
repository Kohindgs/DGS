import type { ContentBlock, HeadingBlock } from "@/lib/content/types";
import approved from "@/data/migration/technical-link-corrections.approved.json";

type Correction = {
  path: string;
  anchor?: string;
  wordpressDestination: string;
  requiredNextDestination?: string;
  action?: "REMOVE_BROKEN_HREF";
  classification?: string;
  reason?: string;
};

const WP_ORIGIN = "https://www.dgeniussolutions.com";

function normalizeHref(href: string) {
  try {
    const url = new URL(href, WP_ORIGIN);
    const pathname = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
    return pathname;
  } catch {
    return href;
  }
}

function correctionsForPath(routePath: string): Correction[] {
  return (approved.corrections as Correction[]).filter((item) => item.path === routePath);
}

function findCorrection(corrections: Correction[], href: string, anchor?: string) {
  const normalized = normalizeHref(href);
  return (
    corrections.find((item) => normalizeHref(item.wordpressDestination) === normalized) ||
    corrections.find((item) => item.anchor && item.anchor === anchor) ||
    null
  );
}

function applyHrefValue(href: string, correction: Correction | null) {
  if (!correction) return href;
  if (correction.action === "REMOVE_BROKEN_HREF") return null;
  if (correction.requiredNextDestination) return correction.requiredNextDestination;
  return href;
}

function mapSpans<T extends { href?: string; text?: string }>(spans: T[], corrections: Correction[]) {
  let changed = false;
  const next = spans.map((span) => {
    if (!span.href) return span;
    const correction = findCorrection(corrections, span.href, span.text?.trim());
    const nextHref = applyHrefValue(span.href, correction);
    if (nextHref === null) {
      changed = true;
      const { href: _removed, ...rest } = span;
      return rest as T;
    }
    if (nextHref !== span.href) {
      changed = true;
      return { ...span, href: nextHref };
    }
    return span;
  });
  return changed ? next : spans;
}

export function applyTechnicalLinkCorrections(path: string, blocks: ContentBlock[]): ContentBlock[] {
  const corrections = correctionsForPath(path);
  if (!corrections.length) return blocks;

  return blocks.map((block) => {
    if (block.type === "heading" && block.href) {
      const heading = block as HeadingBlock;
      const correction = findCorrection(corrections, heading.href!, heading.text);
      const nextHref = applyHrefValue(heading.href!, correction);
      if (nextHref === null) {
        const { href: _removed, ...rest } = heading;
        return rest;
      }
      if (nextHref !== heading.href) return { ...heading, href: nextHref };
      return block;
    }

    if (block.type === "paragraph") {
      const content = mapSpans(block.content, corrections);
      return content === block.content ? block : { ...block, content };
    }

    if (block.type === "list") {
      let changed = false;
      const items = block.items.map((item) => {
        const nextItem = mapSpans(item, corrections);
        if (nextItem !== item) changed = true;
        return nextItem;
      });
      return changed ? { ...block, items } : block;
    }

    if (block.type === "faq") {
      let changed = false;
      const items = block.items.map((item) => {
        const answer = mapSpans(item.answer, corrections);
        if (answer !== item.answer) changed = true;
        return answer === item.answer ? item : { ...item, answer };
      });
      return changed ? { ...block, items } : block;
    }

    return block;
  });
}
