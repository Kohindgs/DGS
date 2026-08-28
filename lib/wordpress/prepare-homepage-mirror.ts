import type { WpMirrorContent } from "./mirror-types";
import { rewriteWpUrls } from "@/lib/wp-exact/rewrite-wp-urls";

/** Envira dump inside the creative gallery frame — replaced with native gallery. */
const ENVIRA_INNER_RE =
  /<div class="dgs-v1215-gallery-frame dgs-v1215-reveal">[\s\S]*?<\/div>\s*(?=<\/div>\s*<\/section>)/i;

const INLINE_STYLE_TAIL_RE = /<!-- STRUCTURED DATA -->[\s\S]*$/i;
const MAIN_RE = /<main class="dgs-v1215"[\s\S]*<\/main>/i;
const INLINE_STYLES_RE = /<\/main>\s*(<style>[\s\S]*?<\/style>)/i;

export const NATIVE_CREATIVE_GALLERY_MARKER = "<!--DGS_NATIVE_CREATIVE_GALLERY-->";

export type HomepageMirrorSegment =
  | { type: "html"; html: string }
  | { type: "creativeGallery" };

export type PreparedHomepageMirror = WpMirrorContent & {
  mainHtml: string;
  combinedStyles: string;
  segments: HomepageMirrorSegment[];
};

function buildSegments(mainHtml: string): HomepageMirrorSegment[] {
  const idx = mainHtml.indexOf(NATIVE_CREATIVE_GALLERY_MARKER);
  if (idx < 0) return [{ type: "html", html: mainHtml }];
  return [
    { type: "html", html: mainHtml.slice(0, idx) },
    { type: "creativeGallery" },
    { type: "html", html: mainHtml.slice(idx + NATIVE_CREATIVE_GALLERY_MARKER.length) },
  ];
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

  if (ENVIRA_INNER_RE.test(mainHtml)) {
    mainHtml = mainHtml.replace(
      ENVIRA_INNER_RE,
      `<div class="dgs-v1215-gallery-frame dgs-v1215-reveal">${NATIVE_CREATIVE_GALLERY_MARKER}`,
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
  };
}
