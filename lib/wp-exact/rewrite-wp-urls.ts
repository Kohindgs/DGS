const WP_ORIGIN = "https://www.dgeniussolutions.com";
const WP_ORIGIN_PATTERN = /https:\/\/(?:www\.)?dgeniussolutions\.com/gi;

function isWpAssetPath(path: string): boolean {
  return path.startsWith("/wp-content/") || path.startsWith("/wp-includes/");
}

/** Rewrites internal page URLs to site-relative paths; keeps media on the WP CDN. */
export function rewriteWpUrls(html: string): string {
  let out = html.replace(WP_ORIGIN_PATTERN, (match, offset, source) => {
    const next = source[offset + match.length];
    if (next !== "/") return match;

    const rest = source.slice(offset + match.length);
    const pathMatch = rest.match(/^\/[^"'\\\s<>]*/);
    const path = pathMatch?.[0] ?? "/";

    if (isWpAssetPath(path)) {
      return WP_ORIGIN;
    }

    return "";
  });

  // Repair any legacy relative wp-content/wp-includes paths from older rewrites.
  out = out.replace(/(["'(])\/wp-content\//g, `$1${WP_ORIGIN}/wp-content/`);
  out = out.replace(/(["'(])\/wp-includes\//g, `$1${WP_ORIGIN}/wp-includes/`);

  return out.replaceAll('href="/#', 'href="#');
}
