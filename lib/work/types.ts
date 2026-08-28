export type WorkSystem = "ai-production" | "brand-creative" | "case-study";

export type WorkMedia = {
  type: "image" | "video";
  src: string;
  thumbnail?: string;
  poster?: string;
  alt: string;
  width?: number;
  height?: number;
};

export type WorkRecord = {
  id: string;
  slug: string;
  system: WorkSystem;
  title: string;
  client?: string;
  category?: string;
  summary?: string;
  media: WorkMedia[];
  source: {
    wordpressId?: number;
    enviraGalleryId?: number;
    enviraMediaId?: number;
    verifiedBy: "authenticated-wordpress" | "explicit-review";
  };
};

export type WorkCollection = {
  id: string;
  system: WorkSystem;
  label: string;
  description?: string;
  itemIds: string[];
};
