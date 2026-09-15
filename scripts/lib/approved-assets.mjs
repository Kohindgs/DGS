import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

export const APPROVED_ASSET_VERSION = "2B.1A";
export const PRODUCTION_HOST = "www.dgeniussolutions.com";

export const PINNED_LOGO = {
  url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/02/cropped-DGS-LOGO.png",
  sha256: "0b4dd1b64ff83158caaff9413885e37fcabbb252f02a645320061cc8e00f19d9",
  width: 512,
  height: 512,
  mime: "image/png",
  format: "png",
};

export const PINNED_WEAVINGS_SOURCE = {
  url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/Weavings-Home-page-.png?v=20260707-header-visible",
  sha256: "7162b0d1a00abf0d579434bb5c6919316b924b306a5183476dcebdcaf3e8c5a9",
  width: 1600,
  height: 779,
  mime: "image/png",
  format: "png",
  wordpressMediaId: 64820,
};

export const WEAVINGS_PRESENTATION = {
  width: 1600,
  height: 1000,
  localPath: "/images/case-studies/weavings-home-page-64820.png",
  sourceLocalPath: "/images/case-studies/weavings-home-page-64820-source.png",
  padColor: "#020202",
  alt: "Live preview of Weavings website",
  presentationSha256: "261c52a5b21c6a744b107a247acb26f3909793e0d01ecbd89dd7c2dc724745f8",
};

export const APPROVED_SOCIAL = {
  localPath: "/images/social/dgs-default-share.png",
  productionUrl: "https://www.dgeniussolutions.com/images/social/dgs-default-share.png",
  width: 1200,
  height: 630,
  mime: "image/png",
  format: "png",
  sha256: "88ca56b4b25877e682d8f0fce291a4486d1e41aea58b468be81a23239d3789c5",
};

export const WEAVINGS_ROUTES = [
  "/services/website-development-amc/",
  "/services/website-development-pune-page/",
];

export const MSHOTS_PATTERN = "s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.weavings.in%2F";

const STAGING_HOST_PATTERNS = [/dimgrey-goat/i, /hostingersite\.com/i];

export function sha256Buffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function validateApprovedAssetUrl(url) {
  if (!url) return { ok: false, reason: "missing-url" };
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: "invalid-url" };
  }
  if (parsed.protocol !== "https:") return { ok: false, reason: "non-https" };
  if (parsed.username || parsed.password) return { ok: false, reason: "credentials" };
  if (parsed.port) return { ok: false, reason: "unexpected-port" };
  if (parsed.hostname !== PRODUCTION_HOST) return { ok: false, reason: "wrong-host" };
  if (STAGING_HOST_PATTERNS.some((pattern) => pattern.test(url))) {
    return { ok: false, reason: "staging-host" };
  }
  return { ok: true };
}

export function validateApprovedAssetUrlOrThrow(url, label = "asset") {
  const result = validateApprovedAssetUrl(url);
  if (!result.ok) {
    throw new Error(`${label} final URL rejected (${result.reason}): ${url}`);
  }
}

export function isStrictPngContentType(contentType) {
  if (!contentType) return false;
  const parts = contentType.split(";").map((part) => part.trim());
  if (parts[0].toLowerCase() !== "image/png") return false;
  for (let index = 1; index < parts.length; index += 1) {
    if (!parts[index].toLowerCase().startsWith("charset=")) return false;
  }
  return true;
}

export function assertStrictImageMimeAndFormat(contentType, format, label) {
  if (!isStrictPngContentType(contentType)) {
    throw new Error(`${label} Content-Type must be image/png, got ${contentType || "missing"}`);
  }
  if (format !== "png") {
    throw new Error(`${label} decoded format must be png, got ${format || "missing"}`);
  }
}

export async function inspectImageBuffer(buffer) {
  const meta = await sharp(buffer).metadata();
  return {
    sha256: sha256Buffer(buffer),
    width: meta.width,
    height: meta.height,
    format: meta.format,
  };
}

