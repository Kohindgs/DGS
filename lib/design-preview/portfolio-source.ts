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

const SAI_VIDEO_IDS = [
  "shirdi-sai-vachaan-5",
  "shirdi-sai-vaani-derr",
  "shirdi-sai-vaani-choothne-ka-darr",
  "shirdi-sai-vishwas",
  "shirdi-sai-prarthana",
  "shirdi-sai-suno-sai-ko",
  "shirdi-sai-dham-intro"
];

const NEW_AI_VIDEO_IDS = [
  // 1. Hyundai (3)
  "hyundai-creta-1",
  "hyundai-creta-2",
  "hyundai-creta-3",
  // 2. Sundaram E-Learning (8)
  "sundaram-elearning-bal-3-1",
  "sundaram-elearning-evs1-ch7",
  "sundaram-elearning-evs2-ch7",
  "sundaram-elearning-marathi-13",
  "sundaram-elearning-maths-ch9",
  "sundaram-elearning-marathi-eng-3-8",
  "sundaram-elearning-marathi-eng-3-5",
  "sundaram-elearning-marathi-bhaag-3",
  // 3. Clarion Agro (2)
  "clarion-jasmine-atta-hindi",
  "clarion-jasmine-atta-telugu",
  // 4. Better Ceasons (4)
  "better-ceasons-tenant",
  "better-ceasons-visarjan",
  "better-ceasons-chaturthi",
  "better-ceasons-kachra",
];

function orderPortfolioMedia(items: PortfolioItem[]) {
  const itemMap = new Map(items.map((item) => [item.id, item]));

  // 1-4: New AI Videos in deterministic client order
  const orderedAiVideos: PortfolioItem[] = [];
  for (const id of NEW_AI_VIDEO_IDS) {
    const v = itemMap.get(id);
    if (v) orderedAiVideos.push(v);
  }

  // 2: Shirdi Se Sai mythological AI work (7)
  const orderedSaiVideos: PortfolioItem[] = [];
  for (const id of SAI_VIDEO_IDS) {
    const v = itemMap.get(id);
    if (v) orderedSaiVideos.push(v);
  }

  // 3: Existing video work (media1..media6)
  const existingVideos = items.filter((item) => /^media\d+$/i.test(item.id));

  // 4: Other new visual media (picture\d+)
  const newPictures = items.filter((item) => /^picture\d+$/i.test(item.id));

  // 5: Remaining legacy portfolio items
  const processedIds = new Set([
    ...NEW_AI_VIDEO_IDS,
    ...SAI_VIDEO_IDS,
    ...existingVideos.map((i) => i.id),
    ...newPictures.map((i) => i.id),
  ]);
  const remaining = items.filter((item) => !processedIds.has(item.id));

  return [...orderedAiVideos, ...orderedSaiVideos, ...existingVideos, ...newPictures, ...remaining];
}

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

export function loadPortfolioDesignPreviewSourceStatic() {
  const hero = readPortfolioHero();
  return {
    ...hero,
    items: orderPortfolioMedia(portfolioMedia.items),
  };
}

export async function loadPortfolioDesignPreviewSource() {
  const source = loadPortfolioDesignPreviewSourceStatic();
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
}
