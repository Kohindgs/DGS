import { getExcerpt, getFeaturedImage, getTitle } from '../../lib/wordpress';

export default function BlogCard({ post }) {
  const title = getTitle(post);
  const excerpt = getExcerpt(post, 140);
  const image = getFeaturedImage(post);
  const date = post?.date
    ? new Date(post.date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <a href={`/blogs/${post.slug}`} className="dgs-blog-card">
      <div className="dgs-blog-card-media">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" loading="lazy" />
        ) : (
          <div className="dgs-blog-card-fallback" aria-hidden="true" />
        )}
      </div>
      <div className="dgs-blog-card-body">
        {date ? <time className="dgs-blog-card-date">{date}</time> : null}
        <h3 className="dgs-blog-card-title">{title}</h3>
        <p className="dgs-blog-card-excerpt">{excerpt}</p>
        <span className="dgs-blog-card-link">
          Read article
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.33 8h9.34M8.67 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </a>
  );
}
