const DEFAULT_CONCURRENCY = 8;
const USER_AGENT = "DGS-Full-Site-Audit/1.0";

export function createProbeCache() {
  return new Map();
}

export async function mapWithConcurrency(items, fn, limit = DEFAULT_CONCURRENCY) {
  if (!items.length) return [];
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

export function unwrapRenderedAssetSrc(src, target) {
  if (!src) return "";
  try {
    const url = new URL(src, target);
    if (url.pathname.includes("/_next/image")) {
      const inner = url.searchParams.get("url");
      if (inner) return decodeURIComponent(inner);
    }
    return url.href;
  } catch {
    return src;
  }
}

export async function probeUrl(url, { method = "HEAD", redirect = "follow" } = {}) {
  return fetch(url, {
    method,
    redirect,
    headers: {
      Accept: "*/*",
      "User-Agent": USER_AGENT,
    },
  });
}

export async function validateImageAsset(src, target, cache, routePath) {
  const sourceUrl = unwrapRenderedAssetSrc(src, target);
  const cacheKey = `image::${sourceUrl}`;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (routePath && !cached.routes.includes(routePath)) cached.routes.push(routePath);
    return cached;
  }

  const record = {
    src,
    sourceUrl,
    status: null,
    classification: "UNKNOWN",
    routes: routePath ? [routePath] : [],
    wordpressWorks: null,
    nextWorks: null,
  };

  if (!sourceUrl || /^data:/i.test(sourceUrl)) {
    record.classification = "INLINE_DATA";
    cache.set(cacheKey, record);
    return record;
  }

  try {
    let response = await probeUrl(sourceUrl, { method: "HEAD" });
    if ([403, 405].includes(response.status)) {
      response = await probeUrl(sourceUrl, { method: "GET" });
    }
    record.status = response.status;

    if (response.status === 429) {
      record.classification = "RATE_LIMITED";
    } else if (response.status === 404 || response.status === 410) {
      record.classification = "BROKEN";
    } else if (response.status >= 500) {
      record.classification = "SERVER_ERROR";
    } else if (response.status >= 200 && response.status < 300) {
      record.classification = "OK";
    } else if ([403, 405].includes(response.status)) {
      record.classification = "RATE_LIMITED";
    } else if (response.status >= 400) {
      record.classification = "BROKEN";
    }
    record.wordpressWorks = record.classification === "OK";
  } catch {
    record.status = "fetch-error";
    record.classification = "FETCH_ERROR";
  }

  cache.set(cacheKey, record);
  return record;
}

function canonicalFromResponse(response, target, path) {
  const link = response.headers.get("link");
  if (link) {
    const match = link.match(/<([^>]+)>;\s*rel="canonical"/i);
    if (match) {
      try {
        return new URL(match[1], target).pathname.replace(/\/index\.php\/?$/, "/");
      } catch {
        /* ignore */
      }
    }
  }
  return path;
}

export async function validateInternalLink(link, target, cache) {
  const path = link.path;
  const cacheKey = `link::${path}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const record = {
    path,
    anchor: link.anchor || "",
    classification: "UNKNOWN",
    status: null,
    finalStatus: null,
    finalPath: null,
    redirectHops: [],
  };

  try {
    let response = await probeUrl(new URL(path, target), { method: "HEAD", redirect: "manual" });
    record.status = response.status;

    if (response.status === 404 || response.status === 410) {
      record.classification = response.status === 410 ? "410" : "404";
    } else if (response.status >= 500) {
      record.classification = "5XX";
    } else if (response.status === 429) {
      record.classification = "RATE_LIMITED";
    } else if ([301, 302, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      const hopPath = location ? new URL(location, target).pathname : null;
      record.redirectHops.push({ status: response.status, location: hopPath });
      const followed = await probeUrl(new URL(path, target), { method: "HEAD", redirect: "follow" });
      record.finalStatus = followed.status;
      record.finalPath = canonicalFromResponse(followed, target, followed.url ? new URL(followed.url).pathname : path);
      if (followed.status >= 200 && followed.status < 300) {
        record.classification =
          hopPath && hopPath !== path ? "AVOIDABLE_INTERNAL_REDIRECT" : "200_DIRECT_CANONICAL";
      } else if (followed.status === 404) {
        record.classification = "404";
      } else if (followed.status === 410) {
        record.classification = "410";
      } else if (followed.status >= 500) {
        record.classification = "5XX";
      } else {
        record.classification = "AMBIGUOUS";
      }
    } else if (response.status >= 200 && response.status < 300) {
      record.finalStatus = response.status;
      record.finalPath = canonicalFromResponse(response, target, path);
      const canonicalPath = record.finalPath;
      record.classification =
        canonicalPath && canonicalPath !== path ? "200_WRONG_CANONICAL" : "200_DIRECT_CANONICAL";
      const robots = response.headers.get("x-robots-tag") || "";
      if (/noindex/i.test(robots)) record.classification = "NOINDEX_DESTINATION";
    } else if (path.includes("#")) {
      record.classification = "FRAGMENT";
    } else if (/\.(pdf|jpg|jpeg|png|gif|webp|svg|mp4|webm|kml|xml)(\?|$)/i.test(path)) {
      record.classification = "MEDIA";
    } else {
      record.classification = "AMBIGUOUS";
    }
  } catch {
    record.classification = "FETCH_ERROR";
    record.status = "fetch-error";
  }

  cache.set(cacheKey, record);
  return record;
}

export function isBrokenLinkClassification(classification) {
  return classification === "404" || classification === "410" || classification === "5XX" || classification === "FETCH_ERROR";
}

export function isBrokenImageClassification(classification) {
  return classification === "BROKEN" || classification === "SERVER_ERROR" || classification === "FETCH_ERROR";
}
