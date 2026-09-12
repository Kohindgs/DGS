import Link from "next/link";
import Image from "next/image";
import type { BlogPostDetail, BlogPostMeta } from "@/lib/blog/blog-data";
import { BlogCard } from "./BlogCard";
import styles from "./Blog.module.css";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export function BlogArticle({
  article,
  relatedPosts,
}: {
  article: BlogPostDetail;
  relatedPosts: BlogPostMeta[];
}) {
  return (
    <article className={styles.articleWrapper}>
      <div className={styles.articleContainer}>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className={styles.breadcrumbs}>
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbDivider}>/</span>
          <Link href="/blogs/">Blogs</Link>
          <span className={styles.breadcrumbDivider}>/</span>
          <span aria-current="page" style={{ color: "#fff" }}>
            {article.title}
          </span>
        </nav>

        {/* Header */}
        <header className={styles.articleHeader}>
          <div className={styles.tagRow} style={{ marginBottom: "16px" }}>
            <span>{article.readingTimeMinutes} min read</span>
          </div>

          <h1 className={styles.articleH1}>{article.h1}</h1>

          {article.date ? (
            <div className={styles.articleMetaBar}>
              <div className={styles.metaItem}>
                <span>Published:</span>
                <time dateTime={article.date}>{formatDate(article.date)}</time>
              </div>
              {article.modified && article.modified !== article.date ? (
                <>
                  <span>•</span>
                  <div className={styles.metaItem}>
                    <span>Updated:</span>
                    <time dateTime={article.modified}>{formatDate(article.modified)}</time>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </header>

        {/* Hero Featured Image */}
        {article.featuredImage?.src ? (
          <div className={styles.heroImageWrap}>
            <Image
              src={article.featuredImage.src}
              alt={article.featuredImage.alt || article.title}
              fill
              priority
              sizes="(max-width: 880px) 100vw, 880px"
              className={styles.featuredImg}
            />
          </div>
        ) : null}

        {/* Full Semantic Article Body (contains the original single FAQ section if present) */}
        <div
          className={styles.prose}
          dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
        />

        {/* Free Consultation CTA */}
        <section aria-label="Strategy consultation" className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>Accelerate Your Digital &amp; Search Growth</h2>
          <p className={styles.ctaText}>
            Speak directly with our Mumbai-based SEO, AI search, and digital marketing strategists for a bespoke growth audit.
          </p>
          <Link href="/contact-us/" className={styles.ctaButton}>
            Get a Free Strategy Audit <span aria-hidden="true">&rarr;</span>
          </Link>
        </section>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 ? (
          <section aria-label="Related insights" className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Related Insights</h2>
            <div className={styles.grid}>
              {relatedPosts.map((post) => (
                <BlogCard key={post.path} post={post} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
