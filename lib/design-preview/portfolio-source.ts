import portfolioMirror from "@/data/wordpress/mirrors/pages/portfolio.json";
import portfolioVideosRaw from "@/data/design-preview/portfolio-videos.json";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";

const decodeHtml = (value: string) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

type PortfolioVideoManifestItem = {
  id: number;
  title: string;
  alt?: string;
  videoSrc: string;
  poster: string;
  width: number;
  height: number;
};

const portfolioVideos = portfolioVideosRaw as { items: PortfolioVideoManifestItem[] };

function readPortfolioHero() {
  const body = portfolioMirror.body;
  const titleMatch = body.match(/<span class="title-line">([^<]+)<\/span>/i);
  const industriesBlock = body.match(/<p class="hero-industries">([\s\S]*?)<\/p>/i)?.[1] ?? "";
  const industries = Array.from(
    industriesBlock.matchAll(/<span class="industry-highlight">([\s\S]*?)<\/span>/gi),
    (match) => decodeHtml(match[1].replace(/<[^>]*>/g, "").trim()),
  );

  if (!titleMatch || industries.length === 0) {
    throw new Error("Portfolio design preview could not derive hero content from the WordPress mirror.");
  }

  return {
    title: decodeHtml(titleMatch[1].trim()),
    industries,
  };
}

export function loadPortfolioDesignPreviewSource() {
  const hero = readPortfolioHero();
  const gallery = loadHomepageGallery();

  if (!gallery.items.length) {
    throw new Error("Portfolio design preview requires the existing WordPress gallery items.");
  }

  const imageItems = gallery.items.map((item) => ({
    ...item,
    mediaType: "image" as const,
  }));

  const videoItems = portfolioVideos.items.map((item) => ({
    id: item.id,
    title: item.title,
    alt: item.alt || "",
    thumbnail: item.poster,
    media: item.videoSrc,
    width: item.width,
    height: item.height,
    mediaType: "video" as const,
    videoSrc: item.videoSrc,
    poster: item.poster,
  }));

  return {
    ...hero,
    galleryId: gallery.galleryId,
    items: [...imageItems, ...videoItems],
  };
}
