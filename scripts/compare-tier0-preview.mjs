import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { classifyNoindex, expectsStagingNoindex } from "./lib/migration-audit-shared.mjs";

const ROOT = process.cwd();
const TARGET = new URL(process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3000");
const OUT_DIR = path.join(ROOT, "data/audit/target");
const [tier0, contentBaseline, exceptionsFile] = await Promise.all([
  readJson(path.join(ROOT, "data/migration/tier0-routes.json")),
  readJson(path.join(ROOT, "data/migration/tier0-content-baseline.generated.json")),
  readJson(path.join(ROOT, "data/migration/tier0-parity-exceptions.approved.json")),
]);
const sourceByPath = new Map(contentBaseline.baselines.map((item) => [item.path, item]));
const exceptionsByPath = new Map((exceptionsFile.exceptions || []).map((item) => [item.path, item]));

function decode(value = "") {
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
function text(html = "") {
  return decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}
function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decode(match[1].trim()) : "";
}
function canonical(html) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) if (attr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical")) return attr(tag, "href");
  return "";
}
function meta(html, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) if (attr(tag, "name").toLowerCase() === name.toLowerCase()) return attr(tag, "content");
  return "";
}
function first(html, regex) { const match = html.match(regex); return match ? text(match[1]) : ""; }
function sha(value) { return createHash("sha256").update(value).digest("hex"); }
function normalizePath(value) {
  const url = new URL(value, TARGET);
  let pathname = url.pathname || "/";
  if (pathname !== "/" && !pathname.endsWith("/") && !/\.[a-z0-9]{1,8}$/i.test(pathname)) pathname += "/";
  return pathname;
}
function internalLinks(html, pageUrl) {
  const paths = [];
  for (const tag of html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || []) {
    const href = attr(tag, "href");
    if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) continue;
    try {
      const url = new URL(href, pageUrl);
      if (url.origin === TARGET.origin) paths.push(normalizePath(url.pathname));
    } catch { /* malformed links handled in full target audit */ }
  }
  return [...new Set(paths)];
}

const reports = [];
const failures = [];
const expectedStaging = [];
const realFailures = [];
for (const route of tier0.routes) {
  const source = sourceByPath.get(route.path);
  const exception = exceptionsByPath.get(route.path) || {};
  const url = new URL(route.path, TARGET);
  const response = await fetch(url, { redirect: "manual", headers: { Accept: "text/html,*/*", "User-Agent": "DGS-NextJS-Target-Parity/1.0" } });
  const html = await response.text();
  const title = first(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const h1 = first(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const canonicalUrl = canonical(html);
  const robots = meta(html, "robots");
  const xRobots = response.headers.get("x-robots-tag") || "";
  const noindexInfo = classifyNoindex(robots, xRobots);
  const articleMatch = html.match(/<article\b[^>]*data-migration-content[^>]*>([\s\S]*?)<\/article>/i);
  const articleHtml = articleMatch?.[1] || "";
  const articleText = text(articleHtml);
  const articleSha = sha(articleText);
  const targetLinks = internalLinks(articleHtml, url);
  const sourceLinks = [...new Set((source?.internalLinks || []).map((item) => normalizePath(item.path)))];
  const allowedMissingLinks = new Set(exception.allowedMissingInternalLinks || []);
  const missingInternalLinks = sourceLinks.filter((item) => !targetLinks.includes(item) && !allowedMissingLinks.has(item));
  const exactContent = source ? articleSha === source.content.normalizedTextSha256 : false;

  const itemFailures = [];
  const recordFailure = (message, expected = false) => {
    itemFailures.push(message);
    failures.push(`${route.path}: ${message}`);
    if (expected) expectedStaging.push(`${route.path}: ${message}`);
    else realFailures.push(`${route.path}: ${message}`);
  };

  if (response.status !== 200) recordFailure(`expected 200, received ${response.status}`);
  if (response.status >= 300 && response.status < 400) recordFailure(`protected route redirects to ${response.headers.get("location") || "unknown"}`);
  if (noindexInfo.hasNoindex) recordFailure(noindexInfo.label || "noindex detected", noindexInfo.classification === "A");
  if (title !== route.observedTitle && exception.allowTitleChange !== true) recordFailure("title differs from protected baseline");
  if (h1 !== route.observedH1 && exception.allowH1Change !== true) recordFailure("H1 differs from protected baseline");
  if (!canonicalUrl) recordFailure("canonical missing");
  else if (normalizePath(canonicalUrl) !== normalizePath(route.desiredCanonicalPath || route.path)) recordFailure(`canonical points to ${canonicalUrl}`);
  if (!articleMatch) recordFailure("semantic migration article marker missing");
  if (source && !exactContent && exception.allowContentHashChange !== true) recordFailure("normalized visible content hash differs from WordPress baseline");
  if (missingInternalLinks.length) recordFailure(`missing ${missingInternalLinks.length} protected source internal-link destinations`);

  reports.push({
    path: route.path,
    status: response.status,
    title,
    h1,
    canonical: canonicalUrl,
    robots,
    xRobotsTag: xRobots,
    noindexClassification: noindexInfo.label,
    expectStagingNoindex: expectsStagingNoindex(),
    articleCharacterCount: articleText.length,
    articleSha256: articleSha,
    sourceArticleSha256: source?.content.normalizedTextSha256 || null,
    exactContent,
    sourceInternalLinkDestinations: sourceLinks.length,
    targetInternalLinkDestinations: targetLinks.length,
    missingInternalLinks,
    approvedExceptions: exception,
    failures: itemFailures,
  });
}

const output = {
  checkedAt: new Date().toISOString(),
  target: TARGET.origin,
  expectStagingNoindex: expectsStagingNoindex(),
  reports,
  failures,
  expectedStagingFailures: expectedStaging,
  realFailures,
};
await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "tier0-parity.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify(
    {
      target: TARGET.origin,
      protectedPages: reports.length,
      expectStagingNoindex: expectsStagingNoindex(),
      expectedStagingFailures: expectedStaging,
      realFailures,
      failures,
    },
    null,
    2,
  ),
);
if (realFailures.length) process.exitCode = 1;

async function readJson(file) { return JSON.parse(await readFile(file, "utf8")); }
