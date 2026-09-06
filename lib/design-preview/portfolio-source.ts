import portfolioMirror from "@/data/wordpress/mirrors/pages/portfolio.json";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";

const decodeHtml = (value: string) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

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

  return {
    ...hero,
    galleryId: gallery.galleryId,
    items: gallery.items,
  };
}
