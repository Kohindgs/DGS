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
 *
 * First render keeps the gallery as a sibling (matches SSR). After hydration,
 * a layout effect portals it into the in-tree mount before paint.
 */
export function JustifiedPortfolioGalleryPortal({ items }: Props) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(1280);
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const node = document.getElementById(NATIVE_JUSTIFIED_GALLERY_ROOT_ID);
    const update = () => {
      const width = node
        ? Math.floor(node.getBoundingClientRect().width) || Math.floor(window.innerWidth)
        : Math.floor(window.innerWidth);
      setContainerWidth(width || 1280);
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    };
    // External mount node from mirrored HTML — attach after hydration to avoid #418.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync to a server-rendered mount node
    setTarget(node);
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
