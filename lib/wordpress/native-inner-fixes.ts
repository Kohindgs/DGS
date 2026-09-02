export const NATIVE_JUSTIFIED_GALLERY_MOUNT = "<!--DGS_NATIVE_JUSTIFIED_GALLERY-->";

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
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    let out = tag;
    const read = (name: string) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] || "";
    const src = read("src");
    const srcset = read("srcset");
    const dataSrc = read("data-src") || read("data-envira-src") || read("data-lazy-src");
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
    }

    return out;
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
