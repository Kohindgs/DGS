import type { ContentBlock, HeadingBlock } from "@/lib/content/types";
import approved from "@/data/migration/ranking-link-restorations.approved.json";

type Restoration = {
  headingId: string;
  anchor: string;
  wordpressDestination: string;
  requiredNextDestination: string | null;
  action?: "REMOVE_BROKEN_HREF";
  classification?: string | null;
  reason?: string;
};

const byPath = approved.restorations as Record<string, Restoration[]>;

export function applyRankingLinkRestorations(path: string, blocks: ContentBlock[]): ContentBlock[] {
  const restorations = byPath[path];
  if (!restorations?.length) return blocks;

  const restorationByHeadingId = new Map(restorations.map((item) => [item.headingId, item]));

  return blocks.map((block) => {
    if (block.type !== "heading") return block;
    const heading = block as HeadingBlock;
    const restoration = heading.id ? restorationByHeadingId.get(heading.id) : undefined;
    if (!restoration) return block;

    if (restoration.action === "REMOVE_BROKEN_HREF") {
      const { href: _removed, ...withoutHref } = heading;
      return withoutHref;
    }

    if (!restoration.requiredNextDestination) return block;
    return { ...heading, href: restoration.requiredNextDestination };
  });
}
