#!/usr/bin/env node
/**
 * Extracts live WordPress homepage chrome (nav, footer, boot scripts) for exact mirror.
 * READ ONLY — does not modify production WordPress.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const WP_URL = "https://www.dgeniussolutions.com/";
const OUT_DIR = join(process.cwd(), "lib/wp-exact/extracted");

async function main() {
  const res = await fetch(WP_URL);
  if (!res.ok) throw new Error(`Failed to fetch ${WP_URL}: ${res.status}`);
  const html = await res.text();

  mkdirSync(OUT_DIR, { recursive: true });

  const navStart = html.indexOf('<div id="dgsNav">');
  const navEnd = html.indexOf("</div>", html.lastIndexOf('id="dgsFoot"')) + 6;
  const navHtml = navStart >= 0 ? html.slice(navStart, navEnd) : "";

  const navStyleStart = html.lastIndexOf("<style", navStart);
  const navStyleEnd = html.indexOf("</style>", navStyleStart) + 8;
  const navStyles = navStyleStart >= 0 ? html.slice(navStyleStart, navStyleEnd) : "";

  const footerMarker = '<footer class="dgs-footer-wrapper">';
  const footerStart = html.indexOf(footerMarker);
  const footerEnd = footerStart >= 0 ? html.indexOf("</footer>", footerStart) + 9 : -1;
  const footerHtml = footerStart >= 0 ? html.slice(footerStart, footerEnd) : "";

  const footerStyleStart = html.lastIndexOf("<style", footerStart);
  const footerStyleEnd = html.indexOf("</style>", footerStyleStart) + 8;
  const footerStyles =
    footerStyleStart >= 0 && footerStyleStart < footerStart
      ? html.slice(footerStyleStart, footerStyleEnd)
      : "";

  const mainEnd = html.indexOf("</main>");
  const tail = mainEnd >= 0 ? html.slice(mainEnd) : "";
  const bootScripts = [...tail.matchAll(/<script src="data:text\/javascript;base64,([^"]+)"[^>]*><\/script>/g)].map(
    (m) => Buffer.from(m[1], "base64").toString("utf8"),
  );

  const navEnd = html.indexOf("</div>", html.lastIndexOf('id="dgsFoot"')) + 6;
  const mainStart = html.indexOf('<main class="dgs-v1215"');
  const navChunk = navEnd >= 0 && mainStart > navEnd ? html.slice(navEnd, mainStart) : "";
  const navBootMatch = [...navChunk.matchAll(/data:text\/javascript;base64,([^"]+)/g)].find((m) => {
    const js = Buffer.from(m[1], "base64").toString("utf8");
    return js.includes("dgsToggle");
  });
  const navBoot = navBootMatch ? Buffer.from(navBootMatch[1], "base64").toString("utf8") : "";

  const manifest = {
    capturedAt: new Date().toISOString(),
    source: WP_URL,
    navHtmlLength: navHtml.length,
    navStylesLength: navStyles.length,
    footerHtmlLength: footerHtml.length,
    footerStylesLength: footerStyles.length,
    bootScriptCount: bootScripts.length,
    bootScriptLabels: ["v1215-motion", "portfolio-gallery", ...bootScripts.slice(2).map((_, i) => `script-${i + 2}`)],
  };

  writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  writeFileSync(join(OUT_DIR, "nav.html"), navHtml);
  writeFileSync(join(OUT_DIR, "nav-styles.css"), navStyles.replace(/^<style[^>]*>/, "").replace(/<\/style>$/, ""));
  writeFileSync(join(OUT_DIR, "footer.html"), footerHtml);
  writeFileSync(join(OUT_DIR, "footer-styles.css"), footerStyles.replace(/^<style[^>]*>/, "").replace(/<\/style>$/, ""));

  bootScripts.forEach((js, index) => {
    writeFileSync(join(OUT_DIR, `boot-${index}.js`), js);
  });
  if (navBoot) writeFileSync(join(OUT_DIR, "boot-nav.js"), navBoot);

  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
