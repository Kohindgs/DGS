import { notFound } from "next/navigation";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import { JsonLd } from "@/components/seo/JsonLd";
import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";
import { Reveal } from "@/components/motion/Reveal";

export async function PortfolioPageTemplate() {
  const route = await getRouteByPath("/portfolio/");
  if (!route) notFound();

  const gallery = loadHomepageGallery();
  const schemas = buildRouteSchemas({
    route,
    path: "/portfolio/",
    blocks: [],
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Portfolio", path: "/portfolio/" }],
  });

  return (
    <main className="page-main" id="main-content">
      <article data-migration-content data-wordpress-id={route.wordpressId}>
        <div className="container readable-copy">
          <h1>{route.h1 || "PORTFOLIO"}</h1>
          {route.description ? <p>{route.description}</p> : null}
        </div>
        <Reveal>
          <div className="wide-container">
            <PortfolioGallery items={gallery.items} />
          </div>
        </Reveal>
      </article>
      <JsonLd id="page-jsonld" value={schemas} />
    </main>
  );
}
