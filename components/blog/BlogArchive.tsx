import Link from "next/link";
import Image from "next/image";
import type { BlogPostMeta } from "@/lib/blog/blog-data";
import { BlogCard } from "./BlogCard";
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

export function BlogArchive({ posts }: { posts: BlogPostMeta[] }) {
  const featured = posts[0];
  const gridPosts = posts.slice(1);

  return (
    <div className={styles.archiveWrapper}>
      <div className={styles.archiveContainer}>
        {/* Hero Section */}
        <header className={styles.hero}>
          <div className={styles.heroBadge}>
            <span>D&apos;Genius Insights</span>
          </div>
          <h1 className={styles.heroTitle}>
            Strategic Thinking on <span className={styles.heroGradText}>SEO, AI Search &amp; Growth</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Actionable perspectives, deep-dives, and modern digital strategies curated by our Mumbai team.
          </p>
        </header>

        {/* Featured Article Banner */}
        {featured ? (
          <section aria-label="Featured article" className={styles.featuredBanner}>
            <Link href={featured.path} className={styles.featuredImgWrap} tabIndex={-1} aria-hidden="true">
              <Image
                src={featured.featuredImage.src}
                alt={featured.featuredImage.alt || featured.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className={styles.featuredImg}
              />
            </Link>

            <div className={styles.featuredMeta}>
              <div className={styles.tagRow}>
                <span className={styles.categoryTag}>{featured.category}</span>
                <span>•</span>
                <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                <span>•</span>
                <span>{featured.readingTimeMinutes} min read</span>
              </div>

              <h2 className={styles.featuredTitle}>
                <Link href={featured.path}>{featured.title}</Link>
              </h2>

              <p className={styles.featuredExcerpt}>{featured.description}</p>

              <div>
                <Link href={featured.path} className={styles.readMoreBtn}>
                  Read Article <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {/* All Articles Grid */}
        <section aria-label="All insights">
          <div className={styles.grid}>
            {gridPosts.map((post) => (
              <BlogCard key={post.path} post={post} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
