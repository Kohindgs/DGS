import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inferMediaSize } from "../lib/portfolio/infer-media-size.ts";
import { layoutJustified } from "../lib/portfolio/justified-layout.ts";
import {
  NATIVE_JUSTIFIED_GALLERY_MOUNT,
  replaceEnviraWrapWithNativeMount,
  unwrapMirrorLazyMedia,
} from "../lib/wordpress/native-inner-fixes.ts";

describe("inferMediaSize", () => {
  it("reads WordPress thumbnail dimensions from the filename", () => {
    assert.deepEqual(
      inferMediaSize("https://example.com/SS_01-3-1-1024x576.png.webp"),
      { width: 1024, height: 576 },
    );
    assert.deepEqual(inferMediaSize("https://example.com/420-720PX_SOS.png.webp"), {
      width: 420,
      height: 720,
    });
  });
});

describe("layoutJustified", () => {
  it("packs overflowing items onto the next row and stretches the completed row", () => {
    const items = [
      { id: 1, width: 1600, height: 400 },
      { id: 2, width: 1600, height: 400 },
      { id: 3, width: 800, height: 400 },
    ];
    const rows = layoutJustified(items, {
      containerWidth: 1440,
      rowHeight: 150,
      gutter: 10,
      justifyLastRow: false,
    });
    assert.ok(rows.length >= 1);
    const first = rows[0];
    const total = first.items.reduce((sum, cell) => sum + cell.width, 0) + 10 * (first.items.length - 1);
    assert.ok(Math.abs(total - 1440) < 1);
    assert.ok(first.items.length >= 1);
  });

  it("matches live WordPress desktop packing for 16:9 thumbs at 1280px", () => {
    const items = Array.from({ length: 6 }, (_, index) => ({
      id: index + 1,
      width: 1024,
      height: 576,
    }));
    const rows = layoutJustified(items, {
      containerWidth: 1280,
      rowHeight: 150,
      gutter: 1,
      justifyLastRow: false,
    });
    assert.equal(rows[0].items.length, 4);
    assert.ok(Math.abs(rows[0].height - 180) < 2);
  });

  it("matches live WordPress mobile packing for a 16:9 thumb at 390px", () => {
    const rows = layoutJustified(
      [
        { id: 1, width: 1024, height: 576 },
        { id: 2, width: 1024, height: 576 },
      ],
      {
        containerWidth: 390,
        rowHeight: 150,
        gutter: 0,
        justifyLastRow: false,
      },
    );
    assert.equal(rows[0].items.length, 1);
    assert.ok(Math.abs(rows[0].height - 219.375) < 1);
  });
});

describe("unwrapMirrorLazyMedia", () => {
  it("drops 1x1 gif srcset so the real src is used", () => {
    const html =
      '<img src="https://www.dgeniussolutions.com/wp-content/uploads/a.jpg" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/uploads/a.jpg 400w">';
    const out = unwrapMirrorLazyMedia(html);
    assert.equal(out.includes("data:image/gif"), false);
    assert.equal(out.includes("wp-content/uploads/a.jpg"), true);
  });

  it("promotes data-src over svg placeholders", () => {
    const html =
      '<img src="data:image/svg+xml;base64,PHN2Zy8+" data-src="https://www.dgeniussolutions.com/wp-content/uploads/logo.png" class="lazyload">';
    const out = unwrapMirrorLazyMedia(html);
    assert.match(out, /src="https:\/\/www\.dgeniussolutions\.com\/wp-content\/uploads\/logo\.png"/);
  });
});

describe("replaceEnviraWrapWithNativeMount", () => {
  it("replaces a nested wrap with the native mount marker", () => {
    const html =
      '<div class="before"></div><div id="envira-gallery-wrap-63155" class="envira-gallery-wrap"><div id="envira-gallery-63155"><div class="envira-gallery-item"></div></div></div><div class="after"></div>';
    const out = replaceEnviraWrapWithNativeMount(html);
    assert.equal(out.includes("envira-gallery-wrap-63155"), false);
    assert.equal(out.includes(NATIVE_JUSTIFIED_GALLERY_MOUNT), true);
    assert.equal(out.includes('<div class="before"></div>'), true);
    assert.equal(out.includes('<div class="after"></div>'), true);
  });
});
