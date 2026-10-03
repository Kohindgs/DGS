import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { unwrapMirrorLazyMedia } from "@/lib/wordpress/native-inner-fixes";
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
  bootFooter: string;
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
    bootFooter,
  ] = await Promise.all([
    readOptional(join(EXTRACTED, "nav.html")),
    readOptional(join(EXTRACTED, "nav-styles.css")),
    readOptional(join(EXTRACTED, "footer.html")),
    readOptional(join(EXTRACTED, "footer-styles.css")),
    readOptional(join(EXTRACTED, "fluentform-styles.css")),
    readOptional(join(EXTRACTED, "home-fluentform-styles.css")),
    readOptional(join(EXTRACTED, "boot-v1215-particles-only.js")).then(
      async (particlesOnly) =>
        particlesOnly || (await readOptional(join(EXTRACTED, "boot-0.js"))),
    ),
    readOptional(join(EXTRACTED, "boot-portfolio-home.js")).then(
      async (pHome) => pHome || (await readOptional(join(EXTRACTED, "boot-1.js"))),
    ),
    readOptional(join(EXTRACTED, "boot-portfolio-8.js")).then(
      async (p8) => p8 || (await readOptional(join(EXTRACTED, "boot-1.js"))),
    ),
    readOptional(join(EXTRACTED, "boot-nav.js")),
    readOptional(join(EXTRACTED, "boot-footer.js")).then(
      async (f) => f || (await readOptional(join(EXTRACTED, "boot-2.js"))),
    ),
  ]);

  cached = {
    navHtml: unwrapMirrorLazyMedia(rewriteWpUrls(navHtml)),
    navStyles: rewriteWpUrls(navStyles),
    // Keep the footer map iframe lazy; footer images already have real src values.
    footerHtml: rewriteWpUrls(footerHtml),
    footerStyles: rewriteWpUrls(footerStyles),
    fluentformStyles: rewriteWpUrls(fluentformStyles),
    homeFluentformStyles: rewriteWpUrls(homeFluentformStyles),
    bootV1215,
    bootPortfolioHome,
    bootPortfolioInner,
    bootNav,
    bootFooter,
  };

  return cached;
}
