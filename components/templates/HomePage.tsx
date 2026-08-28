import { notFound } from "next/navigation";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";
import { loadHomepageMirrorContent } from "@/lib/wordpress/load-homepage-mirror";
import { buildHomepageMirrorJsonLd } from "@/lib/schema/homepage-mirror-schemas";
import { extractHeroCopy, parseHomepageSections } from "@/lib/home/parse-homepage-sections";
import { HomeV1215Shell } from "@/components/home/HomeV1215Shell";
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

  const [allBlocks, gallery, mirrorContent] = await Promise.all([
    loadContentBlocks(),
    Promise.resolve(loadHomepageGallery()),
    loadHomepageMirrorContent(),
  ]);

  const blocks = allBlocks["/"]?.blocks || [];
  const sections = parseHomepageSections(blocks);
  const hero = extractHeroCopy(sections.hero);

  const jsonLdScripts = buildHomepageMirrorJsonLd({
    content: mirrorContent,
    route,
    blocks,
  });

  return (
    <>
      {jsonLdScripts.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      ))}

      <HomeV1215Shell>
        <article data-migration-content data-wordpress-id={route.wordpressId ?? 63505}>
          <HomeHero eyebrow={hero.eyebrow} h1={hero.h1} lead={hero.lead} image={hero.image} />
          <HomeHeroRail />
          <HomeProofStack blocks={sections.proof} />
          <HomeCapabilities blocks={sections.capabilities} />
          <HomePortfolioPreview items={gallery.items} />
          <HomeCaseStudies blocks={sections.caseStudies} />
          <HomeCreativeGallery items={gallery.items} blocks={sections.creativeGallery} />
          <HomeTestimonials blocks={sections.testimonials} />
          <HomeSearchAuthority blocks={sections.searchAuthority} />
          <HomeIndustries blocks={sections.industries} />
          <HomeWhyDgs blocks={sections.whyDgs} />
          <HomeFaq blocks={sections.faq} />
          <HomeFinalCta blocks={sections.finalCta} />
        </article>
      </HomeV1215Shell>
    </>
  );
}
