import type { WpMirrorContent } from "@/lib/wordpress/mirror-types";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import type { RouteRecord } from "@/lib/nextjs/routes";
import type { ContentBlock } from "@/lib/content/types";

/** Prefer synced Rank Math @graph JSON-LD from WordPress for homepage AI/search coverage. */
export function buildHomepageMirrorJsonLd(input: {
  content: WpMirrorContent;
  route: RouteRecord;
  blocks: ContentBlock[];
}): string[] {
  const wpSchemas = input.content.schemas?.filter((schema) => schema.trim().length > 0);
  if (wpSchemas?.length) {
    return wpSchemas;
  }

  return buildRouteSchemas({
    route: input.route,
    path: "/",
    blocks: input.blocks,
    breadcrumbs: [],
  }).map((schema) => JSON.stringify(schema));
}
