import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import { loadHomepageMirrorContent } from "@/lib/wordpress/load-homepage-mirror";
import { prepareHomepageMirror } from "@/lib/wordpress/prepare-homepage-mirror";
import { loadWpExtractedAssets } from "@/lib/wp-exact/load-extracted-assets";
import { JsonLd } from "@/components/seo/JsonLd";
import { DgsWpBoot } from "@/components/wp-exact/DgsWpBoot";
import { WpMirrorCreativeGallery } from "@/components/wp-exact/WpMirrorCreativeGallery";
import { WpMirrorPortfolioPreview } from "@/components/wp-exact/WpMirrorPortfolioPreview";

export async function HomeWpMirrorPage() {
  const [content, assets, route, allBlocks] = await Promise.all([
    loadHomepageMirrorContent(),
    loadWpExtractedAssets(),
    getRouteByPath("/"),
    loadContentBlocks(),
  ]);

  const prepared = prepareHomepageMirror(content);
  const gallery = loadHomepageGallery();

  const schemas = buildRouteSchemas({
    route: route!,
    path: "/",
    blocks: allBlocks["/"]?.blocks || [],
    breadcrumbs: [],
  });

  return (
    <>
      {prepared.fontLinks?.map((linkHtml, index) => (
        <div key={`font-${index}`} dangerouslySetInnerHTML={{ __html: linkHtml }} />
      ))}

      <style dangerouslySetInnerHTML={{ __html: assets.navStyles }} />
      <style dangerouslySetInnerHTML={{ __html: prepared.combinedStyles }} />
      <style dangerouslySetInnerHTML={{ __html: assets.footerStyles }} />

      <div dangerouslySetInnerHTML={{ __html: assets.navHtml }} />

      <div className="dgs-wp-mirror-home">
        {prepared.segments.map((segment, index) => {
          if (segment.type === "html") {
            return (
              <div
                key={`html-${index}`}
                dangerouslySetInnerHTML={{ __html: segment.html }}
              />
            );
          }

          if (segment.type === "portfolio") {
            return <WpMirrorPortfolioPreview key="portfolio" items={gallery.items} />;
          }

          return <WpMirrorCreativeGallery key="creative" items={gallery.items} />;
        })}
      </div>

      <div dangerouslySetInnerHTML={{ __html: assets.footerHtml }} />

      <DgsWpBoot
        bootNav={assets.bootNav}
        bootV1215={assets.bootV1215}
        bootPortfolio={assets.bootPortfolio}
        runPortfolio={!prepared.hasPortfolioSplit}
      />

      <JsonLd id="page-jsonld" value={schemas} />
    </>
  );
}
