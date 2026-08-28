import { Metadata } from "next";
import { getRouteByPath } from "@/lib/nextjs/routes";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HomeWpMirrorPage } from "@/components/mirror/HomeWpMirrorPage";

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/");

  if (!route) {
    return { title: "D'Genius Solutions" };
  }

  return buildPageMetadata({
    title: route.title || "Digital Marketing Agency in Mumbai | D'Genius Solutions",
    description: route.description || "",
    path: "/",
    canonicalPath: route.desiredCanonicalPath || route.canonical || "/",
    indexable: route.indexable,
    metadataReview: !route.description,
  });
}

export default function HomePage() {
  return <HomeWpMirrorPage />;
}
