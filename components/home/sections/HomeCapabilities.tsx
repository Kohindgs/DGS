import Link from "next/link";
import type { ContentBlock } from "@/lib/content/types";
import styles from "./HomeCapabilities.module.css";

type Props = { blocks: ContentBlock[] };

function blockText(block: ContentBlock): string {
  if (block.type === "heading") return block.text;
  if (block.type === "paragraph") return block.content.map((s) => s.text).join("");
  return "";
}

const SERVICE_LINKS: Record<string, string> = {
  "Search Visibility & AI Discovery": "/services/seo-services-in-mumbai/",
  "Website Development & AMC": "/services/website-development-amc/",
  "Social Media & Performance Marketing": "/services/social-media-marketing/",
  "Branding, Content & AI Production": "/services/branding/",
};

export function HomeCapabilities({ blocks }: Props) {
  const heading = blocks.find((b) => b.type === "heading" && b.level === 2);
  const cards = blocks.filter((b) => b.type === "heading" && b.level === 3);

  return (
    <section className={styles.section} id="dgs-v1215-services">
      <div className={styles.inner}>
        <h2>{heading?.type === "heading" ? heading.text : ""}</h2>
        <div className={styles.grid}>
          {cards.map((card) => {
            const title = card.type === "heading" ? card.text : "";
            const body = blocks
              .slice(blocks.indexOf(card) + 1)
              .find((b) => b.type === "paragraph");
            const href = SERVICE_LINKS[title] || "/services/";
            return (
              <Link key={title} href={href} className={styles.card}>
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
