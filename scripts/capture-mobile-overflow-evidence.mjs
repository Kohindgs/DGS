#!/usr/bin/env node
import { writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { cleanPath } from "./lib/full-site-route-audit.mjs";
import {
  REQUIRED_VIEWPORTS,
  buildMobileEvidencePayload,
  computeMobileEvidenceDigest,
  serializeMobileEvidencePayload,
} from "./lib/ranking-readiness-integrity.mjs";

const ROOT = process.cwd();
const TARGET = process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025/";
const SOURCE_COMMIT = process.env.MOBILE_EVIDENCE_SOURCE_COMMIT;
if (!SOURCE_COMMIT) {
  console.error("MOBILE_EVIDENCE_SOURCE_COMMIT is required");
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
  const evidence = {
    sourceCommit: SOURCE_COMMIT,
    sourceReportGeneratedAt: new Date().toISOString(),
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
