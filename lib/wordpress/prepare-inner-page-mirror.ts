import { rewriteWpUrls } from "@/lib/wp-exact/rewrite-wp-urls";
import { applyApprovedLinkCorrectionsToHtml } from "./apply-mirror-link-corrections";
import {
  markElementorBackgroundsReady,
  replaceEnviraWrapWithNativeMount,
  stripCapturedFooters,
  unwrapMirrorLazyMedia,
} from "./native-inner-fixes";
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
  let body = markElementorBackgroundsReady(
    unwrapMirrorLazyMedia(stripCapturedFooters(stripLeadingCloseTags(content.body || ""))),
  );
  if (content.path === "/portfolio/") {
    body = replaceEnviraWrapWithNativeMount(body);
  }
  body = body.replace(
    /(?:https:\/\/(?:www\.)?dgeniussolutions\.com)?\/wp-content\/uploads\/2026\/07\/Weavings-Home-page-\.png(?:\?[^"'\s>]*)?/g,
    "/images/case-studies/weavings-home-page-64820.png",
  );
  // DGS Quick Win 3: Eliminate broken external HumanXT dependencies
  body = body
    .replace(
      /https?:\/\/humanxt\.com\/wp-content\/uploads\/(?:2024\/05|2025\/08)\/h4-logo\.png/g,
      "https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Humanxt-1-300x300.png",
    )
    .replace(
      /<link\b[^>]*href=["']https?:\/\/humanxt\.com\/fonts\/fira-sans\.css["'][^>]*>/gi,
      "",
    )
    .replace(
      /https:\/\/s\.wordpress\.com\/mshots\/v1\/https%3A%2F%2Fhumanxt\.com%2F\?w=1600/g,
      "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Humanxt-scaled.webp",
    )
    .replace(
      /<iframe\b[^>]*\b(?:humanxt\.com)[^>]*><\/iframe>/gi,
      '<img loading="lazy" class="live-preview-image e-lazyloaded" src="https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Humanxt-scaled.webp" alt="HumanXT website preview by D’Genius Solutions" width="1600" height="1000" loading="lazy" decoding="async" referrerpolicy="no-referrer" />',
    );
  body = applyApprovedLinkCorrectionsToHtml(
    content.path,
    lazyBelowFold(rewriteWpUrls(body)),
  );
  const styles = rewriteWpUrls(content.styles || "");
  const fontLinks = content.fontLinks?.map((tag) => rewriteWpUrls(tag));
  const articleHtml = `<article data-migration-content data-wordpress-id="${wordpressId}">${body}</article>`;
  return {
    ...content,
    articleHtml,
    combinedStyles: styles,
    fontLinks,
  };
}
