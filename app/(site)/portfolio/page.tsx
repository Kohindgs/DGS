import { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import { PortfolioPreviewA } from "@/components/design-preview/portfolio/PortfolioPreviewA";
import { DgsWpBoot } from "@/components/wp-exact/DgsWpBoot";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadPortfolioDesignPreviewSource } from "@/lib/design-preview/portfolio-source";
import { loadWpExtractedAssets } from "@/lib/wp-exact/load-extracted-assets";

const syne = Syne({
  subsets: ["latin"],
  variable: "--preview-font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--preview-font-body",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/portfolio/");
  if (!route) return { title: "Portfolio" };

  return buildPageMetadata({
    title: route.title || "Portfolio",
    description: route.description || "",
    path: "/portfolio/",
    canonicalPath: "/portfolio/",
    indexable: route.indexable,
  });
}

export default async function PortfolioPage() {
  const route = await getRouteByPath("/portfolio/");
  const path = "/portfolio/";
  const blocks = (await loadContentBlocks())[path]?.blocks || [];
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio/" },
  ];
  const schemaBlocks = route
    ? buildRouteSchemas({ route, path, blocks, breadcrumbs })
    : [];

  const [source, assets] = await Promise.all([
    Promise.resolve(loadPortfolioDesignPreviewSource()),
    loadWpExtractedAssets(),
  ]);

  return (
    <div className={`${syne.variable} ${inter.variable}`} data-dgs-portfolio="approved-signature-ui">
      {schemaBlocks ? <JsonLd id="page-jsonld" value={schemaBlocks} /> : null}

      <style dangerouslySetInnerHTML={{ __html: assets.navStyles }} />
      <style dangerouslySetInnerHTML={{ __html: assets.footerStyles }} />

      <div dangerouslySetInnerHTML={{ __html: assets.navHtml }} suppressHydrationWarning />

      <PortfolioPreviewA
        title={source.title}
        industries={source.industries}
        items={source.items}
        previewMode={false}
      />

      <div dangerouslySetInnerHTML={{ __html: assets.footerHtml }} suppressHydrationWarning />

      <DgsWpBoot
        bootNav={assets.bootNav}
        bootV1215=""
        bootPortfolio=""
        runV1215={false}
        runPortfolio={false}
      />
    </div>
  );
}
