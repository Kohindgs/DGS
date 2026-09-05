import { notFound } from "next/navigation";
import { Metadata } from "next";
import { loadRouteRegistry, getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import { slugToPath } from "@/lib/nextjs/path";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { assertProtectedRouteSearchPolicy } from "@/lib/migration/search-policy";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import { getRetiredRoute } from "@/lib/migration/retired-routes";
import { getRouteDecision, shouldExcludeFromStaticGeneration } from "@/lib/migration/route-decisions";
import { applyRankingLinkRestorations } from "@/lib/migration/ranking-link-restorations";
import { applyTechnicalLinkCorrections } from "@/lib/migration/technical-link-corrections";
import { InnerWpMirrorPage } from "@/components/mirror/InnerWpMirrorPage";
import { buildPageBreadcrumbs } from "@/lib/navigation/page-breadcrumbs";

export async function generateStaticParams() {
  const { routes } = await loadRouteRegistry();
  return routes
    .filter((r) => r.proposedAction === "KEEP_SAME_URL" || r.proposedAction === "PROTECTED")
    .filter((r) => r.path !== "/")
    .filter((r) => !getRetiredRoute(r.path))
    .filter((r) => !shouldExcludeFromStaticGeneration(r.path))
    .map((r) => ({ slug: r.path.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = slugToPath(slug || []);
  const route = await getRouteByPath(path);

  if (!route) {
    return { title: "Not Found" };
  }

  const decision = getRouteDecision(path);
  const title = route.title || "Page";
  const description = route.description || "";
  const canonicalFromRoute = route.desiredCanonicalPath || route.canonical || path;
  const canonicalPath = decision?.canonicalPath || canonicalFromRoute;

  return buildPageMetadata({
    title,
    description,
    path,
    canonicalPath: canonicalPath.startsWith("http")
      ? new URL(canonicalPath).pathname
      : canonicalPath,
    indexable: decision?.indexable ?? route.indexable,
    metadataReview: !description,
  });
}

export default async function DynamicPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const path = slugToPath(slug || []);
  const route = await getRouteByPath(path);

  if (!route) {
    notFound();
  }

  if (route.protected) {
    assertProtectedRouteSearchPolicy({
      path: route.path,
      canonicalPath: route.desiredCanonicalPath || route.canonical || route.path,
      indexable: route.indexable,
      includeInSitemap: route.includeInSitemap,
    });
  }

  const blocks = (await loadContentBlocks())[path]?.blocks || [];
  const restoredBlocks = applyTechnicalLinkCorrections(
    path,
    applyRankingLinkRestorations(path, blocks),
  );
  const breadcrumbs = buildPageBreadcrumbs(path, route);
  const schemaBlocks = buildRouteSchemas({ route, path, blocks: restoredBlocks, breadcrumbs });

  return <InnerWpMirrorPage path={path} wordpressId={route.wordpressId} schemaBlocks={schemaBlocks} />;
}
