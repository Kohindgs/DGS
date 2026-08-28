import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/audit/target");

function decodeHtmlEntities(value = "") {
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

function normalizeText(value = "") {
  return decodeHtmlEntities(value)
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeImageAlt(alt = "") {
  return normalizeText(alt);
}

function normalizeInternalLink(href = "") {
  if (!href) return "";
  let urlPath = href;
  try {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      const parsed = new URL(href);
      if (parsed.hostname.includes("dgeniussolutions.com")) {
        urlPath = parsed.pathname + parsed.search + parsed.hash;
      } else {
        return href;
      }
    }
  } catch {
    return href;
  }
  if (!urlPath.startsWith("/")) {
    urlPath = "/" + urlPath;
  }
  return urlPath;
}

function extractSourceData(blocks) {
  const nodes = [];
  const headings = [];
  const imageAlts = [];

  for (const b of blocks) {
    if (b.type === "paragraph") {
      const text = normalizeText((b.content || []).map((s) => s.text || "").join(""));
      if (text) nodes.push({ type: "paragraph", text });
    } else if (b.type === "heading") {
      const text = normalizeText(b.text || "");
      if (text) {
        nodes.push({ type: "heading", level: b.level, text });
        headings.push({ level: b.level, text });
      }
    } else if (b.type === "image") {
      const src = b.src || "";
      if (src.startsWith("data:image/svg+xml;base64,")) {
        try {
          const decoded = Buffer.from(src.split(",")[1] || "", "base64").toString();
          if (decoded.includes('width="1"') && decoded.includes('height="1"')) continue;
        } catch {
          // ignore decode errors
        }
      }
      const alt = normalizeImageAlt(b.alt || "");
      if (alt) {
        nodes.push({ type: "image", alt });
        imageAlts.push(alt);
      }
    }
  }

  const text = nodes.map((n) => n.text || n.alt).join(" ");
  return { nodes, headings, imageAlts, text };
}

function extractTargetData(articleHtml) {
  const nodes = [];
  const headings = [];
  const imageAlts = [];

  const cleanHtml = articleHtml
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  const matches = [];

  const blockRegex = /<(h[1-4]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = blockRegex.exec(cleanHtml))) {
    matches.push({ index: m.index, type: m[1].toLowerCase(), content: m[2] });
  }

  const imgRegex = /<img\b[^>]*>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(cleanHtml))) {
    matches.push({ index: imgMatch.index, type: "img", content: imgMatch[0] });
  }

  const inlineRegex = /<(span|cite|small|strong|em|mark|b|i|u|s|sub|sup)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let inlineMatch;
  while ((inlineMatch = inlineRegex.exec(cleanHtml))) {
    matches.push({ index: inlineMatch.index, type: "inline", tag: inlineMatch[1].toLowerCase(), content: inlineMatch[2] });
  }

  matches.sort((a, b) => a.index - b.index);

  for (const match of matches) {
    if (match.type === "h1" || match.type === "h2" || match.type === "h3" || match.type === "h4") {
      const text = normalizeText(match.content.replace(/<[^>]+>/g, " "));
      if (text) {
        const level = Number(match.type[1]);
        headings.push({ level, text });
        nodes.push({ type: "heading", level, text });
      }
    } else if (match.type === "p" || match.type === "li") {
      const text = normalizeText(match.content.replace(/<[^>]+>/g, " "));
      if (text) {
        nodes.push({ type: "paragraph", text });
      }
    } else if (match.type === "img") {
      const altMatch = match.content.match(/alt="([^"]*)"/i);
      const srcMatch = match.content.match(/src="([^"]*)"/i);
      const src = srcMatch ? srcMatch[1] : "";
      if (src.startsWith("data:image/svg+xml;base64,")) {
        try {
          const decoded = Buffer.from(src.split(",")[1] || "", "base64").toString();
          if (decoded.includes('width="1"') && decoded.includes('height="1"')) continue;
        } catch {
          // ignore
        }
      }
      const alt = normalizeImageAlt(altMatch ? altMatch[1] : "");
      if (alt) {
        imageAlts.push(alt);
        nodes.push({ type: "image", alt });
      }
    } else if (match.type === "inline") {
      const text = normalizeText(match.content.replace(/<[^>]+>/g, " "));
      if (text && text.length > 1) {
        nodes.push({ type: "paragraph", text });
      }
    }
  }

  const text = nodes.map((n) => n.text || n.alt).join(" ");
  return { nodes, headings, imageAlts, text };
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const blocks = JSON.parse(await readFile(path.join(ROOT, "data/wordpress/blocks/content-blocks.generated.json"), "utf8"));
  const wpBlocks = blocks.blocks["/"]?.blocks || [];

  const response = await fetch("http://127.0.0.1:3000/");
  const html = await response.text();

  const articleMatch = html.match(/<article\b[^>]*data-migration-content[^>]*>([\s\S]*)<\/article>/i);
  const articleHtml = articleMatch?.[1] || "";

  const source = extractSourceData(wpBlocks);
  const target = extractTargetData(articleHtml);

  const sourceSemanticHash = createHash("sha256").update(source.text).digest("hex");
  const targetSemanticHash = createHash("sha256").update(target.text).digest("hex");

  const sourceHeadingSequence = source.headings.map((h) => `${h.level}: ${h.text}`);
  const targetHeadingSequence = target.headings.map((h) => `${h.level}: ${h.text}`);

  const sourceImageAltCount = source.imageAlts.length;
  const targetImageAltCount = target.imageAlts.length;

  const sourceTextNodeCount = source.nodes.length;
  const targetTextNodeCount = target.nodes.length;

  const sourceCharacterCount = source.text.length;
  const targetCharacterCount = target.text.length;

  const missingSourceItems = [];
  const extraTargetItems = [];
  const duplicateTargetItems = [];

  const sourceTexts = source.nodes.map((n) => n.text || n.alt);
  const targetTexts = target.nodes.map((n) => n.text || n.alt);

  const sourceTextMap = new Map();
  for (const t of sourceTexts) {
    sourceTextMap.set(t, (sourceTextMap.get(t) || 0) + 1);
  }

  const targetTextMap = new Map();
  for (const t of targetTexts) {
    targetTextMap.set(t, (targetTextMap.get(t) || 0) + 1);
  }

  for (const [text, count] of sourceTextMap) {
    const targetCount = targetTextMap.get(text) || 0;
    if (targetCount < count) {
      missingSourceItems.push({ text, sourceCount: count, targetCount });
    }
  }

  for (const [text, count] of targetTextMap) {
    const sourceCount = sourceTextMap.get(text) || 0;
    if (sourceCount === 0) {
      extraTargetItems.push({ text, count });
    } else if (count > sourceCount) {
      duplicateTargetItems.push({ text, sourceCount, targetCount: count });
    }
  }

  const headingsMatch = JSON.stringify(sourceHeadingSequence) === JSON.stringify(targetHeadingSequence);
  const textMatch = source.text === target.text;
  const countsMatch =
    sourceTextNodeCount === targetTextNodeCount &&
    sourceImageAltCount === targetImageAltCount &&
    sourceCharacterCount === targetCharacterCount;
  const noMissing = missingSourceItems.length === 0;
  const noExtra = extraTargetItems.length === 0;
  const noDuplicates = duplicateTargetItems.length === 0;

  const wpInternalLinkCounts = new Map();
  for (const b of wpBlocks) {
    if (b.type === "paragraph") {
      for (const s of b.content || []) {
        if (s.href) {
          const norm = normalizeInternalLink(s.href);
          if (norm.startsWith("/")) {
            wpInternalLinkCounts.set(norm, (wpInternalLinkCounts.get(norm) || 0) + 1);
          }
        }
      }
    }
  }

  const targetInternalLinkCounts = new Map();
  const linkRegex = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(articleHtml))) {
    const href = linkMatch[1];
    const norm = normalizeInternalLink(href);
    if (norm.startsWith("/")) {
      targetInternalLinkCounts.set(norm, (targetInternalLinkCounts.get(norm) || 0) + 1);
    }
  }

  const wpInternalLinks = [...wpInternalLinkCounts.keys()];
  const targetInternalLinks = [...targetInternalLinkCounts.keys()];

  const missingInternalLinks = [];
  const extraInternalLinks = [];

  for (const [link, sourceCount] of wpInternalLinkCounts) {
    const targetCount = targetInternalLinkCounts.get(link) || 0;
    if (targetCount < sourceCount) {
      missingInternalLinks.push({ link, sourceCount, targetCount });
    }
  }

  for (const [link, targetCount] of targetInternalLinkCounts) {
    const sourceCount = wpInternalLinkCounts.get(link) || 0;
    if (sourceCount === 0) {
      extraInternalLinks.push({ link, targetCount });
    } else if (targetCount > sourceCount) {
      extraInternalLinks.push({ link, sourceCount, targetCount });
    }
  }

  const noMissingLinks = missingInternalLinks.length === 0;
  const noExtraLinks = extraInternalLinks.length === 0;
  const contentParity =
    headingsMatch &&
    textMatch &&
    countsMatch &&
    noMissing &&
    noExtra &&
    noDuplicates &&
    noMissingLinks &&
    noExtraLinks;

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
  const canonicalMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/);
  const robotsMatch = html.match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/);
  const h1Count = (html.match(/<h1/gi) || []).length;

  const EXPECTED_TITLE = "Digital Marketing Agency in Mumbai | D'Genius Solutions";
  const EXPECTED_CANONICAL = "https://www.dgeniussolutions.com/";
  const EXPECTED_ROBOTS = "index, follow";

  const parity = {
    generatedAt: new Date().toISOString(),
    path: "/",
    wordpressId: 63505,
    status: response.status,
    title: titleMatch ? decodeHtmlEntities(titleMatch[1]) : null,
    canonical: canonicalMatch ? canonicalMatch[1] : null,
    robots: robotsMatch ? robotsMatch[1] : null,
    h1Count,
    sourceSemanticHash,
    targetSemanticHash,
    sourceCharacterCount,
    targetCharacterCount,
    sourceTextNodeCount,
    targetTextNodeCount,
    sourceHeadingSequence,
    targetHeadingSequence,
    sourceImageAltCount,
    targetImageAltCount,
    missingSourceItems,
    extraTargetItems,
    duplicateTargetItems,
    wpInternalLinks,
    targetInternalLinks,
    missingInternalLinks,
    extraInternalLinks,
    contentParity,
    failures: [],
  };

  if (response.status !== 200) {
    parity.failures.push(`HTTP ${response.status}`);
  }
  if (parity.title !== EXPECTED_TITLE) {
    parity.failures.push(`title mismatch: ${parity.title}`);
  }
  if (parity.canonical !== EXPECTED_CANONICAL) {
    parity.failures.push(`canonical mismatch: ${parity.canonical}`);
  }
  if (parity.robots !== EXPECTED_ROBOTS) {
    parity.failures.push(`robots mismatch: ${parity.robots}`);
  }
  if (h1Count !== 1) {
    parity.failures.push(`expected 1 H1, found ${h1Count}`);
  }
  if (!articleMatch) {
    parity.failures.push("missing article marker");
  }
  if (missingInternalLinks.length > 0) {
    parity.failures.push(`${missingInternalLinks.length} missing internal links`);
  }
  if (extraInternalLinks.length > 0) {
    parity.failures.push(`${extraInternalLinks.length} extra internal links`);
  }
  if (!contentParity) {
    const parts = [];
    if (!headingsMatch) parts.push("heading sequence mismatch");
    if (!textMatch) parts.push("normalized text mismatch");
    if (!countsMatch) parts.push("count mismatch");
    if (missingSourceItems.length > 0) parts.push(`${missingSourceItems.length} missing items`);
    if (extraTargetItems.length > 0) parts.push(`${extraTargetItems.length} extra items`);
    if (duplicateTargetItems.length > 0) parts.push(`${duplicateTargetItems.length} duplicate items`);
    if (missingInternalLinks.length > 0) parts.push(`${missingInternalLinks.length} missing internal links`);
    if (extraInternalLinks.length > 0) parts.push(`${extraInternalLinks.length} extra internal links`);
    parity.failures.push(parts.join(", ") || "content parity mismatch");
  }

  await writeFile(path.join(OUT, "homepage-parity.json"), `${JSON.stringify(parity, null, 2)}\n`, "utf8");

  console.log("Homepage parity result:", parity.failures.length === 0 ? "PASS" : "FAIL");
  console.log("Failures:", parity.failures);
  console.log("Source semantic hash:", sourceSemanticHash.substring(0, 16));
  console.log("Target semantic hash:", targetSemanticHash.substring(0, 16));
  console.log("Content parity:", contentParity);
}

main().catch(console.error);
