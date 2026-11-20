import { notFound, permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPageSeoOverride } from "@/lib/seo/page-overrides";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/blog/blog-data";
import { BlogArticle } from "@/components/blog/BlogArticle";
import { BlogWpChrome } from "@/components/blog/BlogWpChrome";
import { JsonLd } from "@/components/seo/JsonLd";
import type { JsonLdValue } from "@/lib/schema/jsonld";
import { buildGlobalEntitySchemas } from "@/lib/schema/page-schemas";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  webPageSchema,
} from "@/lib/schema/builders";
import { ORGANIZATION_ID, WEBSITE_ID } from "@/lib/schema/entity";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import {
  cmsBlogToPublicPost,
  getPublishedCmsBlogBySlug,
  getCmsBlogBySlug,
} from "@/lib/cms/blogs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = (rawSlug || "").replace(/^\/blogs\/|\/$/g, "");
  const path = `/blogs/${slug}/`;
  const seoOverride = getPageSeoOverride(path);

  if (isCmsDatabaseConfigured()) {
    try {
      const cmsBlog = await getPublishedCmsBlogBySlug(slug);
      const rawArticle = cmsBlog ? cmsBlogToPublicPost(cmsBlog) : null;
      const article = rawArticle
        ? {
            ...rawArticle,
            title: seoOverride?.title || rawArticle.title,
            description: seoOverride?.description || rawArticle.description,
            modified: seoOverride ? "2026-11-14T18:00:00Z" : rawArticle.modified,
          }
        : null;
      if (article) {
        return buildPageMetadata({
          title: seoOverride?.title || article.title,
          description: seoOverride?.description || article.description,
          ogTitle: seoOverride?.ogTitle,
          twitterTitle: seoOverride?.twitterTitle,
          path: article.path,
          canonicalPath: article.canonical || article.path,
          indexable: true,
          image: article.featuredImage?.src,
          type: "article",
        });
      }

      // Check if draft, review, or trashed
      const cmsSummary = await getCmsBlogBySlug(slug);
      if (cmsSummary) {
        return {
          title: "Not Found",
          robots: { index: false, follow: false },
        };
      }
    } catch {
      // Fall through to legacy check
    }
  }

  // Check legacy blog data
  const legacyArticle = await getBlogPostBySlug(path);
  if (legacyArticle) {
    return buildPageMetadata({
      title: seoOverride?.title || legacyArticle.title,
      description: seoOverride?.description || legacyArticle.description,
      ogTitle: seoOverride?.ogTitle,
      twitterTitle: seoOverride?.twitterTitle,
      path: legacyArticle.path,
      canonicalPath: legacyArticle.canonical || legacyArticle.path,
      indexable: true,
      image: legacyArticle.featuredImage?.src,
      type: "article",
    });
  }

  return {
    title: "Not Found",
    robots: { index: false, follow: false },
  };
}

