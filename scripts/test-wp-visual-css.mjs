import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rebaseCssUrls, resolveCssAssetUrl, findRelativeCssUrls } from "./lib/rebase-css-urls.mjs";
import {
  collectFontLinkTags,
  collectHeadVisualCss,
  collectHtmlVisualAssetUrls,
  collectVisualStylesheetUrls,
  isVisualStylesheetHref,
  looksLikePlaceholderSrc,
} from "./lib/collect-visual-stylesheets.mjs";

const SHEET = "https://www.dgeniussolutions.com/wp-content/plugins/example/css/widget.css";

describe("resolveCssAssetUrl", () => {
  it("resolves ../images/foo.svg against the stylesheet", () => {
    assert.equal(
      resolveCssAssetUrl("../images/foo.svg", SHEET),
      "https://www.dgeniussolutions.com/wp-content/plugins/example/images/foo.svg",
    );
  });

  it("resolves ../../../uploads/foo.webp from a plugin css folder", () => {
    assert.equal(
      resolveCssAssetUrl("../../../uploads/foo.webp", SHEET),
      "https://www.dgeniussolutions.com/wp-content/uploads/foo.webp",
    );
  });

  it("resolves root-relative /wp-content/uploads/foo.webp", () => {
    assert.equal(
      resolveCssAssetUrl("/wp-content/uploads/foo.webp", SHEET),
      "https://www.dgeniussolutions.com/wp-content/uploads/foo.webp",
    );
  });

  it("keeps absolute https URLs", () => {
    assert.equal(
      resolveCssAssetUrl("https://cdn.example.com/a.png", SHEET),
      "https://cdn.example.com/a.png",
    );
  });

  it("resolves protocol-relative URLs with the stylesheet protocol", () => {
    assert.equal(
      resolveCssAssetUrl("//cdn.example.com/a.png", SHEET),
      "https://cdn.example.com/a.png",
    );
  });

  it("preserves data URLs", () => {
    const data = "data:image/svg+xml;base64,AAAA";
    assert.equal(resolveCssAssetUrl(data, SHEET), data);
  });

  it("preserves query strings and hashes on font files", () => {
    assert.equal(
      resolveCssAssetUrl("../fonts/eicons.woff2?5.53.0#iefix", SHEET),
      "https://www.dgeniussolutions.com/wp-content/plugins/example/fonts/eicons.woff2?5.53.0#iefix",
    );
  });

  it("preserves fragment-only svg filter urls", () => {
    assert.equal(resolveCssAssetUrl("#n", SHEET), "#n");
    assert.equal(resolveCssAssetUrl("%23n", SHEET), "%23n");
  });
});

describe("rebaseCssUrls", () => {
  it("rewrites url() in background-image, mask, content, and @font-face", () => {
    const css = `
      .a { background-image: url("../images/icon.svg"); }
      .b { background: #000 url('../../../uploads/foo.webp') center; }
      .c { mask-image: url(../images/mask.svg); mask: url("../images/mask.svg"); }
      .d::before { content: url("../images/check.svg"); }
      .e { list-style-image: url("../images/bullet.svg"); }
      @font-face { src: url("../fonts/fa.woff2") format("woff2"); }
    `;
    const out = rebaseCssUrls(css, SHEET);
    assert.match(out, /plugins\/example\/images\/icon\.svg/);
    assert.match(out, /wp-content\/uploads\/foo\.webp/);
    assert.match(out, /plugins\/example\/images\/mask\.svg/);
    assert.match(out, /plugins\/example\/images\/check\.svg/);
    assert.match(out, /plugins\/example\/images\/bullet\.svg/);
    assert.match(out, /plugins\/example\/fonts\/fa\.woff2/);
    assert.equal(out.includes("url(../images/icon.svg)"), false);
  });

  it("does not rewrite nested url() inside quoted SVG data URLs", () => {
    const css =
      '.grain{background-image:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'n\'/><rect filter=\'url(%23n)\'/></svg>");}';
    const out = rebaseCssUrls(css, SHEET);
    assert.match(out, /data:image\/svg\+xml;utf8/);
    assert.match(out, /url\(%23n\)/);
    assert.equal(out.includes("plugins/example"), false);
  });

  it("rewrites @import including quoted relative files", () => {
    const css = '@import "../more.css";\n@import url("./fonts.css");\n@import "./more.css" screen;';
    const out = rebaseCssUrls(css, SHEET);
    assert.match(out, /plugins\/example\/more\.css/);
    assert.match(out, /plugins\/example\/css\/fonts\.css/);
    assert.match(out, /plugins\/example\/css\/more\.css/);
  });

  it("does not corrupt data URLs or Google font URLs", () => {
    const css =
      ".x{background:url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=)}@import url(https://fonts.googleapis.com/css2?family=Inter);";
    const out = rebaseCssUrls(css, SHEET);
    assert.match(out, /data:image\/gif;base64,/);
    assert.match(out, /fonts\.googleapis\.com\/css2/);
  });

  it("reports leftover relative url() values", () => {
    assert.deepEqual(findRelativeCssUrls("a{background:url(../images/x.svg)}"), ["../images/x.svg"]);
    assert.deepEqual(findRelativeCssUrls("a{background:url(/wp-content/uploads/foo.webp)}"), [
      "/wp-content/uploads/foo.webp",
    ]);
    assert.deepEqual(findRelativeCssUrls("a{background:url(https://cdn.example.com/x.svg)}"), []);
  });
});

