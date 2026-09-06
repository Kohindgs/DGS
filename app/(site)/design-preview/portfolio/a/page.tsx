import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import { PortfolioPreviewA } from "@/components/design-preview/portfolio/PortfolioPreviewA";
import { DgsWpBoot } from "@/components/wp-exact/DgsWpBoot";
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

export const metadata: Metadata = {
  title: "Portfolio",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function PortfolioDesignPreviewAPage() {
  const source = loadPortfolioDesignPreviewSource();
  const assets = await loadWpExtractedAssets();

  return (
    <div className={`${syne.variable} ${inter.variable}`} data-dgs-design-preview="portfolio-a">
      <style dangerouslySetInnerHTML={{ __html: assets.navStyles }} />
      <style dangerouslySetInnerHTML={{ __html: assets.footerStyles }} />

      <div dangerouslySetInnerHTML={{ __html: assets.navHtml }} />

      <PortfolioPreviewA
        title={source.title}
        industries={source.industries}
        items={source.items}
      />

      <div dangerouslySetInnerHTML={{ __html: assets.footerHtml }} />

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
