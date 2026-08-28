import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizePath } from "./path";

const REGISTRY_PATH = path.join(process.cwd(), "data/migration/nextjs-route-registry.generated.json");

export type RouteRecord = {
  path: string;
  wordpressId: number;
  wordpressType: "page" | "service" | "post";
  slug: string;
  status: string | null;
  title: string | null;
  description: string | null;
  h1: string | null;
  canonical: string | null;
  canonicalMismatch: boolean;
  desiredCanonicalPath: string | null;
  robots: string | null;
  indexable: boolean;
  includeInSitemap: boolean;
  protected: boolean;
  protectedLabel: string | null;
  proposedAction: string;
  modified: string;
  date: string | null;
  headings: Array<{ level: string; text: string }>;
  faqItems: Array<{ question: string; answer: string }>;
};

let cache: { routes: RouteRecord[]; byPath: Map<string, RouteRecord> } | null = null;

export async function loadRouteRegistry() {
  if (cache) return cache;
  const raw = JSON.parse(await readFile(REGISTRY_PATH, "utf8"));
  const routes: RouteRecord[] = raw.routes;
  const byPath = new Map(routes.map((r) => [normalizePath(r.path), r]));
  cache = { routes, byPath };
  return cache;
}

export async function getRouteByPath(path: string): Promise<RouteRecord | undefined> {
  const registry = await loadRouteRegistry();
  return registry.byPath.get(normalizePath(path));
}

export async function getAllRoutes(): Promise<RouteRecord[]> {
  const registry = await loadRouteRegistry();
  return registry.routes;
}

export async function getProtectedRoutes(): Promise<RouteRecord[]> {
  const registry = await loadRouteRegistry();
  return registry.routes.filter((r) => r.protected);
}

export async function getIndexableRoutes(): Promise<RouteRecord[]> {
  const registry = await loadRouteRegistry();
  return registry.routes.filter(
    (r) =>
      r.indexable &&
      r.includeInSitemap &&
      (r.proposedAction === "KEEP_SAME_URL" || r.proposedAction === "PROTECTED"),
  );
}
