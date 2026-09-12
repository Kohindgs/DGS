export const WP_ORIGIN = "https://www.dgeniussolutions.com";
const WP_ORIGIN_PATTERN = /https:\/\/(?:www\.)?dgeniussolutions\.com/gi;

/** Rewrites internal page and asset URLs to site-relative paths, preserving large media streaming assets. */
export function rewriteWpUrls(html: string): string {
  const out = html.replace(WP_ORIGIN_PATTERN, (match, offset, source) => {
    const next = source[offset + match.length];
    if (next !== "/") return match;
    const after = source.slice(offset + match.length);
    const urlMatch = after.match(/^[^\s"'<>]+/);
    if (urlMatch && /\.(mp4|webm|ogv)(\?.*)?$/i.test(urlMatch[0])) {
      return match;
    }
    return "";
  });

  return out.replaceAll('href="/#', 'href="#');
}
