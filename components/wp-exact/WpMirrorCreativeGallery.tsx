import Link from "next/link";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import styles from "./WpMirrorCreativeGallery.module.css";

const PREVIEW_COUNT = 12;

type Props = {
  items: HomepageGalleryItem[];
};

/** Native creative gallery — replaces Envira runtime with WP-framed static markup. */
export function WpMirrorCreativeGallery({ items }: Props) {
  const preview = items.slice(0, PREVIEW_COUNT);

  return (
    <div className={styles.wrap}>
      <div className={styles.gallery}>
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
      </div>
      <div className={styles.ctaRow}>
        <Link href="/portfolio/" className={styles.cta}>
          View Portfolio
        </Link>
      </div>
    </div>
  );
}
