import { notFound } from "next/navigation";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import type { ContentBlock } from "@/lib/content/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { SemanticContent } from "@/components/content/SemanticContent";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import { ClientLogoMarquee } from "@/components/home/ClientLogoMarquee";
import { loadHomepageClientLogos } from "@/lib/home/load-client-logos";
import { splitHomepageBlocks } from "@/lib/home/split-homepage-blocks";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeHeroSignals } from "@/components/home/HomeHeroSignals";
import { HomePortfolioPreview } from "@/components/portfolio/HomePortfolioPreview";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";
import { Reveal } from "@/components/motion/Reveal";

function withoutForms(blocks: ContentBlock[]) {
  return blocks.filter((block) => block.type !== "form");
}

export async function HomePageTemplate() {
  const route = await getRouteByPath("/");
  if (!route) notFound();

  const allBlocks = (await loadContentBlocks())["/"]?.blocks || [];
  const gallery = loadHomepageGallery();
  const logos = loadHomepageClientLogos();
  const sections = splitHomepageBlocks(allBlocks);
  const pageH1 = route.h1 || route.title || "Full Service Digital Marketing Agency In Mumbai";

  const schemas = buildRouteSchemas({
    route,
    path: "/",
    blocks: allBlocks,
    breadcrumbs: [],
  });

  return (
    <main className="page-main home-page" id="main-content">
      <article data-migration-content data-wordpress-id={route?.wordpressId ?? 63505}>
        <HomeHero h1={pageH1} />
        <HomeHeroSignals />

        <Reveal variant="reveal-up">
          <div className="container">
            <SemanticContent blocks={withoutForms(sections.afterHero)} demoteSecondaryHeadings />
          </div>
        </Reveal>

        <Reveal variant="reveal-up">
          <ClientLogoMarquee logos={logos} />
        </Reveal>

        <Reveal variant="reveal-side" motionFrom="left">
          <div className="container">
            <SemanticContent blocks={withoutForms(sections.prePortfolio)} demoteSecondaryHeadings />
          </div>
        </Reveal>

        <Reveal variant="reveal-up">
          <HomePortfolioPreview items={gallery.items} />
        </Reveal>

        {sections.portfolioIntro.length > 0 ? (
          <Reveal variant="reveal-up">
            <div className="container">
              <SemanticContent blocks={withoutForms(sections.portfolioIntro)} demoteSecondaryHeadings />
            </div>
          </Reveal>
        ) : null}

        <Reveal variant="reveal-side" motionFrom="right">
          <div className="container">
            <SemanticContent blocks={withoutForms(sections.beforeFinalCta)} demoteSecondaryHeadings />
          </div>
        </Reveal>

        <Reveal variant="reveal-up">
          <HomeFinalCta />
        </Reveal>
      </article>

      <JsonLd id="page-jsonld" value={schemas} />
    </main>
  );
}
