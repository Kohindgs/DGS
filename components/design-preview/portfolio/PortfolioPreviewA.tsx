"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent,
  type SyntheticEvent,
} from "react";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import styles from "./PortfolioPreviewA.module.css";

export type PortfolioPreviewMediaItem = HomepageGalleryItem & {
  mediaType?: "image" | "video";
  videoSrc?: string;
  poster?: string;
};

type Props = {
  title: string;
  industries: string[];
  items: PortfolioPreviewMediaItem[];
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

const hasHumanReadableTitle = (title: string) => {
  const value = title.trim();
  if (!value) return false;
  if (/^ss[_\s-]*\d+/i.test(value)) return false;
  if (/^img[_\s-]*\d+/i.test(value)) return false;
  if (/^dsc[_\s-]*\d+/i.test(value)) return false;
  if (/\.(jpe?g|png|webp|gif|mp4|mov)$/i.test(value)) return false;
  return true;
};

const guardAgainstUpscaling = (event: SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  const frame = image.parentElement;
  if (!frame) return;

  const renderedWidth = frame.getBoundingClientRect().width;
  if (image.naturalWidth > 0 && image.naturalWidth + 1 < renderedWidth) {
    frame.dataset.lowres = "true";
  } else {
    delete frame.dataset.lowres;
  }
};

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
            const isVideo = item.mediaType === "video" && Boolean(item.videoSrc);
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
                data-media-kind={isVideo ? "video" : "image"}
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
                    {isVideo ? (
                      <video
                        src={item.videoSrc}
                        poster={item.poster || item.thumbnail}
                        muted
                        playsInline
                        preload="metadata"
                        className={styles.image}
                      />
                    ) : (
                      /* Full-resolution WordPress media is used in the editorial grid to avoid upscaling thumbnails. */
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.media || item.thumbnail}
                        alt={item.alt || ""}
                        width={item.width || 640}
                        height={item.height || 480}
                        loading={index < 4 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={index < 2 ? "high" : "auto"}
                        onLoad={guardAgainstUpscaling}
                        className={styles.image}
                      />
                    )}
                    <span className={styles.mediaShade} aria-hidden="true" />
                    <span className={styles.openGlyph} aria-hidden="true">{isVideo ? "▶" : "↗"}</span>
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
              {activeItem.mediaType === "video" && activeItem.videoSrc ? (
                <video
                  src={activeItem.videoSrc}
                  poster={activeItem.poster || activeItem.thumbnail}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className={styles.viewerImage}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={activeItem.media}
                  alt={activeItem.alt || ""}
                  className={styles.viewerImage}
                />
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
