import { Metadata } from "next";
import { loadRouteRegistry, getRouteByPath } from "@/lib/nextjs/routes";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { organizationSchema, breadcrumbSchema } from "@/lib/schema/builders";
import { readFile } from "node:fs/promises";
import { ServicesArchiveTemplate } from "@/components/templates/ServicesArchiveTemplate";

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

  const wpServices: Array<{ path: string }> = JSON.parse(
    await readFile("data/wordpress/normalized/services.json", "utf8"),
  );
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
    <ServicesArchiveTemplate
      heading={route?.h1 || "Archives: Services"}
      description={description}
      services={services}
      breadcrumbs={breadcrumbs}
      schemaBlocks={schemaBlocks}
    />
  );
}
