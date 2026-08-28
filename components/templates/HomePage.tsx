import { notFound } from "next/navigation";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import { extractHeroCopy, parseHomepageSections } from "@/lib/home/parse-homepage-sections";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeHeroRail } from "@/components/home/HomeHeroRail";
import { HomePortfolioPreview } from "@/components/portfolio/HomePortfolioPreview";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";
import { HomeProofStack } from "@/components/home/sections/HomeProofStack";
import { HomeCapabilities } from "@/components/home/sections/HomeCapabilities";
import { HomeCaseStudies } from "@/components/home/sections/HomeCaseStudies";
import { HomeCreativeGallery } from "@/components/home/sections/HomeCreativeGallery";
import { HomeTestimonials } from "@/components/home/sections/HomeTestimonials";
import { HomeSearchAuthority } from "@/components/home/sections/HomeSearchAuthority";
import { HomeIndustries } from "@/components/home/sections/HomeIndustries";
import { HomeWhyDgs } from "@/components/home/sections/HomeWhyDgs";
import { HomeFaq } from "@/components/home/sections/HomeFaq";

export async function HomePageTemplate() {
  const route = await getRouteByPath("/");
  if (!route) notFound();

  const allBlocks = (await loadContentBlocks())["/"]?.blocks || [];
  const gallery = loadHomepageGallery();
  const sections = parseHomepageSections(allBlocks);
  const hero = extractHeroCopy(sections.hero);

  const schemas = buildRouteSchemas({
    route,
    path: "/",
    blocks: allBlocks,
    breadcrumbs: [],
  });

  return (
    <main className="page-main home-page" id="main-content" style={{ paddingBlock: 0 }}>
      <article data-migration-content data-wordpress-id={route?.wordpressId ?? 63505}>
        <HomeHero eyebrow={hero.eyebrow} h1={hero.h1} lead={hero.lead} image={hero.image} />
        <HomeHeroRail />
        <HomeProofStack blocks={sections.proof} />
        <HomeCapabilities blocks={sections.capabilities} />
        <HomePortfolioPreview items={gallery.items} />
        <HomeCaseStudies blocks={sections.caseStudies} />
        <HomeCreativeGallery blocks={sections.creativeGallery} />
        <HomeTestimonials blocks={sections.testimonials} />
        <HomeSearchAuthority blocks={sections.searchAuthority} />
        <HomeIndustries blocks={sections.industries} />
        <HomeWhyDgs blocks={sections.whyDgs} />
        <HomeFaq blocks={sections.faq} />
        <HomeFinalCta blocks={sections.finalCta} />
      </article>

      <JsonLd id="page-jsonld" value={schemas} />
    </main>
  );
}
