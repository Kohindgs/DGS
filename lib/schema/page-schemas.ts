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

function blockText(block: ContentBlock): string {
  if (block.type === "heading") return block.text.trim();
  if (block.type === "paragraph") return block.content.map((span) => span.text).join("").trim();
  return "";
}

function cleanFaqQuestion(text: string): string {
  return text.replace(/\s*\+\s*$/, "").trim();
}

function isFaqHeading(text: string): boolean {
  const normalized = text.replace(/\s+/g, " ").trim();
  return /^(?:frequently asked questions|common questions)$/i.test(normalized) || /\bfaqs?$/i.test(normalized);
}

function extractFaqsFromBlocks(blocks: ContentBlock[]) {
  const typed = blocks
    .filter((b): b is Extract<ContentBlock, { type: "faq" }> => b.type === "faq")
    .flatMap((b) => (b.items || []).map((item) => ({
      question: item.question.trim(),
      answer: (item.answer || [{ text: "" }]).map((span) => span.text).join("").trim(),
    })));
  if (typed.length > 0) return typed;

  const start = blocks.findIndex((b) => b.type === "heading" && isFaqHeading(b.text));
  if (start < 0) return [];
  const section = blocks.slice(start + 1);
  const stop = section.findIndex((b) => b.type === "heading" && !isFaqHeading(b.text));
  const scoped = stop >= 0 ? section.slice(0, stop) : section;
  const out: Array<{ question: string; answer: string }> = [];

  for (let i = 0; i < scoped.length; i += 1) {
    const block = scoped[i];
    if (block.type !== "paragraph") continue;
    const text = blockText(block).replace(/\s+/g, " ");
    const inline = text.match(/^(.+?\?)\s*\+\s*(.+)$/);
    if (inline) {
      out.push({ question: cleanFaqQuestion(inline[1]), answer: inline[2].trim() });
      continue;
    }
    if (!/\?\s*\+?$/.test(text)) continue;
    const question = cleanFaqQuestion(text);
    const next = scoped[i + 1];
    const answer = next?.type === "paragraph" ? blockText(next).replace(/\s+/g, " ") : "";
    if (question && answer) {
      out.push({ question, answer });
      i += 1;
    }
  }
  return out;
}
