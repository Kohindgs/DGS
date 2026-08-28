import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";
import { loadHomepageMirrorContent } from "@/lib/wordpress/load-homepage-mirror";
import {
  NATIVE_CREATIVE_GALLERY_MOUNT,
  NATIVE_HOME_FORM_MOUNT,
  prepareHomepageMirror,
} from "@/lib/wordpress/prepare-homepage-mirror";
import { loadWpExtractedAssets } from "@/lib/wp-exact/load-extracted-assets";
import { buildCreativeGalleryHtml, buildHomeFormHtml } from "@/lib/wp-exact/build-mirror-swap-html";
import { buildHomepageMirrorJsonLd } from "@/lib/schema/homepage-mirror-schemas";
import { DgsWpBoot } from "@/components/wp-exact/DgsWpBoot";

const WP_CDN_ORIGIN = "https://www.dgeniussolutions.com";
const THREE_CDN_ORIGIN = "https://cdn.jsdelivr.net";

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

  const mainHtml = prepared.mainHtml
    .replace(NATIVE_CREATIVE_GALLERY_MOUNT, buildCreativeGalleryHtml(gallery.items))
    .replace(NATIVE_HOME_FORM_MOUNT, buildHomeFormHtml());

  const jsonLdScripts = buildHomepageMirrorJsonLd({
    content,
    route: route!,
    blocks: allBlocks["/"]?.blocks || [],
  });

  return (
    <>
      <link rel="preconnect" href={WP_CDN_ORIGIN} />
      <link rel="dns-prefetch" href={WP_CDN_ORIGIN} />
      <link rel="preconnect" href={THREE_CDN_ORIGIN} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={THREE_CDN_ORIGIN} />

      {jsonLdScripts.map((schema, index) => (
        <script key={`schema-${index}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      ))}

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

      <div className="dgs-wp-mirror-home" dangerouslySetInnerHTML={{ __html: mainHtml }} />

      <div dangerouslySetInnerHTML={{ __html: assets.footerHtml }} />

      <DgsWpBoot
        bootNav={assets.bootNav}
        bootV1215={assets.bootV1215}
        bootPortfolio={assets.bootPortfolioHome}
      />
    </>
  );
}
