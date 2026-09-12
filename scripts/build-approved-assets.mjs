#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  APPROVED_SOCIAL,
  PINNED_LOGO,
  PINNED_WEAVINGS_SOURCE,
  WEAVINGS_PRESENTATION,
  assertPinnedSource,
  buildApprovedAssetManifest,
  buildSocialShareImage,
  buildWeavingsPresentationDerivative,
  fetchPinnedAsset,
  inspectImageBuffer,
  sha256Buffer,
} from "./lib/approved-assets.mjs";

const ROOT = process.cwd();
const SOCIAL_OUT = path.join(ROOT, "public", APPROVED_SOCIAL.localPath.replace(/^\//, ""));
const WEAVINGS_SOURCE_OUT = path.join(ROOT, "public", WEAVINGS_PRESENTATION.sourceLocalPath.replace(/^\//, ""));
const WEAVINGS_PRESENTATION_OUT = path.join(ROOT, "public", WEAVINGS_PRESENTATION.localPath.replace(/^\//, ""));
const MANIFEST_OUT = path.join(ROOT, "data/migration/approved-asset-replacements.json");

async function main() {
  const logo = await fetchPinnedAsset(PINNED_LOGO.url);
  assertPinnedSource(logo, PINNED_LOGO, "Logo");

  const weavings = await fetchPinnedAsset(PINNED_WEAVINGS_SOURCE.url);
  assertPinnedSource(weavings, PINNED_WEAVINGS_SOURCE, "Weavings source");

  await mkdir(path.dirname(SOCIAL_OUT), { recursive: true });
  await mkdir(path.dirname(WEAVINGS_SOURCE_OUT), { recursive: true });
  await mkdir(path.dirname(WEAVINGS_PRESENTATION_OUT), { recursive: true });

  await writeFile(WEAVINGS_SOURCE_OUT, weavings.buffer);

  const presentationBuffer = await buildWeavingsPresentationDerivative(weavings.buffer);
  await writeFile(WEAVINGS_PRESENTATION_OUT, presentationBuffer);
  const presentation = await inspectImageBuffer(presentationBuffer);
  if (presentation.width !== WEAVINGS_PRESENTATION.width || presentation.height !== WEAVINGS_PRESENTATION.height) {
    throw new Error(`Weavings presentation dimensions must be ${WEAVINGS_PRESENTATION.width}x${WEAVINGS_PRESENTATION.height}`);
  }

  const socialBuffer = await buildSocialShareImage(logo.buffer, PINNED_LOGO.width, PINNED_LOGO.height);
  await writeFile(SOCIAL_OUT, socialBuffer);
  const socialSha256 = sha256Buffer(socialBuffer);

  const manifest = buildApprovedAssetManifest({
    socialSha256,
    weavingsPresentationSha256: presentation.sha256,
  });

  await writeFile(MANIFEST_OUT, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        version: manifest.version,
        logo: {
          sha256: PINNED_LOGO.sha256,
          width: PINNED_LOGO.width,
          height: PINNED_LOGO.height,
        },
        weavingsSource: {
          sha256: PINNED_WEAVINGS_SOURCE.sha256,
          width: PINNED_WEAVINGS_SOURCE.width,
          height: PINNED_WEAVINGS_SOURCE.height,
        },
        weavingsPresentation: {
          sha256: presentation.sha256,
          width: presentation.width,
          height: presentation.height,
        },
        social: {
          sha256: socialSha256,
          width: APPROVED_SOCIAL.width,
          height: APPROVED_SOCIAL.height,
          productionUrl: APPROVED_SOCIAL.productionUrl,
        },
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
