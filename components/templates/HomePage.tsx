import { notFound } from "next/navigation";
import Image from "next/image";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import type { ContentBlock, HeadingBlock, ImageBlock } from "@/lib/content/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { SemanticContent } from "@/components/content/SemanticContent";
import { NativePortfolioGallery } from "@/components/portfolio/NativePortfolioGallery";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import { ClientLogoMarquee } from "@/components/home/ClientLogoMarquee";
import { loadHomepageClientLogos } from "@/lib/home/load-client-logos";
import { PublicLeadForm } from "@/components/forms/PublicLeadForm";

/** Blocks before native portfolio gallery (through Brand Identity intro). */
const GALLERY_SPLIT_INDEX = 148;
const LOGO_SECTION_START = 17;
const LOGO_SECTION_END = 148;

const HERO_IMAGE = {
  src: "https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp",
  alt: "Digital marketing, SEO, AEO, GEO, LLM SEO and AI production agency visual for D'Genius Solutions",
  width: 1200,
  height: 800,
};

export async function HomePageTemplate() {
  const route = await getRouteByPath("/");
  if (!route) notFound();
  const allBlocks = (await loadContentBlocks())["/"]?.blocks || [];
  const gallery = loadHomepageGallery();
  const logos = loadHomepageClientLogos();

  const pageH1 = route?.h1 || route?.title || "Full Service Digital Marketing Agency In Mumbai";
  const isH1 = (b: ContentBlock): b is HeadingBlock => b.type === "heading" && b.level === 1;
  const isClientLogo = (b: ContentBlock): b is ImageBlock =>
    b.type === "image" && /client logo/i.test(b.alt || "");

  const contentBlocks = allBlocks.filter((b) => !isH1(b));
  const beforeGallery = contentBlocks
    .slice(0, GALLERY_SPLIT_INDEX)
    .filter((block, index) => !(index >= LOGO_SECTION_START && index < LOGO_SECTION_END && isClientLogo(block)));
  const afterGallery = contentBlocks.slice(GALLERY_SPLIT_INDEX);

  const schemas = buildRouteSchemas({
    route,
    path: "/",
    blocks: allBlocks,
    breadcrumbs: [],
  });

  return (
    <main className="page-main home-page" id="main-content">
      <article data-migration-content data-wordpress-id={route?.wordpressId ?? 63505}>
        <section className="home-hero wide-container">
          <div className="home-hero__copy readable-copy">
            <p className="home-hero__eyebrow">Mumbai Based Full Service Digital Marketing Agency</p>
            <h1>{pageH1}</h1>
            <p className="home-hero__lead">
              D&apos;Genius Solutions is a full service digital marketing agency in Mumbai helping brands grow through connected search, websites, social media, paid campaigns, branding and AI-led creative production.
            </p>
          </div>
          <div className="home-hero__visual">
            <Image
              src={HERO_IMAGE.src}
              alt={HERO_IMAGE.alt}
              width={HERO_IMAGE.width}
              height={HERO_IMAGE.height}
              preload
              sizes="(max-width: 768px) 100vw, (max-width: 1920px) 60vw, 960px"
              className="home-hero__image"
            />
          </div>
        </section>

        <div className="container">
          <SemanticContent blocks={beforeGallery.slice(0, 12)} />
        </div>

        <ClientLogoMarquee logos={logos} />

        <div className="container">
          <SemanticContent blocks={beforeGallery.slice(12)} />
        </div>

        <section className="home-portfolio wide-container" aria-labelledby="home-portfolio-heading">
          <NativePortfolioGallery items={gallery.items} />
        </section>

        <div className="container">
          <SemanticContent blocks={afterGallery} />
        </div>

        <section className="container home-contact-form" aria-labelledby="home-contact-form-heading">
          <h2 id="home-contact-form-heading">Start a Conversation</h2>
          <PublicLeadForm route="/" />
        </section>
      </article>

      <JsonLd id="page-jsonld" value={schemas} />
    </main>
  );
}
