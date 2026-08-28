import type { ContentBlock } from "@/lib/content/types";
import styles from "./HomeWhyDgs.module.css";

type Props = { blocks: ContentBlock[] };

function blockText(block: ContentBlock): string {
  if (block.type === "heading") return block.text;
  if (block.type === "paragraph") return block.content.map((s) => s.text).join("");
  return "";
}

export function HomeWhyDgs({ blocks }: Props) {
  const heading = blocks.find((b) => b.type === "heading" && b.level === 2);
  const pillars = blocks.filter((b) => b.type === "heading" && b.level === 3);

  return (
    <section className={styles.section} id="dgs-v1215-why" data-reveal>
      <div className={styles.inner}>
        <h2>{heading?.type === "heading" ? heading.text : ""}</h2>
        <div className={styles.grid}>
          {pillars.map((pillar) => {
            const index = blocks.indexOf(pillar);
            const copy = blocks.slice(index + 1, index + 3).find((b) => b.type === "paragraph");
            return (
              <article key={pillar.type === "heading" ? pillar.text : ""} className={styles.card}>
                <h3>{pillar.type === "heading" ? pillar.text : ""}</h3>
                {copy?.type === "paragraph" ? <p>{blockText(copy)}</p> : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
