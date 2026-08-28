import type { ContentBlock } from "@/lib/content/types";
import styles from "./HomeTestimonials.module.css";

type Props = { blocks: ContentBlock[] };

function blockText(block: ContentBlock): string {
  if (block.type === "heading") return block.text;
  if (block.type === "paragraph") return block.content.map((s) => s.text).join("");
  return "";
}

export function HomeTestimonials({ blocks }: Props) {
  const heading = blocks.find((b) => b.type === "heading" && b.level === 2);
  const people = blocks.filter((b) => b.type === "heading" && b.level === 3);

  return (
    <section className={`${styles.section} dgs-v1215-testimonials`} id="testimonials">
      <div className={styles.inner}>
        <h2>{heading?.type === "heading" ? heading.text : ""}</h2>
        <div className={styles.grid}>
          {people.map((person) => {
            const index = blocks.indexOf(person);
            const quote = blocks.slice(index + 1, index + 4).find((b) => b.type === "paragraph");
            return (
              <article key={person.type === "heading" ? person.text : ""} className={styles.card}>
                <h3>{person.type === "heading" ? person.text : ""}</h3>
                {quote?.type === "paragraph" ? <p>{blockText(quote)}</p> : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
