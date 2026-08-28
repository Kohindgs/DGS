import Image from "next/image";
import type { ContentBlock } from "@/lib/content/types";
import styles from "./HomeCreativeGallery.module.css";

type Props = { blocks: ContentBlock[] };

export function HomeCreativeGallery({ blocks }: Props) {
  const heading = blocks.find((b) => b.type === "heading" && b.level === 2);
  const images = blocks.filter((b) => b.type === "image").slice(0, 8);

  return (
    <section className={`${styles.section} dgs-v1215-portfolio`} id="dgs-v1215-work">
      <div className={styles.inner}>
        <h2>{heading?.type === "heading" ? heading.text : ""}</h2>
        <div className={styles.grid}>
          {images.map((image, index) =>
            image.type === "image" ? (
              <div key={`${image.src}-${index}`} className={styles.item}>
                <Image
                  src={image.src}
                  alt={image.alt || ""}
                  width={480}
                  height={360}
                  className={styles.image}
                />
              </div>
            ) : null,
          )}
        </div>
      </div>
    </section>
  );
}
