import Link from "next/link";
import Image from "next/image";
import type { BlogPostDetail, BlogPostMeta } from "@/lib/blog/blog-data";
import { BlogCard } from "./BlogCard";
import { BlogAudioPlayer } from "./BlogAudioPlayer";
import styles from "./Blog.module.css";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function toIsoWithTimezone(val?: string | null): string | undefined {
  if (!val) return undefined;
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return String(val);
}

function isMaterialUpdate(pub?: string, mod?: string): boolean {
  if (!pub || !mod) return false;
  try {
    const pubD = new Date(pub);
    const modD = new Date(mod);
    return Math.abs(modD.getTime() - pubD.getTime()) > 3600 * 1000;
  } catch {
    return pub.slice(0, 10) !== mod.slice(0, 10);
  }
}

type ServiceRecommendation = {
  href: string;
  anchor: string;
  summary: string;
};

function selectRelatedServices(article: BlogPostDetail): ServiceRecommendation[] {
  const hay = `${article.path} ${article.title} ${article.h1}`.toLowerCase();
  const picks: ServiceRecommendation[] = [];

  if (
    hay.includes("aeo") ||
    hay.includes("answer engine") ||
    hay.includes("ai overview") ||
    hay.includes("featured snippet") ||
    hay.includes("voice")
  ) {
    picks.push({
      href: "/services/aeo-services-in-mumbai/",
      anchor: "Answer Engine Optimization (AEO) Services in Mumbai",
      summary: "Structure your pages to win Google AI Overviews, People Also Ask, and zero-click answer citations.",
    });
  }
  if (
    hay.includes("geo") ||
    hay.includes("generative") ||
    hay.includes("chatgpt") ||
    hay.includes("perplexity") ||
    hay.includes("ai search") ||
    hay.includes("ai overview") ||
    hay.includes("ai tools")
  ) {
    picks.push({
      href: "/services/geo/",
      anchor: "Generative Engine Optimization (GEO) Services",
      summary: "Engineer entity clarity, passage citability, and brand authority across ChatGPT, Perplexity, and Gemini.",
    });
  }
  if (
    hay.includes("llm") ||
    hay.includes("schema") ||
    hay.includes("entity") ||
    hay.includes("brand mention") ||
    hay.includes("brand visibility") ||
    hay.includes("ai tools")
  ) {
    picks.push({
      href: "/services/llm-seo-service/",
      anchor: "LLM SEO & AI Knowledge Graph Optimization",
      summary: "Make your brand, services, and proof machine-readable for Large Language Models and AI agents.",
    });
  }
  if (hay.includes("web") || hay.includes("next") || hay.includes("wordpress") || hay.includes("design") || hay.includes("speed") || hay.includes("core web vitals")) {
    picks.push({
      href: "/services/website-development-amc/",
      anchor: "Custom Website Development, UI/UX & AMC in Mumbai",
      summary: "High-converting, Core Web Vitals-engineered Next.js and WordPress websites with ongoing technical AMC.",
    });
  }
  if (hay.includes("video") || hay.includes("reel") || hay.includes("avatar") || hay.includes("creative")) {
    picks.push({
      href: "/services/ai-video-production-agency/",
      anchor: "AI Video Production Agency in Mumbai",
      summary: "Broadcast-quality AI commercials, product films, and multilingual social reels with human creative direction.",
    });
  }
  if (hay.includes("ads") || hay.includes("ppc") || hay.includes("performance") || hay.includes("roas") || hay.includes("meta") || hay.includes("google ads")) {
    picks.push({
      href: "/services/performance-marketing/",
      anchor: "Performance Marketing & Paid Media Agency in Mumbai",
      summary: "ROI-engineered Google Ads, Meta Ads, conversion tracking, and landing page CRO built for qualified pipeline.",
    });
  }
  if (hay.includes("social") || hay.includes("instagram") || hay.includes("linkedin")) {
    picks.push({
      href: "/services/social-media-marketing/",
      anchor: "Social Media Marketing Agency in Mumbai",
      summary: "High-retention Reels, LinkedIn B2B authority content, and community growth strategies.",
    });
  }
  if (hay.includes("brand") || hay.includes("identity") || hay.includes("logo")) {
    picks.push({
      href: "/services/branding/",
      anchor: "Brand Strategy & Visual Identity Design in Mumbai",
      summary: "Positioning, visual identity systems, and brand guidelines for ambitious B2B and D2C companies.",
    });
  }

  const defaults: ServiceRecommendation[] = [
    {
      href: "/services/seo-services-in-mumbai/",
      anchor: "SEO Services in Mumbai & Enterprise Organic Growth",
      summary: "Full-funnel technical SEO, E-E-A-T content architecture, local dominance, and compounding search revenue.",
    },
    {
      href: "/services/aeo-services-in-mumbai/",
      anchor: "Answer Engine Optimization (AEO) Services in Mumbai",
      summary: "Capture direct answers across Google AI Overviews, ChatGPT, Perplexity, and conversational search.",
    },
    {
      href: "/services/website-development-amc/",
      anchor: "Custom Website Development & Technical AMC",
      summary: "SEO-native Next.js & WordPress websites engineered for speed, accessibility, and lead conversion.",
    },
  ];

  for (const d of defaults) {
    if (picks.length >= 3) break;
    if (!picks.some((p) => p.href === d.href)) {
      picks.push(d);
    }
  }

  return picks.slice(0, 3);
}

