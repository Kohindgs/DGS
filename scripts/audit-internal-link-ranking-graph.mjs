#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { cleanPath } from "./lib/full-site-route-audit.mjs";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/audit/internal-link-ranking-graph.json");
const graphFile = JSON.parse(
  readFileSync(path.join(ROOT, "data/migration/internal-link-graph.generated.json"), "utf8"),
);
const indexability = JSON.parse(
  readFileSync(path.join(ROOT, "data/migration/indexability-manifest.generated.json"), "utf8"),
);

const indexable = new Set(
  indexability.routes.filter((r) => r.indexable).map((r) => cleanPath(r.path)),
);

const nodes = {};
for (const entry of graphFile.graph || []) {
  const routePath = cleanPath(entry.path);
  if (!indexable.has(routePath)) continue;
  nodes[routePath] = {
    path: routePath,
    incomingLinks: entry.inboundEdges || 0,
    outgoingLinks: entry.outboundEdges || 0,
    uniqueIncomingSources: entry.uniqueInboundSources || 0,
    uniqueOutgoingDestinations: entry.uniqueOutboundDestinations || 0,
    topInboundAnchors: entry.topInboundAnchors || [],
    topOutboundAnchors: entry.topOutboundAnchors || [],
    orphan: (entry.uniqueInboundSources || 0) === 0,
    weaklyLinked: (entry.uniqueInboundSources || 0) <= 1,
  };
}

const orphans = Object.values(nodes).filter((n) => n.orphan).map((n) => n.path);
const weak = Object.values(nodes).filter((n) => n.weaklyLinked).map((n) => n.path);

writeFileSync(
  OUT,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: "data/migration/internal-link-graph.generated.json",
      nodeCount: Object.keys(nodes).length,
      orphanPages: orphans,
      weaklyLinkedPages: weak,
      nodes,
      cannibalizationClusters: [],
      note: "Cannibalization clusters require manual CONTENT STRATEGY review — not implemented in Phase 2A",
    },
    null,
    2,
  ),
);
console.log(JSON.stringify({ nodeCount: Object.keys(nodes).length, orphans: orphans.length, weak: weak.length }, null, 2));
