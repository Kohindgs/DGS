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
  homeFluentformStyles: string;
  bootV1215: string;
  bootPortfolioHome: string;
  bootPortfolioInner: string;
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

  const [
    navHtml,
    navStyles,
    footerHtml,
    footerStyles,
    fluentformStyles,
    homeFluentformStyles,
    bootV1215,
    bootPortfolioHome,
    bootPortfolioInner,
    bootNav,
  ] = await Promise.all([
    readFile(join(EXTRACTED, "nav.html"), "utf8"),
    readFile(join(EXTRACTED, "nav-styles.css"), "utf8"),
    readFile(join(EXTRACTED, "footer.html"), "utf8"),
    readFile(join(EXTRACTED, "footer-styles.css"), "utf8"),
    readOptional(join(EXTRACTED, "fluentform-styles.css")),
    readOptional(join(EXTRACTED, "home-fluentform-styles.css")),
    readOptional(join(EXTRACTED, "boot-v1215-particles-only.js")).then(
      (particlesOnly) =>
        particlesOnly || readFile(join(EXTRACTED, "boot-0.js"), "utf8"),
    ),
    readFile(join(EXTRACTED, "boot-portfolio-home.js"), "utf8").catch(() =>
      readFile(join(EXTRACTED, "boot-1.js"), "utf8"),
    ),
    readFile(join(EXTRACTED, "boot-portfolio-8.js"), "utf8").catch(() =>
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
    homeFluentformStyles: rewriteWpUrls(homeFluentformStyles),
    bootV1215,
    bootPortfolioHome,
    bootPortfolioInner,
    bootNav,
  };

  return cached;
}