export function BlogArticle({
  article,
  relatedPosts,
}: {
  article: BlogPostDetail;
  relatedPosts: BlogPostMeta[];
}) {
  const rawAuthor = article.author?.trim() || "Kohin Bellara";
  const authorName =
    /editorial team|d'genius solutions/i.test(rawAuthor) ? "Kohin Bellara" : rawAuthor;
  const isoPublished = toIsoWithTimezone(article.date);
  const isoModified = toIsoWithTimezone(article.modified);
  const showUpdated = isMaterialUpdate(article.date, article.modified);
  const relatedServices = selectRelatedServices(article);

  return (
    <article className={styles.articleWrapper}>
      <div className={styles.articleContainer}>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className={styles.breadcrumbs}>
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbDivider}>/</span>
          <Link href="/blogs/">Blogs</Link>
          <span className={styles.breadcrumbDivider}>/</span>
          <span aria-current="page" className={styles.breadcrumbCurrent}>
            {article.title}
          </span>
        </nav>

        {/* Header */}
        <header className={styles.articleHeader}>
          <div className={styles.tagRow} style={{ marginBottom: "16px" }}>
            <span>{article.readingTimeMinutes} min read</span>
          </div>

          <h1 className={styles.articleH1}>{article.h1}</h1>

          <div className={styles.articleMetaBar} itemScope itemType="https://schema.org/BlogPosting">
            <div className={styles.metaItem}>
              <span>By </span>
              <Link
                href="/about-us/"
                className="author-name"
                itemProp="author"
                style={{ fontWeight: 600, color: "inherit", textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                {authorName}, Founder &amp; CEO
              </Link>
            </div>
            {isoPublished ? (
              <>
                <span>•</span>
                <div className={styles.metaItem}>
                  <span>Published: </span>
                  <time dateTime={isoPublished} itemProp="datePublished" suppressHydrationWarning>
                    {formatDate(isoPublished)}
                  </time>
                </div>
              </>
            ) : null}
            {showUpdated && isoModified ? (
              <>
                <span>•</span>
                <div className={styles.metaItem}>
                  <span>Updated: </span>
                  <time dateTime={isoModified} itemProp="dateModified" suppressHydrationWarning>
                    {formatDate(isoModified)}
                  </time>
                </div>
              </>
            ) : null}
          </div>
        </header>

        {/* Hero Featured Image — Natural aspect ratio, zero crop */}
        {article.featuredImage?.src ? (
          <div className={styles.heroImageWrap}>
            <Image
              src={article.featuredImage.src}
              alt={article.featuredImage.alt || article.title}
              width={1600}
              height={900}
              priority
              unoptimized
              sizes="(max-width: 1760px) 100vw, 1600px"
              className={styles.heroImgNatural}
            />
          </div>
        ) : null}

        {/* Full-Article Interactive Audio Narrator */}
        <BlogAudioPlayer
          title={article.h1 || article.title}
          summary={article.description}
          bodyHtml={article.bodyHtml}
          readingTimeMinutes={article.readingTimeMinutes}
        />

        {article.toc.length > 1 ? (
          <details className={styles.toc} open>
            <summary className={styles.tocSummary}>
              <span className={styles.tocLabel}>In this article</span>
              <svg
                className={styles.tocChevron}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <ol className={styles.tocList}>
              {article.toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? styles.tocSubItem : undefined}>
                  <a href={`#${item.id}`}>{item.text}</a>
                </li>
              ))}
            </ol>
          </details>
        ) : null}


        {/* Executive Direct Answer & AI Search Citation Box (Above the Fold) */}
        {article.description ? (
          <aside
            aria-label="Key takeaway and executive summary"
            className={styles.executiveBox}
          >
            <div className={styles.executiveBadgeRow}>
              <span className={styles.executiveBadgeDot} aria-hidden="true" />
              <p className={styles.executiveEyebrow}>
                Executive Takeaway &amp; 2026 Implementation Guide
              </p>
            </div>
            <p className={styles.executiveSummary}>
              <strong>Key Takeaway:</strong> {article.description}
            </p>
            {relatedServices[0] ? (
              <p className={styles.executiveLinks}>
                <strong>Looking for hands-on agency execution?</strong> Explore our{" "}
                <Link href={relatedServices[0].href} className={styles.accentLink}>
                  {relatedServices[0].anchor}
                </Link>
                {relatedServices[1] ? (
                  <>
                    {" "}or{" "}
                    <Link href={relatedServices[1].href} className={styles.accentLink}>
                      {relatedServices[1].anchor}
                    </Link>
                  </>
                ) : null}
                , backed by{" "}
                <Link href="/case_studies/" className={styles.accentLink}>
                  verified 6x organic growth case studies
                </Link>
                .
              </p>
            ) : null}
          </aside>
        ) : null}

        {/* Full Semantic Article Body (contains the original single FAQ section if present) */}
        <div
          className={styles.prose}
          dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
          suppressHydrationWarning
        />

        {/* Author E-E-A-T Credentials Box */}
        <aside aria-label="About the author" className={styles.authorBox}>
          <div className={styles.authorAvatar} aria-hidden="true">
            KB
          </div>
          <div className={styles.authorContent}>
            <p className={styles.authorTitle}>
              Written &amp; Reviewed by{" "}
              <Link href="/about-us/" className={styles.accentLink}>
                {authorName}
              </Link>{" "}
              <span className={styles.authorRole}>
                — Founder &amp; CEO,{" "}
                <Link href="/" className={styles.accentLink}>
                  {"D'Genius Solutions"}
                </Link>
              </span>
            </p>
            <p className={styles.authorBio}>
              With 13+ years of hands-on experience in technical SEO, Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), and full-funnel digital growth, Kohin has led search and revenue transformations for 75+ brands across Mumbai, India, Dubai, the US, and Australia.
            </p>
          </div>
        </aside>

        {/* Contextual Hub-and-Spoke Service Links */}
        <section
          aria-label="Related D'Genius Solutions services"
          className={styles.servicesHubSection}
        >
          <div className={styles.servicesHubHeader}>
            <span className={styles.servicesHubEyebrow}>Integrated Growth Ecosystem</span>
            <h2 className={styles.servicesHubTitle}>
              Explore Our Core Search, AI &amp; Growth Services
            </h2>
            <p className={styles.servicesHubSubtitle}>
              Ready to apply these strategies to your business? Partner with our specialist teams in Mumbai serving India, Dubai, the US, and Australia:
            </p>
          </div>
          <div className={styles.servicesHubGrid}>
            {relatedServices.map((svc) => (
              <Link key={svc.href} href={svc.href} className={styles.serviceCard}>
                <h3 className={styles.serviceCardTitle}>
                  <span>{svc.anchor}</span>
                  <span className={styles.serviceCardArrow} aria-hidden="true">&rarr;</span>
                </h3>
                <p className={styles.serviceCardSummary}>
                  {svc.summary}
                </p>
              </Link>
            ))}
          </div>
          <p className={styles.servicesHubFooter}>
            View all{" "}
            <Link href="/services/" className={styles.accentLink}>
              Digital Marketing, SEO, AEO &amp; AI Services
            </Link>{" "}
            or explore our verified{" "}
            <Link href="/case_studies/" className={styles.accentLink}>
              Client SEO &amp; Growth Case Studies
            </Link>
            .
          </p>
        </section>

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
