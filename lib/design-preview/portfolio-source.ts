import portfolioMirror from "@/data/wordpress/mirrors/pages/portfolio.json";
import portfolioMediaRaw from "@/data/design-preview/portfolio-media.json";

const decodeHtml = (value: string) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

export type MediaVariant = {
  width: number;
  height: number;
  url: string;
  bytes: number;
};

export type PortfolioImageItem = {
  id: string;
  type: "image";
  title: string;
  alt: string;
  sourceWidth: number;
  sourceHeight: number;
  ratio: number;
  orientation: string;
  hasAlpha: boolean;
  variants: {
    avif: MediaVariant[];
    webp: MediaVariant[];
    fallback: string;
  };
};

export type PortfolioVideoItem = {
  id: string;
  type: "video";
  title: string;
  alt: string;
  sourceWidth: number;
  sourceHeight: number;
  width: number;
  height: number;
  ratio: number;
  orientation: string;
  duration: number;
  poster: {
    width: number;
    height: number;
    avif: string;
    webp: string;
    fallback: string;
  };
  sources: {
    webm: string;
    mp4: string;
  };
};

export type PortfolioItem = PortfolioImageItem | PortfolioVideoItem;

const portfolioMedia = portfolioMediaRaw as { items: PortfolioItem[] };

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

  return {
    ...hero,
    items: portfolioMedia.items,
  };
}
