import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT_DIR = path.join(ROOT, "data/audit/live");
const SITE = new URL(process.env.DGS_SOURCE_URL || "https://www.dgeniussolutions.com");
const CONCURRENCY = Number(process.env.AUDIT_CONCURRENCY || "6");
const MAX_REDIRECTS = 10;

const pages = JSON.parse(await readFile(path.join(AUDIT_DIR, "pages-v2.json"), "utf8"));

function dgsHost(hostname) {
  return hostname.replace(/^www\./i, "").toLowerCase() === "dgeniussolutions.com";
}

function normalizeUrl(input, base = SITE) {
  try {
    const url = new URL(input, base);
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

function likelyPageTarget(url) {
  const pathname = url.pathname.toLowerCase();
  if (pathname.startsWith("/wp-content/") || pathname.startsWith("/wp-includes/") || pathname.startsWith("/wp-json/")) return false;
  return !/\.(?:jpg|jpeg|png|gif|webp|avif|svg|ico|pdf|zip|mp4|webm|mov|mp3|wav|woff2?|ttf|eot|css|js|xml)$/i.test(pathname);
}

async function redirectChain(inputUrl) {
  const chain = [];
  let current = new URL(inputUrl);

  for (let index = 0; index <= MAX_REDIRECTS; index += 1) {
    try {
      const response = await fetch(current, {
        headers: { Accept: "text/html,*/*", "User-Agent": "DGS-NextJS-Migration-Audit/1.0" },
        redirect: "manual",
      });
      const location = response.headers.get("location");
      chain.push({ url: current.href, status: response.status, location });
      if (response.status < 300 || response.status >= 400 || !location) {
        return { requestedUrl: inputUrl, finalUrl: current.href, status: response.status, chain };
      }
      current = new URL(location, current);
    } catch (error) {
      return { requestedUrl: inputUrl, finalUrl: current.href, status: 0, chain, error: String(error) };
    }
  }

  return { requestedUrl: inputUrl, finalUrl: current.href, status: 0, chain, error: `More than ${MAX_REDIRECTS} redirects` };
}

async function mapLimit(values, limit, worker) {
  const results = new Array(values.length);
  let cursor = 0;
  async function runner() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= values.length) return;
      results[index] = await worker(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, Math.max(1, values.length)) }, () => runner()));
  return results;
}

const linkSources = new Map();
const canonicalSources = new Map();

for (const page of pages) {
  const sourcePath = normalizeUrl(page.finalUrl)?.pathname || page.finalUrl;
  const allLinks = [...(page.internalLinks || []), ...(page.externalLinks || [])];

  for (const link of allLinks) {
    const url = normalizeUrl(link.href, page.finalUrl);
    if (!url || !dgsHost(url.hostname) || !likelyPageTarget(url)) continue;
    const key = url.href;
    if (!linkSources.has(key)) linkSources.set(key, []);
    linkSources.get(key).push({ from: sourcePath, anchor: link.anchor || "", rel: link.rel || "" });
  }

  if (page.canonical) {
    const canonical = normalizeUrl(page.canonical, page.finalUrl);
    if (canonical && dgsHost(canonical.hostname)) {
      if (!canonicalSources.has(canonical.href)) canonicalSources.set(canonical.href, []);
      canonicalSources.get(canonical.href).push({ from: sourcePath, pageUrl: page.finalUrl });
    }
  }
}

const targetUrls = [...new Set([...linkSources.keys(), ...canonicalSources.keys()])].sort();
const results = await mapLimit(targetUrls, CONCURRENCY, redirectChain);
const resultByUrl = new Map(results.map((item) => [item.requestedUrl, item]));

const linkedTargets = [...linkSources.entries()].map(([url, sources]) => ({
  ...resultByUrl.get(url),
  sources,
}));

const canonicalTargets = [...canonicalSources.entries()].map(([url, sources]) => ({
  ...resultByUrl.get(url),
  sources,
}));

const brokenLinks = linkedTargets.filter((item) => item.status === 0 || item.status >= 400);
const redirectedInternalLinks = linkedTargets.filter((item) => item.chain?.some((step) => step.status >= 300 && step.status < 400));

const canonicalIssues = [];
for (const page of pages) {
  if (!page.canonical) continue;
  const source = normalizeUrl(page.finalUrl);
  const canonical = normalizeUrl(page.canonical, page.finalUrl);
  if (!source || !canonical || !dgsHost(canonical.hostname)) continue;
  const target = resultByUrl.get(canonical.href);
  const sourcePath = source.pathname;
  const canonicalPath = canonical.pathname;

  if (sourcePath !== canonicalPath) {
    canonicalIssues.push({
      severity: "review",
      sourcePath,
      canonical: canonical.href,
      canonicalPath,
      targetStatus: target?.status ?? null,
      targetFinalUrl: target?.finalUrl ?? null,
      issue: "Canonical points to a different same-site path. Verify whether this is deliberate consolidation or a misconfiguration before migration.",
    });
  }
  if (target && target.status >= 400) {
    canonicalIssues.push({
      severity: "error",
      sourcePath,
      canonical: canonical.href,
      canonicalPath,
      targetStatus: target.status,
      targetFinalUrl: target.finalUrl,
      issue: "Canonical target does not resolve successfully.",
    });
  }
}

const hostAliasLinks = linkedTargets.filter((item) => {
  const requested = normalizeUrl(item.requestedUrl);
  return requested && requested.origin !== SITE.origin;
});

const summary = {
  generatedAt: new Date().toISOString(),
  uniqueSameSiteLinkedTargets: linkedTargets.length,
  brokenLinkedTargets: brokenLinks.length,
  redirectedInternalTargets: redirectedInternalLinks.length,
  canonicalTargets: canonicalTargets.length,
  canonicalIssues: canonicalIssues.length,
  hostAliasLinks: hostAliasLinks.length,
};

const writeJson = (name, value) => writeFile(path.join(AUDIT_DIR, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
await Promise.all([
  writeJson("linked-targets.json", linkedTargets),
  writeJson("broken-links.json", brokenLinks),
  writeJson("redirected-internal-links.json", redirectedInternalLinks),
  writeJson("canonical-targets.json", canonicalTargets),
  writeJson("canonical-issues.json", canonicalIssues),
  writeJson("host-alias-links.json", hostAliasLinks),
  writeJson("link-target-summary.json", summary),
]);

console.log(JSON.stringify(summary, null, 2));
