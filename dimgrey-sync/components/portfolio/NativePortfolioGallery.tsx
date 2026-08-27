"use client";

import { useCallback, useEffect, useState } from "react";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import styles from "./NativePortfolioGallery.module.css";

const INITIAL_VISIBLE = 12;
const LOAD_MORE_STEP = 12;

type Props = {
  items: HomepageGalleryItem[];
};

export function NativePortfolioGallery({ items }: Props) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [activeItem, setActiveItem] = useState<HomepageGalleryItem | null>(null);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const closeLightbox = useCallback(() => setActiveItem(null), []);

  useEffect(() => {
    if (!activeItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeItem, closeLightbox]);

  return (
    <>
      <div
        className={styles.gallery}
        role="list"
        aria-label="Brand identity and creative portfolio gallery"
      >
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={styles.item}
            onClick={() => setActiveItem(item)}
            aria-label={`View ${item.title}`}
          >
            <img
              src={item.thumbnail}
              alt={item.alt}
              width={item.width}
              height={item.height}
              loading="lazy"
              decoding="async"
              className={styles.image}
            />
          </button>
        ))}
      </div>

      {hasMore ? (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.moreBtn}
            onClick={() => setVisibleCount((n) => Math.min(n + LOAD_MORE_STEP, items.length))}
          >
            Show more work
          </button>
        </div>
      ) : null}

      {activeItem ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          onClick={closeLightbox}
        >
          <button type="button" className={styles.closeBtn} onClick={closeLightbox} aria-label="Close">
            ×
          </button>
          <figure className={styles.lightboxFigure} onClick={(e) => e.stopPropagation()}>
            <img
              src={activeItem.media}
              alt={activeItem.alt}
              width={activeItem.width}
              height={activeItem.height}
              className={styles.lightboxImage}
            />
            <figcaption>{activeItem.title}</figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
