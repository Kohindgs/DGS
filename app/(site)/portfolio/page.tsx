import { Metadata } from "next";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import { InnerWpMirrorPage } from "@/components/mirror/InnerWpMirrorPage";

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/portfolio/");
  if (!route) return { title: "Portfolio" };

  return buildPageMetadata({
    title: route.title || "Portfolio",
    description: route.description || "",
    path: "/portfolio/",
    canonicalPath: "/portfolio/",
    indexable: route.indexable,
  });
}

export default async function PortfolioPage() {
  const route = await getRouteByPath("/portfolio/");
  const path = "/portfolio/";
  const blocks = (await loadContentBlocks())[path]?.blocks || [];
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio/" },
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
