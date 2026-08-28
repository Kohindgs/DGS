import Link from "next/link";
import type { ContentBlock } from "@/lib/content/types";
import styles from "./HomeSearchAuthority.module.css";

type Props = { blocks: ContentBlock[] };

function blockText(block: ContentBlock): string {
  if (block.type === "heading") return block.text;
  if (block.type === "paragraph") return block.content.map((s) => s.text).join("");
  return "";
}

const LINKS: Record<string, string> = {
  "Rank-ready website and content foundations.": "/services/seo-services-in-mumbai/",
  "Built for answer-first discovery.": "/services/aeo-services-in-mumbai/",
  "Visibility for generative search experiences.": "/services/geo/",
  "Clear entities, services and brand context.": "/services/llm-seo-service/",
  "Natural answers for spoken queries.": "/services/aeo-services-in-mumbai/",
  "Faster creative output with brand control.": "/services/ai-video-production-agency/",
};

export function HomeSearchAuthority({ blocks }: Props) {
  const heading = blocks.find((b) => b.type === "heading" && b.level === 2);
  const items = blocks.filter((b) => b.type === "heading" && b.level === 3);

  return (
    <section className={styles.section} id="dgs-v1215-search-authority">
      <div className={styles.inner}>
        <h2>{heading?.type === "heading" ? heading.text : ""}</h2>
        <div className={styles.grid}>
          {items.map((item) => {
            const title = item.type === "heading" ? item.text : "";
            const body = blocks.slice(blocks.indexOf(item) + 1).find((b) => b.type === "paragraph");
            return (
              <Link key={title} href={LINKS[title] || "/services/"} className={styles.card}>
                <h3>{title}</h3>
                {body?.type === "paragraph" ? <p>{blockText(body)}</p> : null}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
