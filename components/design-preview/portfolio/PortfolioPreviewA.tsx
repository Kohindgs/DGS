"use client";

import { useEffect, useMemo, useState, type CSSProperties, type PointerEvent } from "react";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import styles from "./PortfolioPreviewA.module.css";

type Props = {
  title: string;
  industries: string[];
  items: HomepageGalleryItem[];
};

const layoutClass = (index: number) => {
  const pattern = [
    styles.workLeftLarge,
    styles.workRightSmall,
    styles.workLeftSmall,
    styles.workRightLarge,
    styles.workFull,
  ];
  return pattern[index % pattern.length];
};

const pad = (value: number) => String(value).padStart(2, "0");

export function PortfolioPreviewA({ title, industries, items }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex === null ? null : items[activeIndex];
  const itemCountLabel = useMemo(() => pad(items.length), [items.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? null : (current - 1 + items.length) % items.length,
        );
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? null : (current + 1) % items.length,
        );
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, items.length]);

  const moveMedia = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    event.currentTarget.style.setProperty("--px", x.toFixed(3));
    event.currentTarget.style.setProperty("--py", y.toFixed(3));
  };

  const resetMedia = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty("--px", "0");
    event.currentTarget.style.setProperty("--py", "0");
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="portfolio-preview-title">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroTopline}>
            <span className={styles.previewBadge}>DGS Design Preview</span>
            <span className={styles.heroCounter} aria-hidden="true">01 / {itemCountLabel}</span>
          </div>

          <h1 id="portfolio-preview-title" className={styles.title}>
            {title}
          </h1>

          <p className={styles.industries}>
            {industries.map((industry, index) => (
              <span key={`${industry}-${index}`} className={styles.industryGroup}>
                <span>{industry}</span>
                {index < industries.length - 1 ? (
                  <span className={styles.separator} aria-hidden="true">•</span>
                ) : null}
              </span>
            ))}
          </p>
        </div>
      </section>

      <section className={styles.workSection} aria-label="Portfolio gallery">
        <div className={styles.workGrid}>
          {items.map((item, index) => {
            const aspect = item.width > 0 && item.height > 0 ? item.width / item.height : 4 / 3;
            const style = {
              "--delay": `${Math.min(index % 6, 5) * 40}ms`,
              "--media-ratio": aspect.toFixed(4),
              "--px": "0",
              "--py": "0",
            } as CSSProperties;

            return (
              <article
                key={item.id}
                className={`${styles.work} ${layoutClass(index)}`}
                style={style}
              >
                <button
                  type="button"
                  className={styles.mediaButton}
                  aria-label={item.title ? `View ${item.title}` : `View portfolio item ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  onPointerMove={moveMedia}
                  onPointerLeave={resetMedia}
                >
                  <span className={styles.mediaFrame}>
                    {/* Exact WordPress-derived gallery media; visual treatment only. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail}
                      alt={item.alt || ""}
                      width={item.width || 640}
                      height={item.height || 480}
                      loading={index < 4 ? "eager" : "lazy"}
                      decoding="async"
                      className={styles.image}
                    />
                    <span className={styles.mediaShade} aria-hidden="true" />
                    <span className={styles.openGlyph} aria-hidden="true">↗</span>
                  </span>
                  <span className={styles.workMeta} aria-hidden="true">
                    <span>{pad(index + 1)}</span>
                    <span className={styles.workMetaLine} />
                    <span>{itemCountLabel}</span>
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {activeItem && activeIndex !== null ? (
        <div
          className={styles.viewer}
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title || "Portfolio image viewer"}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveIndex(null);
          }}
        >
          <div className={styles.viewerChrome}>
            <span className={styles.viewerCount}>{pad(activeIndex + 1)} / {itemCountLabel}</span>
            <button
              type="button"
              className={styles.viewerClose}
              onClick={() => setActiveIndex(null)}
              aria-label="Close portfolio viewer"
            >
              ×
            </button>
          </div>

          <div className={styles.viewerStage}>
            <button
              type="button"
              className={`${styles.viewerNav} ${styles.viewerPrev}`}
              onClick={() => setActiveIndex((activeIndex - 1 + items.length) % items.length)}
              aria-label="Previous portfolio image"
            >
              ←
            </button>

            <figure className={styles.viewerFigure}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeItem.media}
                alt={activeItem.alt || ""}
                className={styles.viewerImage}
              />
              {activeItem.title ? (
                <figcaption className={styles.viewerTitle}>{activeItem.title}</figcaption>
              ) : null}
            </figure>

            <button
              type="button"
              className={`${styles.viewerNav} ${styles.viewerNext}`}
              onClick={() => setActiveIndex((activeIndex + 1) % items.length)}
              aria-label="Next portfolio image"
            >
              →
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
