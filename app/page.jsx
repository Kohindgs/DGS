import ThreeCanvas from './components/ThreeCanvas';
import GsapClient from './components/GsapClient';
import PortfolioGallery from './components/PortfolioGallery';

export const metadata = {
  title: "D'Genius Solutions — AI Video, SEO/AEO/GEO & Digital Marketing Agency, Mumbai",
  description: "Mumbai's premier digital agency. AI Video Production, Generative Engine Optimization (AEO/GEO/LLM), High-Performance Web Development, Performance Marketing, Social Media & Brand Content.",
  keywords: ["Digital Marketing Agency Mumbai", "AI Video Production", "AEO GEO LLM Optimization", "Generative Engine Optimization", "Next.js Website Development", "Performance Marketing Agency India"],
  openGraph: {
    title: "D'Genius Solutions — Next-Gen Digital Agency",
    description: "AI Video · AEO/GEO · Web Development · Performance Marketing",
    url: "https://www.dgeniussolutions.com/",
    siteName: "D'Genius Solutions",
    locale: "en_IN",
    type: "website",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization", "@id": "https://www.dgeniussolutions.com/#organization",
      name: "D'Genius Solutions", url: "https://www.dgeniussolutions.com/",
      logo: "https://www.dgeniussolutions.com/logo.png",
      sameAs: ["https://www.linkedin.com/company/dgeniussolutions/", "https://www.instagram.com/dgeniussolutions/", "https://www.facebook.com/dgeniussolutions/"],
      address: { "@type": "PostalAddress", streetAddress: "SV Road", addressLocality: "Khar W", addressRegion: "Mumbai", postalCode: "400050", addressCountry: "IN" },
    },
    {
      "@type": "ProfessionalService", "@id": "https://www.dgeniussolutions.com/#service",
      name: "D'Genius Solutions", priceRange: "$$$", telephone: "+91-9987922901",
      areaServed: ["Mumbai", "India", "Global"],
      hasOfferCatalog: {
        "@type": "OfferCatalog", name: "Digital Services",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Video Production" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "SEO, AEO, GEO & LLM Optimization" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Website Development" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Social Media Marketing" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Performance Marketing" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Branding & Content Creation" } },
        ],
      },
    },
    {
      "@type": "FAQPage", "@id": "https://www.dgeniussolutions.com/#faq",
      mainEntity: [
        { "@type": "Question", name: "What is AEO, GEO, and LLM Search Optimization?", acceptedAnswer: { "@type": "Answer", text: "AEO and GEO optimize your brand's data graph so AI engines like Google AI Overview, Perplexity, and ChatGPT cite your brand as the authoritative source." } },
        { "@type": "Question", name: "How does D'Genius Solutions use AI for video production?", acceptedAnswer: { "@type": "Answer", text: "We combine AI video synthesis with cinema-grade post-production to create realistic AI avatars, viral short-form content, and high-converting video at scale." } },
      ],
    },
  ],
};

const SERVICES = [
  { num: '01', icon: '🎬', badge: 'Next-Gen Media', title: 'AI Video Production', desc: 'Hyper-realistic AI avatars, viral 3D visual shorts, brand commercials, and cinema-grade synthetic video at scale.', tags: ['AI Avatars', '3D Shorts', 'TVCs', 'Synthetic Post-Production'], cta: 'Launch Campaign' },
  { num: '02', icon: '🧠', badge: 'Generative Search', title: 'SEO, AEO, GEO & LLM', desc: 'Dominate Google AI Overviews, Perplexity, and ChatGPT Search with entity graphs, schema authority, and GEO.', tags: ['AI Overview #1', 'Perplexity', 'Entity Graph', 'Technical SEO'], cta: 'Claim Search Dominance' },
  { num: '03', icon: '💻', badge: 'Web Architecture', title: 'Website Development', desc: 'Ultra-fast Next.js apps, WebGL 3D interactions, and conversion-focused web experiences with 100/100 CWV.', tags: ['Next.js', 'WebGL', 'Core Web Vitals', 'Custom Apps'], cta: 'Build Web App' },
  { num: '04', icon: '📱', badge: 'Organic Growth', title: 'Social Media Marketing', desc: 'Algorithm-first content strategy, viral Reels/Shorts campaigns, influencer partnerships, and community scaling.', tags: ['Viral Reels', 'Community', 'Influencer', 'Brand Engagement'], cta: 'Scale Social' },
  { num: '05', icon: '📈', badge: 'High-ROAS', title: 'Performance Marketing', desc: 'Data-driven Meta & Google Ads funnel management, automated bidding, and CRO engineered for maximum ROAS.', tags: ['Meta Ads', 'Google PPC', 'Funnel CRO', '8×+ ROAS'], cta: 'Maximize ROAS' },
  { num: '06', icon: '🎨', badge: 'Brand Identity', title: 'Branding & Content', desc: 'Comprehensive brand positioning, visual identity systems, compelling copywriting, and multi-channel creative.', tags: ['Visual Identity', '3D Assets', 'Copywriting', 'Guidelines'], cta: 'Elevate Brand' },
];

