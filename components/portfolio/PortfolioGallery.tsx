"use client";

import { useRef, useState } from "react";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import { PortfolioLightbox } from "@/components/portfolio/PortfolioLightbox";
import styles from "./PortfolioGallery.module.css";

const INITIAL_VISIBLE = 14;
const LOAD_MORE_STEP = 12;

type PortfolioGalleryProps = {
  items: HomepageGalleryItem[];
  initialVisible?: number;
  showCategoryLabel?: boolean;
};

export function PortfolioGallery({
  items,
  initialVisible = INITIAL_VISIBLE,
  showCategoryLabel = true,
}: PortfolioGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(initialVisible);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeTriggerRef = useRef<HTMLElement | null>(null);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <>
      {showCategoryLabel ? <p className={styles.category}>All Work</p> : null}
      <div className={styles.gallery} role="list" aria-label="Portfolio gallery">
        {visibleItems.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => {
              triggerRefs.current[index] = node;
            }}
            type="button"
            className={styles.item}
            onClick={() => {
              activeTriggerRef.current = triggerRefs.current[index];
              setActiveIndex(index);
            }}
            aria-label={`View ${item.title}`}
          >
            <img
              src={item.thumbnail}
              alt={item.alt}
              width={item.width}
              height={item.height}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, (max-width: 2560px) 25vw, 20vw"
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
            onClick={() => setVisibleCount((count) => Math.min(count + LOAD_MORE_STEP, items.length))}
          >
            Show More
          </button>
        </div>
      ) : null}

      {activeIndex !== null ? (
        <PortfolioLightbox
          items={items}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onChange={setActiveIndex}
          triggerRef={activeTriggerRef}
        />
      ) : null}
    </>
  );
}
