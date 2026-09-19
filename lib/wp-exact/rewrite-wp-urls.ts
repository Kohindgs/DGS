export const WP_ORIGIN = "https://www.dgeniussolutions.com";
const WP_ASSET_ORIGIN_PATTERN = /https:\/\/(?:(?:www\.)?dgeniussolutions\.com|wp-origin\.dgeniussolutions\.com)/gi;

/** Rewrites captured WordPress page and media URLs to site-relative paths. */
export function rewriteWpUrls(html: string): string {
  const out = html.replace(WP_ASSET_ORIGIN_PATTERN, (match, offset, source) => {
    const next = source[offset + match.length];
    return next === "/" ? "" : match;
  });

  return out.replaceAll('href="/#', 'href="#');
}
