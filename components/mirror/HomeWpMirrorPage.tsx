import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import { loadHomepageMirrorContent } from "@/lib/wordpress/load-homepage-mirror";
import { prepareHomepageMirror } from "@/lib/wordpress/prepare-homepage-mirror";
import { loadWpExtractedAssets } from "@/lib/wp-exact/load-extracted-assets";
import { JsonLd } from "@/components/seo/JsonLd";
import { DgsWpBoot } from "@/components/wp-exact/DgsWpBoot";
import { WpMirrorNativeMounts } from "@/components/wp-exact/WpMirrorNativeMounts";

async function loadMirrorOverridesCss(): Promise<string> {
  try {
    return await readFile(join(process.cwd(), "lib/wp-exact/wp-mirror-overrides.css"), "utf8");
  } catch {
    return "";
  }
}

export async function HomeWpMirrorPage() {
  const [content, assets, route, allBlocks, mirrorOverrides] = await Promise.all([
    loadHomepageMirrorContent(),
    loadWpExtractedAssets(),
    getRouteByPath("/"),
    loadContentBlocks(),
    loadMirrorOverridesCss(),
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
      <style dangerouslySetInnerHTML={{ __html: assets.fluentformStyles }} />
      <style dangerouslySetInnerHTML={{ __html: assets.homeFluentformStyles }} />
      <style dangerouslySetInnerHTML={{ __html: assets.footerStyles }} />
      <style dangerouslySetInnerHTML={{ __html: mirrorOverrides }} />

      <div dangerouslySetInnerHTML={{ __html: assets.navHtml }} />

      <div
        className="dgs-wp-mirror-home"
        dangerouslySetInnerHTML={{ __html: prepared.mainHtml }}
      />

      <WpMirrorNativeMounts galleryItems={gallery.items} />

      <div dangerouslySetInnerHTML={{ __html: assets.footerHtml }} />

      <DgsWpBoot
        bootNav={assets.bootNav}
        bootV1215={assets.bootV1215}
        bootPortfolio={assets.bootPortfolioHome}
      />

      <JsonLd id="page-jsonld" value={schemas} />
    </>
  );
}
