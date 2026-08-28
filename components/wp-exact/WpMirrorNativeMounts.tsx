"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import { WpMirrorCreativeGallery } from "./WpMirrorCreativeGallery";
import { WpMirrorHomeForm } from "./WpMirrorHomeForm";

const GALLERY_MOUNT_ID = "dgs-native-creative-gallery-mount";
const FORM_MOUNT_ID = "dgs-native-home-form-mount";

type Props = {
  galleryItems: HomepageGalleryItem[];
};

/** Portals native React swaps into mount points inside the WP HTML mirror. */
export function WpMirrorNativeMounts({ galleryItems }: Props) {
  const [galleryMount, setGalleryMount] = useState<HTMLElement | null>(null);
  const [formMount, setFormMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setGalleryMount(document.getElementById(GALLERY_MOUNT_ID));
    setFormMount(document.getElementById(FORM_MOUNT_ID));
  }, []);

  return (
    <>
      {galleryMount
        ? createPortal(<WpMirrorCreativeGallery items={galleryItems} />, galleryMount)
        : null}
      {formMount ? createPortal(<WpMirrorHomeForm />, formMount) : null}
    </>
  );
}
