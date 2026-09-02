"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import { inferMediaSize } from "@/lib/portfolio/infer-media-size";
import { layoutJustified } from "@/lib/portfolio/justified-layout";
import { PortfolioLightbox } from "@/components/portfolio/PortfolioLightbox";
import styles from "./JustifiedPortfolioGallery.module.css";

const DESKTOP_ROW_HEIGHT = 190;
const MOBILE_ROW_HEIGHT = 90;
const DESKTOP_GUTTER = 10;
const MOBILE_GUTTER = 0;
const MOBILE_MQ = 767;

type SizedItem = HomepageGalleryItem & { layoutWidth: number; layoutHeight: number };

type Props = {
  items: HomepageGalleryItem[];
};

export function JustifiedPortfolioGallery({ items }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeTriggerRef = useRef<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(1440);
  const [isMobile, setIsMobile] = useState(false);
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
    const node = rootRef.current;
    if (!node || typeof ResizeObserver === "undefined") {
      setContainerWidth(typeof window !== "undefined" ? window.innerWidth : 1440);
      return;
    }
    const update = () => {
      setContainerWidth(Math.floor(node.getBoundingClientRect().width));
      setIsMobile(window.matchMedia(`(max-width: ${MOBILE_MQ}px)`).matches);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const rows = useMemo(() => {
    if (!containerWidth || !sizedItems.length) return [];
    if (isMobile) {
      return sizedItems.map((item) => ({
        height: MOBILE_ROW_HEIGHT,
        items: [{ item, width: containerWidth, height: MOBILE_ROW_HEIGHT }],
      }));
    }
    return layoutJustified(
      sizedItems.map((item) => ({
        ...item,
        width: item.layoutWidth,
        height: item.layoutHeight,
      })),
      {
        containerWidth,
        rowHeight: DESKTOP_ROW_HEIGHT,
        gutter: DESKTOP_GUTTER,
        justifyLastRow: false,
      },
    );
  }, [containerWidth, isMobile, sizedItems]);

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
              gap: `${isMobile ? MOBILE_GUTTER : DESKTOP_GUTTER}px`,
              marginBottom: `${isMobile ? MOBILE_GUTTER : DESKTOP_GUTTER}px`,
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
