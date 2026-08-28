import type { ContentBlock } from "@/lib/content/types";
import type { RouteRecord } from "@/lib/nextjs/routes";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  serviceSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/schema/builders";
import { ORGANIZATION_ID, WEBSITE_ID, verifiedOrganization } from "@/lib/schema/entity";
import type { BreadcrumbItem } from "@/lib/schema/builders";

export function buildGlobalEntitySchemas(): Record<string, unknown>[] {
  return [
    organizationSchema({
      id: ORGANIZATION_ID,
      name: verifiedOrganization.name,
      url: verifiedOrganization.url,
      logoUrl: verifiedOrganization.logoUrl,
      email: verifiedOrganization.email,
      telephone: [...verifiedOrganization.telephone],
      address: verifiedOrganization.address,
      sameAs: [...verifiedOrganization.sameAs],
    }),
    websiteSchema({
      id: WEBSITE_ID,
      url: verifiedOrganization.url,
      name: verifiedOrganization.name,
      publisherId: ORGANIZATION_ID,
    }),
  ];
}

export function buildRouteSchemas(input: {
  route: RouteRecord;
  path: string;
  blocks: ContentBlock[];
  breadcrumbs: BreadcrumbItem[];
}): Record<string, unknown>[] {
  const { route, path, blocks, breadcrumbs } = input;
  const schemas = [...buildGlobalEntitySchemas()];

  schemas.push(
    webPageSchema({
      name: route.title || route.h1 || "Page",
      description: route.description || "",
      path,
      organizationId: ORGANIZATION_ID,
      websiteId: WEBSITE_ID,
    }),
  );

  if (route.wordpressType === "service") {
    schemas.push(
      serviceSchema({
        name: route.title || "",
        description: route.description || "",
        path,
        providerId: ORGANIZATION_ID,
      }),
    );
  }

  if (breadcrumbs.length > 0) {
    schemas.push(breadcrumbSchema(breadcrumbs));
  }

  const pageFaqs = extractFaqsFromBlocks(blocks);
  if (pageFaqs.length > 0) {
    schemas.push(faqSchema(pageFaqs));
  }

  if (route.wordpressType === "post" && route.date) {
    schemas.push(
      articleSchema({
        headline: route.title || "",
        description: route.description || "",
        path,
        datePublished: route.date,
        dateModified: route.modified,
        publisherId: ORGANIZATION_ID,
      }),
    );
  }

  return schemas;
}

function extractFaqsFromBlocks(blocks: ContentBlock[]) {
  return blocks
    .filter((b): b is Extract<ContentBlock, { type: "faq" }> => b.type === "faq")
    .flatMap((b) =>
      (b.items || []).map((item) => ({
        question: item.question,
        answer: (item.answer || [{ text: "" }]).map((span) => span.text).join(""),
      })),
    );
}
