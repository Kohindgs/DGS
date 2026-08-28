import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SITE = new URL(process.env.DGS_SOURCE_URL || "https://www.dgeniussolutions.com");
const OUT_DIR = path.join(ROOT, "data/audit/live");
const tier0 = JSON.parse(await readFile(path.join(ROOT, "data/migration/tier0-routes.json"), "utf8"));
const routes = [...new Set(["/", "/contact-us/", ...tier0.routes.map((route) => route.path)])];
const pages = [];

for (const route of routes) {
  try {
    const response = await fetch(new URL(route, SITE), {
      redirect: "follow",
      headers: { Accept: "text/html,*/*", "User-Agent": "DGS-NextJS-Accessibility-Baseline/1.0" },
    });
    const html = await response.text();
    const imageTags = html.match(/<img\b[^>]*>/gi) || [];
    const inputTags = html.match(/<(?:input|select|textarea)\b[^>]*>/gi) || [];
    const buttonTags = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) || [];
    const anchorTags = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
    const headings = extractHeadings(html);
    const labels = new Map();
    for (const tag of html.match(/<label\b[^>]*>[\s\S]*?<\/label>/gi) || []) {
      const target = attr(tag, "for");
      if (target) labels.set(target, text(tag));
    }

    const imagesMissingAltAttribute = imageTags.filter((tag) => !hasAttr(tag, "alt")).length;
    const imagesBlankAlt = imageTags.filter((tag) => hasAttr(tag, "alt") && attr(tag, "alt") === "").length;
    const unlabeledControls = inputTags.filter((tag) => {
      const type = attr(tag, "type").toLowerCase();
      if (["hidden", "submit", "button", "reset", "image"].includes(type)) return false;
      const id = attr(tag, "id");
      return !attr(tag, "aria-label") && !attr(tag, "aria-labelledby") && !(id && labels.has(id));
    }).map((tag) => ({ name: attr(tag, "name"), id: attr(tag, "id"), type: attr(tag, "type") || tag.match(/^<([a-z]+)/i)?.[1] || "control" }));
    const unnamedButtons = buttonTags.filter((tag) => !text(tag) && !attr(tag, "aria-label") && !attr(tag, "aria-labelledby")).length;
    const unnamedAnchors = anchorTags.filter((tag) => !text(tag) && !attr(tag, "aria-label") && !attr(tag, "aria-labelledby") && !/<img\b[^>]*alt=["'][^"']+["']/i.test(tag)).length;
    const headingJumps = [];
    for (let index = 1; index < headings.length; index += 1) {
      if (headings[index].level - headings[index - 1].level > 1) headingJumps.push({ from: headings[index - 1], to: headings[index] });
    }
    const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] || "";
    const lang = attr(htmlTag, "lang");
    const viewport = (html.match(/<meta\b[^>]*name=["']viewport["'][^>]*>/i) || [""])[0];
    const skipLinkPresent = anchorTags.some((tag) => /^#/.test(attr(tag, "href")) && /skip/i.test(text(tag)));

    pages.push({
      path: route,
      status: response.status,
      lang,
      hasViewportMeta: Boolean(viewport),
      h1Count: headings.filter((heading) => heading.level === 1).length,
      headingJumps,
      imageCount: imageTags.length,
      imagesMissingAltAttribute,
      imagesBlankAlt,
      controlCount: inputTags.length,
      unlabeledControls,
      unnamedButtons,
      unnamedAnchors,
      skipLinkPresent,
    });
  } catch (error) {
    pages.push({ path: route, status: 0, error: String(error) });
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  source: SITE.origin,
  warning: "Static markup checks are a baseline only and do not replace browser/keyboard/screen-reader/axe testing on the final Next preview.",
  pages,
};
await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "accessibility-static.generated.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ pages: pages.map((page) => ({ path: page.path, h1Count: page.h1Count, missingAlt: page.imagesMissingAltAttribute, blankAlt: page.imagesBlankAlt, unlabeledControls: page.unlabeledControls?.length || 0, unnamedButtons: page.unnamedButtons, unnamedAnchors: page.unnamedAnchors, headingJumps: page.headingJumps?.length || 0 })) }, null, 2));

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decode(match[1].trim()) : "";
}
function hasAttr(tag, name) { return new RegExp(`\\s${name}(?:\\s*=|\\s|>)`, "i").test(tag); }
function decode(value = "") { return value.replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#0*39;/gi, "'"); }
function text(value = "") { return decode(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()); }
function extractHeadings(html) {
  const result = [];
  const regex = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(html))) result.push({ level: Number(match[1]), text: text(match[2]) });
  return result;
}