export default async function BlogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = (rawSlug || "").replace(/^\/blogs\/|\/$/g, "");
  const path = `/blogs/${slug}/`;
  const seoOverride = getPageSeoOverride(path);

  if (isCmsDatabaseConfigured()) {
    try {
      const cmsSummary = await getCmsBlogBySlug(slug);
      if (cmsSummary) {
        if (cmsSummary.status === "trashed") {
          if (cmsSummary.redirect_url) {
            permanentRedirect(cmsSummary.redirect_url);
          }
          notFound();
        }
        if (cmsSummary.status !== "published") {
          notFound();
        }
      }

      const cmsBlog = await getPublishedCmsBlogBySlug(slug);
      const rawArticle = cmsBlog ? cmsBlogToPublicPost(cmsBlog) : null;
      const article = rawArticle
        ? {
            ...rawArticle,
            title: seoOverride?.title || rawArticle.title,
            description: seoOverride?.description || rawArticle.description,
            modified: seoOverride ? "2026-11-14T18:00:00Z" : rawArticle.modified,
          }
        : null;
      if (article) {
        const relatedPosts = await getRelatedBlogPosts(path, 3);
        const breadcrumbItems = [
          { name: "Home", path: "/" },
          { name: "Blogs", path: "/blogs/" },
          { name: article.title, path: article.path },
        ];
        const blogPostingSchema = articleSchema({
          headline: article.h1 || article.title,
          description: article.description,
          path: article.path,
          datePublished: article.date,
          dateModified: article.modified,
          publisherId: ORGANIZATION_ID,
          authorName: article.author,
          imageUrl: article.featuredImage?.src,
        });

        const companionSchemas: Record<string, unknown>[] = [
          ...buildGlobalEntitySchemas(),
          webPageSchema({
            name: article.title,
            description: article.description,
            path: article.path,
            organizationId: ORGANIZATION_ID,
            websiteId: WEBSITE_ID,
          }),
          breadcrumbSchema(breadcrumbItems),
        ];

        if (article.faqs.length > 0) {
          companionSchemas.push(
            faqSchema(article.faqs.map((f) => ({ question: f.question, answer: f.answer })))
          );
        }

        return (
          <>
            <JsonLd id="schema-blogposting" value={blogPostingSchema as unknown as JsonLdValue} />
            <JsonLd
              id="schema-graph"
              value={{ "@context": "https://schema.org", "@graph": companionSchemas } as unknown as JsonLdValue}
            />
            <BlogWpChrome>
              <BlogArticle article={article} relatedPosts={relatedPosts} />
            </BlogWpChrome>
          </>
        );
      }
    } catch (err) {
      if ((err as any)?.digest?.startsWith("NEXT_REDIRECT") || (err as any)?.digest?.startsWith("NEXT_NOT_FOUND")) {
        throw err;
      }
    }
  }

  // Fallback to legacy static blog data
  const rawLegacyArticle = await getBlogPostBySlug(path);
  const legacyArticle = rawLegacyArticle
    ? {
        ...rawLegacyArticle,
        title: seoOverride?.title || rawLegacyArticle.title,
        description: seoOverride?.description || rawLegacyArticle.description,
        modified: seoOverride ? "2026-11-14T18:00:00Z" : rawLegacyArticle.modified,
      }
    : null;
  if (legacyArticle) {
    const relatedPosts = await getRelatedBlogPosts(path, 3);
    const breadcrumbItems = [
      { name: "Home", path: "/" },
      { name: "Blogs", path: "/blogs/" },
      { name: legacyArticle.title, path: legacyArticle.path },
    ];
    const blogPostingSchema = articleSchema({
      headline: legacyArticle.h1 || legacyArticle.title,
      description: legacyArticle.description,
      path: legacyArticle.path,
      datePublished: legacyArticle.date,
      dateModified: legacyArticle.modified,
      publisherId: ORGANIZATION_ID,
      authorName: legacyArticle.author,
      imageUrl: legacyArticle.featuredImage?.src,
    });

    const companionSchemas: Record<string, unknown>[] = [
      ...buildGlobalEntitySchemas(),
      webPageSchema({
        name: legacyArticle.title,
        description: legacyArticle.description,
        path: legacyArticle.path,
        organizationId: ORGANIZATION_ID,
        websiteId: WEBSITE_ID,
      }),
      breadcrumbSchema(breadcrumbItems),
    ];

    if (legacyArticle.faqs.length > 0) {
      companionSchemas.push(
        faqSchema(legacyArticle.faqs.map((f) => ({ question: f.question, answer: f.answer })))
      );
    }

    return (
      <>
        <JsonLd id="schema-blogposting" value={blogPostingSchema as unknown as JsonLdValue} />
        <JsonLd
          id="schema-graph"
          value={{ "@context": "https://schema.org", "@graph": companionSchemas } as unknown as JsonLdValue}
        />
        <BlogWpChrome>
          <BlogArticle article={legacyArticle} relatedPosts={relatedPosts} />
        </BlogWpChrome>
      </>
    );
  }

  notFound();
}
