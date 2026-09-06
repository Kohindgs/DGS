"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import type { PortfolioItem } from "@/lib/design-preview/portfolio-source";
import styles from "./PortfolioPreviewA.module.css";

type Props = {
  title: string;
  industries: string[];
  items: PortfolioItem[];
  previewMode?: boolean;
};

const pad = (value: number) => String(value).padStart(2, "0");

const hasHumanReadableTitle = (title: string) => {
  const value = title.trim();
  if (!value) return false;
  if (/^ss[_\s-]*\d+/i.test(value)) return false;
  if (/^img[_\s-]*\d+/i.test(value)) return false;
  if (/^dsc[_\s-]*\d+/i.test(value)) return false;
  if (/^picture\s*\d+/i.test(value)) return false;
  if (/^media\s*\d+/i.test(value)) return false;
  if (/\.(jpe?g|png|webp|gif|mp4|mov|m4v)$/i.test(value)) return false;
  return true;
};

// ZERO-CROP JUSTIFIED EDITORIAL ROW GROUPING ALGORITHM
// Groups items so that when each item's width is proportional to its REAL aspect ratio,
// all items in that row share the exact same natural visual row height without 1px of crop.
function buildEditorialRows(items: PortfolioItem[]): PortfolioItem[][] {
  const rows: PortfolioItem[][] = [];
  let currentRow: PortfolioItem[] = [];
  let currentRatioSum = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const r = item.ratio;

    // Standalone ultra-wides (panoramic >= 2.4)
    if (r >= 2.4) {
      if (currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [];
        currentRatioSum = 0;
      }
      rows.push([item]);
      continue;
    }

    const nextSum = currentRatioSum + r;
    const nextCount = currentRow.length + 1;

    // Flush row when comfortable combined ratio reached (2.4 - 3.7) or max 4 items
    const shouldFlush =
      currentRow.length >= 2 &&
      (nextCount > 4 || nextSum > 3.7 || (currentRatioSum >= 3.0 && nextCount >= 3));

    if (shouldFlush) {
      rows.push(currentRow);
      currentRow = [item];
      currentRatioSum = r;
    } else {
      currentRow.push(item);
      currentRatioSum = nextSum;
    }
  }

  // Balance trailing item
  if (currentRow.length > 0) {
    if (currentRow.length === 1 && rows.length > 0) {
      const prev = rows[rows.length - 1];
      if (prev.length < 4 && prev[0].ratio < 2.4) {
        prev.push(currentRow[0]);
        currentRow = [];
      }
    }
    if (currentRow.length > 0) rows.push(currentRow);
  }

  return rows;
}