describe("collectVisualStylesheetUrls", () => {
  it("captures LiteSpeed, Elementor, theme, and plugin CSS from live DOM", () => {
    const html = `
      <link rel="stylesheet" href="https://www.dgeniussolutions.com/wp-content/litespeed/css/7264475e5e2ed82579e0ba85303a23ae.css?ver=a23ae">
      <link rel="stylesheet" href="/wp-content/plugins/elementor/assets/css/frontend.min.css">
      <link rel="stylesheet" href="/wp-content/themes/softy/style.css">
      <link rel="stylesheet" href="/wp-content/uploads/elementor/css/post-40278.css">
      <link rel="stylesheet" href="/wp-admin/css/common.css">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope">
    `;
    const urls = collectVisualStylesheetUrls(html, "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/");
    assert.equal(urls.some((u) => /litespeed\/css\/7264475e/.test(u)), true);
    assert.equal(urls.some((u) => /elementor\/assets\/css\/frontend/.test(u)), true);
    assert.equal(urls.some((u) => /themes\/softy/.test(u)), true);
    assert.equal(urls.some((u) => /elementor\/css\/post-40278/.test(u)), true);
    assert.equal(urls.some((u) => /wp-admin/.test(u)), false);
    assert.equal(urls.some((u) => /fonts\.googleapis/.test(u)), false);
  });

  it("does not treat HTML-widget families as CSS-free", () => {
    assert.equal(
      isVisualStylesheetHref(
        "https://www.dgeniussolutions.com/wp-content/litespeed/css/1d4b9ba56f25c8e3b8aa30628fe10fd5.css",
      ),
      true,
    );
  });
});

describe("collectFontLinkTags", () => {
  it("keeps Google preconnect and cached webfont preloads", () => {
    const html = `
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link rel="preload" as="font" href="/wp-content/cache/fonts/1/google-fonts/fonts/s/manrope/v20/xn7gYHE41ni1AdIRggexSg.woff2" crossorigin>
    `;
    const tags = collectFontLinkTags(html, "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/");
    assert.equal(tags.length, 2);
    assert.match(tags.join(""), /fonts\.gstatic\.com/);
    assert.match(tags.join(""), /https:\/\/www\.dgeniussolutions\.com\/wp-content\/cache\/fonts\//);
  });
});

describe("looksLikePlaceholderSrc", () => {
  it("detects gif placeholders", () => {
    assert.equal(
      looksLikePlaceholderSrc(
        "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
      ),
      true,
    );
    assert.equal(looksLikePlaceholderSrc("https://www.dgeniussolutions.com/wp-content/uploads/a.png"), false);
  });
});

describe("collectHeadVisualCss", () => {
  it("keeps @font-face and small Elementor background CSS and skips the lazy-bg killer", () => {
    const html = `
      <style>@font-face{font-family:"Manrope";src:url("/wp-content/cache/fonts/manrope.woff2") format("woff2");}</style>
      <style>.e-con.e-parent:nth-of-type(n+4):not(.e-lazyloaded){background-image:none !important}</style>
      <style>#dgsNav{color:red}</style>
      <style>.elementor-52 .x{background-image:url("/wp-content/uploads/hero.webp");}</style>
    `;
    const css = collectHeadVisualCss(html);
    assert.match(css, /@font-face/);
    assert.match(css, /hero\.webp/);
    assert.equal(css.includes("e-lazyloaded"), false);
    assert.equal(css.includes("#dgsNav"), false);
  });
});

describe("collectHtmlVisualAssetUrls", () => {
  it("collects img src, srcset, and data-src", () => {
    const html =
      '<img src="https://www.dgeniussolutions.com/wp-content/uploads/a.png" srcset="https://www.dgeniussolutions.com/wp-content/uploads/a-400.png 400w" data-src="https://www.dgeniussolutions.com/wp-content/uploads/a.png">';
    const urls = collectHtmlVisualAssetUrls(html);
    assert.equal(urls.length, 2);
  });
});
