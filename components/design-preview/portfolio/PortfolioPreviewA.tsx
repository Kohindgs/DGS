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


const FILTER_TABS = [
  { key: "all", label: "ALL PORTFOLIO" },
  { key: "automobile", label: "AUTOMOBILE AI" },
  { key: "edtech", label: "EDTECH AI" },
  { key: "fmcg", label: "FMCG AI" },
  { key: "commercial-film", label: "COMMERCIAL AI FILM" },
  { key: "campaign", label: "CAMPAIGN AI" },
  { key: "mythological", label: "MYTHOLOGICAL AI" },
  { key: "festival", label: "FESTIVAL VIDEOS" },
  { key: "product", label: "PRODUCT AI" },
  { key: "jewellery", label: "JEWELLERY AI" },
  { key: "concept", label: "CONCEPT AI" },
  { key: "tvc", label: "TVC AI" },
] as const;

function matchesCategory(item: PortfolioItem, filterKey: string): boolean {
  if (filterKey === "all") return true;
  const id = item.id.toLowerCase();
  const title = (item.title || "").toLowerCase();
  const alt = (item.alt || "").toLowerCase();

  switch (filterKey) {
    case "automobile":
      return id.includes("hyundai") || title.includes("hyundai") || alt.includes("automobile");
    case "edtech":
      return id.includes("sundaram") || title.includes("sundaram") || alt.includes("edtech");
    case "fmcg":
      return id.includes("clarion") || title.includes("clarion") || alt.includes("fmcg");
    case "commercial-film":
      return (
        id.includes("hyundai") ||
        title.includes("hyundai") ||
        id.includes("home-credit") ||
        title.includes("home credit") ||
        id.startsWith("media")
      );
    case "campaign":
      return (
        (id.includes("better-ceasons") || title.includes("better ceasons") || alt.includes("campaign")) &&
        !id.includes("home-credit") &&
        !title.includes("home credit")
      );
    case "mythological":
      return (
        id.startsWith("shirdi-sai") ||
        title.includes("sai") ||
        title.includes("vachaan") ||
        alt.includes("mythological")
      );
    case "festival":
      return (
        title.includes("festival") ||
        title.includes("holi") ||
        title.includes("diwali") ||
        title.includes("baisakhi") ||
        title.includes("easter") ||
        title.includes("sankranti") ||
        title.includes("navratri") ||
        title.includes("lohri") ||
        title.includes("jayanti") ||
        alt.includes("festival")
      );
    case "product":
      return (
        title.includes("mango") ||
        title.includes("lava") ||
        title.includes("ice cream") ||
        title.includes("soya") ||
        title.includes("chilli") ||
        alt.includes("product")
      );
    case "jewellery":
      return (
        title.includes("jewel") ||
        title.includes("gold") ||
        title.includes("baanganga") ||
        alt.includes("jewel")
      );
    case "concept":
      return (
        id.includes("sundaram") ||
        title.includes("horse") ||
        title.includes("magic") ||
        alt.includes("concept")
      );
    case "tvc":
      return (
        id.includes("home-credit") ||
        title.includes("home credit") ||
        id.includes("clarion") ||
        id.includes("better-ceasons")
      );
    default:
      return true;
  }
}

export function PortfolioPreviewA({ title, industries, items, previewMode = true }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const getBatchSize = () => {
    if (typeof window === "undefined") return 12;
    const w = window.innerWidth;
    if (w < 641) return 6;
    if (w < 1025) return 8;
    return 12;
  };

  const [visibleCount, setVisibleCount] = useState<number>(12);

  useEffect(() => {
    setVisibleCount(getBatchSize());
  }, []);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((item) => matchesCategory(item, activeFilter));
  }, [items, activeFilter]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const remainingCount = Math.max(0, filteredItems.length - visibleCount);

  const activeItem = activeIndex === null ? null : filteredItems[activeIndex];
  const itemCountLabel = useMemo(() => pad(filteredItems.length), [filteredItems.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? null : (current - 1 + filteredItems.length) % filteredItems.length,
        );
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? null : (current + 1) % filteredItems.length,
        );
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, filteredItems.length]);

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

      <nav className={styles.filterBar} role="navigation" aria-label="Portfolio category filters">
        <div className={styles.filterScroll}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.filterPill} ${activeFilter === tab.key ? styles.filterPillActive : ""}`}
              onClick={() => {
                setActiveFilter(tab.key);
                setActiveIndex(null);
                setVisibleCount(getBatchSize());
              }}
              aria-pressed={activeFilter === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <section className={styles.workSection} aria-label="Portfolio gallery">
        <div className={styles.workContainer}>
          {visibleItems.map((item, itemIndex) => {
            const isVideo = item.type === "video";
            const aspect = item.ratio;
            const isLand = aspect >= 1.2;
            const delay = `${Math.min(itemIndex % 6, 5) * 40}ms`;

            const style = {
              "--item-ratio": aspect.toFixed(4),
              "--delay": delay,
            } as CSSProperties;

            const isAboveFold = itemIndex < 4;
            const isLcpCandidate = itemIndex === 0;

            return (
              <article
                key={item.id}
                className={`${styles.work} ${isLand ? styles.workLandscape : styles.workPortrait}`}
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
                          alt={
                            item.alt?.trim() ||
                            (hasHumanReadableTitle(item.title)
                              ? `${item.title} - D'Genius Solutions Creative Project`
                              : `D'Genius Solutions Creative Portfolio Project ${pad(itemIndex + 1)}`)
                          }
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
                {hasHumanReadableTitle(item.title) ? (
                  <div className={styles.workCaption}>
                    <h3 className={styles.workTitle}>{item.title}</h3>
                    {isVideo && item.alt ? (
                      <span className={styles.workCategory}>{item.alt}</span>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
        {remainingCount > 0 ? (
          <div style={{ display: "flex", justifyContent: "center", margin: "48px 0 24px" }}>
            <button
              type="button"
              id="load-more-btn"
              className="dgs-load-more-btn"
              onClick={() => setVisibleCount((prev) => prev + getBatchSize())}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "48px",
                padding: "0 32px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all 0.25s ease"
              }}
            >
              LOAD MORE WORK ({remainingCount} REMAINING)
            </button>
          </div>
        ) : null}
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
              onClick={() => setActiveIndex((activeIndex - 1 + filteredItems.length) % filteredItems.length)}
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
              onClick={() => setActiveIndex((activeIndex + 1) % filteredItems.length)}
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
