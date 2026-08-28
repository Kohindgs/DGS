import { notFound } from "next/navigation";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import type { ContentBlock, HeadingBlock } from "@/lib/content/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { SemanticContent } from "@/components/content/SemanticContent";
import { NativePortfolioGallery } from "@/components/portfolio/NativePortfolioGallery";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";

/** Blocks before native portfolio gallery (through Brand Identity intro). */
const GALLERY_SPLIT_INDEX = 148;

export async function HomePageTemplate() {
  const route = await getRouteByPath("/");
  if (!route) notFound();
  const allBlocks = (await loadContentBlocks())["/"]?.blocks || [];
  const gallery = loadHomepageGallery();

  const pageH1 = route?.h1 || route?.title || "Full Service Digital Marketing Agency In Mumbai";
  const isH1 = (b: ContentBlock): b is HeadingBlock => b.type === "heading" && b.level === 1;
  const contentBlocks = allBlocks.filter((b) => !isH1(b));

  const beforeGallery = contentBlocks.slice(0, GALLERY_SPLIT_INDEX);
  const afterGallery = contentBlocks.slice(GALLERY_SPLIT_INDEX);

  const schemas = buildRouteSchemas({
    route,
    path: "/",
    blocks: allBlocks,
    breadcrumbs: [],
  });

  return (
    <main className="page-main" id="main-content">
      <article data-migration-content data-wordpress-id={route?.wordpressId ?? 63505}>
        <div className="container readable-copy">
          <h1>{pageH1}</h1>
        </div>
        <div className="container">
          <SemanticContent blocks={beforeGallery} />
        </div>

        <section className="home-portfolio wide-container" aria-labelledby="home-portfolio-heading">
          <NativePortfolioGallery items={gallery.items} />
        </section>

        <div className="container">
          <SemanticContent blocks={afterGallery} />
        </div>
      </article>

      <JsonLd id="page-jsonld" value={schemas} />
    </main>
  );
}
