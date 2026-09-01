import { rewriteWpUrls } from "@/lib/wp-exact/rewrite-wp-urls";
import { applyApprovedLinkCorrectionsToHtml } from "./apply-mirror-link-corrections";
import type { InnerPageMirrorContent } from "./inner-mirror-types";

export type PreparedInnerPageMirror = InnerPageMirrorContent & {
  articleHtml: string;
  combinedStyles: string;
};

function stripLeadingCloseTags(html: string): string {
  return html.replace(/^(?:\s*<\/(?:div|header|section|main|span|nav|aside)>)+/i, "").trim();
}

function lazyBelowFold(html: string): string {
  let count = 0;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    count += 1;
    if (count <= 2) {
      return tag
        .replace(/\bloading=["']lazy["']/i, 'loading="eager"')
        .replace(/<img/i, count === 1 ? '<img fetchpriority="high"' : "<img");
    }
    if (!/\bloading=/i.test(tag)) {
      return tag.replace(/<img/i, '<img loading="lazy"');
    }
    return tag;
  });
}

export function prepareInnerPageMirror(
  content: InnerPageMirrorContent,
  wordpressId: number,
): PreparedInnerPageMirror {
  const body = applyApprovedLinkCorrectionsToHtml(
    content.path,
    lazyBelowFold(rewriteWpUrls(stripLeadingCloseTags(content.body || ""))),
  );
  const styles = rewriteWpUrls(content.styles || "");
  const articleHtml = `<article data-migration-content data-wordpress-id="${wordpressId}">${body}</article>`;
  return {
    ...content,
    articleHtml,
    combinedStyles: styles,
  };
}
