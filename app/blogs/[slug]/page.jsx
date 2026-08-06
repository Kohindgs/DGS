import { notFound } from 'next/navigation';
import PageHero from '../../components/PageHero';
import WpContent from '../../components/WpContent';
import {
  getPostBySlug,
  getPosts,
  getTitle,
  getExcerpt,
  getFeaturedImage,
  prepareWpHtml,
  wpMetadata,
} from '../../../lib/wordpress';

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const { posts } = await getPosts({ page: 1, perPage: 100, embed: false });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) return { title: 'Post not found' };
    return {
      ...wpMetadata(post, { path: `/blogs/${slug}` }),
      openGraph: {
        ...wpMetadata(post, { path: `/blogs/${slug}` }).openGraph,
        type: 'article',
      },
    };
  } catch {
    return { title: 'Blog' };
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }
  if (!post) notFound();

  const title = getTitle(post);
  const subtitle = getExcerpt(post, 180);
  const image = getFeaturedImage(post);
  const html = prepareWpHtml(post.content?.rendered || '');
  const date = post.date
    ? new Date(post.date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <main>
      <PageHero
        eyebrow={date || 'Blog'}
        title={title}
        subtitle={subtitle}
        actions={
          <a href="/blogs" className="dgs-btn-ghost">
            ← All articles
          </a>
        }
      />

      <section className="dgs-content-section">
        <div className="dgs-container dgs-content-container dgs-content-container--narrow">
          {image ? (
            <div className="dgs-article-feature">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" />
            </div>
          ) : null}
          <WpContent html={html} className="dgs-wp-content--article" />
        </div>
      </section>
    </main>
  );
}
