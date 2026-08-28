import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT_DIR = path.join(ROOT, "data/audit/live");
const MIGRATION_DIR = path.join(ROOT, "data/migration");
const [edges, parity, tier0] = await Promise.all([
  readJson(path.join(AUDIT_DIR, "internal-links-v2.json")),
  readJson(path.join(MIGRATION_DIR, "route-parity-v2.generated.json")),
  readJson(path.join(MIGRATION_DIR, "tier0-routes.json")),
]);

const routePaths = new Set(parity.routes.map((route) => route.path));
const stats = new Map();
function get(pathName) {
  if (!stats.has(pathName)) stats.set(pathName, { path: pathName, inboundEdges: 0, outboundEdges: 0, inboundSources: new Set(), outboundDestinations: new Set(), inboundAnchors: new Map(), outboundAnchors: new Map() });
  return stats.get(pathName);
}
for (const route of parity.routes) get(route.path);

for (const edge of edges) {
  const from = get(edge.from);
  const to = get(edge.to);
  from.outboundEdges += 1;
  from.outboundDestinations.add(edge.to);
  to.inboundEdges += 1;
  to.inboundSources.add(edge.from);
  increment(from.outboundAnchors, edge.anchor || "");
  increment(to.inboundAnchors, edge.anchor || "");
}

const graph = [...stats.values()].map((item) => ({
  path: item.path,
  inboundEdges: item.inboundEdges,
  uniqueInboundSources: item.inboundSources.size,
  outboundEdges: item.outboundEdges,
  uniqueOutboundDestinations: item.outboundDestinations.size,
  topInboundAnchors: top(item.inboundAnchors, 12),
  topOutboundAnchors: top(item.outboundAnchors, 12),
})).sort((a, b) => a.path.localeCompare(b.path));

const graphByPath = new Map(graph.map((item) => [item.path, item]));
const tier0Requirements = tier0.routes.map((route) => {
  const current = graphByPath.get(route.path) || { path: route.path, inboundEdges: 0, uniqueInboundSources: 0, outboundEdges: 0, uniqueOutboundDestinations: 0, topInboundAnchors: [], topOutboundAnchors: [] };
  return {
    path: route.path,
    label: route.label,
    sourceBaseline: current,
    migrationRule: "Do not materially reduce meaningful internal-link discoverability during redesign. Preserve service-cluster relationships and verify the post-migration graph before cutover.",
  };
});

const reviewCandidates = parity.routes
  .filter((route) => route.proposedAction === "KEEP_SAME_URL" && route.resourceType === "html")
  .map((route) => ({ ...route, graph: graphByPath.get(route.path) || null }))
  .filter((route) => (route.graph?.uniqueInboundSources || 0) <= 1)
  .map((route) => ({
    path: route.path,
    title: route.title,
    wordpress: route.wordpress,
    uniqueInboundSources: route.graph?.uniqueInboundSources || 0,
    inboundEdges: route.graph?.inboundEdges || 0,
    review: "Internal-link opportunity review only. Do not add links until relevance and page intent are verified.",
  }));

const output = {
  generatedAt: new Date().toISOString(),
  edgeCount: edges.length,
  routeCount: routePaths.size,
  graph,
  tier0Requirements,
  lowInboundReviewCandidates: reviewCandidates,
};
await mkdir(MIGRATION_DIR, { recursive: true });
await writeFile(path.join(MIGRATION_DIR, "internal-link-graph.generated.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ edgeCount: edges.length, routes: graph.length, tier0: tier0Requirements.length, lowInboundReview: reviewCandidates.length }, null, 2));

function increment(map, key) { map.set(key, (map.get(key) || 0) + 1); }
function top(map, limit) { return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([anchor, count]) => ({ anchor, count })); }
async function readJson(file) { return JSON.parse(await readFile(file, "utf8")); }
