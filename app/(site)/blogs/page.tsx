import { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog/blog-data";
import { BlogArchive } from "@/components/blog/BlogArchive";
import { BlogWpChrome } from "@/components/blog/BlogWpChrome";
import { JsonLd } from "@/components/seo/JsonLd";
import type { JsonLdValue } from "@/lib/schema/jsonld";
import { buildGlobalEntitySchemas } from "@/lib/schema/page-schemas";
import { blogArchiveSchema, breadcrumbSchema, webPageSchema } from "@/lib/schema/builders";
import { ORGANIZATION_ID } from "@/lib/schema/entity";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { cmsBlogToPublicPost, listPublishedCmsBlogs } from "@/lib/cms/blogs";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Blogs - D'Genius Solutions",
    description: "Strategic thinking on SEO, AI search, and digital growth.",
    path: "/blogs/",
    canonicalPath: "/blogs/",
    indexable: true,
    type: "website",
  });
}

export default async function BlogsArchivePage() {
  let posts = await getAllBlogPosts();

  if (isCmsDatabaseConfigured()) {
    try {
      const nativeBlogs = await listPublishedCmsBlogs(200);
      const nativePosts = nativeBlogs
        .map(cmsBlogToPublicPost)
        .filter((post): post is NonNullable<typeof post> => post !== null);

      const existingPaths = new Set(posts.map((post) => post.path));
      const newNativePosts = nativePosts.filter((post) => !existingPaths.has(post.path));

      // Native CMS posts appear first, followed by historical migrated posts
      posts = [...newNativePosts, ...posts];
    } catch (err) {
      console.warn("Failed to load native CMS blogs in archive:", err);
    }
  }

  const blogSchemas = [
    ...buildGlobalEntitySchemas(),
    webPageSchema({
      name: "Blogs - D'Genius Solutions",
      description: "Strategic thinking on SEO, AI search, and digital growth.",
      path: "/blogs/",
      organizationId: ORGANIZATION_ID,
    }),
    blogArchiveSchema({
      name: "Blogs - D'Genius Solutions",
      description: "Strategic thinking on SEO, AI search, and digital growth.",
      path: "/blogs/",
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
      <BlogWpChrome>
        <BlogArchive posts={posts} />
      </BlogWpChrome>
    </>
  );
}
