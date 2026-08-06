import PageHero from '../../components/PageHero';
import BlogCard from '../../components/BlogCard';
import { getPosts } from '../../../lib/wordpress';

export const revalidate = 300;

export const metadata = {
  title: 'Blogs',
  description: "Insights on SEO, AEO, GEO, AI search, and digital marketing from D'Genius Solutions.",
  alternates: { canonical: '/blogs' },
};

export default async function BlogsIndex({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);
  let posts = [];
  let totalPages = 1;

  try {
    const result = await getPosts({ page, perPage: 12 });
    posts = result.posts;
    totalPages = result.totalPages || 1;
  } catch {
    posts = [];
  }

  return (
    <main>
      <PageHero
        eyebrow="Insights"
        title="DGS Blog"
        subtitle="Practical thinking on AI search, SEO, content, and growth — live from WordPress."
      />

      <section className="dgs-content-section">
        <div className="dgs-container">
          {posts.length === 0 ? (
            <p className="dgs-empty">No posts found. Check the WordPress API connection.</p>
          ) : (
            <div className="dgs-blog-grid">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="dgs-pagination" aria-label="Blog pagination">
              {page > 1 ? (
                <a className="dgs-btn-ghost" href={page === 2 ? '/blogs' : `/blogs?page=${page - 1}`}>
                  Previous
                </a>
              ) : (
                <span />
              )}
              <span className="dgs-pagination-status">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <a className="dgs-btn-ghost" href={`/blogs?page=${page + 1}`}>
                  Next
                </a>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </div>
      </section>
    </main>
  );
}
