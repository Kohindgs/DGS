import Link from "next/link";
import type { RouteRecord } from "@/lib/nextjs/routes";
import type { BreadcrumbItem } from "@/lib/schema/builders";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { PageCtaBand } from "./PageCtaBand";

type ServicesArchiveTemplateProps = {
  heading: string;
  description: string;
  services: RouteRecord[];
  breadcrumbs: BreadcrumbItem[];
  schemaBlocks: Record<string, unknown>[];
};

export function ServicesArchiveTemplate({
  heading,
  description,
  services,
  breadcrumbs,
  schemaBlocks,
}: ServicesArchiveTemplateProps) {
  return (
    <main className="page-main inner-page inner-page--archive" id="main-content">
      <PageBreadcrumbs items={breadcrumbs} />

      <article data-migration-content>
        <header className="inner-hero">
          <div className="container readable-copy">
            <p className="inner-hero__eyebrow">What we do</p>
            <h1>{heading}</h1>
            {description ? <p className="inner-hero__lead">{description}</p> : null}
          </div>
        </header>

        <div className="container">
          <div className="services-archive__grid">
            {services.map((service) => (
              <div key={service.path} className="services-archive__card">
                <h2>
                  <Link href={service.path}>{service.title || service.path}</Link>
                </h2>
                {service.description ? <p>{service.description}</p> : null}
                <p className="services-archive__link">
                  <Link href={service.path}>View service</Link>
                </p>
              </div>
            ))}
          </div>
        </div>
      </article>

      <PageCtaBand />
      <JsonLd id="page-jsonld" value={schemaBlocks} />
    </main>
  );
}
