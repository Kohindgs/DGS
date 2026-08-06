import ThreeCanvas from './components/ThreeCanvas';
import GsapClient from './components/GsapClient';
import PortfolioGallery from './components/PortfolioGallery';
import BlogCard from './components/BlogCard';
import { getPosts } from '../lib/wordpress';

export const metadata = {
  title: 'Full Service Digital Marketing Agency in Mumbai',
  description:
    "D'Genius Solutions is a full service digital marketing agency in Mumbai helping brands grow through connected search, websites, social media, paid campaigns, branding and AI-led creative production.",
  keywords: [
    'Digital Marketing Agency Mumbai',
    'SEO AEO GEO Mumbai',
    'AI Video Production',
    'Performance Marketing Agency',
    'Website Development Mumbai',
  ],
  openGraph: {
    title: "D'Genius Solutions — Full Service Digital Marketing Agency in Mumbai",
    description:
      'Search, websites, social, performance marketing, branding and AI-led creative — one connected growth team.',
    url: 'https://www.dgeniussolutions.com/',
    siteName: "D'Genius Solutions",
    locale: 'en_IN',
    type: 'website',
  },
  alternates: { canonical: '/' },
};

const PILLARS = [
  {
    num: '01',
    title: 'Search Visibility & AI Discovery',
    desc: 'Search strategy, technical foundations, content structure and AI-search readiness designed to improve how brands are discovered across Google and emerging answer platforms.',
    links: [
      { href: '/services/seo-services-in-mumbai', label: 'SEO' },
      { href: '/services/aeo-services-in-mumbai', label: 'AEO' },
      { href: '/services/geo', label: 'GEO' },
      { href: '/services/llm-seo-service', label: 'LLM SEO' },
    ],
  },
  {
    num: '02',
    title: 'Website Development & AMC',
    desc: 'High-performance websites and ongoing maintenance so your site stays fast, conversion-ready, and structured for search and AI discovery.',
    links: [{ href: '/services/website-development-amc', label: 'Web & AMC' }],
  },
  {
    num: '03',
    title: 'Social Media & Performance Marketing',
    desc: 'Organic social systems plus paid Google and Meta funnels engineered for qualified leads, sales, and measurable ROI.',
    links: [
      { href: '/services/social-media-marketing', label: 'Social' },
      { href: '/services/performance-marketing', label: 'Performance' },
    ],
  },
  {
    num: '04',
    title: 'Branding, Content & AI Production',
    desc: 'Brand identity, content systems, and AI-led creative production for campaigns, product stories, and social content.',
    links: [
      { href: '/services/branding', label: 'Branding' },
      { href: '/services/content-creation', label: 'Content' },
      { href: '/services/ai-video-production-agency', label: 'AI Video' },
    ],
  },
];

const AI_CAPABILITIES = [
  { title: 'AI Video Production', desc: 'Campaign films, product stories and social-ready video at brand-controlled quality.' },
  { title: 'AI Product Visuals', desc: 'Product imagery and launch assets produced faster without losing brand polish.' },
  { title: 'Mascot & Character AI', desc: 'Characters and mascots that stay consistent across campaigns and platforms.' },
  { title: 'Festival & Topical Content', desc: 'Seasonal and moment-based creative that ships while the conversation is live.' },
];

const SEARCH_STACK = [
  { title: 'SEO', desc: 'Rank-ready website and content foundations.' },
  { title: 'AEO', desc: 'Built for answer-first discovery.' },
  { title: 'GEO', desc: 'Visibility for generative search experiences.' },
  { title: 'LLM SEO', desc: 'Clear entities, services and brand context.' },
  { title: 'Voice', desc: 'Natural answers for spoken queries.' },
  { title: 'AI Creative', desc: 'Faster creative output with brand control.' },
];

const WHY_US = [
  { title: 'Strategy', desc: 'One connected plan across search, web, creative and performance — not disconnected vendors.' },
  { title: 'Search', desc: 'Traditional SEO plus AEO, GEO and LLM readiness for Google and AI answer engines.' },
  { title: 'Creative', desc: 'Brand systems and AI-led production that keep campaigns consistent and fast.' },
  { title: 'Scale', desc: 'Built to grow with you — from foundation work to multi-channel execution.' },
];

const BRANDS = [
  'TheWorldGrad',
  'Weavings Manpower',
  'Kotak Mahindra',
  'Eureka Forbes',
  'Onida',
  'Pantaloons',
  'DSP Mutual Fund',
  'Home Credit',
];

const AWARDS = [
  { org: 'Prime Insights · 2024', title: 'Best Place to Work' },
  { org: 'Corporate Connect · 2024-25', title: 'Highly Regarded Digital Marketing Agency to Watch Out' },
  { org: 'GLA · 2025', title: 'Excellence in SEO, Content & Performance Marketing' },
];

