#!/usr/bin/env node
import { writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { cleanPath } from "./lib/full-site-route-audit.mjs";
import {
  REQUIRED_VIEWPORTS,
  assertCleanWorktree,
  assertHeadMatchesCommit,
  assertValidCommitSha,
  buildMobileEvidencePayload,
  commitTimestampMs,
  computeMobileEvidenceDigest,
  gitOutput,
} from "./lib/ranking-readiness-integrity.mjs";
import {
  APPROVED_SOCIAL,
  WEAVINGS_PRESENTATION,
  WEAVINGS_ROUTES,
} from "./lib/approved-assets.mjs";

const ROOT = process.cwd();
const TARGET = process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025/";
const SOURCE_COMMIT = process.env.MOBILE_EVIDENCE_SOURCE_COMMIT;

if (!SOURCE_COMMIT) {
  console.error("MOBILE_EVIDENCE_SOURCE_COMMIT is required");
  process.exit(1);
}

if (!assertValidCommitSha(SOURCE_COMMIT)) {
  console.error("MOBILE_EVIDENCE_SOURCE_COMMIT must be a 40-character commit SHA");
  process.exit(1);
}

try {
  gitOutput(ROOT, ["cat-file", "-e", `${SOURCE_COMMIT}^{commit}`]);
} catch {
  console.error(`Commit does not exist: ${SOURCE_COMMIT}`);
  process.exit(1);
}

try {
  assertCleanWorktree(ROOT);
} catch (error) {
  console.error("Working tree must be clean before mobile evidence capture");
  for (const dirtyPath of error.dirtyPaths || []) console.error(dirtyPath);
  process.exit(1);
}

try {
  assertHeadMatchesCommit(ROOT, SOURCE_COMMIT);
} catch (error) {
  console.error("HEAD must exactly match MOBILE_EVIDENCE_SOURCE_COMMIT");
  console.error(JSON.stringify({ expected: error.expected, actual: error.actual }, null, 2));
  process.exit(1);
}

const commitTs = commitTimestampMs(ROOT, SOURCE_COMMIT);
const captureStartedAt = Date.now();
if (captureStartedAt <= commitTs) {
  console.error("Capture timestamp must be later than application-source commit timestamp");
  process.exit(1);
}

const shortSha = SOURCE_COMMIT.slice(0, 7);
const OUT = path.join(ROOT, `data/audit/mobile-overflow-evidence.${shortSha}.json`);

const indexability = JSON.parse(
  readFileSync(path.join(ROOT, "data/migration/indexability-manifest.generated.json"), "utf8"),
);
const paths = indexability.routes
  .filter((route) => route.indexable && route.includeInSitemap)
  .map((route) => cleanPath(route.path))
  .sort();

if (paths.length !== 96) {
  console.error(`Expected 96 indexable routes, found ${paths.length}`);
  process.exit(1);
}

async function detectOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const docOverflow = doc.scrollWidth > doc.clientWidth + 1;
    const bodyOverflow = body ? body.scrollWidth > body.clientWidth + 1 : false;
    return docOverflow || bodyOverflow;
  });
}

async function verifyServedAssets(page, routePath) {
  const html = await page.content();
  if (/s\.wordpress\.com\/mshots/i.test(html)) {
    throw new Error(`${routePath}: served HTML still contains mshots`);
  }
  if (!html.includes(APPROVED_SOCIAL.productionUrl)) {
    throw new Error(`${routePath}: missing approved OG image URL`);
  }
  if (WEAVINGS_ROUTES.includes(routePath)) {
    if (!html.includes(WEAVINGS_PRESENTATION.localPath)) {
      throw new Error(`${routePath}: missing approved Weavings presentation asset`);
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const pagesByPath = new Map(paths.map((routePath) => [routePath, { "390x844": false, "430x932": false }]));

  for (const routePath of paths) {
    const url = new URL(routePath, TARGET).toString();
    for (const viewport of REQUIRED_VIEWPORTS) {
      const [width, height] = viewport.split("x").map(Number);
      const page = await browser.newPage({ viewport: { width, height } });
      try {
        const response = await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
        if (!response || response.status() !== 200) {
          throw new Error(`${routePath} returned status ${response?.status() ?? "unknown"}`);
        }
        await verifyServedAssets(page, routePath);
        const overflow = await detectOverflow(page);
        pagesByPath.get(routePath)[viewport] = overflow;
      } finally {
        await page.close();
      }
    }
    process.stderr.write(`captured ${routePath}\n`);
  }

  await browser.close();

  const payload = buildMobileEvidencePayload(pagesByPath);
  const digest = computeMobileEvidenceDigest(payload);
  const capturedAt = new Date().toISOString();
  if (Date.parse(capturedAt) <= commitTs) {
    throw new Error("Evidence capture timestamp must be later than application-source commit");
  }

  const evidence = {
    sourceCommit: SOURCE_COMMIT,
    sourceReportGeneratedAt: capturedAt,
    capturedAt,
    captureStartedAtMs: captureStartedAt,
    sourceCommitTimestampMs: commitTs,
    viewports: REQUIRED_VIEWPORTS,
    digest,
    evidence: payload,
  };

  writeFileSync(OUT, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        out: path.relative(ROOT, OUT),
        sourceCommit: SOURCE_COMMIT,
        digest,
        capturedAt,
        overflowPages: payload.filter((entry) => entry["390x844"] || entry["430x932"]).length,
        totalRoutes: payload.length,
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
