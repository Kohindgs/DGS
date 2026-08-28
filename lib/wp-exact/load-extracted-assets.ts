import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { rewriteWpUrls } from "./rewrite-wp-urls";

const EXTRACTED = join(process.cwd(), "lib/wp-exact/extracted");

export type WpExtractedAssets = {
  navHtml: string;
  navStyles: string;
  footerHtml: string;
  footerStyles: string;
  bootV1215: string;
  bootPortfolio: string;
  bootNav: string;
};

let cached: WpExtractedAssets | null = null;

export async function loadWpExtractedAssets(): Promise<WpExtractedAssets> {
  if (cached) return cached;

  const [navHtml, navStyles, footerHtml, footerStyles, bootV1215, bootPortfolio, bootNav] =
    await Promise.all([
      readFile(join(EXTRACTED, "nav.html"), "utf8"),
      readFile(join(EXTRACTED, "nav-styles.css"), "utf8"),
      readFile(join(EXTRACTED, "footer.html"), "utf8"),
      readFile(join(EXTRACTED, "footer-styles.css"), "utf8"),
      readFile(join(EXTRACTED, "boot-0.js"), "utf8"),
      readFile(join(EXTRACTED, "boot-1.js"), "utf8"),
      readFile(join(EXTRACTED, "boot-nav.js"), "utf8"),
    ]);

  cached = {
    navHtml: rewriteWpUrls(navHtml),
    navStyles: rewriteWpUrls(navStyles),
    footerHtml: rewriteWpUrls(footerHtml),
    footerStyles: rewriteWpUrls(footerStyles),
    bootV1215,
    bootPortfolio,
    bootNav,
  };

  return cached;
}
