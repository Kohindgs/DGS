export type WpMirrorContent = {
  path: string;
  type: string;
  slug: string;
  wordpressId: number;
  link: string;
  modified: string;
  seo: {
    title: string;
    description: string;
    canonical: string;
    robots?: string;
    ogImage?: string | null;
  };
  bodyClass?: string;
  schemas?: string[];
  noindex?: boolean;
  contentKey?: string;
  body: string;
  styles?: string;
  fontLinks?: string[];
};
