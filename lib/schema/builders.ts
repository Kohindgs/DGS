import { absoluteUrl } from "@/lib/seo/site";
import { normalizeBrandName, decodeHtmlEntities } from "@/lib/brand";

function cleanSchemaText(text: string | undefined): string {
  if (!text) return "";
  return normalizeBrandName(decodeHtmlEntities(text)).trim();
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export function organizationSchema(input: {
  name: string;
  url: string;
  id?: string;
  logoUrl?: string;
  email?: string;
  telephone?: string[];
  address?: {
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressRegion: string;
    addressCountry: string;
  };
  sameAs?: string[];
}) {
  const id = input.id || `${input.url.replace(/\/$/, "")}/#organization`;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": id,
    name: cleanSchemaText(input.name),
    url: input.url,
    ...(input.logoUrl ? { logo: { "@type": "ImageObject", url: input.logoUrl } } : {}),
    ...(input.email ? { email: input.email } : {}),
    ...(input.telephone?.length ? { telephone: input.telephone } : {}),
    ...(input.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: cleanSchemaText(input.address.streetAddress),
            addressLocality: cleanSchemaText(input.address.addressLocality),
            postalCode: input.address.postalCode,
            addressRegion: cleanSchemaText(input.address.addressRegion),
            addressCountry: input.address.addressCountry,
          },
        }
      : {}),
    ...(input.sameAs?.length ? { sameAs: input.sameAs } : {}),
  };
}

export function websiteSchema(input: {
  id: string;
  url: string;
  name: string;
  publisherId: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": input.id,
    url: input.url,
    name: cleanSchemaText(input.name),
    publisher: { "@id": input.publisherId },
  };
}

export function webPageSchema(input: {
  name: string;
  description: string;
  path: string;
  organizationId: string;
  websiteId?: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
}) {
  const url = absoluteUrl(input.path);
  const websiteId = input.websiteId || `${new URL(url).origin}/#website`;
  return {
    "@context": "https://schema.org",
    "@type": input.type || "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: cleanSchemaText(input.name),
    description: cleanSchemaText(input.description),
    isPartOf: { "@id": websiteId },
    about: { "@id": input.organizationId },
  };
}

export function blogArchiveSchema(input: {
  name: string;
  description: string;
  path: string;
  organizationId: string;
  posts: Array<{ name: string; path: string; position: number }>;
}) {
  const url = absoluteUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: cleanSchemaText(input.name),
    description: cleanSchemaText(input.description),
    about: { "@id": input.organizationId },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.posts.map((p) => ({
        "@type": "ListItem",
        position: p.position,
        name: cleanSchemaText(p.name),
        url: absoluteUrl(p.path),
      })),
    },
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  path: string;
  providerId: string;
  serviceType?: string;
  areaServed?: string | string[];
}) {
  const url = absoluteUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    url,
    name: cleanSchemaText(input.name),
    description: cleanSchemaText(input.description),
    provider: { "@id": input.providerId },
    ...(input.serviceType ? { serviceType: cleanSchemaText(input.serviceType) } : {}),
    ...(input.areaServed
      ? {
          areaServed: Array.isArray(input.areaServed)
            ? input.areaServed.map((a) => cleanSchemaText(a))
            : cleanSchemaText(input.areaServed),
        }
      : {}),
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cleanSchemaText(item.name),
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: cleanSchemaText(item.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: cleanSchemaText(item.answer),
      },
    })),
  };
}

export function articleSchema(input: {
  headline: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
  publisherId: string;
  authorName?: string;
  imageUrl?: string;
}) {
  const url = absoluteUrl(input.path);
  const toIso = (val?: string) => {
    if (!val) return undefined;
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toISOString();
    } catch {}
    return val;
  };
  const published = toIso(input.datePublished);
  const modified = toIso(input.dateModified) || published;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: cleanSchemaText(input.headline),
    description: cleanSchemaText(input.description),
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    publisher: { "@id": input.publisherId },
    author: input.authorName
      ? { "@type": "Person", name: cleanSchemaText(input.authorName) }
      : {
          "@type": "Organization",
          name: "D'Genius Solutions",
          url: "https://www.dgeniussolutions.com",
        },
    ...(input.imageUrl ? { image: absoluteUrl(input.imageUrl) } : {}),
  };
}

export function videoObjectSchema(input: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: cleanSchemaText(input.name),
    description: cleanSchemaText(input.description),
    thumbnailUrl: [absoluteUrl(input.thumbnailUrl)],
    uploadDate: input.uploadDate,
    ...(input.contentUrl ? { contentUrl: absoluteUrl(input.contentUrl) } : {}),
    ...(input.embedUrl ? { embedUrl: input.embedUrl } : {}),
  };
}
