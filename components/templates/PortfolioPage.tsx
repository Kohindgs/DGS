import { notFound } from "next/navigation";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import { JsonLd } from "@/components/seo/JsonLd";
import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";
import { PortfolioCategoryLabels } from "@/components/portfolio/PortfolioCategoryLabels";
import { PageBreadcrumbs } from "@/components/templates/PageBreadcrumbs";
import { PageCtaBand } from "@/components/templates/PageCtaBand";

export async function PortfolioPageTemplate() {
  const route = await getRouteByPath("/portfolio/");
  if (!route) notFound();

  const gallery = loadHomepageGallery();
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio/" },
  ];
  const schemas = buildRouteSchemas({
    route,
    path: "/portfolio/",
    blocks: [],
    breadcrumbs,
  });

  return (
    <main className="page-main inner-page inner-page--portfolio" id="main-content">
      <PageBreadcrumbs items={breadcrumbs} />
      <article data-migration-content data-wordpress-id={route.wordpressId}>
        <header className="inner-hero">
          <div className="container readable-copy">
            <p className="inner-hero__eyebrow">Selected work</p>
            <h1>{route.h1 || "PORTFOLIO"}</h1>
            <PortfolioCategoryLabels />
          </div>
        </header>
        <div className="wide-container portfolio-page-gallery">
          <PortfolioGallery items={gallery.items} />
        </div>
      </article>
      <PageCtaBand lead="Need campaign-ready visual work? Share the brief and we’ll map the production path." />
      <JsonLd id="page-jsonld" value={schemas} />
    </main>
  );
}
