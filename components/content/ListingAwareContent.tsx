import Link from "next/link";
import type { ReactNode } from "react";
import type { ContentBlock } from "@/lib/content/types";
import { SemanticContent } from "./SemanticContent";
import { RichText } from "./RichText";

type ListingAwareContentProps = {
  blocks: ContentBlock[];
  route: string;
  hrefByTitle?: Record<string, string>;
};

function normalizeTitle(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export function ListingAwareContent({ blocks, route, hrefByTitle = {} }: ListingAwareContentProps) {
  const nodes: ReactNode[] = [];
  const leftover: ContentBlock[] = [];
  let leftoverKey = 0;

  const flushLeftover = () => {
    if (leftover.length === 0) return;
    const chunk = leftover.splice(0, leftover.length);
    nodes.push(
      <SemanticContent
        key={`listing-rest-${leftoverKey++}`}
        blocks={chunk}
        demoteSecondaryHeadings
        route={route}
      />,
    );
  };

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const next = blocks[index + 1];

    if (
      block.type === "heading" &&
      (block.level === 3 || block.level === 4) &&
      next?.type === "paragraph"
    ) {
      flushLeftover();
      const href =
        (block.href && block.href.startsWith("/") && !block.href.startsWith("//") ? block.href : undefined) ||
        hrefByTitle[normalizeTitle(block.text)];
      const headingTag = block.level === 3 ? "h3" : "h4";
      const Heading = headingTag;
      nodes.push(
        <div key={`listing-card-${index}`} className="listing-card">
          <Heading id={block.id}>
            {href ? <Link href={href}>{block.text}</Link> : block.text}
          </Heading>
          <p>
            <RichText content={next.content} />
          </p>
        </div>,
      );
      index += 1;
      continue;
    }

    leftover.push(block);
  }

  flushLeftover();
  return <div className="listing-content">{nodes}</div>;
}
