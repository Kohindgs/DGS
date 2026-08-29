import type { ContentBlock, HeadingBlock } from "@/lib/content/types";
import approved from "@/data/migration/ranking-link-restorations.approved.json";

type Restoration = {
  headingId: string;
  anchor: string;
  wordpressDestination: string;
  requiredNextDestination: string;
  classification?: string | null;
  stopReason?: string;
};

const byPath = approved.restorations as Record<string, Restoration[]>;

export function applyRankingLinkRestorations(path: string, blocks: ContentBlock[]): ContentBlock[] {
  const restorations = byPath[path];
  if (!restorations?.length) return blocks;

  const hrefByHeadingId = new Map(
    restorations.map((item) => [item.headingId, item.requiredNextDestination]),
  );

  return blocks.map((block) => {
    if (block.type !== "heading") return block;
    const heading = block as HeadingBlock;
    const href = heading.id ? hrefByHeadingId.get(heading.id) : undefined;
    if (!href) return block;
    return { ...heading, href };
  });
}