export default function HomePage() {
  return (
    <>
      <GsapClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* ── NAVIGATION ── */}
      <nav className="dgs-nav" id="dgs-nav">
        <div className="dgs-container">
          <div className="dgs-nav-container">
            <a href="/" className="dgs-nav-logo">
              <span className="dgs-nav-logo-icon"></span>
              D'Genius Solutions
            </a>

            <div className="dgs-nav-links">
              <a href="#services" className="dgs-nav-link">Services</a>
              <a href="#work" className="dgs-nav-link">Work</a>
              <a href="#approach" className="dgs-nav-link">Approach</a>
              <a href="#faq" className="dgs-nav-link">FAQ</a>
            </div>

            <div className="dgs-nav-actions">
              <a href="#contact" className="dgs-btn-primary dgs-nav-cta">Start a Project</a>
              <button className="dgs-nav-toggle" aria-label="Toggle menu">
                <span></span><span></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* ── HERO ── */}
        <section className="dgs-hero" id="hero">
          <div className="dgs-hero-bg" aria-hidden="true">
            <ThreeCanvas />
            <div className="dgs-hero-gradient-orb"></div>
            <div className="dgs-hero-grain"></div>
          </div>

          <div className="dgs-container">
            <div className="dgs-hero-content dgs-reveal">
              <div className="dgs-hero-badge">
                <span className="dgs-hero-badge-dot"></span>
                Full-Service Digital Agency · Mumbai
              </div>

              <h1 className="dgs-hero-title">
                We build digital engines
                <br />
                <span className="dgs-gradient-text">that drive growth.</span>
              </h1>

              <p className="dgs-hero-subtitle">
                AI Video Production · SEO / AEO / GEO · High-Performance Web Apps · Performance Marketing · Social Media · Branding
              </p>

              <div className="dgs-hero-actions">
                <a href="#contact" className="dgs-btn-primary">
                  Start a Project
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.33 8h9.34M8.67 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
                <a href="#work" className="dgs-btn-ghost">View Our Work</a>
              </div>
            </div>

            <div className="dgs-hero-stats dgs-reveal">
              <div className="dgs-stat-item">
                <strong className="dgs-stat-value dgs-stat-number" data-value="150" data-suffix="+">0</strong>
                <span className="dgs-stat-label">Brand Campaigns</span>
              </div>
              <div className="dgs-stat-item">
                <strong className="dgs-stat-value dgs-stat-number" data-value="40" data-prefix="$" data-suffix="M+">0</strong>
                <span className="dgs-stat-label">Revenue Generated</span>
              </div>
              <div className="dgs-stat-item">
                <strong className="dgs-stat-value dgs-stat-number" data-value="99" data-suffix="%">0</strong>
                <span className="dgs-stat-label">Client Retention</span>
              </div>
              <div className="dgs-stat-item">
                <strong className="dgs-stat-value dgs-stat-number" data-value="8" data-suffix="×+">0</strong>
                <span className="dgs-stat-label">Average ROAS</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div className="dgs-marquee" aria-hidden="true">
          <div className="dgs-marquee-content">
            {['AI Video Production', 'SEO & AEO', 'Generative Engine Optimization', 'LLM Search', 'Web Development', 'Performance Marketing', 'Social Media', 'Branding & Content',
              'AI Video Production', 'SEO & AEO', 'Generative Engine Optimization', 'LLM Search', 'Web Development', 'Performance Marketing', 'Social Media', 'Branding & Content',
            ].map((text, i) => (
              <span key={i}>
                <span className="dgs-marquee-item">{text}</span>
                <span className="dgs-marquee-separator">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── SERVICES ── */}
        <section className="dgs-services" id="services">
          <div className="dgs-container">
            <div className="dgs-section-header dgs-reveal">
              <span className="dgs-section-label">What We Do</span>
              <h2>Capabilities built for <span className="dgs-gradient-text">modern growth</span></h2>
              <p>Six specialized service verticals engineered to dominate traditional search, social algorithms, and generative AI engines.</p>
            </div>

            <div className="dgs-services-grid dgs-stagger-grid">
              {SERVICES.map((s) => (
                <article key={s.num} className="dgs-service-card dgs-tilt">
                  <span className="dgs-service-number">{s.num}</span>
                  <div className="dgs-service-icon">{s.icon}</div>
                  <span className="dgs-service-badge">{s.badge}</span>
                  <h3 className="dgs-service-title">{s.title}</h3>
                  <p className="dgs-service-desc">{s.desc}</p>
                  <div className="dgs-service-tags">
                    {s.tags.map((t) => <span key={t} className="dgs-service-tag">{t}</span>)}
                  </div>
                  <a href="#contact" className="dgs-service-link">
                    {s.cta}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3.33 8h9.34M8.67 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── PORTFOLIO ── */}
        <section className="dgs-portfolio" id="work">
          <div className="dgs-container">
            <div className="dgs-section-header dgs-reveal">
              <span className="dgs-section-label">Selected Work</span>
              <h2>Results that <span className="dgs-gradient-text">speak for themselves</span></h2>
              <p>Featured campaigns across AI video, search dominance, web development, and performance marketing.</p>
            </div>
            <PortfolioGallery />
          </div>
        </section>

        {/* ── APPROACH / AUTHORITY ── */}
        <section className="dgs-authority" id="approach">
          <div className="dgs-container">
            <div className="dgs-section-header dgs-reveal">
              <span className="dgs-section-label">Our Approach</span>
              <h2>Next-gen search <span className="dgs-gradient-text">dominance strategy</span></h2>
              <p>How we ensure your brand ranks at the top of Google Search and generative AI engines.</p>
            </div>

            <div className="dgs-authority-grid dgs-stagger-grid">
              <article className="dgs-authority-card dgs-tilt">
                <span className="dgs-authority-step">Google AI Overview</span>
                <h3 className="dgs-authority-title">Generative Engine Optimization</h3>
                <p className="dgs-authority-desc">We optimize content structures, entity graphs, and structured data so Google's AI Overview features your brand in snapshot answers.</p>
              </article>

              <article className="dgs-authority-card dgs-tilt">
                <span className="dgs-authority-step">Perplexity & LLM Search</span>
                <h3 className="dgs-authority-title">Answer Engine Optimization</h3>
                <p className="dgs-authority-desc">Directing conversational AI engines to source facts, recommendations, and citations directly from your website's semantic data graph.</p>
              </article>

              <article className="dgs-authority-card dgs-tilt">
                <span className="dgs-authority-step">Core Web Vitals</span>
                <h3 className="dgs-authority-title">Performance Engineering</h3>
                <p className="dgs-authority-desc">100/100 speed scores, instant page loads, and zero layout shifts to maximize quality rankings across every search engine.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="dgs-faq" id="faq">
          <div className="dgs-container">
            <div className="dgs-faq-container">
              <div className="dgs-section-header dgs-reveal">
                <span className="dgs-section-label">FAQ</span>
                <h2>Frequently asked <span className="dgs-gradient-text">questions</span></h2>
              </div>

              <div className="dgs-reveal">
                <details className="dgs-faq-item" open>
                  <summary className="dgs-faq-summary">
                    How does D'Genius combine traditional SEO with AEO and GEO?
                    <span className="dgs-faq-icon"></span>
                  </summary>
                  <div className="dgs-faq-content">While traditional SEO targets keyword rankings on Google SERPs, our AEO and GEO practice structures your brand's data so LLMs — Google AI Overview, Perplexity, ChatGPT — cite your company as the authoritative answer. We layer all three for compounding visibility.</div>
                </details>

                <details className="dgs-faq-item">
                  <summary className="dgs-faq-summary">
                    What makes your AI Video Production unique?
                    <span className="dgs-faq-icon"></span>
                  </summary>
                  <div className="dgs-faq-content">We combine hyper-realistic AI video synthesis with cinema-grade post-production. Custom AI avatars, multi-platform aspect ratios, and automated scaling produce high-converting commercial video in a fraction of traditional production time and cost.</div>
                </details>

                <details className="dgs-faq-item">
                  <summary className="dgs-faq-summary">
                    How fast can a website development project launch?
                    <span className="dgs-faq-icon"></span>
                  </summary>
                  <div className="dgs-faq-content">Using our Next.js and WebGL architecture, we design, build, and deploy ultra-fast websites within 4–8 weeks — fully optimized for 100/100 Core Web Vitals and AEO-ready structured data from day one.</div>
                </details>

                <details className="dgs-faq-item">
                  <summary className="dgs-faq-summary">
                    What ROAS can we expect from performance marketing?
                    <span className="dgs-faq-icon"></span>
                  </summary>
                  <div className="dgs-faq-content">Our performance marketing clients average 6–10× ROAS across Meta and Google Ads. We achieve this through data-driven creative testing, funnel CRO, automated bidding, and real-time optimization loops.</div>
                </details>

                <details className="dgs-faq-item">
                  <summary className="dgs-faq-summary">
                    Do you work with businesses outside Mumbai?
                    <span className="dgs-faq-icon"></span>
                  </summary>
                  <div className="dgs-faq-content">Absolutely. While headquartered in Mumbai, we serve clients across India and internationally. Our process is fully remote-optimized with structured sprint workflows, shared dashboards, and weekly strategy calls.</div>
                </details>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="dgs-cta" id="contact">
          <div className="dgs-container">
            <div className="dgs-cta-card dgs-reveal">
              <span className="dgs-section-label">Ready to grow?</span>
              <h2 className="dgs-cta-title">Let's build your <span className="dgs-gradient-text">digital engine</span></h2>
              <p className="dgs-cta-desc">Partner with Mumbai's leading digital agency to scale your brand's reach, authority, and revenue.</p>
              <a href="mailto:contact@dgeniussolutions.com" className="dgs-btn-primary dgs-btn-lg">
                Schedule Strategy Call
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.33 8h9.34M8.67 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="dgs-footer">
          <div className="dgs-container">
            <div className="dgs-footer-grid">
              <div className="dgs-footer-brand">
                <a href="/" className="dgs-nav-logo">
                  <span className="dgs-nav-logo-icon"></span>
                  D'Genius Solutions
                </a>
                <p className="dgs-footer-brand-desc">Mumbai-based full-service digital agency specializing in AI video, generative search optimization, and high-performance web experiences.</p>
              </div>

              <div>
                <h4 className="dgs-footer-heading">Services</h4>
                <div className="dgs-footer-links">
                  <a href="#services" className="dgs-footer-link">AI Video Production</a>
                  <a href="#services" className="dgs-footer-link">SEO / AEO / GEO</a>
                  <a href="#services" className="dgs-footer-link">Web Development</a>
                  <a href="#services" className="dgs-footer-link">Performance Marketing</a>
                  <a href="#services" className="dgs-footer-link">Social Media</a>
                  <a href="#services" className="dgs-footer-link">Branding & Content</a>
                </div>
              </div>

              <div>
                <h4 className="dgs-footer-heading">Company</h4>
                <div className="dgs-footer-links">
                  <a href="#work" className="dgs-footer-link">Our Work</a>
                  <a href="#approach" className="dgs-footer-link">Approach</a>
                  <a href="#faq" className="dgs-footer-link">FAQ</a>
                  <a href="#contact" className="dgs-footer-link">Contact</a>
                </div>
              </div>

              <div>
                <h4 className="dgs-footer-heading">Connect</h4>
                <div className="dgs-footer-links">
                  <a href="https://www.linkedin.com/company/dgeniussolutions/" target="_blank" rel="noopener noreferrer" className="dgs-footer-link">LinkedIn</a>
                  <a href="https://www.instagram.com/dgeniussolutions/" target="_blank" rel="noopener noreferrer" className="dgs-footer-link">Instagram</a>
                  <a href="https://www.facebook.com/dgeniussolutions/" target="_blank" rel="noopener noreferrer" className="dgs-footer-link">Facebook</a>
                  <a href="mailto:contact@dgeniussolutions.com" className="dgs-footer-link">Email Us</a>
                </div>
              </div>
            </div>

            <div className="dgs-footer-bottom">
              <span className="dgs-footer-copyright">© 2026 D'Genius Solutions. All rights reserved.</span>
              <span className="dgs-footer-copyright">Mumbai, India · Global Operations</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
