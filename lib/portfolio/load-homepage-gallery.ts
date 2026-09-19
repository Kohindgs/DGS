import type { HomepageGalleryData } from "@/lib/portfolio/types";
import galleryData from "@/data/portfolio/homepage-gallery.json";
import { rewriteWpUrls } from "@/lib/wp-exact/rewrite-wp-urls";

export function loadHomepageGallery(): HomepageGalleryData {
  const source = galleryData as HomepageGalleryData;
  return {
    ...source,
    items: source.items.map((item) => ({
      ...item,
      thumbnail: rewriteWpUrls(item.thumbnail),
      media: rewriteWpUrls(item.media),
    })),
  };
}
