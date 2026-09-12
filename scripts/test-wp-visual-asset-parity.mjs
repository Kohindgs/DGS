import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { findRelativeCssUrls } from "./lib/rebase-css-urls.mjs";
import { looksLikePlaceholderSrc } from "./lib/collect-visual-stylesheets.mjs";

const ROOT = process.cwd();
const SEO = path.join(ROOT, "data/wordpress/mirrors/pages/services__seo-services-in-mumbai.json");
const BRANDING = path.join(ROOT, "data/wordpress/mirrors/pages/services__branding.json");
const ABOUT = path.join(ROOT, "data/wordpress/mirrors/pages/about-us.json");
const FAMILIES = path.join(ROOT, "data/wordpress/mirrors/template-families.json");

describe("extracted HTML-widget families include live visual CSS", () => {
  it("SEO location page is no longer cssFiles: []", async () => {
    const page = JSON.parse(await readFile(SEO, "utf8"));
    assert.equal(page.family, "service-html-location-seo");
    assert.equal(page.source, "live");
    assert.ok(page.cssFiles.length >= 20, `expected live stylesheets, got ${page.cssFiles.length}`);
    assert.equal(
      page.fontLinks.some((tag) => /as=["']font["']/i.test(tag) || /cache\/fonts\//i.test(tag)),
      true,
    );
    assert.match(page.styles || "", /@font-face/);
  });

  it("branding HTML-widget page also received stylesheets", async () => {
    const page = JSON.parse(await readFile(BRANDING, "utf8"));
    assert.equal(page.family, "service-html-widget-other");
    assert.ok(page.cssFiles.length >= 20, `expected live stylesheets, got ${page.cssFiles.length}`);
  });

  it("template families mark HTML-widget routes as needing theme CSS", async () => {
    const doc = JSON.parse(await readFile(FAMILIES, "utf8"));
    for (const family of [
      "service-html-location-seo",
      "service-html-aeo",
      "service-html-ai-video",
      "service-html-llm",
      "service-html-geo",
      "service-html-performance",
      "service-html-widget-other",
    ]) {
      assert.equal(doc.families[family]?.needsThemeCss, true, family);
    }
  });
});

describe("downloaded stylesheets do not keep relative asset paths", () => {
  it("about-us CSS files rebase to absolute or data/hash URLs", async () => {
    const page = JSON.parse(await readFile(ABOUT, "utf8"));
    for (const file of page.cssFiles) {
      const css = await readFile(path.join(ROOT, "public/wp-mirror-css", file), "utf8");
      assert.deepEqual(findRelativeCssUrls(css), [], file);
    }
  });
});

describe("placeholder detection", () => {
  it("flags leftover 1x1 gif and data:image srcs", () => {
    assert.equal(looksLikePlaceholderSrc("data:image/gif;base64,R0lGODlhAQABAIAAAP"), true);
    assert.equal(looksLikePlaceholderSrc("/wp-content/uploads/real.webp"), false);
  });
});
