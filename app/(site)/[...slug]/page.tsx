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
import { getAllBlogPosts, getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/blog/blog-data";
import { BlogArchive } from "@/components/blog/BlogArchive";
import { BlogArticle } from "@/components/blog/BlogArticle";
import { JsonLd } from "@/components/seo/JsonLd";
import type { JsonLdValue } from "@/lib/schema/jsonld";
import { buildGlobalEntitySchemas } from "@/lib/schema/page-schemas";
import {
  articleSchema,
  blogArchiveSchema,
  breadcrumbSchema,
  faqSchema,
  webPageSchema,
} from "@/lib/schema/builders";
import { ORGANIZATION_ID, WEBSITE_ID } from "@/lib/schema/entity";

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

  if (path === "/blogs/") {
    const posts = await getAllBlogPosts();
    const blogSchemas = [
      ...buildGlobalEntitySchemas(),
      webPageSchema({
        name: route.title || "Blogs - D'Genius Solutions",
        description: route.description || "Strategic thinking on SEO, AI search, and digital growth.",
        path,
        organizationId: ORGANIZATION_ID,
      }),
      blogArchiveSchema({
        name: route.title || "Blogs - D'Genius Solutions",
        description: route.description || "Strategic thinking on SEO, AI search, and digital growth.",
        path,
        organizationId: ORGANIZATION_ID,
        posts: posts.map((p, idx) => ({ name: p.title, path: p.path, position: idx + 1 })),
      }),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Blogs", path: "/blogs/" },
      ]),
    ];

    return (
      <>
        <JsonLd value={blogSchemas as unknown as JsonLdValue} />
        <BlogArchive posts={posts} />
      </>
    );
  }

  if (path.startsWith("/blogs/") && path !== "/blogs/") {
    const article = await getBlogPostBySlug(path);
    if (!article) {
      notFound();
    }
    const relatedPosts = await getRelatedBlogPosts(path, 3);
    const breadcrumbItems = [
      { name: "Home", path: "/" },
      { name: "Blogs", path: "/blogs/" },
      { name: article.title, path: article.path },
    ];
    const articleSchemas: Record<string, unknown>[] = [
      ...buildGlobalEntitySchemas(),
      webPageSchema({
        name: article.title,
        description: article.description,
        path: article.path,
        organizationId: ORGANIZATION_ID,
        websiteId: WEBSITE_ID,
      }),
      breadcrumbSchema(breadcrumbItems),
      articleSchema({
        headline: article.h1 || article.title,
        description: article.description,
        path: article.path,
        datePublished: article.date,
        dateModified: article.modified,
        publisherId: ORGANIZATION_ID,
        imageUrl: article.featuredImage?.src,
      }),
    ];

    if (article.faqs.length > 0) {
      articleSchemas.push(
        faqSchema(article.faqs.map((f) => ({ question: f.question, answer: f.answer }))),
      );
    }

    return (
      <>
        <JsonLd value={articleSchemas as unknown as JsonLdValue} />
        <BlogArticle article={article} relatedPosts={relatedPosts} />
      </>
    );
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
