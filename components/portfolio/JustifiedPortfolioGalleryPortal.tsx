"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import { JustifiedPortfolioGallery } from "@/components/portfolio/JustifiedPortfolioGallery";
import { NATIVE_JUSTIFIED_GALLERY_ROOT_ID } from "@/lib/wordpress/native-inner-fixes";

type Props = {
  items: HomepageGalleryItem[];
};

/**
 * Keeps the native gallery inside the mirrored Elementor shortcode width.
 * Splitting the HTML string at a comment marker dropped the gallery out of
 * that padded column and made it full-bleed.
 */
export function JustifiedPortfolioGalleryPortal({ items }: Props) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(1280);
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const node = document.getElementById(NATIVE_JUSTIFIED_GALLERY_ROOT_ID);
    setTarget(node);
    const update = () => {
      const width = node ? Math.floor(node.getBoundingClientRect().width) : 0;
      setContainerWidth(width || Math.floor(window.innerWidth));
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    };
    update();
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const gallery = (
    <JustifiedPortfolioGallery items={items} containerWidth={containerWidth} isMobile={isMobile} />
  );

  if (target) return createPortal(gallery, target);
  return gallery;
}
