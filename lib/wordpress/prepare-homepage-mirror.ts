import type { WpMirrorContent } from "./mirror-types";
import { rewriteWpUrls } from "@/lib/wp-exact/rewrite-wp-urls";


/** Envira dump inside the creative gallery frame. */
const ENVIRA_INNER_RE =
  /<div class="dgs-v1215-gallery-frame dgs-v1215-reveal">[\s\S]*?<\/div>\s*(?=<\/div>\s*<\/section>)/i;

/** Empty portfolio gallery mount — replaced with native 8-item preview. */
const PORTFOLIO_GALLERY_RE =
  /(<div id="portfolio-gallery-view" class="content-view active-view">)\s*<div id="portfolio-gallery"><\/div>[\s\S]*?<\/div>\s*(?=<div id="mascot-view")/i;

const INLINE_STYLE_TAIL_RE = /<!-- STRUCTURED DATA -->[\s\S]*$/i;
const MAIN_RE = /<main class="dgs-v1215"[\s\S]*<\/main>/i;
const INLINE_STYLES_RE = /<\/main>\s*(<style>[\s\S]*?<\/style>)/i;

export const NATIVE_CREATIVE_GALLERY_MARKER = "<!--DGS_NATIVE_CREATIVE_GALLERY-->";
export const NATIVE_PORTFOLIO_MARKER = "<!--DGS_NATIVE_PORTFOLIO_GALLERY-->";

export type HomepageMirrorSegment =
  | { type: "html"; html: string }
  | { type: "portfolio" }
  | { type: "creativeGallery" };

export type PreparedHomepageMirror = WpMirrorContent & {
  mainHtml: string;
  combinedStyles: string;
  segments: HomepageMirrorSegment[];
  hasCreativeGallerySplit: boolean;
  hasPortfolioSplit: boolean;
};

function buildSegments(mainHtml: string): HomepageMirrorSegment[] {
  const ordered = [
    { marker: NATIVE_PORTFOLIO_MARKER, type: "portfolio" as const },
    { marker: NATIVE_CREATIVE_GALLERY_MARKER, type: "creativeGallery" as const },
  ];

  const segments: HomepageMirrorSegment[] = [];
  let remaining = mainHtml;

  for (const { marker, type } of ordered) {
    const idx = remaining.indexOf(marker);
    if (idx < 0) continue;
    segments.push({ type: "html", html: remaining.slice(0, idx) });
    segments.push({ type });
    remaining = remaining.slice(idx + marker.length);
  }

  segments.push({ type: "html", html: remaining });
  return segments;
}

function extractMainBlock(body: string): { mainHtml: string; inlineStyles: string; rest: string } {
  const mainMatch = body.match(MAIN_RE);
  if (!mainMatch) {
    return { mainHtml: body, inlineStyles: "", rest: "" };
  }

  const mainHtml = mainMatch[0];
  const afterMain = body.slice(body.indexOf(mainHtml) + mainHtml.length);
  const styleMatch = afterMain.match(INLINE_STYLES_RE);
  const inlineStyles = styleMatch ? styleMatch[1].replace(/^<style>/, "").replace(/<\/style>$/, "") : "";

  return { mainHtml, inlineStyles, rest: afterMain };
}

export function prepareHomepageMirror(content: WpMirrorContent): PreparedHomepageMirror {
  let body = content.body;

  const structuredIdx = body.search(INLINE_STYLE_TAIL_RE);
  if (structuredIdx >= 0) {
    body = body.slice(0, structuredIdx).trimEnd();
  }

  const { mainHtml: rawMain, inlineStyles } = extractMainBlock(body);
  let mainHtml = rawMain;

  const hasCreativeGallerySplit = ENVIRA_INNER_RE.test(mainHtml);
  if (hasCreativeGallerySplit) {
    mainHtml = mainHtml.replace(
      ENVIRA_INNER_RE,
      `<div class="dgs-v1215-gallery-frame dgs-v1215-reveal">${NATIVE_CREATIVE_GALLERY_MARKER}`,
    );
  }

  const hasPortfolioSplit = PORTFOLIO_GALLERY_RE.test(mainHtml);
  if (hasPortfolioSplit) {
    mainHtml = mainHtml.replace(
      PORTFOLIO_GALLERY_RE,
      `$1\n          ${NATIVE_PORTFOLIO_MARKER}\n        </div>\n\n        `,
    );
  }

  mainHtml = rewriteWpUrls(mainHtml);

  const segments = buildSegments(mainHtml);

  const combinedStyles = rewriteWpUrls(
    [content.styles || "", inlineStyles].filter(Boolean).join("\n"),
  );

  return {
    ...content,
    mainHtml,
    combinedStyles,
    segments,
    hasCreativeGallerySplit,
    hasPortfolioSplit,
  };
}
