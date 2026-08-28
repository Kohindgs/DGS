import type { WpMirrorContent } from "./mirror-types";
import { rewriteWpUrls } from "@/lib/wp-exact/rewrite-wp-urls";

/** Envira dump inside the creative gallery frame — replaced with native gallery. */
const ENVIRA_INNER_RE =
  /<div class="dgs-v1215-gallery-frame dgs-v1215-reveal">[\s\S]*?<\/div>\s*(?=<\/div>\s*<\/section>)/i;

const FORM_SHORTCODE_RE =
  /<div class="dgs-v1215-form-shortcode">[\s\S]*?<!-- If this appears as plain text[\s\S]*?-->\s*<\/div>/i;

const INLINE_STYLE_TAIL_RE = /<!-- STRUCTURED DATA -->[\s\S]*$/i;
const MAIN_RE = /<main class="dgs-v1215"[\s\S]*<\/main>/i;
const INLINE_STYLES_RE = /<\/main>\s*(<style>[\s\S]*?<\/style>)/i;

export const NATIVE_CREATIVE_GALLERY_MOUNT =
  '<div id="dgs-native-creative-gallery-mount" data-dgs-native-mount="creative-gallery"></div>';
export const NATIVE_HOME_FORM_MOUNT =
  '<div id="dgs-native-home-form-mount" data-dgs-native-mount="home-form"></div>';

export type HomepageMirrorSegment =
  | { type: "html"; html: string }
  | { type: "creativeGallery" }
  | { type: "homeForm" };

export type PreparedHomepageMirror = WpMirrorContent & {
  mainHtml: string;
  combinedStyles: string;
  segments: HomepageMirrorSegment[];
};

function buildSegments(mainHtml: string): HomepageMirrorSegment[] {
  const markers: { marker: string; type: HomepageMirrorSegment["type"] }[] = [
    { marker: NATIVE_CREATIVE_GALLERY_MOUNT, type: "creativeGallery" },
    { marker: NATIVE_HOME_FORM_MOUNT, type: "homeForm" },
  ];

  const segments: HomepageMirrorSegment[] = [];
  let remaining = mainHtml;

  while (remaining.length > 0) {
    let nextIdx = -1;
    let nextType: HomepageMirrorSegment["type"] | null = null;
    let nextMarker = "";

    for (const { marker, type } of markers) {
      const idx = remaining.indexOf(marker);
      if (idx >= 0 && (nextIdx < 0 || idx < nextIdx)) {
        nextIdx = idx;
        nextType = type;
        nextMarker = marker;
      }
    }

    if (nextIdx < 0 || !nextType) {
      segments.push({ type: "html", html: remaining });
      break;
    }

    if (nextIdx > 0) {
      segments.push({ type: "html", html: remaining.slice(0, nextIdx) });
    }
    if (nextType === "creativeGallery") {
      segments.push({ type: "creativeGallery" });
    } else if (nextType === "homeForm") {
      segments.push({ type: "homeForm" });
    }
    remaining = remaining.slice(nextIdx + nextMarker.length);
  }

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

  if (ENVIRA_INNER_RE.test(mainHtml)) {
    mainHtml = mainHtml.replace(
      ENVIRA_INNER_RE,
      `<div class="dgs-v1215-gallery-frame dgs-v1215-reveal is-visible dgs-native-gallery-frame">${NATIVE_CREATIVE_GALLERY_MOUNT}`,
    );
  }

  if (FORM_SHORTCODE_RE.test(mainHtml)) {
    mainHtml = mainHtml.replace(FORM_SHORTCODE_RE, NATIVE_HOME_FORM_MOUNT);
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
