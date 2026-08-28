import retiredRegistry from "@/data/migration/retired-routes.approved.json";
import { normalizeSitePath } from "@/lib/seo/metadata";

type RetiredRoute = {
  path: string;
  statusCode: number;
  reason?: string;
};

const retiredByPath = new Map(
  (retiredRegistry.retired as RetiredRoute[]).map((route) => [
    normalizeSitePath(route.path),
    route,
  ]),
);

export function getRetiredRoute(path: string) {
  return retiredByPath.get(normalizeSitePath(path)) || null;
}
