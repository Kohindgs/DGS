import Image from "next/image";
import type { ContentBlock } from "@/lib/content/types";
import styles from "./HomeCaseStudies.module.css";

type Props = { blocks: ContentBlock[] };

function blockText(block: ContentBlock): string {
  if (block.type === "heading") return block.text;
  if (block.type === "paragraph") return block.content.map((s) => s.text).join("");
  return "";
}

const CASE_ORDER = [
  "TheWorldGrad",
  "Weavings Manpower",
  "Kotak Mahindra",
  "Eureka Forbes",
  "Onida",
  "Pantaloons",
  "DSP Mutual Fund",
  "Home Credit",
];

export function HomeCaseStudies({ blocks }: Props) {
  const heading = blocks.find((b) => b.type === "heading" && b.level === 2);
  const cards = CASE_ORDER.map((title) => {
    const headingBlock = blocks.find((b) => b.type === "heading" && blockText(b) === title);
    const index = headingBlock ? blocks.indexOf(headingBlock) : -1;
    const image = index >= 0 ? blocks.slice(index, index + 6).find((b) => b.type === "image") : undefined;
    const copy = index >= 0 ? blocks.slice(index + 1, index + 4).find((b) => b.type === "paragraph") : undefined;
    return { title, image, copy };
  });

  return (
    <section className={styles.section} id="case-studies">
      <div className={styles.inner}>
        <h2>{heading?.type === "heading" ? heading.text : ""}</h2>
        <div className={styles.grid}>
          {cards.map((card) => (
            <article key={card.title} className={styles.card}>
              {card.image?.type === "image" ? (
                <div className={styles.media}>
                  <Image
                    src={card.image.src}
                    alt={card.image.alt || card.title}
                    width={640}
                    height={360}
                    className={styles.image}
                  />
                </div>
              ) : null}
              <h3>{card.title}</h3>
              {card.copy?.type === "paragraph" ? <p>{blockText(card.copy)}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
