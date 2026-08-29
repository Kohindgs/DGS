import Link from "next/link";
import type { HomepageGalleryItem } from "@/lib/portfolio/types";
import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";
import styles from "./HomePortfolioPreview.module.css";

const HOMEPAGE_PREVIEW_COUNT = 8;

type HomePortfolioPreviewProps = {
  items: HomepageGalleryItem[];
};

export function HomePortfolioPreview({ items }: HomePortfolioPreviewProps) {
  const previewItems = items.slice(0, HOMEPAGE_PREVIEW_COUNT);

  return (
    <section className={`${styles.section} dgs-v1215-ai-portfolio`} id="portfolio" aria-labelledby="home-portfolio-heading" data-reveal>
      <div className="container">
        <h2 id="home-portfolio-heading">AI-Led Creative Portfolio</h2>
      </div>
      <div className="wide-container">
        <PortfolioGallery items={previewItems} initialVisible={HOMEPAGE_PREVIEW_COUNT} showCategoryLabel={false} />
        <div className={styles.ctaWrap}>
          <Link href="/portfolio/" className={styles.cta}>
            View Portfolio
          </Link>
        </div>
      </div>
    </section>
  );
}
