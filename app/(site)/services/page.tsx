import { Metadata } from "next";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import { getPageSeoOverride } from "@/lib/seo/page-overrides";
import { InnerWpMirrorPage } from "@/components/mirror/InnerWpMirrorPage";

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/services/");
  const override = getPageSeoOverride("/services/");

  if (!route && !override) {
    return { title: "Services" };
  }

  const title = override?.title || route?.title || "Services";
  const description = override?.description || route?.description || "";

  return buildPageMetadata({
    title,
    description,
    ogTitle: override?.ogTitle,
    twitterTitle: override?.twitterTitle,
    path: "/services/",
    canonicalPath: route?.desiredCanonicalPath || route?.canonical || "/services/",
    indexable: route ? route.indexable : true,
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
