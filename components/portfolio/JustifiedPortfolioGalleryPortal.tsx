"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import { JustifiedPortfolioGallery } from "@/components/portfolio/JustifiedPortfolioGallery";
import { NATIVE_JUSTIFIED_GALLERY_ROOT_ID } from "@/lib/wordpress/native-inner-fixes";

type Props = {
  items: HomepageGalleryItem[];
};

type MountSnapshot = {
  node: HTMLElement | null;
  width: number;
  isMobile: boolean;
};

const SERVER_SNAPSHOT: MountSnapshot = { node: null, width: 1280, isMobile: false };

let snapshot: MountSnapshot = SERVER_SNAPSHOT;

function measure(): MountSnapshot {
  const node = document.getElementById(NATIVE_JUSTIFIED_GALLERY_ROOT_ID);
  const width = node
    ? Math.floor(node.getBoundingClientRect().width) || Math.floor(window.innerWidth)
    : Math.floor(window.innerWidth) || 1280;
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  return { node, width, isMobile };
}

function subscribe(onChange: () => void) {
  const notify = () => {
    const next = measure();
    if (snapshot.node !== next.node || snapshot.width !== next.width || snapshot.isMobile !== next.isMobile) {
      snapshot = next;
      onChange();
    }
  };
  notify();
  const node = document.getElementById(NATIVE_JUSTIFIED_GALLERY_ROOT_ID);
  const observer = node && typeof ResizeObserver !== "undefined" ? new ResizeObserver(notify) : null;
  if (node && observer) observer.observe(node);
  window.addEventListener("resize", notify);
  return () => {
    observer?.disconnect();
    window.removeEventListener("resize", notify);
  };
}

/**
 * Keeps the native gallery inside the mirrored Elementor shortcode width.
 * Splitting the HTML string at a comment marker dropped the gallery out of
 * that padded column and made it full-bleed.
 */
export function JustifiedPortfolioGalleryPortal({ items }: Props) {
  const mount = useSyncExternalStore(subscribe, () => snapshot, () => SERVER_SNAPSHOT);
  const gallery = (
    <JustifiedPortfolioGallery items={items} containerWidth={mount.width} isMobile={mount.isMobile} />
  );
  if (mount.node) return createPortal(gallery, mount.node);
  return gallery;
}
