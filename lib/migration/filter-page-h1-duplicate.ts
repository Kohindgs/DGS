import type { ContentBlock } from "@/lib/content/types";

/** Omit only the first source H1 block that duplicates the resolved page H1. */
export function filterDuplicatePageH1Block(blocks: ContentBlock[], pageH1: string): ContentBlock[] {
  const normalizedPageH1 = pageH1.trim();
  let removedDuplicate = false;

  return blocks.filter((block) => {
    if (
      !removedDuplicate &&
      block.type === "heading" &&
      block.level === 1 &&
      block.text.trim() === normalizedPageH1
    ) {
      removedDuplicate = true;
      return false;
    }
    return true;
  });
}