const FAQS = [
  {
    q: 'What does a full service digital marketing agency in Mumbai actually cover?',
    a: 'At D’Genius Solutions that means connected search (SEO, AEO, GEO, LLM), websites, social media, performance marketing, branding, content and AI-led creative production — working as one growth system.',
  },
  {
    q: 'How is AEO and GEO different from traditional SEO?',
    a: 'SEO targets rankings on Google results. AEO and GEO structure your brand so AI engines — Google AI Overviews, Perplexity, ChatGPT — cite and recommend you in generated answers.',
  },
  {
    q: 'Do you only work with Mumbai brands?',
    a: 'We are Mumbai-based and serve clients across India and internationally, with remote-ready workflows, shared dashboards and weekly strategy calls.',
  },
  {
    q: 'What should we start with — a growth audit or a specific service?',
    a: 'Most brands begin with a growth audit of website, search visibility and campaign flow so we can prioritize the highest-impact work first.',
  },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.dgeniussolutions.com/#organization',
      name: "D'Genius Solutions",
      url: 'https://www.dgeniussolutions.com/',
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
      telephone: '+91-9987922901',
      areaServed: ['Mumbai', 'India', 'Global'],
      description:
        'Full service digital marketing agency in Mumbai for search, websites, social, performance marketing, branding and AI production.',
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
};

