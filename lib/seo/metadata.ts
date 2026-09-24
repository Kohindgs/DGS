import type { Metadata } from "next";
import { absoluteUrl } from "./site";
import { isPublicIndexingEnabled } from "./environment";
import { normalizeBrandName, decodeHtmlEntities, DGS_BRAND_NAME } from "@/lib/brand";

export const DEFAULT_SHARE_IMAGE_PATH = "/images/social/dgs-default-share.png";
export const DEFAULT_SHARE_IMAGE_URL = absoluteUrl(DEFAULT_SHARE_IMAGE_PATH);

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
  const rawTitle = input.title?.trim() || "";
  if (!rawTitle) throw new Error(`Metadata title is required for ${input.path}`);
  const title = normalizeBrandName(decodeHtmlEntities(rawTitle));
  const rawDescription = input.description?.trim();
  const description = rawDescription ? normalizeBrandName(decodeHtmlEntities(rawDescription)) : undefined;

  const path = normalizeSitePath(input.path);
  const canonicalPath = normalizeSitePath(input.canonicalPath || path);
  const publicIndexing = isPublicIndexingEnabled();
  const requestedIndexable = input.indexable !== false;
  const indexable = publicIndexing && requestedIndexable;
  const follow = publicIndexing && input.follow !== false;
  const image = absoluteUrl(input.image || DEFAULT_SHARE_IMAGE_PATH);

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
      siteName: DGS_BRAND_NAME,
      locale: "en_IN",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [image],
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
