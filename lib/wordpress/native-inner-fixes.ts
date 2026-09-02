export const NATIVE_JUSTIFIED_GALLERY_ROOT_ID = "dgs-native-justified-gallery-root";

/** Empty in-tree mount so the native gallery stays inside the Elementor shortcode width. */
export const NATIVE_JUSTIFIED_GALLERY_MOUNT = `<div id="${NATIVE_JUSTIFIED_GALLERY_ROOT_ID}" data-dgs-native-justified-gallery-root="true" style="margin-bottom:20px"></div>`;

function findMatchingClose(html: string, startIdx: number): number {
  const tagMatch = html.slice(startIdx).match(/^<([a-zA-Z0-9-]+)/);
  if (!tagMatch) return -1;
  const tag = tagMatch[1];
  let depth = 0;
  const re = new RegExp(`<(/)?${tag}\\b[^>]*>`, "gi");
  re.lastIndex = startIdx;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const selfClosing = /\/\s*>$/.test(match[0]);
    if (selfClosing) continue;
    if (match[1] === "/") {
      depth -= 1;
      if (depth === 0) return match.index + match[0].length;
    } else {
      depth += 1;
    }
  }
  return -1;
}

/** Strip Envira/LiteSpeed placeholder srcset/src so the real media URL is what the browser paints. */
export function unwrapMirrorLazyMedia(html: string): string {
  const unwrappedImgs = html.replace(/<img\b[^>]*>/gi, (tag) => {
    let out = tag;
    const read = (name: string) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] || "";
    const src = read("src");
    const srcset = read("srcset");
    const dataSrc = read("data-src") || read("data-envira-src") || read("data-lazy-src") || read("data-original");
    const dataSrcset = read("data-srcset") || read("data-envira-srcset") || read("data-lazy-srcset");
    const srcIsPlaceholder = /^data:image\//i.test(src) || /placeholder/i.test(src);
    const srcsetIsPlaceholder =
      /^data:image\//i.test(srcset) || /R0lGODlhAQABAIAAAP/i.test(srcset) || srcset === "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

    if (dataSrc && (srcIsPlaceholder || !src)) {
      if (/\bsrc=/i.test(out)) out = out.replace(/\bsrc=["'][^"']*["']/i, `src="${dataSrc}"`);
      else out = out.replace(/<img/i, `<img src="${dataSrc}"`);
    }

    if (srcsetIsPlaceholder) {
      if (dataSrcset && !/^data:image\//i.test(dataSrcset)) {
        out = out.replace(/\bsrcset=["'][^"']*["']/i, `srcset="${dataSrcset}"`);
      } else {
        out = out.replace(/\s*srcset=["'][^"']*["']/i, "");
      }
    } else if (dataSrcset && !srcset) {
      out = out.replace(/<img/i, `<img srcset="${dataSrcset}"`);
    }

    return out;
  });
  return unwrapDataBackgrounds(unwrapSourcesAndPosters(unwrappedImgs));
}

function unwrapSourcesAndPosters(html: string): string {
  let out = html.replace(/<source\b[^>]*>/gi, (tag) => {
    const dataSrcset = tag.match(/\bdata-srcset=["']([^"']+)["']/i)?.[1];
    const srcset = tag.match(/\bsrcset=["']([^"']+)["']/i)?.[1] || "";
    if (dataSrcset && (/^data:image\//i.test(srcset) || /R0lGODlhAQABAIAAAP/i.test(srcset) || !srcset)) {
      if (/\bsrcset=/i.test(tag)) return tag.replace(/\bsrcset=["'][^"']*["']/i, `srcset="${dataSrcset}"`);
      return tag.replace(/<source/i, `<source srcset="${dataSrcset}"`);
    }
    return tag;
  });
  out = out.replace(/<video\b[^>]*>/gi, (tag) => {
    const dataPoster = tag.match(/\bdata-poster=["']([^"']+)["']/i)?.[1];
    const poster = tag.match(/\bposter=["']([^"']+)["']/i)?.[1] || "";
    if (dataPoster && (!poster || /^data:image\//i.test(poster))) {
      if (/\bposter=/i.test(tag)) return tag.replace(/\bposter=["'][^"']*["']/i, `poster="${dataPoster}"`);
      return tag.replace(/<video/i, `<video poster="${dataPoster}"`);
    }
    return tag;
  });
  return out;
}

function unwrapDataBackgrounds(html: string): string {
  return html.replace(/<(div|section|span|figure|a|header|footer|article|aside|li)\b[^>]*>/gi, (tag) => {
    const dataBg =
      tag.match(/\bdata-bg=["']([^"']+)["']/i)?.[1] ||
      tag.match(/\bdata-lazy-bg=["']([^"']+)["']/i)?.[1] ||
      tag.match(/\bdata-bg-webp=["']([^"']+)["']/i)?.[1];
    if (!dataBg || /^data:image\//i.test(dataBg) || /placeholder/i.test(dataBg)) return tag;
    if (/background-image\s*:/i.test(tag)) return tag;
    if (/\bstyle=/i.test(tag)) {
      return tag.replace(
        /\bstyle=(["'])([\s\S]*?)\1/i,
        (_, q, style) => `style=${q}background-image:url('${dataBg}');${style}${q}`,
      );
    }
    return tag.replace(/<([a-zA-Z0-9-]+)/i, `<$1 style="background-image:url('${dataBg}')"`);
  });
}

/** Elementor JS adds this class so lazy background CSS does not zero out section images. */
export function markElementorBackgroundsReady(html: string): string {
  return html.replace(/class=(["'])([^"']*\be-con\b[^"']*\be-parent\b[^"']*)\1/gi, (full, q, cls) => {
    if (/\be-lazyloaded\b/.test(cls) || /\be-no-lazyload\b/.test(cls)) return full;
    return `class=${q}${cls} e-lazyloaded${q}`;
  });
}

/** Replace the Envira wrap with a native mount. Returns original HTML if the wrap cannot be sliced cleanly. */
export function replaceEnviraWrapWithNativeMount(html: string): string {
  const match = html.match(/<div[^>]*id=["']envira-gallery-wrap-\d+["'][^>]*>/i);
  if (!match || match.index == null) return html;
  const end = findMatchingClose(html, match.index);
  if (end < 0) return html;
  return `${html.slice(0, match.index)}${NATIVE_JUSTIFIED_GALLERY_MOUNT}${html.slice(end)}`;
}

export function hasNativeVideoPortfolioMount(html: string): boolean {
  return /id=["']portfolio-gallery["']/.test(html) && /id=["']load-more-btn["']/.test(html);
}
