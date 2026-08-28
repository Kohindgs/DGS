import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { rewriteWpUrls } from "./rewrite-wp-urls";

const EXTRACTED = join(process.cwd(), "lib/wp-exact/extracted");

export type WpExtractedAssets = {
  navHtml: string;
  navStyles: string;
  footerHtml: string;
  footerStyles: string;
  fluentformStyles: string;
  bootV1215: string;
  bootPortfolioHome: string;
  bootNav: string;
};

let cached: WpExtractedAssets | null = null;

async function readOptional(path: string): Promise<string> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}

export async function loadWpExtractedAssets(): Promise<WpExtractedAssets> {
  if (cached) return cached;

  const [navHtml, navStyles, footerHtml, footerStyles, fluentformStyles, bootV1215, bootPortfolioHome, bootNav] =
    await Promise.all([
      readFile(join(EXTRACTED, "nav.html"), "utf8"),
      readFile(join(EXTRACTED, "nav-styles.css"), "utf8"),
      readFile(join(EXTRACTED, "footer.html"), "utf8"),
      readFile(join(EXTRACTED, "footer-styles.css"), "utf8"),
      readOptional(join(EXTRACTED, "fluentform-styles.css")),
      readFile(join(EXTRACTED, "boot-0.js"), "utf8"),
      readFile(join(EXTRACTED, "boot-portfolio-home.js"), "utf8").catch(() =>
        readFile(join(EXTRACTED, "boot-1.js"), "utf8"),
      ),
      readFile(join(EXTRACTED, "boot-nav.js"), "utf8"),
    ]);

  cached = {
    navHtml: rewriteWpUrls(navHtml),
    navStyles: rewriteWpUrls(navStyles),
    footerHtml: rewriteWpUrls(footerHtml),
    footerStyles: rewriteWpUrls(footerStyles),
    fluentformStyles: rewriteWpUrls(fluentformStyles),
    bootV1215,
    bootPortfolioHome,
    bootNav,
  };

  return cached;
}
