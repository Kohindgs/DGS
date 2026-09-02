import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadInnerPageMirror } from "@/lib/wordpress/load-inner-page-mirror";
import { prepareInnerPageMirror } from "@/lib/wordpress/prepare-inner-page-mirror";
import {
  NATIVE_JUSTIFIED_GALLERY_MOUNT,
  hasNativeVideoPortfolioMount,
} from "@/lib/wordpress/native-inner-fixes";
import { loadWpExtractedAssets } from "@/lib/wp-exact/load-extracted-assets";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";
import { DgsWpBoot } from "@/components/wp-exact/DgsWpBoot";
import { InnerMirrorWidgets } from "@/components/mirror/InnerMirrorWidgets";
import { JustifiedPortfolioGallery } from "@/components/portfolio/JustifiedPortfolioGallery";
import { JsonLd } from "@/components/seo/JsonLd";
import type { JsonLdValue } from "@/lib/schema/jsonld";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";

const WP_CDN_ORIGIN = "https://www.dgeniussolutions.com";

async function loadMirrorOverridesCss(): Promise<string> {
  try {
    return await readFile(join(process.cwd(), "lib/wp-exact/inner-mirror-overrides.css"), "utf8");
  } catch {
    return "";
  }
}

type InnerWpMirrorPageProps = {
  path: string;
  wordpressId: number;
  schemaBlocks?: JsonLdValue;
};

function MirrorArticle({
  html,
  galleryItems,
}: {
  html: string;
  galleryItems?: HomepageGalleryItem[];
}) {
  if (galleryItems?.length && html.includes(NATIVE_JUSTIFIED_GALLERY_MOUNT)) {
    const [before, after] = html.split(NATIVE_JUSTIFIED_GALLERY_MOUNT);
    return (
      <div className="dgs-wp-mirror-inner">
        <div dangerouslySetInnerHTML={{ __html: before }} />
        <JustifiedPortfolioGallery items={galleryItems} />
        <div dangerouslySetInnerHTML={{ __html: after }} />
      </div>
    );
  }

  return <div className="dgs-wp-mirror-inner" dangerouslySetInnerHTML={{ __html: html }} />;
}

export async function InnerWpMirrorPage({ path, wordpressId, schemaBlocks }: InnerWpMirrorPageProps) {
  const [content, assets, mirrorOverrides] = await Promise.all([
    loadInnerPageMirror(path),
    loadWpExtractedAssets(),
    loadMirrorOverridesCss(),
  ]);

  const prepared = prepareInnerPageMirror(content, wordpressId);
  const runVideoPortfolio = hasNativeVideoPortfolioMount(prepared.articleHtml);
  const galleryItems = path === "/portfolio/" ? loadHomepageGallery().items : undefined;

  return (
    <>
      <link rel="preconnect" href={WP_CDN_ORIGIN} />
      <link rel="dns-prefetch" href={WP_CDN_ORIGIN} />

      {schemaBlocks ? <JsonLd id="page-jsonld" value={schemaBlocks} /> : null}

      {prepared.fontLinks?.map((linkHtml, index) => (
        <div key={`font-${index}`} dangerouslySetInnerHTML={{ __html: linkHtml }} />
      ))}

      {(content.cssFiles || []).map((file) => (
        <link key={file} rel="stylesheet" href={`/wp-mirror-css/${file}`} />
      ))}

      <style dangerouslySetInnerHTML={{ __html: assets.navStyles }} />
      {prepared.combinedStyles ? <style dangerouslySetInnerHTML={{ __html: prepared.combinedStyles }} /> : null}
      <style dangerouslySetInnerHTML={{ __html: assets.fluentformStyles }} />
      <style dangerouslySetInnerHTML={{ __html: assets.footerStyles }} />
      <style dangerouslySetInnerHTML={{ __html: mirrorOverrides }} />

      <div dangerouslySetInnerHTML={{ __html: assets.navHtml }} />

      <MirrorArticle html={prepared.articleHtml} galleryItems={galleryItems} />

      <div dangerouslySetInnerHTML={{ __html: assets.footerHtml }} />

      <DgsWpBoot
        bootNav={assets.bootNav}
        bootV1215=""
        bootPortfolio={runVideoPortfolio ? assets.bootPortfolioInner : ""}
        runV1215={false}
        runPortfolio={runVideoPortfolio}
      />
      <InnerMirrorWidgets />
    </>
  );
}
