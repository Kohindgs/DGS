export type RichTextSpan = {
  text: string;
  href?: string;
  strong?: boolean;
  emphasis?: boolean;
};

export type ParagraphBlock = {
  type: "paragraph";
  content: RichTextSpan[];
};

export type HeadingBlock = {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  id?: string;
};

export type ListBlock = {
  type: "list";
  ordered: boolean;
  items: RichTextSpan[][];
};

export type ImageBlock = {
  type: "image";
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  preload?: boolean;
  dimensionSource?: "verified" | "fallback";
};

export type QuoteBlock = {
  type: "quote";
  text: string;
  cite?: string;
};

export type FaqBlock = {
  type: "faq";
  items: Array<{
    question: string;
    answer: RichTextSpan[];
  }>;
};

export type VideoBlock = {
  type: "video";
  src: string;
  poster?: string;
  title: string;
  width?: number;
  height?: number;
};

export type FormBlock = {
  type: "form";
  action: string;
  method: string;
  inputs: Array<{ name?: string; type?: string; required?: boolean }>;
  wordpressForm: boolean;
};

export type TableBlock = {
  type: "table";
  headers: string[];
  rows: string[][];
};

export type EmbedBlock = {
  type: "embed";
  src: string;
  title: string;
  width?: number;
  height?: number;
};

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | ImageBlock
  | QuoteBlock
  | FaqBlock
  | VideoBlock
  | EmbedBlock
  | FormBlock
  | TableBlock;

export type MigratedPageRecord = {
  path: string;
  wordpressId: number;
  wordpressType: "page" | "service" | "post";
  title: string;
  h1: string;
  description: string;
  canonicalPath: string;
  indexable: boolean;
  includeInSitemap: boolean;
  breadcrumbs: Array<{ name: string; path: string }>;
  blocks: ContentBlock[];
  sourceEvidence: {
    modified: string;
    visibleTextSha256: string;
    renderedHtmlSha256?: string;
  };
};
