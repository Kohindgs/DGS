import { PRODUCTION_CANONICAL_HOST } from "./ranking-readiness-integrity.mjs";

export const APPROVED_DEFAULT_SHARE_IMAGE_URL =
  "https://www.dgeniussolutions.com/images/social/dgs-default-share.png";

export const APPROVED_TWITTER_CARD = "summary_large_image";

export function validateApprovedSocialImageUrl(url) {
  if (!url) return { ok: false, reason: "missing" };
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: "invalid-url" };
  }
  if (parsed.protocol !== "https:") return { ok: false, reason: "non-https" };
  if (parsed.username || parsed.password) return { ok: false, reason: "credentials" };
  if (parsed.port) return { ok: false, reason: "unexpected-port" };
  if (parsed.search || parsed.hash) return { ok: false, reason: "query-or-hash" };
  if (parsed.hostname !== PRODUCTION_CANONICAL_HOST) return { ok: false, reason: "wrong-host" };
  if (/dimgrey-goat/i.test(url)) return { ok: false, reason: "dimgrey-leak" };
  if (parsed.href !== APPROVED_DEFAULT_SHARE_IMAGE_URL) return { ok: false, reason: "wrong-path" };
  return { ok: true };
}

export function validateApprovedTwitterCard(card) {
  if (!card) return { ok: false, reason: "missing" };
  if (card !== APPROVED_TWITTER_CARD) return { ok: false, reason: "wrong-card" };
  return { ok: true };
}

export function evaluatePageSocialMetadata(page) {
  const ogImageCheck = validateApprovedSocialImageUrl(page.ogImage);
  const twitterImageCheck = validateApprovedSocialImageUrl(page.twitterImage);
  const twitterCardCheck = validateApprovedTwitterCard(page.twitterCard);

  const ogImageDefect = !ogImageCheck.ok;
  const twitterImageDefect = !twitterImageCheck.ok;
  const twitterCardDefect = !twitterCardCheck.ok;

  const socialDefects = [];
  if (ogImageDefect) socialDefects.push(`og-image:${ogImageCheck.reason}`);
  if (twitterImageDefect) socialDefects.push(`twitter-image:${twitterImageCheck.reason}`);
  if (twitterCardDefect) socialDefects.push(`twitter-card:${twitterCardCheck.reason}`);

  return {
    ogImageDefect,
    twitterImageDefect,
    twitterCardDefect,
    socialDefectCount: socialDefects.length,
    socialDefects,
    ogImageMissing: ogImageDefect,
    twitterImageMissing: twitterImageDefect,
  };
}

export function recomputeSocialSummary(pages) {
  let ogImageDefects = 0;
  let twitterImageDefects = 0;
  let twitterCardDefects = 0;
  for (const page of pages) {
    const social = evaluatePageSocialMetadata(page);
    if (social.ogImageDefect) ogImageDefects += 1;
    if (social.twitterImageDefect) twitterImageDefects += 1;
    if (social.twitterCardDefect) twitterCardDefects += 1;
  }
  return {
    ogImageDefects,
    twitterImageDefects,
    twitterCardDefects,
    socialMetadataComplete: ogImageDefects === 0 && twitterImageDefects === 0 && twitterCardDefects === 0,
  };
}

export function deriveSocialMetadataStatus(pages) {
  const summary = recomputeSocialSummary(pages);
  if (summary.socialMetadataComplete) return "complete";
  return "SOCIAL_METADATA_DEFECTS_PRESENT";
}
