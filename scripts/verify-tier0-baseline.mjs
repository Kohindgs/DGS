import { readFile } from "node:fs/promises";

const SOURCE = new URL("https://www.dgeniussolutions.com");
const TARGET = new URL(process.env.TIER0_TARGET_URL || SOURCE.href);
const baseline = JSON.parse(
  await readFile(new URL("../data/migration/tier0-routes.json", import.meta.url), "utf8"),
);

const sourceMode = TARGET.origin === SOURCE.origin;

function textContent(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#0*39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function matchOne(html, regex) {
  const match = html.match(regex);
  return match ? textContent(match[1]) : "";
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? match[1].trim() : "";
}

function getCanonical(html) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const rel = attr(tag, "rel").toLowerCase().split(/\s+/);
    if (rel.includes("canonical")) return attr(tag, "href");
  }
  return "";
}

function getRobots(html) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (attr(tag, "name").toLowerCase() === "robots") return attr(tag, "content");
  }
  return "";
}

function normalizedPath(input, base = TARGET) {
  const url = new URL(input, base);
  let pathname = url.pathname || "/";
  if (pathname !== "/" && !pathname.endsWith("/")) pathname += "/";
  return pathname;
}

const failures = [];
const legacyFindings = [];
const report = [];

for (const route of baseline.routes) {
  const url = new URL(route.path, TARGET);
  const response = await fetch(url, {
    redirect: "follow",
    headers: { Accept: "text/html,*/*", "User-Agent": "DGS-NextJS-Tier0-Guard/1.0" },
  });
  const html = await response.text();
  const title = matchOne(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1 = matchOne(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const canonical = getCanonical(html);
  const robots = getRobots(html);
  const noindex = /noindex/i.test(robots);
  const finalPath = normalizedPath(response.url);
  const desiredCanonicalPath = normalizedPath(route.desiredCanonicalPath || route.path);
  const canonicalPath = canonical ? normalizedPath(canonical) : "";
  const knownIssues = new Set(route.sourceKnownIssues || []);

  const item = {
    path: route.path,
    mode: sourceMode ? "source-baseline" : "target-verification",
    status: response.status,
    finalUrl: response.url,
    title,
    h1,
    canonical,
    canonicalPath,
    desiredCanonicalPath,
    robots,
    sourceKnownIssues: [...knownIssues],
  };

  report.push(item);

  if (response.status !== 200) failures.push(`${route.path}: expected 200, received ${response.status}`);
  if (finalPath !== normalizedPath(route.path)) failures.push(`${route.path}: unexpected final route ${response.url}`);
  if (noindex) failures.push(`${route.path}: noindex detected`);
  if (route.observedTitle && title !== route.observedTitle) failures.push(`${route.path}: title changed from protected baseline`);
  if (route.observedH1 && h1 !== route.observedH1) failures.push(`${route.path}: H1 changed from protected baseline`);

  if (!canonical) {
    failures.push(`${route.path}: canonical is missing`);
  } else if (canonicalPath !== desiredCanonicalPath) {
    const message = `${route.path}: canonical points to ${canonicalPath}, desired ${desiredCanonicalPath}`;
    if (sourceMode && knownIssues.has("canonical-mismatch")) legacyFindings.push(message);
    else failures.push(message);
  }
}

console.log(
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      source: SOURCE.origin,
      target: TARGET.origin,
      mode: sourceMode ? "source-baseline" : "target-verification",
      report,
      legacyFindings,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) process.exitCode = 1;
