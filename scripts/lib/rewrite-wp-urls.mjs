const WP_ORIGIN = "https://www.dgeniussolutions.com";
const WP_ORIGIN_PATTERN = /https:\/\/(?:www\.)?dgeniussolutions\.com/gi;

function isWpAssetPath(assetPath) {
  return assetPath.startsWith("/wp-content/") || assetPath.startsWith("/wp-includes/");
}

/** Rewrites internal page URLs to site-relative paths; keeps media on the WP origin. */
export function rewriteWpUrls(html) {
  let out = html.replace(WP_ORIGIN_PATTERN, (match, offset, source) => {
    const next = source[offset + match.length];
    if (next !== "/") return match;

    const rest = source.slice(offset + match.length);
    const pathMatch = rest.match(/^\/[^"'\\\s<>]*/);
    const assetPath = pathMatch?.[0] ?? "/";

    if (isWpAssetPath(assetPath)) {
      return WP_ORIGIN;
    }

    return "";
  });

  out = out.replace(/(["'(])\/wp-content\//g, `$1${WP_ORIGIN}/wp-content/`);
  out = out.replace(/(["'(])\/wp-includes\//g, `$1${WP_ORIGIN}/wp-includes/`);

  return out.replaceAll('href="/#', 'href="#');
}

export { WP_ORIGIN };
