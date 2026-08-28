import routeDecisionsFile from "@/data/migration/route-decisions.approved.json";
import { normalizeSitePath } from "@/lib/seo/metadata";

export type RouteDecision = {
  path: string;
  classification: string;
  approved: boolean;
  indexable: boolean;
  includeInSitemap: boolean;
  canonicalPath?: string | null;
  redirectTo?: string | null;
  reason?: string;
};

const decisionsByPath = new Map(
  (routeDecisionsFile.decisions as RouteDecision[]).map((decision) => [
    normalizeSitePath(decision.path),
    decision,
  ]),
);

export function getRouteDecision(path: string): RouteDecision | null {
  return decisionsByPath.get(normalizeSitePath(path)) || null;
}

export function getApprovedRedirectDestination(path: string): string | null {
  const decision = getRouteDecision(path);
  if (decision?.approved && decision.redirectTo) {
    return normalizeSitePath(decision.redirectTo);
  }
  return null;
}

export function shouldExcludeFromStaticGeneration(path: string): boolean {
  const decision = getRouteDecision(path);
  return Boolean(decision?.approved && decision.redirectTo);
}
