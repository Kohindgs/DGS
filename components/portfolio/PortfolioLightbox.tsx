"use client";

import { useCallback, useEffect, useRef } from "react";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import styles from "./PortfolioLightbox.module.css";

type PortfolioLightboxProps = {
  items: HomepageGalleryItem[];
  activeIndex: number;
  onClose: () => void;
  onChange: (index: number) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
};

export function PortfolioLightbox({
  items,
  activeIndex,
  onClose,
  onChange,
  triggerRef,
}: PortfolioLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const item = items[activeIndex];

  const goPrev = useCallback(() => {
    onChange((activeIndex - 1 + items.length) % items.length);
  }, [activeIndex, items.length, onChange]);

  const goNext = useCallback(() => {
    onChange((activeIndex + 1) % items.length);
  }, [activeIndex, items.length, onChange]);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trigger = triggerRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
      if (event.key !== "Tab" || !dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [goNext, goPrev, onClose, triggerRef]);

  if (!item) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close lightbox">
          ×
        </button>
        <button type="button" className={styles.prevBtn} onClick={goPrev} aria-label="Previous item">
          ‹
        </button>
        <button type="button" className={styles.nextBtn} onClick={goNext} aria-label="Next item">
          ›
        </button>
        <figure className={styles.figure}>
          <img src={item.media} alt={item.alt} width={item.width} height={item.height} className={styles.image} />
          <figcaption>{item.title}</figcaption>
        </figure>
      </div>
    </div>
  );
}
