"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import { inferMediaSize } from "@/lib/portfolio/infer-media-size";
import { layoutJustified } from "@/lib/portfolio/justified-layout";
import { PortfolioLightbox } from "@/components/portfolio/PortfolioLightbox";
import styles from "./JustifiedPortfolioGallery.module.css";

/** Live WordPress Envira config: justified_row_height 150. Mobile also renders 150, not 80. */
const ROW_HEIGHT = 150;
/** Live justified_margins is 1px on desktop; gutter_mobile is 0. */
const DESKTOP_GUTTER = 1;
const MOBILE_GUTTER = 0;
const MOBILE_MQ = 767;

type SizedItem = HomepageGalleryItem & { layoutWidth: number; layoutHeight: number };

type Props = {
  items: HomepageGalleryItem[];
  containerWidth?: number;
  isMobile?: boolean;
};

export function JustifiedPortfolioGallery({
  items,
  containerWidth: containerWidthProp,
  isMobile: isMobileProp,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeTriggerRef = useRef<HTMLElement | null>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const [measuredMobile, setMeasuredMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const sizedItems = useMemo<SizedItem[]>(
    () =>
      items.map((item) => {
        const inferred = inferMediaSize(item.thumbnail, { width: item.width || 4, height: item.height || 3 });
        return { ...item, layoutWidth: inferred.width, layoutHeight: inferred.height };
      }),
    [items],
  );

  useEffect(() => {
    if (containerWidthProp && containerWidthProp > 0 && typeof isMobileProp === "boolean") return;
    const node = rootRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const update = () => {
      setMeasuredWidth(Math.floor(node.getBoundingClientRect().width));
      setMeasuredMobile(window.matchMedia(`(max-width: ${MOBILE_MQ}px)`).matches);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [containerWidthProp, isMobileProp]);

  const isMobile = typeof isMobileProp === "boolean" ? isMobileProp : measuredMobile;
  const containerWidth = containerWidthProp && containerWidthProp > 0 ? containerWidthProp : measuredWidth || 1280;
  const gutter = isMobile ? MOBILE_GUTTER : DESKTOP_GUTTER;

  const rows = useMemo(() => {
    if (!containerWidth || !sizedItems.length) return [];
    return layoutJustified(
      sizedItems.map((item) => ({
        ...item,
        width: item.layoutWidth,
        height: item.layoutHeight,
      })),
      {
        containerWidth,
        rowHeight: ROW_HEIGHT,
        gutter,
        justifyLastRow: false,
      },
    );
  }, [containerWidth, gutter, sizedItems]);

  return (
    <>
      <div
        ref={rootRef}
        className={styles.gallery}
        role="list"
        aria-label="Portfolio gallery"
        data-dgs-native-justified-gallery="true"
      >
        {rows.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className={styles.row}
            style={{
              height: `${row.height}px`,
              gap: `${gutter}px`,
              marginBottom: `${gutter}px`,
            }}
          >
            {row.items.map((cell) => {
              const index = sizedItems.findIndex((item) => item.id === cell.item.id);
              const item = cell.item;
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    triggerRefs.current[index] = node;
                  }}
                  type="button"
                  className={styles.item}
                  role="listitem"
                  style={{ width: `${cell.width}px`, height: `${cell.height}px` }}
                  onClick={() => {
                    activeTriggerRef.current = triggerRefs.current[index];
                    setActiveIndex(index);
                  }}
                  aria-label={item.title ? `View ${item.title}` : "View portfolio image"}
                >
                  {/* WordPress media URLs; next/image would rewrite the live CDN paths. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail}
                    alt=""
                    width={item.layoutWidth}
                    height={item.layoutHeight}
                    loading={index < 6 ? "eager" : "lazy"}
                    decoding="async"
                    className={styles.image}
                  />
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {activeIndex !== null ? (
        <PortfolioLightbox
          items={sizedItems}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onChange={setActiveIndex}
          triggerRef={activeTriggerRef}
        />
      ) : null}
    </>
  );
}
