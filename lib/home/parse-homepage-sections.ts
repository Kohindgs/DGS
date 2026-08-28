import type { ContentBlock, FaqBlock, HeadingBlock, ImageBlock } from "@/lib/content/types";

export type HomepageSectionKey =
  | "hero"
  | "rail"
  | "proof"
  | "capabilities"
  | "portfolio"
  | "caseStudies"
  | "creativeGallery"
  | "testimonials"
  | "searchAuthority"
  | "industries"
  | "whyDgs"
  | "faq"
  | "finalCta";

export type ParsedHomepageSections = Record<
  Exclude<HomepageSectionKey, "faq">,
  ContentBlock[]
> & {
  faq: FaqBlock[];
};

function isHeading(block: ContentBlock, text: string, level?: number): block is HeadingBlock {
  return (
    block.type === "heading" &&
    block.text.trim() === text &&
    (level === undefined || block.level === level)
  );
}

function findHeadingIndex(blocks: ContentBlock[], text: string, level?: number) {
  return blocks.findIndex((block) => isHeading(block, text, level));
}

function blockText(block: ContentBlock): string {
  if (block.type === "heading") return block.text;
  if (block.type === "paragraph") return block.content.map((span) => span.text).join("");
  return "";
}

function isClientLogo(block: ContentBlock): block is ImageBlock {
  return block.type === "image" && /client logo/i.test(block.alt || "");
}

function isEnviraArtifact(block: ContentBlock): boolean {
  if (block.type !== "paragraph") return false;
  const text = blockText(block).trim();
  return text === "×" || text === "‹" || text === "›";
}

const HEADING = {
  trustedBrands:
    "Trusted by brands across finance, retail, education, healthcare, consumer and technology categories.",
  awards: "Recognized for SEO, Content & Performance Marketing",
  capabilities: "One team for search, web, creative, performance and AI production.",
  portfolio: "AI-Led Creative Portfolio",
  caseStudies: "SEO, Website And Digital Growth Case Studies",
  creativeGallery: "Brand Identity & Creative Excellence",
  testimonials: "Trusted By Brands Worldwide",
  searchAuthority: "Built For Google Search, AI Answers And Voice Discovery",
  industries: "Industries We Help Grow",
  whyDgs: "Why Brands Choose D’Genius Solutions",
  finalCta: "Let us audit your brand, website, search visibility and campaign flow.",
} as const;

export function parseHomepageSections(allBlocks: ContentBlock[]): ParsedHomepageSections {
  const blocks = allBlocks.filter((block) => !isEnviraArtifact(block));

  const h1Index = blocks.findIndex((block) => block.type === "heading" && block.level === 1);
  const trustedIndex = findHeadingIndex(blocks, HEADING.trustedBrands, 2);
  const capabilitiesIndex = findHeadingIndex(blocks, HEADING.capabilities, 2);
  const portfolioIndex = findHeadingIndex(blocks, HEADING.portfolio, 2);
  const caseStudiesIndex = findHeadingIndex(blocks, HEADING.caseStudies, 2);
  const creativeIndex = findHeadingIndex(blocks, HEADING.creativeGallery, 2);
  const testimonialsIndex = findHeadingIndex(blocks, HEADING.testimonials, 2);
  const searchAuthorityIndex = findHeadingIndex(blocks, HEADING.searchAuthority, 2);
  const industriesIndex = findHeadingIndex(blocks, HEADING.industries, 2);
  const whyIndex = findHeadingIndex(blocks, HEADING.whyDgs, 2);
  const finalCtaIndex = findHeadingIndex(blocks, HEADING.finalCta, 2);

  const railStart = blocks.findIndex(
    (block) => block.type === "paragraph" && blockText(block).includes("Search Visibility"),
  );
  const railEnd = trustedIndex >= 0 ? trustedIndex : capabilitiesIndex;

  const slice = (start: number, end: number) =>
    start >= 0 && end > start ? blocks.slice(start, end) : [];

  return {
    hero: slice(0, railStart >= 0 ? railStart : h1Index >= 0 ? h1Index + 4 : 4),
    rail: slice(railStart, railEnd),
    proof: slice(trustedIndex, capabilitiesIndex),
    capabilities: slice(capabilitiesIndex, portfolioIndex),
    portfolio: slice(portfolioIndex, caseStudiesIndex),
    caseStudies: slice(caseStudiesIndex, creativeIndex),
    creativeGallery: slice(creativeIndex, testimonialsIndex),
    testimonials: slice(testimonialsIndex, searchAuthorityIndex),
    searchAuthority: slice(searchAuthorityIndex, industriesIndex),
    industries: slice(industriesIndex, whyIndex),
    whyDgs: slice(whyIndex, finalCtaIndex),
    faq: blocks
      .slice(whyIndex >= 0 ? whyIndex : 0, finalCtaIndex >= 0 ? finalCtaIndex : blocks.length)
      .filter((block): block is FaqBlock => block.type === "faq"),
    finalCta: finalCtaIndex >= 0 ? blocks.slice(finalCtaIndex) : [],
  };
}

export function extractHeroCopy(blocks: ContentBlock[]) {
  const eyebrow = blocks.find(
    (block) =>
      block.type === "paragraph" &&
      blockText(block).includes("Mumbai Based Full Service Digital Marketing Agency"),
  );
  const h1 = blocks.find((block) => block.type === "heading" && block.level === 1) as
    | HeadingBlock
    | undefined;
  const lead = blocks.find(
    (block) =>
      block.type === "paragraph" &&
      blockText(block).includes("full service digital marketing agency in Mumbai"),
  );
  const image = blocks.find((block) => block.type === "image") as ImageBlock | undefined;

  return {
    eyebrow: eyebrow ? blockText(eyebrow).trim() : "Mumbai Based Full Service Digital Marketing Agency",
    h1: h1?.text || "Full Service Digital Marketing Agency In Mumbai",
    lead: lead ? blockText(lead).trim() : "",
    image,
  };
}

export function extractProofLogos(blocks: ContentBlock[]) {
  return blocks.filter(isClientLogo);
}
