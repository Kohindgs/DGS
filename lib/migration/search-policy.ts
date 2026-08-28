import { protectedRoutes } from "./protected-routes";
import { normalizeSitePath } from "@/lib/seo/metadata";

const protectedByPath = new Map(
  protectedRoutes.map((route) => [normalizeSitePath(route.path), route]),
);

export function getProtectedRoute(path: string) {
  return protectedByPath.get(normalizeSitePath(path)) || null;
}

export function isProtectedRoute(path: string) {
  return Boolean(getProtectedRoute(path));
}

export function assertProtectedRouteSearchPolicy(input: {
  path: string;
  canonicalPath: string;
  indexable: boolean;
  includeInSitemap: boolean;
  redirectTo?: string | null;
}) {
  const route = getProtectedRoute(input.path);
  if (!route) return;

  const path = normalizeSitePath(input.path);
  const canonicalPath = normalizeSitePath(input.canonicalPath);
  const errors: string[] = [];

  if (!input.indexable) errors.push(`${path}: protected route cannot be noindex`);
  if (!input.includeInSitemap) errors.push(`${path}: protected route must be included in sitemap`);
  if (input.redirectTo) errors.push(`${path}: protected route cannot redirect to ${input.redirectTo}`);
  if (canonicalPath !== path) errors.push(`${path}: protected route must self-canonicalize; received ${canonicalPath}`);

  if (errors.length) {
    throw new Error(`Protected search policy violation:\n${errors.join("\n")}`);
  }
}
