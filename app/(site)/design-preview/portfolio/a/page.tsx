import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import { PortfolioPreviewA } from "@/components/design-preview/portfolio/PortfolioPreviewA";
import { loadPortfolioDesignPreviewSource } from "@/lib/design-preview/portfolio-source";

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

export default function PortfolioDesignPreviewAPage() {
  const source = loadPortfolioDesignPreviewSource();

  return (
    <div className={`${syne.variable} ${inter.variable}`} data-dgs-design-preview="portfolio-a">
      <PortfolioPreviewA
        title={source.title}
        industries={source.industries}
        items={source.items}
      />
    </div>
  );
}
