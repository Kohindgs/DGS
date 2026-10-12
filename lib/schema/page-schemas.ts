import type { ContentBlock } from "@/lib/content/types";
import type { RouteRecord } from "@/lib/nextjs/routes";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  serviceSchema,
  videoObjectSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/schema/builders";
import { ORGANIZATION_ID, WEBSITE_ID, verifiedOrganization } from "@/lib/schema/entity";
import type { BreadcrumbItem } from "@/lib/schema/builders";
import { getPageSeoOverride } from "@/lib/seo/page-overrides";

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
  const seoOverride = getPageSeoOverride(path);
  const pageTitle = seoOverride?.title || route.title || route.h1 || "Page";
  const pageDescription = seoOverride?.description || route.description || "";
  const schemas = [...buildGlobalEntitySchemas()];

  schemas.push(
    webPageSchema({
      name: pageTitle,
      description: pageDescription,
      path,
      organizationId: ORGANIZATION_ID,
      websiteId: WEBSITE_ID,
    }),
  );

  if (route.wordpressType === "service" || path === "/aeo-dubai/") {
    schemas.push(
      serviceSchema({
        name: seoOverride?.serviceName || pageTitle,
        description: pageDescription,
        path,
        providerId: ORGANIZATION_ID,
        serviceType: seoOverride?.serviceType,
        areaServed: seoOverride?.areaServed,
      }),
    );
  }

  if (breadcrumbs.length > 0) {
    schemas.push(breadcrumbSchema(breadcrumbs));
  }

  const pageFaqs = extractFaqsFromBlocks(blocks);
  const faqSchemaExcludedPaths = new Set(["/better-ceasons-case-study/"]);
  if (pageFaqs.length > 0 && !faqSchemaExcludedPaths.has(path)) {
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

  const aiVideoSchemaPaths = new Set([
    "/services/ai-video-production-agency/",
    "/portfolio/",
    "/ai-production-videos-google-ads-landing-page/",
    "/services/ai-production-dubai-page/",
  ]);

  if (aiVideoSchemaPaths.has(path)) {
    schemas.push(
      videoObjectSchema({
        name: "Hyundai Creta — Feature & Technology Explainer",
        description: "AI-powered automotive feature explainer showcasing advanced tech highlights for Hyundai Creta.",
        thumbnailUrl: "/media/portfolio/posters/hyundai_creta_1_poster.webp",
        uploadDate: "2026-10-12",
        contentUrl: "/media/portfolio/videos/hyundai_creta_1.mp4",
      }),
      videoObjectSchema({
        name: "Sundaram E-Learning — Interactive Curriculum Animation",
        description: "AI interactive curriculum video animation for primary education produced for Sundaram E-Learning.",
        thumbnailUrl: "/media/portfolio/posters/sundaram_bal_3_1_poster.webp",
        uploadDate: "2026-10-12",
        contentUrl: "/media/portfolio/videos/sundaram_bal_3_1.mp4",
      }),
      videoObjectSchema({
        name: "Clarion Agro — Jasmine Atta Campaign",
        description: "High-engagement AI commercial campaign for Clarion Agro Jasmine Atta.",
        thumbnailUrl: "/media/portfolio/posters/clarion_jasmine_atta_hindi_poster.webp",
        uploadDate: "2026-10-12",
        contentUrl: "/media/portfolio/videos/clarion_jasmine_atta_hindi.mp4",
      }),
      videoObjectSchema({
        name: "Better Ceasons — 1000 Saal Ka Tenant Ad Campaign",
        description: "AI narrative commercial series crafted for Better Ceasons brand marketing.",
        thumbnailUrl: "/media/portfolio/posters/better_ceasons_tenant_poster.webp",
        uploadDate: "2026-10-12",
        contentUrl: "/media/portfolio/videos/better_ceasons_tenant.mp4",
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
