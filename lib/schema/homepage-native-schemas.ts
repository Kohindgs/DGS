import type { ContentBlock } from "@/lib/content/types";
import type { RouteRecord } from "@/lib/nextjs/routes";
import {
  faqSchema,
  organizationSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/schema/builders";
import {
  LOCAL_BUSINESS_ID,
  LOGO_ID,
  ORGANIZATION_ID,
  WEBSITE_ID,
  verifiedOrganization,
} from "@/lib/schema/entity";

function extractHomepageFaqs(blocks: ContentBlock[]) {
  return blocks
    .filter((block): block is Extract<ContentBlock, { type: "faq" }> => block.type === "faq")
    .flatMap((block) =>
      (block.items || []).map((item) => ({
        question: item.question,
        answer: (item.answer || [{ text: "" }]).map((span) => span.text).join(""),
      })),
    );
}

export function buildHomepageNativeSchemas(input: {
  route: RouteRecord;
  blocks: ContentBlock[];
}): Record<string, unknown>[] {
  const { route, blocks } = input;

  const organization = organizationSchema({
    id: ORGANIZATION_ID,
    name: verifiedOrganization.name,
    url: verifiedOrganization.url,
    logoUrl: verifiedOrganization.logoUrl,
    email: verifiedOrganization.email,
    telephone: [...verifiedOrganization.telephone],
    address: verifiedOrganization.address,
    sameAs: [...verifiedOrganization.sameAs],
  });

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": LOCAL_BUSINESS_ID,
    name: verifiedOrganization.name,
    url: verifiedOrganization.url,
    image: verifiedOrganization.logoUrl,
    logo: { "@type": "ImageObject", "@id": LOGO_ID, url: verifiedOrganization.logoUrl },
    email: verifiedOrganization.email,
    telephone: verifiedOrganization.telephone,
    priceRange: "$$",
    hasMap: "https://maps.google.com/?q=D'Genius+Solutions+Khar+West+Mumbai",
    geo: {
      "@type": "GeoCoordinates",
      latitude: 19.066186,
      longitude: 72.834937,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "10:00",
        closes: "15:00",
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: verifiedOrganization.address.streetAddress,
      addressLocality: verifiedOrganization.address.addressLocality,
      addressRegion: verifiedOrganization.address.addressRegion,
      postalCode: verifiedOrganization.address.postalCode,
      addressCountry: verifiedOrganization.address.addressCountry,
    },
    areaServed: [...verifiedOrganization.areaServed],
    knowsAbout: [...verifiedOrganization.knowsAbout],
    sameAs: [...verifiedOrganization.sameAs],
  };

  const website = websiteSchema({
    id: WEBSITE_ID,
    url: verifiedOrganization.url,
    name: verifiedOrganization.name,
    publisherId: ORGANIZATION_ID,
  });

  const webpage = webPageSchema({
    name: route.title || route.h1 || verifiedOrganization.name,
    description: route.description || "",
    path: "/",
    organizationId: ORGANIZATION_ID,
    websiteId: WEBSITE_ID,
  });

  const schemas: Record<string, unknown>[] = [organization, localBusiness, website, webpage];

  const faqs = extractHomepageFaqs(blocks);
  if (faqs.length > 0) {
    schemas.push(faqSchema(faqs));
  }

  return schemas;
}

export function buildHomepageNativeJsonLd(input: {
  route: RouteRecord;
  blocks: ContentBlock[];
}): string[] {
  return buildHomepageNativeSchemas(input).map((schema) => JSON.stringify(schema));
}
