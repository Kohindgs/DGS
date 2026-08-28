import type { ContentBlock, HeadingBlock, ImageBlock } from "@/lib/content/types";

export type HomepageSections = {
  afterHero: ContentBlock[];
  prePortfolio: ContentBlock[];
  portfolioIntro: ContentBlock[];
  beforeFinalCta: ContentBlock[];
  finalCta: ContentBlock[];
};

const isH1 = (block: ContentBlock): block is HeadingBlock =>
  block.type === "heading" && block.level === 1;

const isClientLogo = (block: ContentBlock): block is ImageBlock =>
  block.type === "image" && /client logo/i.test(block.alt || "");

function blockText(block: ContentBlock): string {
  if (block.type === "heading") return block.text;
  if (block.type === "paragraph") return block.content.map((span) => span.text).join("");
  return "";
}

function findIndex(blocks: ContentBlock[], predicate: (block: ContentBlock, index: number) => boolean) {
  return blocks.findIndex(predicate);
}

function isEnviraUiArtifact(block: ContentBlock): boolean {
  if (block.type !== "paragraph") return false;
  const text = blockText(block).trim();
  return text === "×" || text === "‹" || text === "›";
}

/** Split homepage blocks by visible heading anchors instead of brittle numeric indexes. */
export function splitHomepageBlocks(allBlocks: ContentBlock[]): HomepageSections {
  const blocks = allBlocks.filter((block) => !isH1(block) && !isEnviraUiArtifact(block));

  const trustedByIndex = findIndex(blocks, (block) =>
    block.type === "paragraph" && blockText(block).includes("Trusted By 200+"),
  );

  const firstLogoIndex = findIndex(blocks, isClientLogo);
  const lastLogoIndex = blocks.reduce(
    (last, block, index) => (isClientLogo(block) ? index : last),
    -1,
  );

  const portfolioIndex = findIndex(
    blocks,
    (block) => block.type === "heading" && block.text.trim() === "AI-Led Creative Portfolio",
  );

  const caseStudiesIndex = findIndex(
    blocks,
    (block) =>
      block.type === "heading" &&
      block.text.trim() === "SEO, Website And Digital Growth Case Studies",
  );

  const finalCtaIndex = findIndex(
    blocks,
    (block) => block.type === "paragraph" && blockText(block).includes("Ready To Fix The Gaps?"),
  );

  const afterHeroEnd = trustedByIndex >= 0 ? trustedByIndex : 8;
  const logoStripEnd = lastLogoIndex >= 0 ? lastLogoIndex + 1 : firstLogoIndex >= 0 ? firstLogoIndex : afterHeroEnd;
  const prePortfolioStart = logoStripEnd;
  const prePortfolioEnd = portfolioIndex >= 0 ? portfolioIndex : caseStudiesIndex >= 0 ? caseStudiesIndex : finalCtaIndex >= 0 ? finalCtaIndex : blocks.length;
  const portfolioIntroStart = portfolioIndex >= 0 ? portfolioIndex + 1 : -1;
  const portfolioIntroEnd = caseStudiesIndex >= 0 ? caseStudiesIndex : finalCtaIndex >= 0 ? finalCtaIndex : blocks.length;
  const beforeFinalEnd = finalCtaIndex >= 0 ? finalCtaIndex : blocks.length;

  return {
    afterHero: blocks.slice(afterHeroEnd, prePortfolioStart),
    prePortfolio: blocks.slice(prePortfolioStart, prePortfolioEnd),
    portfolioIntro:
      portfolioIntroStart >= 0 ? blocks.slice(portfolioIntroStart, portfolioIntroEnd) : [],
    beforeFinalCta:
      caseStudiesIndex >= 0 ? blocks.slice(caseStudiesIndex, beforeFinalEnd) : blocks.slice(prePortfolioEnd, beforeFinalEnd),
    finalCta: finalCtaIndex >= 0 ? blocks.slice(finalCtaIndex) : [],
  };
}
