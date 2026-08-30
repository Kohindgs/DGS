import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import { createHash } from "node:crypto";

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "data/wordpress/raw");
const OUT_DIR = path.join(ROOT, "data/wordpress/blocks");
const APPROVED_ASSETS = path.join(ROOT, "data/migration/approved-asset-replacements.json");
const ARCHIVE_HEADING_EVIDENCE = path.join(ROOT, "data/migration/archive-heading-evidence.json");

async function loadApprovedAssetReplacements() {
  try {
    const manifest = JSON.parse(await readFile(APPROVED_ASSETS, "utf8"));
    return manifest.replacements || [];
  } catch {
    return [];
  }
}

function normalizeRoutePath(pathName) {
  if (!pathName) return pathName;
  return pathName.endsWith("/") ? pathName : `${pathName}/`;
}

function applyArchiveHeadingCorrections(pathName, blocks) {
  const routePath = normalizeRoutePath(pathName);
  const corrections = applyArchiveHeadingCorrections.cache || [];
  for (const archive of corrections) {
    if (normalizeRoutePath(archive.route) !== routePath) continue;
    for (const block of blocks) {
      if (block.type === "heading" && block.level === 1 && block.text === archive.priorExtractedHeading) {
        block.text = archive.correctedExtractedHeading;
        block.id = archive.correctedExtractedHeading.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
      }
    }
  }
}

function applyApprovedAssetReplacements(pathName, blocks, replacements) {
  const routePath = normalizeRoutePath(pathName);
  for (const block of blocks) {
    if (block.type !== "image") continue;
    for (const replacement of replacements) {
      const routes = (replacement.routes || []).map(normalizeRoutePath);
      if (!routes.includes(routePath)) continue;
      const pattern = replacement.match?.pattern;
      if (!pattern || !block.src.includes(pattern)) continue;
      const next = replacement.replacement;
      block.src = next.localPath;
      if (next.alt) block.alt = next.alt;
      if (next.width) block.width = next.width;
      if (next.height) block.height = next.height;
      block.dimensionSource = "verified";
      block.approvedAssetReplacementId = replacement.id;
    }
  }
}

async function loadArchiveHeadingCorrections() {
  try {
    const evidence = JSON.parse(await readFile(ARCHIVE_HEADING_EVIDENCE, "utf8"));
    applyArchiveHeadingCorrections.cache = evidence.archives || [];
  } catch {
    applyArchiveHeadingCorrections.cache = [];
  }
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function decodeEntities(value = "") {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function normalizeText(html = "") {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function unwrapElementor($) {
  const selectors = [
    "[data-elementor-type]",
    "[data-elementor-id]",
    "[data-e_type]",
    ".elementor-element",
    ".elementor-widget",
    ".e-con",
    ".e-flex",
    ".e-grid",
    ".cmsmasters-block-default",
    ".cmsmasters-sticky-default",
  ];
  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const $el = $(el);
      $el.contents().each((_, child) => {
        if (child.type === "text" || child.type === "tag") {
          $el.before(child);
        }
      });
      $el.remove();
    });
  }
}

function cleanHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

function extractInlineSpans($, $el) {
  const spans = [];
  $el.contents().each((_, child) => {
    if (child.type === "text") {
      const text = decodeEntities(child.data || "");
      if (text) spans.push({ text });
    } else if (child.type === "tag") {
      const tag = child.tagName?.toLowerCase();
      if (tag === "strong" || tag === "b") {
        const inner = extractInlineSpans($, $(child));
        for (const s of inner) s.strong = true;
        spans.push(...inner);
      } else if (tag === "em" || tag === "i") {
        const inner = extractInlineSpans($, $(child));
        for (const s of inner) s.emphasis = true;
        spans.push(...inner);
      } else if (tag === "a") {
        const href = $(child).attr("href") || "";
        const inner = extractInlineSpans($, $(child));
        for (const s of inner) s.href = href || undefined;
        spans.push(...inner);
      } else {
        const text = decodeEntities($(child).text() || "");
        if (text) spans.push({ text });
      }
    }
  });
  return spans;
}