const MARQUEE = [
  'SEO',
  'AEO',
  'GEO',
  'LLM SEO',
  'Website Development',
  'Performance Marketing',
  'Social Media',
  'AI Video',
  'Branding',
  'Content',
];

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
        {/* HERO — brand first, one composition */}
        <section className="dgs-hero" id="hero">
          <div className="dgs-hero-bg" aria-hidden="true">
            <ThreeCanvas />
            <div className="dgs-hero-gradient-orb" />
            <div className="dgs-hero-grain" />
          </div>

          <div className="dgs-container">
            <div className="dgs-hero-content dgs-reveal">
              <p className="dgs-hero-brand">D&apos;Genius Solutions</p>
              <h1 className="dgs-hero-title">
                Full Service Digital Marketing
                <br />
                <span className="dgs-gradient-text">Agency In Mumbai</span>
              </h1>
              <p className="dgs-hero-subtitle">
                Helping brands grow through connected search, websites, social media, paid campaigns,
                branding and AI-led creative production.
              </p>
              <div className="dgs-hero-actions">
                <a href="/contact-us" className="dgs-btn-primary">
                  Get A Growth Audit
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3.33 8h9.34M8.67 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a href="/our-services" className="dgs-btn-ghost">
                  View Services
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="dgs-trust-strip" aria-label="Key metrics">
          <div className="dgs-container">
            <div className="dgs-trust-grid">
              <div className="dgs-trust-item">
                <strong className="dgs-stat-value dgs-stat-number" data-value="200" data-suffix="+">
                  0
                </strong>
                <span className="dgs-stat-label">Brands Worked With</span>
              </div>
              <div className="dgs-trust-item">
                <strong className="dgs-stat-value dgs-stat-number" data-value="20" data-suffix="K+">
                  0
                </strong>
                <span className="dgs-stat-label">Customers Reached</span>
              </div>
              <div className="dgs-trust-item">
                <strong className="dgs-stat-value">4.5</strong>
                <span className="dgs-stat-label">Average User Rating</span>
              </div>
              <div className="dgs-trust-item">
                <strong className="dgs-stat-value">Mumbai</strong>
                <span className="dgs-stat-label">Full Service Team</span>
              </div>
            </div>
          </div>
        </section>

        <div className="dgs-marquee" aria-hidden="true">
          <div className="dgs-marquee-content">
            {[...MARQUEE, ...MARQUEE].map((text, i) => (
              <span key={`${text}-${i}`}>
                <span className="dgs-marquee-item">{text}</span>
                <span className="dgs-marquee-separator">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* Hire us for */}
        <section className="dgs-services" id="services">
          <div className="dgs-container">
            <div className="dgs-section-header dgs-reveal">
              <span className="dgs-section-label">What You Can Hire Us For</span>
              <h2>
                One team for search, web, creative,{' '}
                <span className="dgs-gradient-text">performance and AI</span>
              </h2>
              <p>
                We are not only a content or design team. D&apos;Genius Solutions works across the complete
                digital growth stack so your website, search, ads, social and creative output move in one
                direction.
              </p>
            </div>

            <div className="dgs-services-grid dgs-stagger-grid">
              {PILLARS.map((s) => (
                <article key={s.num} className="dgs-service-card dgs-tilt">
                  <span className="dgs-service-number">{s.num}</span>
                  <h3 className="dgs-service-title">{s.title}</h3>
                  <p className="dgs-service-desc">{s.desc}</p>
                  <div className="dgs-service-tags">
                    {s.links.map((l) => (
                      <a key={l.href} href={l.href} className="dgs-service-tag">
                        {l.label}
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* AI portfolio capabilities */}
        <section className="dgs-authority" id="ai-creative">
          <div className="dgs-container">
            <div className="dgs-section-header dgs-reveal">
              <span className="dgs-section-label">AI-Led Creative Portfolio</span>
              <h2>
                Creative production for campaigns,{' '}
                <span className="dgs-gradient-text">product stories and social</span>
              </h2>
            </div>
            <div className="dgs-authority-grid dgs-stagger-grid">
              {AI_CAPABILITIES.map((item) => (
                <article key={item.title} className="dgs-authority-card dgs-tilt">
                  <h3 className="dgs-authority-title">{item.title}</h3>
                  <p className="dgs-authority-desc">{item.desc}</p>
                </article>
              ))}
            </div>
            <div className="dgs-section-cta">
              <a href="/services/ai-video-production-agency" className="dgs-btn-ghost">
                Explore AI Video
              </a>
            </div>
          </div>
        </section>

        {/* Case studies / work */}
        <section className="dgs-portfolio" id="work">
          <div className="dgs-container">
            <div className="dgs-section-header dgs-reveal">
              <span className="dgs-section-label">SEO, Website And Digital Growth</span>
              <h2>
                Case studies & <span className="dgs-gradient-text">selected work</span>
              </h2>
              <p>Real brand work across digital marketing, websites, SEO, creative, social and AI production.</p>
            </div>
            <PortfolioGallery />
            <div className="dgs-section-cta">
              <a href="/case_studies" className="dgs-btn-ghost">
                View case studies
              </a>
              <a href="/portfolio" className="dgs-btn-ghost">
                Full portfolio
              </a>
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="dgs-brands" id="brands">
          <div className="dgs-container">
            <div className="dgs-section-header dgs-reveal">
              <span className="dgs-section-label">Trusted By Brands Worldwide</span>
              <h2>
                Trusted by brands across finance, retail, education,{' '}
                <span className="dgs-gradient-text">healthcare and technology</span>
              </h2>
            </div>
            <div className="dgs-brands-grid">
              {BRANDS.map((brand) => (
                <div key={brand} className="dgs-brand-chip">
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search stack */}
        <section className="dgs-services" id="search">
          <div className="dgs-container">
            <div className="dgs-section-header dgs-reveal">
              <span className="dgs-section-label">Search & Discovery</span>
              <h2>
                Built for Google Search,{' '}
                <span className="dgs-gradient-text">AI answers and voice</span>
              </h2>
            </div>
            <div className="dgs-search-grid dgs-stagger-grid">
              {SEARCH_STACK.map((item) => (
                <article key={item.title} className="dgs-search-card">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="dgs-awards" id="awards">
          <div className="dgs-container">
            <div className="dgs-section-header dgs-reveal">
              <span className="dgs-section-label">Awards & Recognition</span>
              <h2>
                Recognized for SEO, content &{' '}
                <span className="dgs-gradient-text">performance marketing</span>
              </h2>
            </div>
            <div className="dgs-awards-grid">
              {AWARDS.map((a) => (
                <article key={a.org} className="dgs-award-card">
                  <span className="dgs-award-org">{a.org}</span>
                  <h3 className="dgs-award-title">{a.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why us */}
        <section className="dgs-authority" id="why">
          <div className="dgs-container">
            <div className="dgs-section-header dgs-reveal">
              <span className="dgs-section-label">Why Brands Choose D&apos;Genius Solutions</span>
              <h2>
                Strategy, search, creative,{' '}
                <span className="dgs-gradient-text">built to scale</span>
              </h2>
            </div>
            <div className="dgs-authority-grid dgs-stagger-grid">
              {WHY_US.map((item) => (
                <article key={item.title} className="dgs-authority-card dgs-tilt">
                  <span className="dgs-authority-step">{item.title}</span>
                  <p className="dgs-authority-desc">{item.desc}</p>
                </article>
              ))}
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

        {/* FAQ */}
        <section className="dgs-faq" id="faq">
          <div className="dgs-container">
            <div className="dgs-faq-container">
              <div className="dgs-section-header dgs-reveal">
                <span className="dgs-section-label">FAQ</span>
                <h2>
                  Questions brands ask before choosing a{' '}
                  <span className="dgs-gradient-text">digital marketing agency</span>
                </h2>
              </div>
              <div className="dgs-reveal">
                {FAQS.map((item, i) => (
                  <details key={item.q} className="dgs-faq-item" open={i === 0}>
                    <summary className="dgs-faq-summary">
                      {item.q}
                      <span className="dgs-faq-icon" />
                    </summary>
                    <div className="dgs-faq-content">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="dgs-cta" id="contact">
          <div className="dgs-container">
            <div className="dgs-cta-card dgs-reveal">
              <span className="dgs-section-label">Growth Audit</span>
              <h2 className="dgs-cta-title">
                Let us audit your brand, website,{' '}
                <span className="dgs-gradient-text">search and campaigns</span>
              </h2>
              <p className="dgs-cta-desc">
                Start with a clear view of where visibility, conversion and creative can compound fastest.
              </p>
              <a href="/contact-us" className="dgs-btn-primary dgs-btn-lg">
                Get A Growth Audit
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
