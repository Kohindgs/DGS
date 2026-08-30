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
};

export const APPROVED_SOCIAL = {
  localPath: "/images/social/dgs-default-share.png",
  productionUrl: "https://www.dgeniussolutions.com/images/social/dgs-default-share.png",
  width: 1200,
  height: 630,
  mime: "image/png",
  format: "png",
};

export const WEAVINGS_ROUTES = [
  "/services/website-development-amc/",
  "/services/website-development-pune-page/",
];

export const MSHOTS_PATTERN = "s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.weavings.in%2F";

export function sha256Buffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
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
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "";
  const inspected = await inspectImageBuffer(buffer);
  return { buffer, contentType, ...inspected };
}

export function assertPinnedSource(actual, pinned, label) {
  if (actual.sha256 !== pinned.sha256) {
    throw new Error(`${label} SHA-256 mismatch: expected ${pinned.sha256}, got ${actual.sha256}`);
  }
  if (actual.width !== pinned.width || actual.height !== pinned.height) {
    throw new Error(`${label} dimensions mismatch: expected ${pinned.width}x${pinned.height}, got ${actual.width}x${actual.height}`);
  }
  const mimeOk = actual.contentType?.includes("png") || actual.format === "png";
  if (!mimeOk) {
    throw new Error(`${label} MIME/format mismatch: ${actual.contentType || actual.format}`);
  }
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

function readLocalImage(root, relativePath) {
  return readFileSync(path.join(root, relativePath.replace(/^\//, "")));
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

  if (manifest.version !== APPROVED_ASSET_VERSION) {
    issues.push(`manifest version must be ${APPROVED_ASSET_VERSION}`);
  }

  const socialUrl = manifest.social?.productionUrl;
  if (socialUrl !== APPROVED_SOCIAL.productionUrl) {
    issues.push(`social productionUrl must be ${APPROVED_SOCIAL.productionUrl}`);
  }
  if (manifest.social?.productionHostname !== PRODUCTION_HOST) {
    issues.push(`social productionHostname must be ${PRODUCTION_HOST}`);
  }

  const replacements = manifest.replacements || [];
  if (replacements.length !== 1) {
    issues.push(`expected exactly one approved replacement, found ${replacements.length}`);
  }

  const replacement = replacements[0];
  if (!replacement || replacement.id !== "weavings-mshots-64820") {
    issues.push("missing weavings-mshots-64820 replacement");
  } else {
    const routes = [...(replacement.routes || [])].sort();
    const expectedRoutes = [...WEAVINGS_ROUTES].sort();
    if (routes.join("|") !== expectedRoutes.join("|")) {
      issues.push("Weavings replacement routes mismatch");
    }
    const rep = replacement.replacement || {};
    if (rep.sourceSha256 !== PINNED_WEAVINGS_SOURCE.sha256) issues.push("Weavings sourceSha256 mismatch");
    if (rep.sourceWidth !== PINNED_WEAVINGS_SOURCE.width || rep.sourceHeight !== PINNED_WEAVINGS_SOURCE.height) {
      issues.push("Weavings source dimensions mismatch");
    }
    if (rep.width !== WEAVINGS_PRESENTATION.width || rep.height !== WEAVINGS_PRESENTATION.height) {
      issues.push("Weavings presentation dimensions must be 1600x1000");
    }
    if (!rep.presentationSha256) issues.push("Weavings presentationSha256 missing");
  }

  const filesToCheck = [
    { rel: APPROVED_SOCIAL.localPath, expected: manifest.social?.defaultShareImage },
    { rel: WEAVINGS_PRESENTATION.sourceLocalPath, pinned: PINNED_WEAVINGS_SOURCE },
    { rel: WEAVINGS_PRESENTATION.localPath, expected: replacement?.replacement },
  ];

  for (const entry of filesToCheck) {
    if (!entry.rel) continue;
    const filePath = path.join(root, "public", entry.rel.replace(/^\//, ""));
    try {
      const buffer = readFileSync(filePath);
      const inspected = await inspectImageBuffer(buffer);
      if (entry.pinned) {
        if (inspected.sha256 !== entry.pinned.sha256) issues.push(`${entry.rel}: sha256 mismatch`);
        if (inspected.width !== entry.pinned.width || inspected.height !== entry.pinned.height) {
          issues.push(`${entry.rel}: dimensions mismatch`);
        }
      }
      if (entry.expected?.sha256 && inspected.sha256 !== entry.expected.sha256) {
        issues.push(`${entry.rel}: sha256 mismatch`);
      }
      if (entry.expected?.presentationSha256 && inspected.sha256 !== entry.expected.presentationSha256) {
        issues.push(`${entry.rel}: presentation sha256 mismatch`);
      }
      if (entry.expected?.width && inspected.width !== entry.expected.width) {
        issues.push(`${entry.rel}: width mismatch`);
      }
      if (entry.expected?.height && inspected.height !== entry.expected.height) {
        issues.push(`${entry.rel}: height mismatch`);
      }
      if (inspected.format !== "png") issues.push(`${entry.rel}: format must be png`);
    } catch {
      issues.push(`missing asset file ${entry.rel}`);
    }
  }

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
