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
  const value = title?.trim() || "";
  if (!value) return false;
  if (/^ss[_\s-]*\d+/i.test(value)) return false;
  if (/^img[_\s-]*\d+/i.test(value)) return false;
  if (/^dsc[_\s-]*\d+/i.test(value)) return false;
  if (/^picture\s*\d+/i.test(value)) return false;
  if (/^media\s*\d+/i.test(value)) return false;
  if (/\.(jpe?g|png|webp|gif|mp4|mov|m4v)$/i.test(value)) return false;
  return true;
};

// PRIMARY WORK DISCIPLINE FILTERS
const PRIMARY_FILTERS = [
  { key: "all", label: "ALL WORK" },
  { key: "ai-video", label: "AI VIDEO" },
  { key: "social-media", label: "SOCIAL MEDIA" },
  { key: "branding", label: "BRANDING" },
  { key: "creative-design", label: "CREATIVE DESIGN" },
  { key: "other-work", label: "OTHER WORK" },
] as const;

// AI VIDEO SUBFILTERS (revealed only when AI VIDEO is active)
const AI_SUBFILTERS = [
  { key: "all-ai", label: "ALL AI VIDEO" },
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

export function PortfolioPreviewA({ title, industries, items, previewMode = true }: Props) {
  const [activePrimaryFilter, setActivePrimaryFilter] = useState<string>("all");
  const [activeAiSubFilter, setActiveAiSubFilter] = useState<string>("all-ai");
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

  // Compute counts for Primary Filters (to auto-hide any empty filters)
  const primaryFilterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: items.length,
      "ai-video": 0,
      "social-media": 0,
      branding: 0,
      "creative-design": 0,
      "other-work": 0,
    };

    items.forEach((item) => {
      const wType = (item as any).workType || (item as any).primaryCategory || (item.type === "video" ? "ai-video" : "creative-design");
      if (counts[wType] !== undefined) {
        counts[wType]++;
      }
    });

    return counts;
  }, [items]);

  // Compute counts for AI Subfilters (to auto-hide any empty AI subfilters)
  const aiItems = useMemo(() => {
    return items.filter((item) => {
      const wType = (item as any).workType || (item as any).primaryCategory;
      return wType === "ai-video" || (item as any).aiVideo === true;
    });
  }, [items]);

  const aiSubfilterCounts = useMemo(() => {
    const counts: Record<string, number> = { "all-ai": aiItems.length };
    AI_SUBFILTERS.forEach((sub) => {
      if (sub.key === "all-ai") return;
      counts[sub.key] = 0;
    });

    aiItems.forEach((item) => {
      const cats = Array.isArray((item as any).categories)
        ? (item as any).categories
        : [((item as any).category || "")];

      AI_SUBFILTERS.forEach((sub) => {
        if (sub.key === "all-ai") return;
        if (cats.includes(sub.key)) {
          counts[sub.key] = (counts[sub.key] || 0) + 1;
        }
      });
    });

    return counts;
  }, [aiItems]);

  // Visible Primary Filter Tabs (auto-hide zero-count filters)
  const visiblePrimaryTabs = useMemo(() => {
    return PRIMARY_FILTERS.filter((tab) => (primaryFilterCounts[tab.key] || 0) > 0);
  }, [primaryFilterCounts]);

  // Visible AI Subfilter Tabs (auto-hide zero-count filters)
  const visibleAiSubTabs = useMemo(() => {
    return AI_SUBFILTERS.filter((sub) => (aiSubfilterCounts[sub.key] || 0) > 0);
  }, [aiSubfilterCounts]);

  // Filtered items based on Two-Level Filtering
  const filteredItems = useMemo(() => {
    if (activePrimaryFilter === "all") {
      return items;
    }

    if (activePrimaryFilter === "ai-video") {
      if (activeAiSubFilter === "all-ai") {
        return aiItems;
      }
      return aiItems.filter((item) => {
        const cats = Array.isArray((item as any).categories)
          ? (item as any).categories
          : [((item as any).category || "")];
        return cats.includes(activeAiSubFilter);
      });
    }

    return items.filter((item) => {
      const wType = (item as any).workType || (item as any).primaryCategory;
      return wType === activePrimaryFilter;
    });
  }, [items, aiItems, activePrimaryFilter, activeAiSubFilter]);

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

      {/* LEVEL 1: PRIMARY WORK DISCIPLINE FILTER BAR */}
      <nav className={styles.filterBar} role="navigation" aria-label="Portfolio discipline filters">
        <div className={styles.filterScroll}>
          {visiblePrimaryTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.filterPill} ${activePrimaryFilter === tab.key ? styles.filterPillActive : ""}`}
              onClick={() => {
                setActivePrimaryFilter(tab.key);
                setActiveAiSubFilter("all-ai");
                setActiveIndex(null);
                setVisibleCount(getBatchSize());
              }}
              aria-pressed={activePrimaryFilter === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* LEVEL 2: AI VIDEO SUBFILTER BAR (Revealed when AI VIDEO is selected) */}
      {activePrimaryFilter === "ai-video" && visibleAiSubTabs.length > 0 ? (
        <nav className={styles.subFilterBar} role="navigation" aria-label="AI Video category subfilters">
          <div className={styles.subFilterScroll}>
            {visibleAiSubTabs.map((sub) => (
              <button
                key={sub.key}
                type="button"
                className={`${styles.subFilterPill} ${activeAiSubFilter === sub.key ? styles.subFilterPillActive : ""}`}
                onClick={() => {
                  setActiveAiSubFilter(sub.key);
                  setActiveIndex(null);
                  setVisibleCount(getBatchSize());
                }}
                aria-pressed={activeAiSubFilter === sub.key}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </nav>
      ) : null}

      <section className={styles.workSection} aria-label="Portfolio gallery">
        <div className={styles.workContainer}>
          {visibleItems.map((item, itemIndex) => {
            const isVideo = item.type === "video";
            const aspect = item.ratio || 1.7778;
            const isLand = aspect >= 1.2;
            const delay = `${Math.min(itemIndex % 6, 5) * 40}ms`;

            const style = {
              "--item-ratio": aspect.toFixed(4),
              "--delay": delay,
            } as CSSProperties;

            const isAboveFold = itemIndex < 4;
            const isLcpCandidate = itemIndex === 0;

            const posterUrl = isVideo
              ? item.poster?.webp || item.poster?.fallback || ""
              : (item as any).poster?.webp || (item as any).variants?.fallback || "";

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
                            srcSet={posterUrl}
                            type="image/webp"
                          />
                          <img
                            src={posterUrl}
                            data-webp-fallback={posterUrl}
                            alt={item.alt || `${item.title} - D'Genius Solutions Portfolio`}
                            width={item.poster?.width || 1920}
                            height={item.poster?.height || 1080}
                            loading={isAboveFold ? "eager" : "lazy"}
                            decoding="async"
                            className={styles.image}
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.dataset.webpFallback && target.src !== target.dataset.webpFallback) {
                                target.src = target.dataset.webpFallback;
                              }
                            }}
                          />
                        </picture>
                        <span className={styles.videoBadge} aria-hidden="true">
                          <span>Film</span>
                        </span>
                      </>
                    ) : (
                      <picture className={styles.picture}>
                        {(item as any).variants?.avif?.length ? (
                          <source
                            srcSet={(item as any).variants.avif
                              .map((v: any) => `${v.url} ${v.width}w`)
                              .join(", ")}
                            type="image/avif"
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          />
                        ) : null}
                        {(item as any).variants?.webp?.length ? (
                          <source
                            srcSet={(item as any).variants.webp
                              .map((v: any) => `${v.url} ${v.width}w`)
                              .join(", ")}
                            type="image/webp"
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          />
                        ) : null}
                        <img
                          src={(item as any).variants?.fallback || posterUrl}
                          alt={
                            item.alt?.trim() ||
                            (hasHumanReadableTitle(item.title)
                              ? `${item.title} - D'Genius Solutions Creative Project`
                              : `D'Genius Solutions Creative Portfolio Project ${pad(itemIndex + 1)}`)
                          }
                          width={item.sourceWidth || 1920}
                          height={item.sourceHeight || 1080}
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
                    {item.client ? (
                      <span className={styles.workCategory}>{item.client}</span>
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

      {/* LIGHTBOX / VIEWER */}
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
                  poster={activeItem.poster?.fallback}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className={styles.viewerImage}
                  style={{ maxHeight: "82vh", maxWidth: "90vw", objectFit: "contain" }}
                >
                  {activeItem.sources?.webm ? <source src={activeItem.sources.webm} type="video/webm" /> : null}
                  {activeItem.sources?.mp4 ? <source src={activeItem.sources.mp4} type="video/mp4" /> : null}
                </video>
              ) : (
                <picture>
                  {(activeItem as any).variants?.avif?.length ? (
                    <source
                      srcSet={(activeItem as any).variants.avif
                        .map((v: any) => `${v.url} ${v.width}w`)
                        .join(", ")}
                      type="image/avif"
                    />
                  ) : null}
                  {(activeItem as any).variants?.webp?.length ? (
                    <source
                      srcSet={(activeItem as any).variants.webp
                        .map((v: any) => `${v.url} ${v.width}w`)
                        .join(", ")}
                      type="image/webp"
                    />
                  ) : null}
                  <img
                    src={(activeItem as any).variants?.fallback || (activeItem as any).url}
                    alt={activeItem.alt || activeItem.title || ""}
                    className={styles.viewerImage}
                    style={{ maxHeight: "84vh", maxWidth: "90vw", objectFit: "contain" }}
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
