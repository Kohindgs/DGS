import portfolioMirror from "@/data/wordpress/mirrors/pages/portfolio.json";
import masterPortfolioJson from "@/data/portfolio/master-portfolio.json";

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
  bytes?: number;
};

export type PortfolioImageItem = {
  id: string;
  type: "image";
  mediaType: "image";
  title: string;
  alt: string;
  client?: string;
  workType?: string;
  sourceWidth?: number;
  sourceHeight?: number;
  width?: number;
  height?: number;
  ratio: number;
  orientation: string;
  hasAlpha?: boolean;
  primaryCategory: string;
  categories: string[];
  industryTags?: string[];
  priority?: number;
  isLatest?: boolean;
  homepageFeatured?: boolean;
  aiVideo?: boolean;
  hidden?: boolean;
  variants: {
    avif: MediaVariant[];
    webp: MediaVariant[];
    fallback: string;
  };
  poster?: {
    width?: number;
    height?: number;
    avif?: string;
    webp: string;
    fallback: string;
  };
};

export type PortfolioVideoItem = {
  id: string;
  type: "video";
  mediaType: "video";
  title: string;
  alt: string;
  client?: string;
  workType?: string;
  sourceWidth?: number;
  sourceHeight?: number;
  width: number;
  height: number;
  ratio: number;
  orientation: string;
  duration?: number;
  primaryCategory: string;
  categories: string[];
  industryTags?: string[];
  priority?: number;
  isLatest?: boolean;
  homepageFeatured?: boolean;
  aiVideo?: boolean;
  hidden?: boolean;
  poster: {
    width?: number;
    height?: number;
    avif?: string;
    webp: string;
    fallback: string;
  };
  sources: {
    webm: string;
    mp4: string;
  };
};

export type PortfolioItem = PortfolioImageItem | PortfolioVideoItem;

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

export function getCanonicalMasterPortfolio(): PortfolioItem[] {
  return (masterPortfolioJson as unknown as PortfolioItem[]).filter(item => !item.hidden);
}

export function getCanonicalAiVideos(): PortfolioVideoItem[] {
  return getCanonicalMasterPortfolio().filter(
    (item): item is PortfolioVideoItem => item.workType === "ai-video" && item.type === "video"
  );
}

export function loadPortfolioDesignPreviewSourceStatic() {
  const hero = readPortfolioHero();
  return {
    ...hero,
    items: getCanonicalMasterPortfolio(),
  };
}

export async function loadPortfolioDesignPreviewSource() {
  const source = loadPortfolioDesignPreviewSourceStatic();
  try {
    const { listPortfolioOverrides } = await import("@/lib/cms/portfolio");
    const overrides = await listPortfolioOverrides();
    if (!overrides.length) return source;

    const byId = new Map(overrides.map((row) => [row.source_item_id, row]));
    const items = source.items
      .map((item, index) => {
        const override = byId.get(item.id);
        return {
          item: override ? {
            ...item,
            title: override.title || item.title,
            alt: override.alt_text || item.alt,
          } : item,
          active: override ? Boolean(override.active) : true,
          order: override ? Number(override.sort_order) : index,
        };
      })
      .filter((entry) => entry.active)
      .sort((a,b) => a.order - b.order)
      .map((entry) => entry.item);

    return { ...source, items };
  } catch(e) {
    return source;
  }
}