export async function fetchPinnedAsset(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  const finalUrl = response.url;
  validateApprovedAssetUrlOrThrow(finalUrl, `fetch ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "";
  const inspected = await inspectImageBuffer(buffer);
  return { buffer, contentType, finalUrl, ...inspected };
}

export function assertPinnedSource(actual, pinned, label) {
  if (actual.finalUrl) {
    validateApprovedAssetUrlOrThrow(actual.finalUrl, label);
  }
  if (actual.sha256 !== pinned.sha256) {
    throw new Error(`${label} SHA-256 mismatch: expected ${pinned.sha256}, got ${actual.sha256}`);
  }
  if (actual.width !== pinned.width || actual.height !== pinned.height) {
    throw new Error(`${label} dimensions mismatch: expected ${pinned.width}x${pinned.height}, got ${actual.width}x${actual.height}`);
  }
  assertStrictImageMimeAndFormat(actual.contentType, actual.format, label);
}

export async function buildWeavingsPresentationDerivative(sourceBuffer) {
  const { width, height, padColor } = {
    width: WEAVINGS_PRESENTATION.width,
    height: WEAVINGS_PRESENTATION.height,
    padColor: WEAVINGS_PRESENTATION.padColor,
  };
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: padColor,
    },
  })
    .composite([{ input: sourceBuffer, top: 0, left: 0 }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

function createSocialBackgroundSvg(width, height) {
  return Buffer.from(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020202"/>
      <stop offset="55%" stop-color="#0a0610"/>
      <stop offset="100%" stop-color="#020202"/>
    </linearGradient>
    <radialGradient id="accentLeft" cx="18%" cy="28%" r="42%">
      <stop offset="0%" stop-color="#9d4edd" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#9d4edd" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="accentRight" cx="82%" cy="72%" r="38%">
      <stop offset="0%" stop-color="#a900ff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#a900ff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="line" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#9d4edd" stop-opacity="0"/>
      <stop offset="50%" stop-color="#9d4edd" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#a900ff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#accentLeft)"/>
  <rect width="${width}" height="${height}" fill="url(#accentRight)"/>
  <rect x="120" y="${height - 3}" width="${width - 240}" height="2" fill="url(#line)"/>
</svg>`);
}

