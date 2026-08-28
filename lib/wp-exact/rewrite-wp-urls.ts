const WP_ORIGIN = "https://www.dgeniussolutions.com";

/** Rewrites production WordPress absolute URLs to site-relative paths. */
export function rewriteWpUrls(html: string): string {
  return html
    .replaceAll(`${WP_ORIGIN}/`, "/")
    .replaceAll(WP_ORIGIN, "")
    .replaceAll('href="/#', 'href="#');
}
