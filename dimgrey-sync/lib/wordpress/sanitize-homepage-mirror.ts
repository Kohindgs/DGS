import type { WpMirrorContent } from "./mirror-types";

const GALLERY_SPLIT = "<!--DGS_NATIVE_GALLERY-->";

/** Envira shortcode dump inside the portfolio gallery frame. */
const ENVIRA_INNER_RE =
  /<div id="envira-gallery-wrap[\s\S]*?<!-- If this appears as plain text[\s\S]*?-->\s*/i;

/** Remove duplicate inline <style> block after </main> (already in content.styles). */
const INLINE_STYLE_TAIL_RE = /<!-- STRUCTURED DATA -->[\s\S]*$/i;

export type SanitizedHomepageMirror = WpMirrorContent & {
  bodyBeforeGallery: string;
  bodyAfterGallery: string;
};

export function sanitizeHomepageMirror(content: WpMirrorContent): SanitizedHomepageMirror {
  let body = content.body;

  if (!ENVIRA_INNER_RE.test(body)) {
    return {
      ...content,
      bodyBeforeGallery: body,
      bodyAfterGallery: "",
    };
  }

  body = body.replace(ENVIRA_INNER_RE, `${GALLERY_SPLIT}\n        `);

  const structuredIdx = body.search(INLINE_STYLE_TAIL_RE);
  if (structuredIdx >= 0) {
    body = body.slice(0, structuredIdx).trimEnd();
    if (!body.endsWith("</main>")) {
      const mainClose = body.lastIndexOf("</main>");
      if (mainClose >= 0) body = body.slice(0, mainClose + 7);
    }
  }

  const splitIdx = body.indexOf(GALLERY_SPLIT);
  const bodyBeforeGallery = splitIdx >= 0 ? body.slice(0, splitIdx) : body;
  const bodyAfterGallery = splitIdx >= 0 ? body.slice(splitIdx + GALLERY_SPLIT.length) : "";

  return {
    ...content,
    body: bodyBeforeGallery + bodyAfterGallery,
    bodyBeforeGallery,
    bodyAfterGallery,
  };
}
