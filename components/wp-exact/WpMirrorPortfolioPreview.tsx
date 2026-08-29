import Link from "next/link";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import styles from "./WpMirrorPortfolioPreview.module.css";

const PREVIEW_COUNT = 8;
const PLAY_ICON = (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 5v14l11-7z" fill="currentColor" />
  </svg>
);

type Props = {
  items: HomepageGalleryItem[];
};

/** Native 8-item portfolio preview inside the WP #portfolio-gallery mount. */
export function WpMirrorPortfolioPreview({ items }: Props) {
  const preview = items.slice(0, PREVIEW_COUNT);

  return (
    <>
      <div id="portfolio-gallery" className={styles.grid}>
        {preview.map((item) => (
          <Link
            key={item.id}
            href="/portfolio/"
            className={`gallery-item ${styles.card}`}
            aria-label={item.title}
          >
            <div className="thumb-fallback" />
            <img
              src={item.thumbnail}
              alt={item.alt || item.title}
              width={item.width}
              height={item.height}
              loading="lazy"
              decoding="async"
              className="thumb-img"
            />
            <div className="play-btn-overlay">
              <div className="play-btn-circle">{PLAY_ICON}</div>
            </div>
            <div className="video-overlay">
              <p>Creative</p>
              <h3>{item.title}</h3>
            </div>
          </Link>
        ))}
      </div>
      <div className="dgs-load-wrap">
        <Link href="/portfolio/" id="load-more-btn" className={styles.moreBtn}>
          View Portfolio
        </Link>
      </div>
    </>
  );
}
