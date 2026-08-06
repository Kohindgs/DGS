import ThreeCanvas from './components/ThreeCanvas';
import GsapClient from './components/GsapClient';
import PortfolioGallery from './components/PortfolioGallery';
import BlogCard from './components/BlogCard';
import { getPosts, HOME_SERVICES } from '../lib/wordpress';

export const metadata = {
  title: "Digital Marketing Agency in Mumbai — AI Video, SEO/AEO/GEO & Growth",
  description:
    "D'Genius Solutions is Mumbai's digital marketing agency for AI video production, SEO, AEO, GEO, LLM search, website development, social media, and performance marketing.",
  keywords: [
    'Digital Marketing Agency Mumbai',
    'AI Video Production',
    'AEO GEO LLM Optimization',
    'SEO Services Mumbai',
    'Performance Marketing Agency India',
  ],
  openGraph: {
    title: "D'Genius Solutions — Digital Marketing Agency in Mumbai",
    description: 'AI Video · AEO/GEO · Web Development · Performance Marketing',
    url: 'https://www.dgeniussolutions.com/',
    siteName: "D'Genius Solutions",
    locale: 'en_IN',
    type: 'website',
  },
  alternates: { canonical: '/' },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.dgeniussolutions.com/#organization',
      name: "D'Genius Solutions",
      url: 'https://www.dgeniussolutions.com/',
      logo: 'https://www.dgeniussolutions.com/logo.png',
      sameAs: [
        'https://www.linkedin.com/company/dgeniussolutions/',
        'https://www.instagram.com/dgeniussolutions/',
        'https://www.facebook.com/dgeniussolutions/',
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'SV Road',
        addressLocality: 'Khar West',
        addressRegion: 'Mumbai',
        postalCode: '400050',
        addressCountry: 'IN',
      },
    },
    {
      '@type': 'ProfessionalService',
      '@id': 'https://www.dgeniussolutions.com/#service',
      name: "D'Genius Solutions",
      priceRange: '$$$',
      telephone: '+91-9987922901',
      areaServed: ['Mumbai', 'India', 'Global'],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Digital Services',
        itemListElement: HOME_SERVICES.map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.title, url: `https://www.dgeniussolutions.com${s.href}` },
        })),
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.dgeniussolutions.com/#website',
      url: 'https://www.dgeniussolutions.com/',
      name: "D'Genius Solutions",
      publisher: { '@id': 'https://www.dgeniussolutions.com/#organization' },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://www.dgeniussolutions.com/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is AEO, GEO, and LLM Search Optimization?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "AEO and GEO optimize your brand's data graph so AI engines like Google AI Overview, Perplexity, and ChatGPT cite your brand as the authoritative source.",
          },
        },
        {
          '@type': 'Question',
          name: "How does D'Genius Solutions use AI for video production?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We combine AI video synthesis with cinema-grade post-production to create realistic AI avatars, viral short-form content, and high-converting video at scale.',
          },
        },
      ],
    },
  ],
};

