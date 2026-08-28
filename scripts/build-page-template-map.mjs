#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "data/migration/nextjs-route-registry.generated.json");
const TIER0_PATH = path.join(ROOT, "data/migration/tier0-routes.json");
const OUT_PATH = path.join(ROOT, "data/migration/page-template-map.json");

function templateForRoute(route) {
  if (route.path === "/") return "Homepage";
  if (route.path === "/services/") return "ServicesArchive";
  if (route.wordpressType === "service") return "ServicePage";
  if (route.wordpressType === "post") return "BlogPost";
  if (route.path === "/blogs/") return "BlogArchive";
  if (route.path === "/portfolio/") return "Portfolio";
  if (route.path === "/case_studies/") return "CaseStudyArchive";
  if (route.path.includes("career") || route.path.includes("executive") || route.path.includes("manager")) {
    return "Careers";
  }
  if (route.path === "/contact-us/") return "ContactForm";
  return "StandardPage";
}

const registry = JSON.parse(await readFile(REGISTRY_PATH, "utf8"));
const tier0Paths = new Set(
  JSON.parse(await readFile(TIER0_PATH, "utf8")).routes.map((r) => r.path),
);

const routes = registry.routes
  .filter((r) => r.proposedAction === "KEEP_SAME_URL" || r.proposedAction === "PROTECTED")
  .map((route) => ({
    route: route.path,
    wordpressId: route.wordpressId,
    contentType: route.wordpressType,
    template: templateForRoute(route),
    tier: tier0Paths.has(route.path) ? "tier-0" : route.protected ? "protected" : "standard",
    indexability: route.indexable ? "indexable" : "noindex",
    includeInSitemap: route.includeInSitemap,
    specialRequirements: tier0Paths.has(route.path)
      ? ["release-blocker", "self-canonical", "preserve-internal-links"]
      : [],
  }));

await writeFile(
  OUT_PATH,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      routes,
    },
    null,
    2,
  ),
);

console.log(`Wrote ${routes.length} routes to ${OUT_PATH}`);
