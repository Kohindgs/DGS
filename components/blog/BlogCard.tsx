import Link from "next/link";
import Image from "next/image";
import type { BlogPostMeta } from "@/lib/blog/blog-data";
import styles from "./Blog.module.css";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export function BlogCard({ post }: { post: BlogPostMeta }) {
  return (
    <article className={styles.card}>
      <Link href={post.path} className={styles.cardImgWrap} tabIndex={-1} aria-hidden="true">
        <Image
          src={post.featuredImage.src}
          alt={post.featuredImage.alt || post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.cardImg}
          loading="lazy"
        />
      </Link>

      <div className={styles.cardContent}>
        <div className={styles.tagRow}>
          <span className={styles.categoryTag}>{post.category}</span>
          <span>•</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>•</span>
          <span>{post.readingTimeMinutes} min read</span>
        </div>

        <h3 className={styles.cardTitle}>
          <Link href={post.path}>{post.title}</Link>
        </h3>

        <p className={styles.cardExcerpt}>{post.description}</p>

        <div className={styles.cardFooter}>
          <Link href={post.path} className={styles.readMoreBtn} aria-label={`Read article: ${post.title}`}>
            Read Article <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
