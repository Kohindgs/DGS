import rankingApproved from "@/data/migration/ranking-link-restorations.approved.json";
import technicalApproved from "@/data/migration/technical-link-corrections.approved.json";

type LinkCorrection = {
  path?: string;
  headingId?: string;
  anchor?: string;
  wordpressDestination: string;
  requiredNextDestination?: string | null;
  action?: "REMOVE_BROKEN_HREF";
};

const WP_ORIGIN = "https://www.dgeniussolutions.com";

function normalizeHrefPath(href: string): string {
  try {
    const url = new URL(href, WP_ORIGIN);
    let pathname = url.pathname || "/";
    if (pathname !== "/" && !pathname.endsWith("/") && !/\.[a-z0-9]{1,8}$/i.test(pathname)) {
      pathname += "/";
    }
    return pathname;
  } catch {
    return href;
  }
}

function visibleAnchorText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function correctionsForPath(routePath: string): LinkCorrection[] {
  const ranking = ((rankingApproved.restorations as Record<string, LinkCorrection[]>)[routePath] || []).map(
    (item) => ({ ...item, path: routePath }),
  );
  const technical = (technicalApproved.corrections as LinkCorrection[]).filter((item) => item.path === routePath);
  return [...ranking, ...technical];
}

/**
 * Applies approved ranking/technical link corrections to mirrored WordPress HTML.
 * Anchor text is preserved. Broken destinations are unwrapped, not rewritten as new copy.
 */
export function applyApprovedLinkCorrectionsToHtml(routePath: string, html: string): string {
  const corrections = correctionsForPath(routePath);
  if (!corrections.length) return html;

  const anchorRe = /<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi;

  return html.replace(anchorRe, (full, pre, href, post, inner) => {
    const path = normalizeHrefPath(href);
    const text = visibleAnchorText(inner);
    const destMatches = corrections.filter((item) => normalizeHrefPath(item.wordpressDestination) === path);
    const match =
      destMatches.find((item) => item.anchor && item.anchor === text) ||
      destMatches.find((item) => !item.anchor) ||
      destMatches.find((item) => item.action === "REMOVE_BROKEN_HREF") ||
      destMatches[0];
    if (!match) return full;
    if (match.action === "REMOVE_BROKEN_HREF") return inner;
    if (match.requiredNextDestination) {
      return `<a${pre}href="${match.requiredNextDestination}"${post}>${inner}</a>`;
    }
    return full;
  });
}
