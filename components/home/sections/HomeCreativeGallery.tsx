import Image from "next/image";
import Link from "next/link";
import type { ContentBlock } from "@/lib/content/types";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import styles from "./HomeCreativeGallery.module.css";

const PREVIEW_COUNT = 8;

type Props = {
  blocks: ContentBlock[];
  items: HomepageGalleryItem[];
};

export function HomeCreativeGallery({ blocks, items }: Props) {
  const heading = blocks.find((b) => b.type === "heading" && b.level === 2);
  const preview = items.slice(0, PREVIEW_COUNT);

  return (
    <section
      className={`${styles.section} dgs-v1215-portfolio`}
      id="dgs-v1215-work"
      data-reveal
    >
      <div className={styles.inner}>
        <h2>{heading?.type === "heading" ? heading.text : "Creative Work"}</h2>
        <div className={styles.grid}>
          {preview.map((item) => (
            <Link
              key={item.id}
              href="/portfolio/"
              className={styles.item}
              aria-label={item.alt || item.title}
            >
              <Image
                src={item.thumbnail}
                alt={item.alt || item.title}
                width={item.width || 480}
                height={item.height || 360}
                className={styles.image}
              />
            </Link>
          ))}
        </div>
        <div className={styles.ctaRow}>
          <Link href="/portfolio/" className={styles.cta}>
            View Portfolio <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
