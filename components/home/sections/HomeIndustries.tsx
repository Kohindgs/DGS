import type { ContentBlock } from "@/lib/content/types";
import styles from "./HomeIndustries.module.css";

type Props = { blocks: ContentBlock[] };

function blockText(block: ContentBlock): string {
  if (block.type === "heading") return block.text;
  if (block.type === "paragraph") return block.content.map((s) => s.text).join("");
  return "";
}

export function HomeIndustries({ blocks }: Props) {
  const heading = blocks.find((b) => b.type === "heading" && b.level === 2);
  const chips = blocks
    .filter((b) => b.type === "paragraph")
    .flatMap((b) => blockText(b).split(/(?=[A-Z][a-z])/))
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && t.length < 40);

  return (
    <section className={styles.section} id="dgs-v1215-industries">
      <div className={styles.inner}>
        <h2>{heading?.type === "heading" ? heading.text : ""}</h2>
        <div className={styles.chips}>
          {chips.map((chip) => (
            <span key={chip} className={styles.chip}>
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
