import type { ContentBlock } from "@/lib/content/types";
import { ClientLogoMarquee } from "@/components/home/ClientLogoMarquee";
import { loadHomepageClientLogos } from "@/lib/home/load-client-logos";
import styles from "./HomeProofStack.module.css";

type Props = {
  blocks: ContentBlock[];
};

function blockText(block: ContentBlock): string {
  if (block.type === "heading") return block.text;
  if (block.type === "paragraph") return block.content.map((s) => s.text).join("");
  return "";
}

export function HomeProofStack({ blocks }: Props) {
  const logos = loadHomepageClientLogos();
  const heading = blocks.find((b) => b.type === "heading" && b.level === 2);
  const subcopy = blocks.find(
    (b) =>
      b.type === "paragraph" &&
      blockText(b).includes("Real brand work across digital marketing"),
  );
  const awardsHeading = blocks.find(
    (b) => b.type === "heading" && blockText(b).includes("Recognized for SEO"),
  );
  const awardCards = blocks.filter(
    (b) => b.type === "heading" && b.level === 3 && /Work|Regarded|Excellence/i.test(blockText(b)),
  );

  return (
    <section className={styles.section} id="dgs-proof">
      <div className={styles.intro}>
        <h2>{heading?.type === "heading" ? heading.text : ""}</h2>
        {subcopy?.type === "paragraph" ? <p>{blockText(subcopy)}</p> : null}
      </div>

      <ClientLogoMarquee logos={logos} />

      <div className={styles.awards}>
        <h2>{awardsHeading?.type === "heading" ? awardsHeading.text : ""}</h2>
        <div className={styles.awardGrid}>
          {awardCards.map((card) => (
            <article key={card.type === "heading" ? card.text : ""} className={styles.awardCard}>
              <h3>{card.type === "heading" ? card.text : ""}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
