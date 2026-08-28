import Link from "next/link";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import styles from "./WpMirrorCreativeGallery.module.css";

const PREVIEW_COUNT = 8;

type Props = {
  items: HomepageGalleryItem[];
};

/** Native creative gallery inside WP frame — no Envira runtime. */
export function WpMirrorCreativeGallery({ items }: Props) {
  const preview = items.slice(0, PREVIEW_COUNT);

  return (
    <div className={`dgs-native-gallery ${styles.gallery}`}>
      {preview.map((item) => (
        <Link
          key={item.id}
          href="/portfolio/"
          className={styles.item}
          aria-label={item.alt || item.title}
        >
          <img
            src={item.thumbnail}
            alt={item.alt || item.title}
            width={item.width}
            height={item.height}
            loading="lazy"
            decoding="async"
            className={styles.image}
          />
        </Link>
      ))}
      <div className={styles.ctaRow}>
        <Link href="/portfolio/" className={`dgs-v1215-btn dgs-v1215-btn-primary ${styles.cta}`}>
          View Portfolio
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
