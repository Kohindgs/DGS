#!/usr/bin/env node
/**
 * Rewrite stored inner-page mirrors in place: unwrap leftover lazy media and
 * strip captured footers. Does not re-fetch WordPress or change ranking copy.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { stripCapturedFooters, unwrapLazyMediaHtml, readHtmlAttr, isPlaceholderMediaUrl, upsertHtmlAttr } from "./lib/html-attrs.mjs";

const ROOT = process.cwd();
const PAGES_DIR = path.join(ROOT, "data/wordpress/mirrors/pages");

function unwrapDataBackgrounds(html) {
  return html.replace(/<(div|section|span|figure|a|header|footer|article|aside|li)\b[^>]*>/gi, (tag) => {
    const dataBg =
      readHtmlAttr(tag, "data-bg") ||
      readHtmlAttr(tag, "data-lazy-bg") ||
      readHtmlAttr(tag, "data-bg-webp");
    if (!dataBg || isPlaceholderMediaUrl(dataBg)) return tag;
    if (/background-image\s*:/i.test(tag)) return tag;
    const style = readHtmlAttr(tag, "style");
    if (style !== null) return upsertHtmlAttr(tag, "style", `background-image:url('${dataBg}');${style}`);
    return upsertHtmlAttr(tag, "style", `background-image:url('${dataBg}')`);
  });
}

function leftoverLazyCount(html) {
  let count = 0;
  for (const match of String(html || "").matchAll(/<img\b[^>]*>/gi)) {
    const src = readHtmlAttr(match[0], "src") || "";
    const dataSrc = readHtmlAttr(match[0], "data-src") || "";
    if (isPlaceholderMediaUrl(src) && dataSrc && !isPlaceholderMediaUrl(dataSrc)) count += 1;
  }
  return count;
}

async function main() {
  const files = (await readdir(PAGES_DIR)).filter((name) => name.endsWith(".json"));
  const changed = [];
  let lazyBefore = 0;
  let lazyAfter = 0;
  let footersStripped = 0;

  for (const file of files) {
    const full = path.join(PAGES_DIR, file);
    const page = JSON.parse(await readFile(full, "utf8"));
    const original = page.body || "";
    const beforeLazy = leftoverLazyCount(original);
    const hadFooter = /<footer\b/i.test(original);
    lazyBefore += beforeLazy;
    const next = unwrapDataBackgrounds(unwrapLazyMediaHtml(stripCapturedFooters(original)));
    const afterLazy = leftoverLazyCount(next);
    lazyAfter += afterLazy;
    if (hadFooter && !/<footer\b/i.test(next)) footersStripped += 1;
    if (next !== original) {
      page.body = next;
      await writeFile(full, `${JSON.stringify(page)}\n`);
      changed.push({ path: page.path || file, lazyBefore: beforeLazy, lazyAfter: afterLazy, footerStripped: hadFooter });
    }
  }

  const report = {
    files: files.length,
    rewritten: changed.length,
    leftoverLazyImgsBefore: lazyBefore,
    leftoverLazyImgsAfter: lazyAfter,
    footersStripped,
    routes: changed.map((row) => row.path),
  };
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
