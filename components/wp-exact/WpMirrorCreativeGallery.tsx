import type { HomepageGalleryItem } from "@/lib/portfolio/types";

const PREVIEW_COUNT = 8;

type Props = {
  items: HomepageGalleryItem[];
};

/** Native creative gallery inside WP frame — no Envira runtime. */
export function WpMirrorCreativeGallery({ items }: Props) {
  const preview = items.slice(0, PREVIEW_COUNT);

  return (
    <div className="dgs-native-gallery">
      {preview.map((item) => (
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        <a
          key={item.id}
          href="/portfolio/"
          className="dgs-native-gallery__item"
          aria-label={item.alt || item.title}
        >
          <img
            src={item.thumbnail}
            alt={item.alt || item.title}
            width={item.width}
            height={item.height}
            loading="lazy"
            decoding="async"
            className="dgs-native-gallery__image"
          />
        </a>
      ))}
      <div className="dgs-native-gallery__cta-row">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/portfolio/" className="dgs-v1215-btn dgs-v1215-btn-primary dgs-native-gallery__cta">
          View Portfolio
          <span>→</span>
        </a>
      </div>
    </div>
  );
}