export function PortfolioPreviewA({ title, industries, items, previewMode = true }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex === null ? null : items[activeIndex];
  const itemCountLabel = useMemo(() => pad(items.length), [items.length]);

  const rows = useMemo(() => buildEditorialRows(items), [items]);

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

  let globalIndex = 0;

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="portfolio-preview-title">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroTopline}>
            {previewMode ? <span className={styles.previewBadge}>DGS Design Preview</span> : <span aria-hidden="true" />}
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
        <div className={styles.workContainer}>
          {rows.map((row, rowIdx) => (
            <div key={`row-${rowIdx}`} className={styles.editorialRow}>
              {row.map((item) => {
                const itemIndex = globalIndex++;
                const isVideo = item.type === "video";
                const aspect = item.ratio;
                const delay = `${Math.min(itemIndex % 6, 5) * 40}ms`;

                // Resolution-aware feature sizing: ensure CSS max width respects natural width
                const maxIntrinsicWidth = `${item.sourceWidth}px`;

                const style = {
                  "--item-ratio": aspect.toFixed(4),
                  "--delay": delay,
                  "--max-intrinsic-w": maxIntrinsicWidth,
                } as CSSProperties;

                const isAboveFold = itemIndex < 4;
                const isLcpCandidate = itemIndex === 0;

                return (
                  <article
                    key={item.id}
                    className={styles.work}
                    style={style}
                    data-media-kind={isVideo ? "video" : "image"}
                  >
                    <button
                      type="button"
                      className={styles.mediaButton}
                      aria-label={item.title ? `View ${item.title}` : `View portfolio item ${itemIndex + 1}`}
                      onClick={() => setActiveIndex(itemIndex)}
                      onPointerMove={moveMedia}
                      onPointerLeave={resetMedia}
                    >
                      <span className={styles.mediaFrame}>
                        {isVideo ? (
                          <>
                            <picture className={styles.picture}>
                              <source
                                srcSet={item.poster.avif}
                                type="image/avif"
                              />
                              <source
                                srcSet={item.poster.webp}
                                type="image/webp"
                              />
                              <img
                                src={item.poster.fallback}
                                alt={item.alt || "Portfolio video poster"}
                                width={item.poster.width}
                                height={item.poster.height}
                                loading={isAboveFold ? "eager" : "lazy"}
                                decoding="async"
                                className={styles.image}
                              />
                            </picture>
                            <span className={styles.videoBadge} aria-hidden="true">
                              <span>Film</span>
                            </span>
                          </>
                        ) : (
                          <picture className={styles.picture}>
                            <source
                              srcSet={item.variants.avif
                                .map((v) => `${v.url} ${v.width}w`)
                                .join(", ")}
                              type="image/avif"
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            />
                            <source
                              srcSet={item.variants.webp
                                .map((v) => `${v.url} ${v.width}w`)
                                .join(", ")}
                              type="image/webp"
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            />
                            <img
                              src={item.variants.fallback}
                              alt={item.alt || ""}
                              width={item.sourceWidth}
                              height={item.sourceHeight}
                              loading={isAboveFold ? "eager" : "lazy"}
                              decoding="async"
                              fetchPriority={isLcpCandidate ? "high" : "auto"}
                              className={styles.image}
                            />
                          </picture>
                        )}
                        <span className={styles.mediaShade} aria-hidden="true" />
                        <span className={styles.openGlyph} aria-hidden="true">{isVideo ? "▶" : "↗"}</span>
                      </span>
                      <span className={styles.workMeta} aria-hidden="true">
                        <span>{pad(itemIndex + 1)}</span>
                        <span className={styles.workMetaLine} />
                        <span>{itemCountLabel}</span>
                      </span>
                    </button>
                  </article>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {activeItem && activeIndex !== null ? (
        <div
          className={styles.viewer}
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title || "Portfolio media viewer"}
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
              aria-label="Previous portfolio media"
            >
              ←
            </button>

            <figure className={styles.viewerFigure}>
              {activeItem.type === "video" ? (
                <video
                  poster={activeItem.poster.fallback}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className={styles.viewerImage}
                >
                  <source src={activeItem.sources.webm} type="video/webm" />
                  <source src={activeItem.sources.mp4} type="video/mp4" />
                </video>
              ) : (
                <picture>
                  <source
                    srcSet={activeItem.variants.avif
                      .map((v) => `${v.url} ${v.width}w`)
                      .join(", ")}
                    type="image/avif"
                  />
                  <source
                    srcSet={activeItem.variants.webp
                      .map((v) => `${v.url} ${v.width}w`)
                      .join(", ")}
                    type="image/webp"
                  />
                  <img
                    src={activeItem.variants.fallback}
                    alt={activeItem.alt || ""}
                    className={styles.viewerImage}
                  />
                </picture>
              )}
              {hasHumanReadableTitle(activeItem.title) ? (
                <figcaption className={styles.viewerTitle}>{activeItem.title}</figcaption>
              ) : null}
            </figure>

            <button
              type="button"
              className={`${styles.viewerNav} ${styles.viewerNext}`}
              onClick={() => setActiveIndex((activeIndex + 1) % items.length)}
              aria-label="Next portfolio media"
            >
              →
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
