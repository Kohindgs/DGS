import Link from "next/link";
import { formatDisplayDate, type RelatedPost } from "@/lib/content/related-posts";

export function RelatedPosts({ posts }: { posts: RelatedPost[] }) {
  if (posts.length === 0) return null;

  return (
    <aside className="related-posts" aria-label="Related articles">
      <div className="related-posts__inner">
        <p className="related-posts__eyebrow">Keep reading</p>
        <ul className="related-posts__grid">
          {posts.map((post) => {
            const dateLabel = formatDisplayDate(post.date);
            return (
              <li key={post.path}>
                <article className="related-posts__card">
                  {dateLabel ? <p className="related-posts__date">{dateLabel}</p> : null}
                  <p className="related-posts__title">
                    <Link href={post.path}>{post.title}</Link>
                  </p>
                  {post.description ? <p className="related-posts__excerpt">{post.description}</p> : null}
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
