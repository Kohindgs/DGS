const WP_ORIGIN = "https://www.dgeniussolutions.com";
const WP_ORIGIN_PATTERN = /https:\/\/(?:www\.)?dgeniussolutions\.com/gi;

/** Rewrites internal page and asset URLs to site-relative paths. */
export function rewriteWpUrls(html: string): string {
  let out = html.replace(WP_ORIGIN_PATTERN, (match, offset, source) => {
    const next = source[offset + match.length];
    if (next !== "/") return match;
    return "";
  });

  return out.replaceAll('href="/#', 'href="#');
}
