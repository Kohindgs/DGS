import { Metadata } from "next";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { PortfolioPageTemplate } from "@/components/templates/PortfolioPage";

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

export default function PortfolioPage() {
  return <PortfolioPageTemplate />;
}
