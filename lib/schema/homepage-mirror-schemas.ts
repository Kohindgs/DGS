import type { ContentBlock } from "@/lib/content/types";
import type { RouteRecord } from "@/lib/nextjs/routes";
import { buildHomepageNativeJsonLd } from "@/lib/schema/homepage-native-schemas";

/** Native Next.js homepage JSON-LD — WordPress/Rank Math schemas are migration evidence only. */
export function buildHomepageMirrorJsonLd(input: {
  route: RouteRecord;
  blocks: ContentBlock[];
}): string[] {
  return buildHomepageNativeJsonLd({
    route: input.route,
    blocks: input.blocks,
  });
}