export async function buildSocialShareImage(logoBuffer, logoWidth, logoHeight) {
  const width = APPROVED_SOCIAL.width;
  const height = APPROVED_SOCIAL.height;
  const logoMax = 300;
  const logoScale = Math.min(logoMax / logoWidth, logoMax / logoHeight, 1);
  const scaledWidth = Math.round(logoWidth * logoScale);
  const scaledHeight = Math.round(logoHeight * logoScale);
  const left = Math.round((width - scaledWidth) / 2);
  const top = Math.round((height - scaledHeight) / 2);
  const background = await sharp(createSocialBackgroundSvg(width, height)).png().toBuffer();
  const logoPng = await sharp(logoBuffer).resize(scaledWidth, scaledHeight, { fit: "inside" }).png().toBuffer();
  return sharp(background)
    .composite([{ input: logoPng, left, top }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

export function buildApprovedAssetManifest({ socialSha256, weavingsPresentationSha256 }) {
  return {
    version: APPROVED_ASSET_VERSION,
    social: {
      defaultShareImage: {
        localPath: APPROVED_SOCIAL.localPath,
        sourceLogoUrl: PINNED_LOGO.url,
        sourceLogoSha256: PINNED_LOGO.sha256,
        sourceLogoWidth: PINNED_LOGO.width,
        sourceLogoHeight: PINNED_LOGO.height,
        sourceLogoMime: PINNED_LOGO.mime,
        width: APPROVED_SOCIAL.width,
        height: APPROVED_SOCIAL.height,
        mime: APPROVED_SOCIAL.mime,
        sha256: socialSha256,
      },
      productionUrl: APPROVED_SOCIAL.productionUrl,
      productionHostname: PRODUCTION_HOST,
    },
    replacements: [
      {
        id: "weavings-mshots-64820",
        routes: WEAVINGS_ROUTES,
        match: {
          type: "mshots",
          pattern: MSHOTS_PATTERN,
        },
        replacement: {
          localPath: WEAVINGS_PRESENTATION.localPath,
          sourceLocalPath: WEAVINGS_PRESENTATION.sourceLocalPath,
          wordpressMediaId: PINNED_WEAVINGS_SOURCE.wordpressMediaId,
          sourceUrl: PINNED_WEAVINGS_SOURCE.url,
          alt: WEAVINGS_PRESENTATION.alt,
          mime: PINNED_WEAVINGS_SOURCE.mime,
          sourceSha256: PINNED_WEAVINGS_SOURCE.sha256,
          sourceWidth: PINNED_WEAVINGS_SOURCE.width,
          sourceHeight: PINNED_WEAVINGS_SOURCE.height,
          presentationSha256: weavingsPresentationSha256,
          width: WEAVINGS_PRESENTATION.width,
          height: WEAVINGS_PRESENTATION.height,
        },
      },
    ],
  };
}

function expectExact(actual, expected, label, issues) {
  if (actual !== expected) {
    issues.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function expectArrayEqual(actual, expected, label, issues) {
  const left = [...(actual || [])].sort();
  const right = [...expected].sort();
  if (left.join("|") !== right.join("|")) {
    issues.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

export function validateManifestProvenance(manifest) {
  const issues = [];

  if (!manifest || typeof manifest !== "object") {
    return { ok: false, issues: ["manifest must be an object"] };
  }

  const allowedTopLevel = new Set(["version", "social", "replacements"]);
  for (const key of Object.keys(manifest)) {
    if (!allowedTopLevel.has(key)) issues.push(`unexpected manifest field: ${key}`);
  }

  expectExact(manifest.version, APPROVED_ASSET_VERSION, "manifest.version", issues);

  const social = manifest.social;
  if (!social || typeof social !== "object") {
    issues.push("manifest.social missing");
  } else {
    const allowedSocial = new Set(["defaultShareImage", "productionUrl", "productionHostname"]);
    for (const key of Object.keys(social)) {
      if (!allowedSocial.has(key)) issues.push(`unexpected social field: ${key}`);
    }
    expectExact(social.productionUrl, APPROVED_SOCIAL.productionUrl, "social.productionUrl", issues);
    expectExact(social.productionHostname, PRODUCTION_HOST, "social.productionHostname", issues);

    const share = social.defaultShareImage;
    if (!share || typeof share !== "object") {
      issues.push("social.defaultShareImage missing");
    } else {
      expectExact(share.localPath, APPROVED_SOCIAL.localPath, "social.defaultShareImage.localPath", issues);
      expectExact(share.sourceLogoUrl, PINNED_LOGO.url, "social.defaultShareImage.sourceLogoUrl", issues);
      expectExact(share.sourceLogoSha256, PINNED_LOGO.sha256, "social.defaultShareImage.sourceLogoSha256", issues);
      expectExact(share.sourceLogoWidth, PINNED_LOGO.width, "social.defaultShareImage.sourceLogoWidth", issues);
      expectExact(share.sourceLogoHeight, PINNED_LOGO.height, "social.defaultShareImage.sourceLogoHeight", issues);
      expectExact(share.sourceLogoMime, PINNED_LOGO.mime, "social.defaultShareImage.sourceLogoMime", issues);
      expectExact(share.width, APPROVED_SOCIAL.width, "social.defaultShareImage.width", issues);
      expectExact(share.height, APPROVED_SOCIAL.height, "social.defaultShareImage.height", issues);
      expectExact(share.mime, APPROVED_SOCIAL.mime, "social.defaultShareImage.mime", issues);
      expectExact(share.sha256, APPROVED_SOCIAL.sha256, "social.defaultShareImage.sha256", issues);
    }
  }

  const replacements = manifest.replacements;
  if (!Array.isArray(replacements)) {
    issues.push("manifest.replacements must be an array");
  } else if (replacements.length !== 1) {
    issues.push(`expected exactly one approved replacement, found ${replacements.length}`);
  } else {
    const replacement = replacements[0];
    const allowedReplacement = new Set(["id", "routes", "match", "replacement"]);
    for (const key of Object.keys(replacement)) {
      if (!allowedReplacement.has(key)) issues.push(`unexpected replacement field: ${key}`);
    }
    expectExact(replacement.id, "weavings-mshots-64820", "replacement.id", issues);
    expectArrayEqual(replacement.routes, WEAVINGS_ROUTES, "replacement.routes", issues);

    const match = replacement.match;
    if (!match || typeof match !== "object") {
      issues.push("replacement.match missing");
    } else {
      expectExact(match.type, "mshots", "replacement.match.type", issues);
      expectExact(match.pattern, MSHOTS_PATTERN, "replacement.match.pattern", issues);
    }

    const rep = replacement.replacement;
    if (!rep || typeof rep !== "object") {
      issues.push("replacement.replacement missing");
    } else {
      expectExact(rep.localPath, WEAVINGS_PRESENTATION.localPath, "replacement.replacement.localPath", issues);
      expectExact(rep.sourceLocalPath, WEAVINGS_PRESENTATION.sourceLocalPath, "replacement.replacement.sourceLocalPath", issues);
      expectExact(rep.wordpressMediaId, PINNED_WEAVINGS_SOURCE.wordpressMediaId, "replacement.replacement.wordpressMediaId", issues);
      expectExact(rep.sourceUrl, PINNED_WEAVINGS_SOURCE.url, "replacement.replacement.sourceUrl", issues);
      expectExact(rep.alt, WEAVINGS_PRESENTATION.alt, "replacement.replacement.alt", issues);
      expectExact(rep.mime, PINNED_WEAVINGS_SOURCE.mime, "replacement.replacement.mime", issues);
      expectExact(rep.sourceSha256, PINNED_WEAVINGS_SOURCE.sha256, "replacement.replacement.sourceSha256", issues);
      expectExact(rep.sourceWidth, PINNED_WEAVINGS_SOURCE.width, "replacement.replacement.sourceWidth", issues);
      expectExact(rep.sourceHeight, PINNED_WEAVINGS_SOURCE.height, "replacement.replacement.sourceHeight", issues);
      expectExact(rep.width, WEAVINGS_PRESENTATION.width, "replacement.replacement.width", issues);
      expectExact(rep.height, WEAVINGS_PRESENTATION.height, "replacement.replacement.height", issues);
      expectExact(
        rep.presentationSha256,
        WEAVINGS_PRESENTATION.presentationSha256,
        "replacement.replacement.presentationSha256",
        issues,
      );
    }
  }

  return { ok: issues.length === 0, issues };
}

async function validateLocalAssetFile(root, relativePath, expectations, issues) {
  const filePath = path.join(root, "public", relativePath.replace(/^\//, ""));
  try {
    const buffer = readFileSync(filePath);
    const inspected = await inspectImageBuffer(buffer);
    if (expectations.sha256 && inspected.sha256 !== expectations.sha256) {
      issues.push(`${relativePath}: sha256 mismatch`);
    }
    if (expectations.width !== undefined && inspected.width !== expectations.width) {
      issues.push(`${relativePath}: width mismatch`);
    }
    if (expectations.height !== undefined && inspected.height !== expectations.height) {
      issues.push(`${relativePath}: height mismatch`);
    }
    if (inspected.format !== "png") {
      issues.push(`${relativePath}: decoded format must be png`);
    }
  } catch {
    issues.push(`missing asset file ${relativePath}`);
  }
}

export async function validateApprovedAssetsOffline(root) {
  const issues = [];
  const manifestPath = path.join(root, "data/migration/approved-asset-replacements.json");
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    return { ok: false, issues: ["missing approved-asset-replacements.json"] };
  }

  const manifestResult = validateManifestProvenance(manifest);
  issues.push(...manifestResult.issues);

  const share = manifest.social?.defaultShareImage;
  const replacement = manifest.replacements?.[0]?.replacement;

  await validateLocalAssetFile(
    root,
    APPROVED_SOCIAL.localPath,
    { sha256: share?.sha256, width: APPROVED_SOCIAL.width, height: APPROVED_SOCIAL.height },
    issues,
  );
  await validateLocalAssetFile(
    root,
    WEAVINGS_PRESENTATION.sourceLocalPath,
    { sha256: PINNED_WEAVINGS_SOURCE.sha256, width: PINNED_WEAVINGS_SOURCE.width, height: PINNED_WEAVINGS_SOURCE.height },
    issues,
  );
  await validateLocalAssetFile(
    root,
    WEAVINGS_PRESENTATION.localPath,
    {
      sha256: replacement?.presentationSha256,
      width: WEAVINGS_PRESENTATION.width,
      height: WEAVINGS_PRESENTATION.height,
    },
    issues,
  );

  const blocks = JSON.parse(readFileSync(path.join(root, "data/wordpress/blocks/content-blocks.generated.json"), "utf8")).blocks || {};
  for (const route of WEAVINGS_ROUTES) {
    const routeBlocks = blocks[route]?.blocks || [];
    const imageBlocks = routeBlocks.filter((block) => block.type === "image");
    const weavings = imageBlocks.find((block) => block.src === WEAVINGS_PRESENTATION.localPath);
    if (!weavings) {
      issues.push(`${route}: missing Weavings presentation image block`);
      continue;
    }
    if (weavings.width !== WEAVINGS_PRESENTATION.width || weavings.height !== WEAVINGS_PRESENTATION.height) {
      issues.push(`${route}: runtime image dimensions must be 1600x1000`);
    }
    const mshots = imageBlocks.find((block) => /mshots/i.test(block.src || ""));
    if (mshots) issues.push(`${route}: runtime mshots reference remains`);
  }

  const runtimeScanDirs = ["app", "components", "lib"];
  for (const dir of runtimeScanDirs) {
    const abs = path.join(root, dir);
    try {
      statSync(abs);
    } catch {
      continue;
    }
    for (const file of collectFiles(abs)) {
      const rel = path.relative(root, file).replace(/\\/g, "/");
      if (rel.includes("data/wordpress/") || rel.includes("data/audit/") || rel.includes("scripts/")) continue;
      const content = readFileSync(file, "utf8");
      if (/s\.wordpress\.com\/mshots/i.test(content)) {
        issues.push(`runtime mshots reference in ${rel}`);
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

function collectFiles(absDir) {
  const out = [];
  for (const entry of readdirSync(absDir, { withFileTypes: true })) {
    const full = path.join(absDir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full));
    else if (/\.(tsx?|jsx?|mjs)$/.test(entry.name)) out.push(full);
  }
  return out;
}
