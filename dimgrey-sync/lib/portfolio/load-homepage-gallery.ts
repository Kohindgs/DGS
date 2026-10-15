import type { HomepageGalleryData } from "@/lib/portfolio/types";
import galleryData from "@/data/portfolio/homepage-gallery.json";

export function loadHomepageGallery(): HomepageGalleryData {
  return galleryData as HomepageGalleryData;
}
