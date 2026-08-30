#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const LOGO_URL = "https://www.dgeniussolutions.com/wp-content/uploads/2026/02/cropped-DGS-LOGO.png";
const WEAVINGS_URL =
  "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/Weavings-Home-page-.png?v=20260707-header-visible";

const SOCIAL_OUT = path.join(ROOT, "public/images/social/dgs-default-share.png");
const WEAVINGS_OUT = path.join(ROOT, "public/images/case-studies/weavings-home-page-64820.png");
const MANIFEST_OUT = path.join(ROOT, "data/migration/approved-asset-replacements.json");

async function fetchVerified(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "";
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const meta = await sharp(buffer).metadata();
  return { buffer, contentType, sha256, width: meta.width, height: meta.height, format: meta.format };
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

async function buildSocialImage(logo) {
  const width = 1200;
  const height = 630;
  const logoMax = 300;
  const logoScale = Math.min(logoMax / logo.width, logoMax / logo.height, 1);
  const logoWidth = Math.round(logo.width * logoScale);
  const logoHeight = Math.round(logo.height * logoScale);
  const left = Math.round((width - logoWidth) / 2);
  const top = Math.round((height - logoHeight) / 2);

  const background = await sharp(createSocialBackgroundSvg(width, height)).png().toBuffer();
  const logoPng = await sharp(logo.buffer).resize(logoWidth, logoHeight, { fit: "inside" }).png().toBuffer();

  await mkdir(path.dirname(SOCIAL_OUT), { recursive: true });
  const output = await sharp(background)
    .composite([{ input: logoPng, left, top }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  await writeFile(SOCIAL_OUT, output);
  const meta = await sharp(output).metadata();
  const sha256 = createHash("sha256").update(output).digest("hex");
  return {
    localPath: "/images/social/dgs-default-share.png",
    sourceLogoUrl: LOGO_URL,
    sourceLogoSha256: logo.sha256,
    sourceLogoWidth: logo.width,
    sourceLogoHeight: logo.height,
    sourceLogoMime: logo.contentType,
    width: meta.width,
    height: meta.height,
    mime: "image/png",
    sha256,
  };
}

async function main() {
  const logo = await fetchVerified(LOGO_URL);
  if (!logo.contentType.includes("png") && logo.format !== "png") {
    throw new Error(`Logo MIME/format mismatch: ${logo.contentType} / ${logo.format}`);
  }
  if (logo.width !== 512 || logo.height !== 512) {
    throw new Error(`Unexpected logo dimensions: ${logo.width}x${logo.height}`);
  }

  const weavings = await fetchVerified(WEAVINGS_URL);
  if (!weavings.contentType.includes("png") && weavings.format !== "png") {
    throw new Error(`Weavings MIME/format mismatch: ${weavings.contentType} / ${weavings.format}`);
  }
  if (!weavings.width || !weavings.height) {
    throw new Error("Weavings image missing dimensions");
  }

  await mkdir(path.dirname(WEAVINGS_OUT), { recursive: true });
  await writeFile(WEAVINGS_OUT, weavings.buffer);

  const social = await buildSocialImage(logo);

  const manifest = {
    version: "2B.1",
    generatedAt: new Date().toISOString(),
    social: {
      defaultShareImage: social,
      productionUrl: "https://www.dgeniussolutions.com/images/social/dgs-default-share.png",
    },
    replacements: [
      {
        id: "weavings-mshots-64820",
        routes: ["/services/website-development-amc/", "/services/website-development-pune-page/"],
        match: {
          type: "mshots",
          pattern: "s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.weavings.in%2F",
        },
        replacement: {
          localPath: "/images/case-studies/weavings-home-page-64820.png",
          wordpressMediaId: 64820,
          sourceUrl: WEAVINGS_URL,
          alt: "Live preview of Weavings website",
          mime: weavings.contentType,
          width: weavings.width,
          height: weavings.height,
          sha256: weavings.sha256,
        },
      },
    ],
  };

  await mkdir(path.dirname(MANIFEST_OUT), { recursive: true });
  await writeFile(MANIFEST_OUT, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        logo: {
          url: LOGO_URL,
          mime: logo.contentType,
          width: logo.width,
          height: logo.height,
          sha256: logo.sha256,
        },
        weavings: {
          url: WEAVINGS_URL,
          mime: weavings.contentType,
          width: weavings.width,
          height: weavings.height,
          sha256: weavings.sha256,
          localPath: manifest.replacements[0].replacement.localPath,
        },
        social,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
