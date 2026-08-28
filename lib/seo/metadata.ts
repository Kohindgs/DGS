import type { Metadata } from "next";
import { absoluteUrl } from "./site";
import { isPublicIndexingEnabled } from "./environment";

export type PageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  canonicalPath?: string;
  indexable?: boolean;
  follow?: boolean;
  image?: string;
  type?: "website" | "article";
  metadataReview?: boolean;
};

export function normalizeSitePath(input: string) {
  const url = new URL(input || "/", "https://www.dgeniussolutions.com");
  let pathname = url.pathname || "/";
  if (pathname !== "/" && !pathname.endsWith("/") && !/\.[a-z0-9]{1,8}$/i.test(pathname)) {
    pathname += "/";
  }
  return pathname;
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const title = input.title.trim();
  const description = input.description?.trim();
  if (!title) throw new Error(`Metadata title is required for ${input.path}`);

  const path = normalizeSitePath(input.path);
  const canonicalPath = normalizeSitePath(input.canonicalPath || path);
  const requestedIndexable = input.indexable !== false;
  const publicIndexing = isPublicIndexingEnabled();
  const indexable = requestedIndexable && publicIndexing;
  const follow = input.follow !== false && publicIndexing;
  const image = input.image ? absoluteUrl(input.image) : undefined;

  const metadata: Metadata = {
    title,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
    },
    robots: {
      index: indexable,
      follow,
      googleBot: {
        index: indexable,
        follow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: input.type || "website",
      title,
      url: absoluteUrl(path),
      siteName: "D'Genius Solutions",
      locale: "en_IN",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      images: image ? [image] : undefined,
    },
  };

  if (description) {
    metadata.description = description;
    (metadata.openGraph!).description = description;
    (metadata.twitter!).description = description;
  }

  if (input.metadataReview) {
    metadata.other = {
      ...(metadata.other || {}),
      "dgs:metadataReview": "true",
    };
  }

  return metadata;
}
