export type WordPressRendered = {
  rendered: string;
};

export type WordPressMediaSize = {
  file?: string;
  width?: number;
  height?: number;
  mime_type?: string;
  source_url?: string;
};

export type WordPressMediaDetails = {
  width?: number;
  height?: number;
  file?: string;
  sizes?: Record<string, WordPressMediaSize>;
  image_meta?: Record<string, unknown>;
};

export type WordPressMedia = {
  id: number;
  slug?: string;
  link?: string;
  date?: string;
  modified?: string;
  source_url: string;
  alt_text?: string;
  title?: WordPressRendered;
  caption?: WordPressRendered;
  description?: WordPressRendered;
  media_type?: string;
  mime_type?: string;
  media_details?: WordPressMediaDetails;
};

export type WordPressContentRecord = {
  id: number;
  slug: string;
  link: string;
  status: string;
  date: string;
  modified: string;
  parent?: number;
  title: WordPressRendered;
  content: WordPressRendered;
  excerpt?: WordPressRendered;
  featured_media?: number;
  type?: string;
  meta?: Record<string, unknown>;
};
