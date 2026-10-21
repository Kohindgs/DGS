export type WpRouteType = "page" | "service" | "post" | "blog-index";

export type WpSeoMeta = {
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  ogImage?: string | null;
  ogType?: string;
};

export type WpRouteManifestEntry = {
  path: string;
  type: WpRouteType;
  slug: string;
  wordpressId: number;
  link: string;
  modified: string;
  seo: WpSeoMeta;
  bodyClass: string;
  schemas: string[];
  noindex: boolean;
  contentKey: string;
};

export type WpManifest = {
  generatedAt: string;
  siteUrl: string;
  routes: WpRouteManifestEntry[];
};
