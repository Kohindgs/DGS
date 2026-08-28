import Image from "next/image";
import type { ContentBlock } from "@/lib/content/types";
import { HomeTrustedBrandsGrid } from "@/components/home/HomeTrustedBrandsGrid";
import { loadHomepageClientLogos } from "@/lib/home/load-client-logos";
import { WP_AWARD_CARDS } from "@/lib/wp-exact/awards";
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

  return (
    <section className={`${styles.section} dgs-v1215-proof-stack`} id="dgs-proof">
      <div className={styles.shell}>
        <div className={styles.sectionHead}>
          <span className={styles.kicker}>Trusted by 200+ brands</span>
          <h2>{heading?.type === "heading" ? heading.text : ""}</h2>
          {subcopy?.type === "paragraph" ? <p>{blockText(subcopy)}</p> : null}
        </div>

        <HomeTrustedBrandsGrid logos={logos} />

        <div className={styles.awardsBlock} id="awards">
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>Awards &amp; Recognition</span>
            <h2>{awardsHeading?.type === "heading" ? awardsHeading.text : ""}</h2>
          </div>
          <div className={`${styles.awardGrid} dgs-v1215-awards-grid`}>
            {WP_AWARD_CARDS.map((card) => (
              <article key={card.title} className={`${styles.awardCard} dgs-v1215-award-card`}>
                <div className={styles.awardImage}>
                  <Image src={card.image} alt={card.title} width={454} height={390} className={styles.awardImg} />
                </div>
                <div className={styles.awardBody}>
                  <span>{card.kicker}</span>
                  <h3>{card.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
