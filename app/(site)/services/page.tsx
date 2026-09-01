import { Metadata } from "next";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import { InnerWpMirrorPage } from "@/components/mirror/InnerWpMirrorPage";

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
  const path = "/services/";
  const blocks = (await loadContentBlocks())[path]?.blocks || [];
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services/" },
  ];
  const schemaBlocks = route
    ? buildRouteSchemas({ route, path, blocks, breadcrumbs })
    : [];

  return (
    <InnerWpMirrorPage
      path={path}
      wordpressId={route?.wordpressId || 0}
      schemaBlocks={schemaBlocks}
    />
  );
}
