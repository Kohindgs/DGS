import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadInnerPageMirror } from "@/lib/wordpress/load-inner-page-mirror";
import { prepareInnerPageMirror } from "@/lib/wordpress/prepare-inner-page-mirror";
import {
  NATIVE_JUSTIFIED_GALLERY_ROOT_ID,
  hasNativeVideoPortfolioMount,
  parseHtmlLinkTag,
} from "@/lib/wordpress/native-inner-fixes";
import { loadWpExtractedAssets } from "@/lib/wp-exact/load-extracted-assets";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";
import { DgsWpBoot } from "@/components/wp-exact/DgsWpBoot";
import { InnerMirrorWidgets } from "@/components/mirror/InnerMirrorWidgets";
import { DynamicThreeBackground } from "@/components/background/DynamicThreeBackground";
import { JustifiedPortfolioGalleryPortal } from "@/components/portfolio/JustifiedPortfolioGalleryPortal";
import { JsonLd } from "@/components/seo/JsonLd";
import { aggregateMirrorCss } from "@/lib/wordpress/aggregate-mirror-css";
import type { JsonLdValue } from "@/lib/schema/jsonld";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";

const THREE_JS_BG_ROUTES = new Set([
  "/services/ai-video-production-agency/",
  "/services/ai-production-dubai-page/",
  "/services/shirdi-se-sai-tak-case-study/",
]);

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
  const mountGallery = Boolean(galleryItems?.length && html.includes(NATIVE_JUSTIFIED_GALLERY_ROOT_ID));
  return (
    <>
      <div className="dgs-wp-mirror-inner" dangerouslySetInnerHTML={{ __html: html }} />
      {mountGallery && galleryItems?.length ? <JustifiedPortfolioGalleryPortal items={galleryItems} /> : null}
    </>
  );
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
  const mountThreeJsBg = THREE_JS_BG_ROUTES.has(path);
  const aggregatedCssFiles = aggregateMirrorCss(content.cssFiles);
  const hasWebDev = Boolean(
    prepared.articleHtml.includes('id="dgs-webdev-page"') ||
    prepared.articleHtml.includes('class="dgs-webdev-page"') ||
    prepared.articleHtml.includes("dgs-webdev-page"),
  );

  return (
    <>
      <link rel="preconnect" href={WP_CDN_ORIGIN} />
      <link rel="dns-prefetch" href={WP_CDN_ORIGIN} />

      {hasWebDev ? (
        <script
          dangerouslySetInnerHTML={{
            __html:
              'document.documentElement.classList.add("dgs-webdev-active");if(document.body)document.body.classList.add("dgs-webdev-active");else document.addEventListener("DOMContentLoaded",function(){document.body.classList.add("dgs-webdev-active")});',
          }}
        />
      ) : null}

      {schemaBlocks ? <JsonLd id="page-jsonld" value={schemaBlocks} /> : null}

      {prepared.fontLinks?.map((linkHtml, index) => {
        const parsed = parseHtmlLinkTag(linkHtml);
        if (!parsed) return null;
        return (
          <link
            key={`font-${index}`}
            rel={parsed.rel}
            href={parsed.href}
            as={parsed.as}
            type={parsed.type}
            crossOrigin={parsed.crossOrigin}
          />
        );
      })}

      {aggregatedCssFiles.length ? (
        <div
          style={{ display: "contents" }}
          dangerouslySetInnerHTML={{
            __html: aggregatedCssFiles
              .map(
                (file) =>
                  `<link rel="stylesheet" href="/wp-mirror-css/${file}" media="print" onload="this.onload=null;this.media='all'"><noscript><link rel="stylesheet" href="/wp-mirror-css/${file}"></noscript>`,
              )
              .join(""),
          }}
        />
      ) : null}

      <style dangerouslySetInnerHTML={{ __html: assets.navStyles }} />
      {prepared.combinedStyles ? <style dangerouslySetInnerHTML={{ __html: prepared.combinedStyles }} /> : null}
      <style dangerouslySetInnerHTML={{ __html: assets.fluentformStyles }} />
      <style dangerouslySetInnerHTML={{ __html: assets.footerStyles }} />
      <style dangerouslySetInnerHTML={{ __html: mirrorOverrides }} />

      <div dangerouslySetInnerHTML={{ __html: assets.navHtml }} />

      {!prepared.articleHtml.includes("<h1") ? (
        <h1
          className="sr-only"
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {path === "/contact-us/" ? "Contact Us" : "D'Genius Solutions"}
        </h1>
      ) : null}

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
      {mountThreeJsBg ? <DynamicThreeBackground /> : null}
    </>
  );
}