export default async function HomePage() {
  let posts = [];
  try {
    const result = await getPosts({ page: 1, perPage: 3 });
    posts = result.posts;
  } catch {
    posts = [];
  }

  return (
    <>
      <GsapClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      <main>
        <section className="dgs-hero" id="hero">
          <div className="dgs-hero-bg" aria-hidden="true">
            <ThreeCanvas />
            <div className="dgs-hero-gradient-orb" />
            <div className="dgs-hero-grain" />
          </div>

          <div className="dgs-container">
            <div className="dgs-hero-content dgs-reveal">
              <div className="dgs-hero-badge">
                <span className="dgs-hero-badge-dot" />
                Digital Marketing Agency · Mumbai
              </div>

              <h1 className="dgs-hero-title">
                We build digital engines
                <br />
                <span className="dgs-gradient-text">that drive growth.</span>
              </h1>

              <p className="dgs-hero-subtitle">
                AI Video Production · SEO / AEO / GEO · High-Performance Websites · Performance Marketing · Social Media · Branding
              </p>

              <div className="dgs-hero-actions">
                <a href="/contact-us" className="dgs-btn-primary">
                  Book a Growth Audit
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3.33 8h9.34M8.67 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a href="/portfolio" className="dgs-btn-ghost">
                  View Our Work
                </a>
              </div>
            </div>

            <div className="dgs-hero-stats dgs-reveal">
              <div className="dgs-stat-item">
                <strong className="dgs-stat-value dgs-stat-number" data-value="150" data-suffix="+">
                  0
                </strong>
                <span className="dgs-stat-label">Brand Campaigns</span>
              </div>
              <div className="dgs-stat-item">
                <strong className="dgs-stat-value dgs-stat-number" data-value="34" data-suffix="+">
                  0
                </strong>
                <span className="dgs-stat-label">Years Combined Expertise</span>
              </div>
              <div className="dgs-stat-item">
                <strong className="dgs-stat-value dgs-stat-number" data-value="15" data-suffix="+">
                  0
                </strong>
                <span className="dgs-stat-label">Industries Served</span>
              </div>
              <div className="dgs-stat-item">
                <strong className="dgs-stat-value dgs-stat-number" data-value="20" data-suffix="+">
                  0
                </strong>
                <span className="dgs-stat-label">Specialists</span>
              </div>
            </div>
          </div>
        </section>

        <div className="dgs-marquee" aria-hidden="true">
          <div className="dgs-marquee-content">
            {[
              'AI Video Production',
              'SEO & AEO',
              'Generative Engine Optimization',
              'LLM Search',
              'Web Development',
              'Performance Marketing',
              'Social Media',
              'Branding & Content',
            ]
              .concat([
                'AI Video Production',
                'SEO & AEO',
                'Generative Engine Optimization',
                'LLM Search',
                'Web Development',
                'Performance Marketing',
                'Social Media',
                'Branding & Content',
              ])
              .map((text, i) => (
                <span key={`${text}-${i}`}>
                  <span className="dgs-marquee-item">{text}</span>
                  <span className="dgs-marquee-separator">·</span>
                </span>
              ))}
          </div>
        </div>

        <section className="dgs-services" id="services">
          <div className="dgs-container">
            <div className="dgs-section-header dgs-reveal">
              <span className="dgs-section-label">What We Do</span>
              <h2>
                Capabilities built for <span className="dgs-gradient-text">modern growth</span>
              </h2>
              <p>
                Service verticals engineered for traditional search, social algorithms, and generative AI engines — sourced from our live WordPress service catalog.
              </p>
            </div>

            <div className="dgs-services-grid dgs-stagger-grid">
              {HOME_SERVICES.map((s) => (
                <article key={s.num} className="dgs-service-card dgs-tilt">
                  <span className="dgs-service-number">{s.num}</span>
                  <span className="dgs-service-badge">{s.badge}</span>
                  <h3 className="dgs-service-title">{s.title}</h3>
                  <p className="dgs-service-desc">{s.desc}</p>
                  <div className="dgs-service-tags">
                    {s.tags.map((t) => (
                      <span key={t} className="dgs-service-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                  <a href={s.href} className="dgs-service-link">
                    Explore service
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3.33 8h9.34M8.67 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </article>
              ))}
            </div>

            <div className="dgs-section-cta">
              <a href="/our-services" className="dgs-btn-ghost">
                View all services
              </a>
            </div>
          </div>
        </section>

        <section className="dgs-portfolio" id="work">
          <div className="dgs-container">
            <div className="dgs-section-header dgs-reveal">
              <span className="dgs-section-label">Selected Work</span>
              <h2>
                Results that <span className="dgs-gradient-text">speak for themselves</span>
              </h2>
              <p>Featured campaigns across AI video, search dominance, web development, and performance marketing.</p>
            </div>
            <PortfolioGallery />
            <div className="dgs-section-cta">
              <a href="/portfolio" className="dgs-btn-ghost">
                Full portfolio
              </a>
              <a href="/case_studies" className="dgs-btn-ghost">
                Case studies
              </a>
            </div>
          </div>
        </section>

        <section className="dgs-authority" id="approach">
          <div className="dgs-container">
            <div className="dgs-section-header dgs-reveal">
              <span className="dgs-section-label">Our Approach</span>
              <h2>
                Next-gen search <span className="dgs-gradient-text">dominance strategy</span>
              </h2>
              <p>How we ensure your brand ranks at the top of Google Search and generative AI engines.</p>
            </div>

            <div className="dgs-authority-grid dgs-stagger-grid">
              <article className="dgs-authority-card dgs-tilt">
                <span className="dgs-authority-step">Google AI Overview</span>
                <h3 className="dgs-authority-title">Generative Engine Optimization</h3>
                <p className="dgs-authority-desc">
                  We optimize content structures, entity graphs, and structured data so Google&apos;s AI Overview features your brand in snapshot answers.
                </p>
              </article>
              <article className="dgs-authority-card dgs-tilt">
                <span className="dgs-authority-step">Perplexity & LLM Search</span>
                <h3 className="dgs-authority-title">Answer Engine Optimization</h3>
                <p className="dgs-authority-desc">
                  Directing conversational AI engines to source facts, recommendations, and citations directly from your website&apos;s semantic data graph.
                </p>
              </article>
              <article className="dgs-authority-card dgs-tilt">
                <span className="dgs-authority-step">Core Web Vitals</span>
                <h3 className="dgs-authority-title">Performance Engineering</h3>
                <p className="dgs-authority-desc">
                  Fast page loads and stable layouts to maximize quality rankings across every search and answer engine.
                </p>
              </article>
            </div>
          </div>
        </section>

        {posts.length > 0 ? (
          <section className="dgs-blog-preview" id="insights">
            <div className="dgs-container">
              <div className="dgs-section-header dgs-reveal">
                <span className="dgs-section-label">Insights</span>
                <h2>
                  Latest from the <span className="dgs-gradient-text">DGS blog</span>
                </h2>
                <p>Live articles pulled from the WordPress blog on dgeniussolutions.com.</p>
              </div>
              <div className="dgs-blog-grid">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
              <div className="dgs-section-cta">
                <a href="/blogs" className="dgs-btn-ghost">
                  View all articles
                </a>
              </div>
            </div>
          </section>
        ) : null}

        <section className="dgs-faq" id="faq">
          <div className="dgs-container">
            <div className="dgs-faq-container">
              <div className="dgs-section-header dgs-reveal">
                <span className="dgs-section-label">FAQ</span>
                <h2>
                  Frequently asked <span className="dgs-gradient-text">questions</span>
                </h2>
              </div>

              <div className="dgs-reveal">
                <details className="dgs-faq-item" open>
                  <summary className="dgs-faq-summary">
                    How does D&apos;Genius combine traditional SEO with AEO and GEO?
                    <span className="dgs-faq-icon" />
                  </summary>
                  <div className="dgs-faq-content">
                    While traditional SEO targets keyword rankings on Google SERPs, our AEO and GEO practice structures your brand&apos;s data so LLMs — Google AI Overview, Perplexity, ChatGPT — cite your company as the authoritative answer.
                  </div>
                </details>
                <details className="dgs-faq-item">
                  <summary className="dgs-faq-summary">
                    What makes your AI Video Production unique?
                    <span className="dgs-faq-icon" />
                  </summary>
                  <div className="dgs-faq-content">
                    We combine hyper-realistic AI video synthesis with cinema-grade post-production — custom AI avatars, multi-platform ratios, and scalable commercial video.
                  </div>
                </details>
                <details className="dgs-faq-item">
                  <summary className="dgs-faq-summary">
                    Do you work with businesses outside Mumbai?
                    <span className="dgs-faq-icon" />
                  </summary>
                  <div className="dgs-faq-content">
                    Yes. Headquartered in Mumbai, we serve clients across India and internationally with remote-optimized sprints, shared dashboards, and weekly strategy calls.
                  </div>
                </details>
              </div>
            </div>
          </div>
        </section>

        <section className="dgs-cta" id="contact">
          <div className="dgs-container">
            <div className="dgs-cta-card dgs-reveal">
              <span className="dgs-section-label">Ready to grow?</span>
              <h2 className="dgs-cta-title">
                Let&apos;s build your <span className="dgs-gradient-text">digital engine</span>
              </h2>
              <p className="dgs-cta-desc">
                Partner with Mumbai&apos;s digital agency to scale reach, authority, and revenue — with 100% transparency.
              </p>
              <a href="/contact-us" className="dgs-btn-primary dgs-btn-lg">
                Schedule Strategy Call
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3.33 8h9.34M8.67 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
