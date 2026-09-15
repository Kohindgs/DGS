#!/usr/bin/env node
/**
 * ONE-TIME manual builder for ranking-protection-baseline.json
 * Requires ALLOW_RANKING_BASELINE_UPDATE=1 — otherwise refuses overwrite.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  extractContextualLinks,
  extractFaqItems,
  extractHeadings,
  extractImages,
  meaningfulMissingHeadings,
  normalizeText,
  textSha256,
} from "./lib/tier0-parity-compare.mjs";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/migration/ranking-protection-baseline.json");
const INTEGRITY_OUT = path.join(ROOT, "data/migration/ranking-protection-baseline.integrity.json");
const POLICY = path.join(ROOT, "data/migration/ranking-protected-routes.json");
const TIER0 = path.join(ROOT, "data/migration/tier0-routes.json");
const CONTENT_BASELINE = path.join(ROOT, "data/migration/tier0-content-baseline.generated.json");
const WP_ORIGIN = "https://www.dgeniussolutions.com";

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function main() {
  const allowUpdate = process.env.ALLOW_RANKING_BASELINE_UPDATE === "1";
  try {
    await readFile(OUT);
    if (!allowUpdate) {
      console.error("REFUSE: ranking-protection-baseline.json is immutable.");
      console.error("Set ALLOW_RANKING_BASELINE_UPDATE=1 to overwrite manually.");
      process.exit(1);
    }
  } catch {
    // first creation
  }

  const [policy, tier0, contentBaseline, pagesRaw, servicesRaw] = await Promise.all([
    readJson(POLICY),
    readJson(TIER0),
    readJson(CONTENT_BASELINE),
    readJson(path.join(ROOT, "data/wordpress/raw/pages.json")),
    readJson(path.join(ROOT, "data/wordpress/raw/services.json")),
  ]);

  const recordsById = new Map([...pagesRaw, ...servicesRaw].map((item) => [Number(item.id), item]));
  const tier0ByPath = new Map(tier0.routes.map((item) => [item.path, item]));
  const baselineByPath = new Map(contentBaseline.baselines.map((item) => [item.path, item]));
  const routes = {};

  for (const routePath of policy.protectedPaths) {
    const route = tier0ByPath.get(routePath);
    const wpRecord = recordsById.get(Number(route.wordpressId));
    const content = baselineByPath.get(routePath);
    if (!route || !wpRecord || !content) {
      throw new Error(`Missing source data for ${routePath}`);
    }

    const html = wpRecord.content?.rendered || "";
    const headings = extractHeadings(html).filter((h) => !/^\+\s*title\s*\+$/i.test(h.text.replace(/^['"]+|['"]+$/g, "")));
    const faqs = extractFaqItems(html);
    const images = extractImages(html)
      .filter((img) => img.alt?.trim())
      .map((img) => ({ src: img.src, alt: img.alt }));
    const contextualLinks = extractContextualLinks(html, `${WP_ORIGIN}${routePath}`).filter(
      (link) => link.anchor?.trim() || !/\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(link.path),
    );
    const bodyText = normalizeText(html);
    const requiredNextCanonical =
      routePath === "/services/aeo-services-in-mumbai/"
        ? "/services/aeo-services-in-mumbai/"
        : route.desiredCanonicalPath || routePath;

    const routeSnapshot = {
      wordpressId: route.wordpressId,
      path: routePath,
      url: `${WP_ORIGIN}${routePath}`,
      title: route.observedTitle,
      metaDescription: policy.observedMetaDescriptions?.[routePath] || "",
      h1: route.observedH1,
      headings: headings.map((h) => ({ level: h.level, text: h.text })),
      bodyText,
      bodyTextSha256: textSha256(bodyText),
      faqs,
      contextualLinks: contextualLinks.map((link) => ({
        anchor: link.anchor,
        href: link.href,
        path: link.path,
      })),
      images,
      observedSourceCanonical: route.observedCanonical
        ? new URL(route.observedCanonical).pathname.replace(/([^/])$/, "$1/").replace(/^(?!\/)/, "/")
        : routePath,
      requiredNextCanonical,
      requiredSchemaTypes: policy.requiredSchemaTypes || [],
    };

    routeSnapshot.routeSha256 = textSha256(JSON.stringify(routeSnapshot));
    routes[routePath] = routeSnapshot;
  }

  let sourceCommit = "unknown";
  try {
    sourceCommit = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    // non-git environment
  }

  const baseline = {
    baselineVersion: 1,
    createdAt: new Date().toISOString(),
    sourceEvidence: {
      source: "WordPress REST content.rendered",
      tier0ContentBaselineGeneratedAt: contentBaseline.generatedAt,
      wordpressRawExtractedAt: "data/wordpress/raw/services.json",
      sourceCommit,
      policyFile: "data/migration/ranking-protected-routes.json",
    },
    routes,
    routeDigests: Object.fromEntries(
      Object.entries(routes).map(([routePath, snapshot]) => [routePath, snapshot.routeSha256]),
    ),
  };

  baseline.overallSha256 = textSha256(JSON.stringify({ routes: baseline.routes, routeDigests: baseline.routeDigests }));

  const serialized = `${JSON.stringify(baseline, null, 2)}\n`;
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, serialized, "utf8");

  const integrity = {
    createdAt: baseline.createdAt,
    overallSha256: createHash("sha256").update(serialized).digest("hex"),
    routeDigests: baseline.routeDigests,
    sourceCommit,
  };
  await writeFile(INTEGRITY_OUT, `${JSON.stringify(integrity, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({ out: OUT, integrityOut: INTEGRITY_OUT, overallSha256: integrity.overallSha256, routeDigests: integrity.routeDigests }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