function serializeInline(spans) {
  return spans.map((s) => s.text).join("");
}

function traverseNode($, $node, blocks, depth = 0) {
  const tag = $node.get(0)?.tagName?.toLowerCase();
  if (!tag) return;

  if (tag === "script" || tag === "style" || tag === "noscript") {
    return;
  }

  if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") {
    const level = Number(tag.replace("h", ""));
    const text = normalizeText($node.html() || "");
    if (text) {
      blocks.push({
        type: "heading",
        level,
        text,
        id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60),
      });
    }
    return;
  }

  if (tag === "p") {
    const spans = extractInlineSpans($, $node);
    const text = serializeInline(spans);
    if (text) {
      blocks.push({ type: "paragraph", content: spans });
    }
    return;
  }

  if (tag === "div") {
    const hasInnerBlock = $node.find("h1, h2, h3, h4, h5, h6, p, ul, ol, img, figure, blockquote, table, details, .dgs-faq-item, [data-faq], video, iframe, form, a").length > 0;
    if (!hasInnerBlock) {
      const text = normalizeText($node.html() || "");
      if (text && text.length > 10) {
        blocks.push({ type: "paragraph", content: [{ text }] });
      }
      return;
    }
  }

  if (tag === "ul" || tag === "ol") {
    const ordered = tag === "ol";
    const items = [];
    $node.children("li").each((_, li) => {
      const $li = $(li);
      const spans = extractInlineSpans($, $li);
      const text = serializeInline(spans);
      if (text) items.push(spans);
    });
    if (items.length > 0) {
      blocks.push({ type: "list", ordered, items });
    }
    return;
  }

  if (tag === "img") {
    const src = $node.attr("src") || $node.attr("data-src") || $node.attr("data-lazy-src") || "";
    const alt = decodeEntities($node.attr("alt") || "");
    const width = Number($node.attr("width")) || undefined;
    const height = Number($node.attr("height")) || undefined;
    if (src) {
      blocks.push({ type: "image", src, alt, width, height, dimensionSource: width && height ? "verified" : "fallback" });
    }
    return;
  }

  if (tag === "figure") {
    const $img = $node.find("img").first();
    const src = $img.attr("src") || $img.attr("data-src") || "";
    const alt = decodeEntities($img.attr("alt") || "");
    const width = Number($img.attr("width")) || undefined;
    const height = Number($img.attr("height")) || undefined;
    const caption = decodeEntities($node.find("figcaption").text() || "").trim();
    if (src) {
      blocks.push({ type: "image", src, alt, width, height, caption: caption || undefined, dimensionSource: width && height ? "verified" : "fallback" });
    }
    return;
  }

  if (tag === "blockquote") {
    const text = normalizeText($node.html() || "");
    const cite = decodeEntities($node.find("cite").text() || "").trim();
    if (text) {
      blocks.push({ type: "quote", text, cite: cite || undefined });
    }
    return;
  }

  if (tag === "table") {
    const headers = [];
    const rows = [];
    $node.find("thead th").each((_, th) => {
      headers.push(normalizeText($(th).html() || ""));
    });
    $node.find("tbody tr").each((_, tr) => {
      const cells = [];
      $(tr).find("td").each((_, td) => {
        cells.push(normalizeText($(td).html() || ""));
      });
      if (cells.length > 0) rows.push(cells);
    });
    if (headers.length > 0 || rows.length > 0) {
      blocks.push({ type: "table", headers, rows });
    }
    return;
  }

  if (tag === "details" || tag === "div") {
    const $details = $node.find("details, .dgs-faq-item, [data-faq], .elementor-accordion-item");
    if ($details.length > 0) {
      const items = [];
      $details.each((_, detail) => {
        const $detail = $(detail);
        const question = normalizeText($detail.find("summary, .elementor-tab-title, h3, h4").first().html() || "");
        const answerSpans = extractInlineSpans($, $detail.find(".elementor-tab-content, .elementor-accordion-content, p").first());
        if (question && answerSpans.length > 0) {
          items.push({ question, answer: answerSpans });
        }
      });
      if (items.length > 0) {
        blocks.push({ type: "faq", items });
        return;
      }
    }
  }

  if (tag === "video") {
    const src = $node.attr("src") || $node.find("source").first().attr("src") || "";
    const poster = $node.attr("poster") || "";
    const title = decodeEntities($node.attr("title") || $node.attr("aria-label") || "");
    const width = Number($node.attr("width")) || undefined;
    const height = Number($node.attr("height")) || undefined;
    if (src) {
      blocks.push({ type: "video", src, poster: poster || undefined, title, width, height });
    }
    return;
  }

  if (tag === "iframe") {
    const src = $node.attr("src") || "";
    const title = decodeEntities($node.attr("title") || $node.attr("aria-label") || "");
    const width = Number($node.attr("width")) || undefined;
    const height = Number($node.attr("height")) || undefined;
    if (src) {
      blocks.push({ type: "embed", src, title, width, height });
    }
    return;
  }

  if (tag === "form") {
    const action = $node.attr("action") || "";
    const method = ($node.attr("method") || "POST").toUpperCase();
    const inputs = [];
    $node.find("input, textarea, select, button").each((_, field) => {
      const $field = $(field);
      inputs.push({
        name: $field.attr("name") || $field.attr("id") || undefined,
        type: $field.attr("type") || $field.prop("tagName")?.toLowerCase() || undefined,
        required: $field.attr("required") !== undefined,
      });
    });
    blocks.push({ type: "form", action, method, inputs, wordpressForm: true });
    return;
  }

  if (tag === "a" && $node.attr("href")?.startsWith("#")) {
    return;
  }

  if (tag === "a") {
    const href = $node.attr("href") || "";
    const spans = extractInlineSpans($, $node);
    if (spans.length > 0) {
      for (const s of spans) s.href = href;
      blocks.push({ type: "paragraph", content: spans });
    }
    return;
  }

  $node.contents().each((_, child) => {
    if (child.type === "text") {
      const text = decodeEntities(child.data || "").trim();
      if (text) {
        blocks.push({ type: "paragraph", content: [{ text }] });
      }
    } else if (child.type === "tag") {
      traverseNode($, $(child), blocks, depth + 1);
    }
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const approvedReplacements = await loadApprovedAssetReplacements();
  await loadArchiveHeadingCorrections();

  const [pages, services, posts] = await Promise.all([
    readJson(path.join(RAW_DIR, "pages.json")),
    readJson(path.join(RAW_DIR, "services.json")),
    readJson(path.join(RAW_DIR, "posts.json")),
  ]);

  const all = [...pages, ...services, ...posts];
  const out = {};

  for (const item of all) {
    const html = item.content?.rendered || "";
    const pathName = (() => { try { return new URL(item.link).pathname; } catch { return null; } })();
    if (!pathName) continue;

    const cleaned = cleanHtml(html);
    const $ = cheerio.load(cleaned);
    unwrapElementor($);

    const blocks = [];
    const bodyChildren = $("body").contents();
    bodyChildren.each((_, child) => {
      if (child.type === "text") {
        const text = decodeEntities(child.data || "").trim();
        if (text) {
          blocks.push({ type: "paragraph", content: [{ text }] });
        }
      } else if (child.type === "tag") {
        traverseNode($, $(child), blocks);
      }
    });

    applyApprovedAssetReplacements(pathName, blocks, approvedReplacements);
    applyArchiveHeadingCorrections(pathName, blocks);

    const visibleText = blocks
      .filter((b) => b.type === "paragraph" || b.type === "heading")
      .map((b) => (b.type === "paragraph" ? serializeInline(b.content || []) : b.text || ""))
      .join(" ");

    out[pathName] = {
      wordpressId: item.id,
      wordpressType: item.type,
      path: pathName,
      blocks,
      visibleTextSha256: createHash("sha256").update(visibleText).digest("hex"),
    };
  }

  await writeFile(path.join(OUT_DIR, "content-blocks.generated.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), blocks: out }, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ generatedAt: new Date().toISOString(), totalRoutes: Object.keys(out).length }, null, 2));
}

main().catch(console.error);
