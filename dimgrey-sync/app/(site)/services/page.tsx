import { Metadata } from "next";
import { loadRouteRegistry, getRouteByPath } from "@/lib/nextjs/routes";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { organizationSchema, breadcrumbSchema } from "@/lib/schema/builders";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import { readFile } from "node:fs/promises";

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/services/");

  if (!route) {
    return { title: "Services" };
  }

  const title = route.title || "Services";
  const description = route.description || "";

  return buildPageMetadata({
    title,
    description,
    path: "/services/",
    canonicalPath: route.desiredCanonicalPath || route.canonical || "/services/",
    indexable: route.indexable,
    metadataReview: !description,
  });
}

export default async function ServicesArchivePage() {
  const route = await getRouteByPath("/services/");
  const registry = await loadRouteRegistry();

  const wpServices: Array<{ path: string }> = JSON.parse(await readFile("data/wordpress/normalized/services.json", "utf8"));
  const wpOrder = new Map<string, number>(wpServices.map((s, idx) => [s.path, idx]));

  const services = registry.routes
    .filter((r) => r.wordpressType === "service" && (r.proposedAction === "KEEP_SAME_URL" || r.proposedAction === "PROTECTED"))
    .sort((a, b) => (wpOrder.get(a.path) ?? Number.MAX_SAFE_INTEGER) - (wpOrder.get(b.path) ?? Number.MAX_SAFE_INTEGER));

  const description = route?.description || "";

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services/" },
  ];

  const schemaBlocks = [
    organizationSchema({
      name: "D'Genius Solutions",
      url: "https://www.dgeniussolutions.com",
      id: "https://www.dgeniussolutions.com/#organization",
    }),
    breadcrumbSchema(breadcrumbs),
  ];

  return (
    <main className="page-main">
      <nav aria-label="Breadcrumb" className="page-breadcrumbs">
        <ol>
          {breadcrumbs.map((item, i) => (
            <li key={item.path}>
              {i > 0 && <span className="page-breadcrumbs__sep">/</span>}
              {i === breadcrumbs.length - 1 ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.path}>{item.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <article data-migration-content>
        <h1>Archives: Services</h1>

        {description && <p className="services-archive__description">{description}</p>}

        <div className="services-archive__grid">
          {services.map((service) => (
            <article key={service.path} className="services-archive__card">
              <h2>
                <Link href={service.path}>{service.title || service.path}</Link>
              </h2>
              {service.description && <p>{service.description}</p>}
            </article>
          ))}
        </div>
      </article>

      <JsonLd id="page-jsonld" value={schemaBlocks} />
    </main>
  );
}
