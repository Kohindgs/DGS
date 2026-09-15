import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizePath } from "./tier0-parity-compare.mjs";

const APPROVED_PATH = path.join(process.cwd(), "data/migration/ranking-link-restorations.approved.json");

let cache = null;

export async function loadApprovedLinkRestorations() {
  if (cache) return cache;
  cache = JSON.parse(await readFile(APPROVED_PATH, "utf8"));
  return cache;
}

export function restorationsForPath(approved, routePath) {
  return approved.restorations?.[routePath] || [];
}

export function removedHrefCorrections(restorations) {
  return restorations.filter((item) => item.action === "REMOVE_BROKEN_HREF");
}

export function correctionByWordpressPath(restorations, wordpressPath, base) {
  const normalized = normalizePath(wordpressPath, base);
  return restorations.find((item) => normalizePath(item.wordpressDestination, base) === normalized) || null;
}

export function correctionByAnchor(restorations, anchor) {
  return restorations.find((item) => item.anchor === anchor) || null;
}

export function requiredNextPathForBaselineLink(link, restorations, base) {
  const byPath = correctionByWordpressPath(restorations, link.path, base);
  const byAnchor = correctionByAnchor(restorations, link.anchor);
  const correction = byPath || byAnchor;
  if (correction?.action === "REMOVE_BROKEN_HREF") return null;
  if (correction?.requiredNextDestination) {
    return normalizePath(correction.requiredNextDestination, base);
  }
  return normalizePath(link.path, base);
}

const WP_ORIGIN = "https://www.dgeniussolutions.com";

export function isSiteInternalHref(href) {
  if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) return false;
  try {
    const url = new URL(href, WP_ORIGIN);
    if (url.origin !== WP_ORIGIN) return false;
    return /^\/(services|blogs|our-services|contact-us|about-us|portfolio)(\/|$)/.test(
      url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`,
    );
  } catch {
    return /^\/(services|blogs|our-services|contact-us|about-us|portfolio)(\/|$)/.test(href);
  }
}

export function buildExpectedContextualLinks(baselineLinks, restorations, base) {
  return baselineLinks
    .filter((link) => isSiteInternalHref(link.href || link.path))
    .map((link) => {
      const correction = correctionByWordpressPath(restorations, link.path, base) || correctionByAnchor(restorations, link.anchor);
      if (correction?.action === "REMOVE_BROKEN_HREF") return null;

      const requiredPath = correction?.requiredNextDestination
        ? normalizePath(correction.requiredNextDestination, base)
        : normalizePath(link.path, base);
      return {
        anchor: link.anchor,
        href: requiredPath,
        path: requiredPath,
        scope: link.scope || "body",
        destination: requiredPath,
        wordpressPath: normalizePath(link.path, base),
        classification: correction?.classification || null,
        action: correction?.action || null,
        reason: correction?.reason || null,
      };
    })
    .filter(Boolean);
}

export function collectRequiredDestinations(approved, frozenBaseline, base) {
  const destinations = [];
  const seen = new Set();
  for (const [routePath, snapshot] of Object.entries(frozenBaseline.routes)) {
    const restorations = restorationsForPath(approved, routePath);
    const expectedLinks = buildExpectedContextualLinks(snapshot.contextualLinks || [], restorations, base);
    for (const link of expectedLinks) {
      const key = `${routePath}::${link.anchor}::${link.path}`;
      if (seen.has(key)) continue;
      seen.add(key);
      destinations.push({
        sourceRoute: routePath,
        anchor: link.anchor,
        wordpressPath: link.wordpressPath,
        requiredPath: link.path,
        classification: link.classification,
        action: link.action,
        reason: link.reason,
      });
    }
  }
  return destinations;
}
