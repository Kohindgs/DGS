import type { RouteRecord } from "@/lib/nextjs/routes";

export type RelatedPost = {
  path: string;
  title: string;
  description: string | null;
  date: string | null;
};

function timestamp(value: string | null | undefined) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function selectRelatedPosts(routes: RouteRecord[], currentPath: string, limit = 3): RelatedPost[] {
  return routes
    .filter(
      (route) =>
        route.wordpressType === "post" &&
        route.path !== currentPath &&
        (route.proposedAction === "KEEP_SAME_URL" || route.proposedAction === "PROTECTED"),
    )
    .sort((a, b) => timestamp(b.date || b.modified) - timestamp(a.date || a.modified))
    .slice(0, limit)
    .map((route) => ({
      path: route.path,
      title: route.title || route.h1 || route.path,
      description: route.description,
      date: route.date,
    }));
}

export function formatDisplayDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function normalizeComparableTitle(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export function buildTitlePathIndex(routes: RouteRecord[]): Record<string, string> {
  const index: Record<string, string> = {};
  for (const route of routes) {
    if (route.title) index[normalizeComparableTitle(route.title)] = route.path;
    if (route.h1) index[normalizeComparableTitle(route.h1)] = route.path;
  }
  return index;
}
