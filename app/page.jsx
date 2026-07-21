import ThreeCanvas from './components/ThreeCanvas';
import GsapClient from './components/GsapClient';
import PortfolioGallery from './components/PortfolioGallery';

export const metadata = {
  title: "D'Genius Solutions | Mumbai Full Service Digital Marketing, AI Video & SEO/AEO/GEO Agency",
  description: "Mumbai's premier digital marketing agency specializing in AI Video Production, SEO/AEO/GEO/LLM Optimization, High-Performance Website Development, Performance Marketing, Social Media & Brand Content.",
  keywords: [
    "Digital Marketing Agency Mumbai",
    "AI Video Production Mumbai",
    "AEO GEO LLM Optimization",
    "Generative Engine Optimization",
    "Google AI Overview Ranking Agency",
    "Next.js Website Development",
    "Performance Marketing Agency India",
    "Social Media Agency Mumbai",
    "Branding and Content Creation",
  ],
  openGraph: {
    title: "D'Genius Solutions | Next-Gen AI Digital Agency Mumbai",
    description: "Dominating Search, Social & AI Search Engines with High-Performance Digital Marketing, AI Video, & Generative Engine Optimization.",
    url: "https://www.dgeniussolutions.com/",
    siteName: "D'Genius Solutions",
    locale: "en_IN",
    type: "website",
  },
};

const JSON_LD_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.dgeniussolutions.com/#organization",
      "name": "D'Genius Solutions",
      "url": "https://www.dgeniussolutions.com/",
      "logo": "https://www.dgeniussolutions.com/logo.png",
      "sameAs": [
        "https://www.linkedin.com/company/dgeniussolutions/",
        "https://www.instagram.com/dgeniussolutions/",
        "https://www.facebook.com/dgeniussolutions/"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Mumbai",
        "addressRegion": "Maharashtra",
        "addressCountry": "IN"
      }
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://www.dgeniussolutions.com/#service",
      "name": "D'Genius Solutions",
      "priceRange": "$$$",
      "telephone": "+91-9876543210",
      "areaServed": ["Mumbai", "India", "Global"],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Core Digital Marketing Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "AI Video Production",
              "description": "Hyper-realistic AI avatars, viral 3D visual shorts, brand films, and automated video content."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "SEO, AEO, GEO & LLM Optimization",
              "description": "Generative Engine Optimization to rank #1 in Google AI Overviews, Perplexity, and ChatGPT Search."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "High-Performance Website Development",
              "description": "Ultra-fast Next.js, WebGL 3D, and high-converting custom web applications."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Social Media Marketing",
              "description": "Viral social strategy, community building, influencer collaborations, and organic growth."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Performance Marketing",
              "description": "High-ROAS Meta & Google Ads management with data-driven funnel optimization."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Branding & Content Creation",
              "description": "360° visual identity, copywriting, brand guidelines, and creative story assets."
            }
          }
        ]
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.dgeniussolutions.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is AEO, GEO, and LLM Search Optimization?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) optimize your brand's data graph so AI search engines like Google AI Overview, Perplexity, and ChatGPT Search cite your brand as the authoritative recommendation."
          }
        },
        {
          "@type": "Question",
          "name": "How does D'Genius Solutions utilize AI Video Production?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We combine state-of-the-art AI video synthesis with cinema-grade post-production to create realistic AI avatars, viral short-form content, and high-converting video commercials at scale."
          }
        }
      ]
    }
  ]
};

export default function HomePage() {
  return (
    <main className="dgs-v1215" id="dgs-v1215">
      <GsapClient />
      
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_SCHEMA) }}
      />

      {/* Dynamic Background */}
      <div className="dgs-v1215-bg" aria-hidden="true">
        <ThreeCanvas />
        <div className="dgs-v1215-fallback"></div>
        <div className="dgs-v1215-grid"></div>
        <div className="dgs-v1215-vignette"></div>
      </div>

      {/* HERO SECTION */}
      <section className="dgs-v1215-hero" id="dgs-home-start">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-hero-layout">

            <div className="dgs-v1215-copy dgs-v1215-reveal">
              <div className="dgs-v1215-kicker">
                <span>⚡</span> Mumbai-Based Full Service Digital Marketing Agency
              </div>

              <h1>
                Dominating Search, Social & AI Search Engines
                <span>AI Video • AEO / GEO • Web Dev • Performance</span>
              </h1>

              <p>
                We build high-growth digital engines for ambitious brands. From <strong>AI Video Production</strong> and <strong>Generative Engine Optimization (AEO/GEO/LLM)</strong> to <strong>High-Performance Web Apps</strong> and <strong>High-ROAS Marketing</strong>, we turn digital presence into exponential revenue.
              </p>

              <div className="dgs-v1215-actions">
                <a href="#dgs-v1215-services" className="dgs-v1215-btn dgs-v1215-btn-primary">
                  Explore Priority Services →
                </a>
                <a href="#dgs-v1215-case-block" className="dgs-v1215-btn dgs-v1215-btn-secondary">
                  View Verified Results
                </a>
              </div>
            </div>

            <div className="dgs-v1215-visual dgs-v1215-reveal">
              <div className="dgs-v1215-robot-wrap">
                <div className="dgs-v1215-robot-aura"></div>
                <img
                  id="dgs-v1215-robot"
                  src="/images/v1215/robot-hero.webp"
                  alt="D'Genius Solutions AI Visual Representation"
                />

                <div className="dgs-v1215-floating-chip dgs-v1215-chip-one">
                  <span>Generative Search</span>
                  <strong>#1 in Google AI Overview</strong>
                </div>

                <div className="dgs-v1215-floating-chip dgs-v1215-chip-two">
                  <span>AI Video Production</span>
                  <strong>Viral Avatar Shorts & TVCs</strong>
                </div>

                <div className="dgs-v1215-floating-chip dgs-v1215-chip-three">
                  <span>Performance ROAS</span>
                  <strong>8.4x Verified Conversion</strong>
                </div>
              </div>
            </div>

          </div>

          <div className="dgs-v1215-statline dgs-v1215-reveal">
            <div>
              <strong>150+</strong>
              <span>Global Brand Campaigns</span>
            </div>
            <div>
              <strong>$40M+</strong>
              <span>Client Revenue Generated</span>
            </div>
            <div>
              <strong>99.4%</strong>
              <span>AI Engine Recommendation</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Core Web Vitals Performance</span>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE TICKER */}
      <section className="dgs-v1215-rail" aria-label="Core Capabilities Marquee">
        <div className="dgs-v1215-rail-line">
          <div className="dgs-v1215-rail-track">
            <span>AI Video Production</span>
            <span>SEO & AEO Optimization</span>
            <span>Generative Engine Optimization (GEO)</span>
            <span>LLM Search Dominance</span>
            <span>High-Speed Web Development</span>
            <span>Performance Marketing</span>
            <span>Social Media Growth</span>
            <span>Branding & Content Creation</span>

            {/* Repeat for seamless infinite scroll */}
            <span>AI Video Production</span>
            <span>SEO & AEO Optimization</span>
            <span>Generative Engine Optimization (GEO)</span>
            <span>LLM Search Dominance</span>
            <span>High-Speed Web Development</span>
            <span>Performance Marketing</span>
            <span>Social Media Growth</span>
            <span>Branding & Content Creation</span>
          </div>
        </div>
      </section>

      {/* CLIENT LOGO & PROOF STACK */}
      <section className="dgs-v1215-proof-stack" id="dgs-v1215-proof">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-section-head dgs-v1215-reveal">
            <div className="dgs-v1215-section-kicker">Trusted Industry Leaders</div>
            <h2>Accelerating Growth for <span>Market Leaders & Unicorns</span></h2>
            <p>From high-growth D2C brands to enterprise leaders, our AI-forward digital strategies deliver measurable impact.</p>
          </div>

          <div className="dgs-v1215-logo-marquee">
            <div className="dgs-v1215-logo-track">
              {['Bespoke', 'Style', 'Blanco', 'Creative', 'Elegance', 'Urban', 'Glam', 'Luxe'].map((client, idx) => (
                <div key={idx} className="dgs-v1215-logo-tile">
                  <span className="dgs-v1215-logo-text">{client}</span>
                </div>
              ))}
              {['Bespoke', 'Style', 'Blanco', 'Creative', 'Elegance', 'Urban', 'Glam', 'Luxe'].map((client, idx) => (
                <div key={`dup-${idx}`} className="dgs-v1215-logo-tile">
                  <span className="dgs-v1215-logo-text">{client}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CORE FOCUS SERVICES SHOWCASE */}
      <section className="dgs-v1215-service-clarity" id="dgs-v1215-services">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-section-head dgs-v1215-reveal">
            <div className="dgs-v1215-section-kicker">Priority Service Suites</div>
            <h2>Full-Service Digital Solutions <span>Built For Modern Growth</span></h2>
            <p>Specialized, high-impact digital capabilities tailored to dominate traditional search, social algorithms, and generative AI search engines.</p>
          </div>

          <div className="dgs-v1215-services-grid">
            
            {/* Service 1: AI Video Production */}
            <article className="dgs-v1215-service-card dgs-v1215-reveal">
              <div className="dgs-v1215-service-icon">🎬</div>
              <span className="dgs-v1215-service-badge">Next-Gen Media</span>
              <h3>AI Video Production</h3>
              <p>Hyper-realistic AI avatars, viral 3D visual shorts, automated brand commercials, and cinema-grade synthetic video creation at scale.</p>
              <div className="dgs-v1215-service-tags">
                <span>AI Avatars</span>
                <span>3D Shorts</span>
                <span>TVCs</span>
                <span>Synthetic Post-Production</span>
              </div>
              <a href="#dgs-v1215-final" className="dgs-v1215-service-link">
                Launch AI Video Campaign
              </a>
            </article>

            {/* Service 2: SEO, AEO, GEO & LLM Optimization */}
            <article className="dgs-v1215-service-card dgs-v1215-reveal">
              <div className="dgs-v1215-service-icon">🧠</div>
              <span className="dgs-v1215-service-badge">Generative Search</span>
              <h3>SEO, AEO, GEO & LLM Optimization</h3>
              <p>Dominate Google AI Overviews, Perplexity, and ChatGPT Search with Generative Engine Optimization, entity graphs, and schema authority.</p>
              <div className="dgs-v1215-service-tags">
                <span>AI Overview #1</span>
                <span>Perplexity Citation</span>
                <span>Entity Graph</span>
                <span>Technical SEO</span>
              </div>
              <a href="#dgs-v1215-final" className="dgs-v1215-service-link">
                Claim AI Search Dominance
              </a>
            </article>

            {/* Service 3: High-Performance Website Development */}
            <article className="dgs-v1215-service-card dgs-v1215-reveal">
              <div className="dgs-v1215-service-icon">💻</div>
              <span className="dgs-v1215-service-badge">Web Architecture</span>
              <h3>Website Development</h3>
              <p>Ultra-fast Next.js, WebGL 3D micro-interactions, and conversion-focused web applications built with 100/100 Core Web Vitals performance.</p>
              <div className="dgs-v1215-service-tags">
                <span>Next.js</span>
                <span>WebGL 3D</span>
                <span>Core Web Vitals 100</span>
                <span>Custom Web Apps</span>
              </div>
              <a href="#dgs-v1215-final" className="dgs-v1215-service-link">
                Build High-Speed Web App
              </a>
            </article>

            {/* Service 4: Social Media Marketing */}
            <article className="dgs-v1215-service-card dgs-v1215-reveal">
              <div className="dgs-v1215-service-icon">📱</div>
              <span className="dgs-v1215-service-badge">Viral Organic Growth</span>
              <h3>Social Media Marketing</h3>
              <p>Algorithm-first content strategy, viral Reels/Shorts campaigns, influencer partnerships, and active community engagement that scales brand affinity.</p>
              <div className="dgs-v1215-service-tags">
                <span>Viral Reels</span>
                <span>Community Growth</span>
                <span>Influencer Strategy</span>
                <span>Brand Engagement</span>
              </div>
              <a href="#dgs-v1215-final" className="dgs-v1215-service-link">
                Scale Social Presence
              </a>
            </article>

            {/* Service 5: Performance Marketing */}
            <article className="dgs-v1215-service-card dgs-v1215-reveal">
              <div className="dgs-v1215-service-icon">📈</div>
              <span className="dgs-v1215-service-badge">High-ROAS Ads</span>
              <h3>Performance Marketing</h3>
              <p>Data-driven Meta & Google Ads funnel management, automated bidding, and conversion rate optimization engineered for high ROAS.</p>
              <div className="dgs-v1215-service-tags">
                <span>Meta Ads</span>
                <span>Google PPC</span>
                <span>Funnel CRO</span>
                <span>8x+ ROAS</span>
              </div>
              <a href="#dgs-v1215-final" className="dgs-v1215-service-link">
                Maximize Ad ROAS
              </a>
            </article>

            {/* Service 6: Branding & Content Creation */}
            <article className="dgs-v1215-service-card dgs-v1215-reveal">
              <div className="dgs-v1215-service-icon">🎨</div>
              <span className="dgs-v1215-service-badge">Brand Identity</span>
              <h3>Branding & Content Creation</h3>
              <p>Comprehensive brand positioning, 3D visual identities, compelling copywriting, and multi-channel creative storytelling assets.</p>
              <div className="dgs-v1215-service-tags">
                <span>Visual Identity</span>
                <span>3D Brand Assets</span>
                <span>Copywriting</span>
                <span>Creative Guidelines</span>
              </div>
              <a href="#dgs-v1215-final" className="dgs-v1215-service-link">
                Elevate Brand Identity
              </a>
            </article>

          </div>
        </div>
      </section>

      {/* PORTFOLIO & WORK SHOWCASE */}
      <section className="dgs-v1215-ai-portfolio" id="dgs-v1215-portfolio">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-section-head dgs-v1215-reveal">
            <div className="dgs-v1215-section-kicker">Creative Portfolio</div>
            <h2>Featured Client Work & <span>Verified Results</span></h2>
            <p>Interactive showcase of our AI Video Production, SEO/AEO takeovers, Web Development, and Performance Marketing campaigns.</p>
          </div>

          <PortfolioGallery />
        </div>
      </section>

      {/* SEARCH & AI AUTHORITY (SEO / AEO / GEO) */}
      <section className="dgs-v1215-search-authority" id="dgs-v1215-authority">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-section-head dgs-v1215-reveal">
            <div className="dgs-v1215-section-kicker">AI & Search Leadership</div>
            <h2>Next-Gen Search Engine <span>Dominance (AEO / GEO / LLM)</span></h2>
            <p>How we guarantee your brand ranks at the top of Google Search and generative AI engines like Perplexity, ChatGPT, and Gemini.</p>
          </div>

          <div className="dgs-v1215-authority-grid">
            <article className="dgs-v1215-authority-card dgs-v1215-reveal">
              <span>Google AI Overview</span>
              <h3>Generative Engine Optimization (GEO)</h3>
              <p>Optimizing content structures, entity graphs, and structured JSON-LD data so Google's AI Overview prominently features your brand in snapshot answers.</p>
            </article>

            <article className="dgs-v1215-authority-card dgs-v1215-reveal">
              <span>Perplexity & LLM Search</span>
              <h3>Answer Engine Optimization (AEO)</h3>
              <p>Directing conversational AI engines to source facts, recommendations, and product citations directly from your website's semantic data graph.</p>
            </article>

            <article className="dgs-v1215-authority-card dgs-v1215-reveal">
              <span>Core Web Vitals & Speed</span>
              <h3>High-Performance Web Engineering</h3>
              <p>Ensuring 100/100 Core Web Vitals speed scores, instant page loads, and zero layout shifts to maximize Google Search quality rankings.</p>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section className="dgs-v1215-faq" id="dgs-v1215-faq">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-section-head dgs-v1215-reveal">
            <div className="dgs-v1215-section-kicker">Frequently Asked Questions</div>
            <h2>Clear Answers to <span>Your Growth Questions</span></h2>
          </div>

          <div className="dgs-v1215-faq-grid dgs-v1215-reveal">
            <details open>
              <summary>How does D'Genius Solutions combine traditional SEO with AEO and GEO?</summary>
              <p>While traditional SEO focuses on keyword rankings on Google SERPs, Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) structure your brand's data so LLMs (Google AI Overview, Perplexity, ChatGPT) cite your company as the premier answer.</p>
            </details>

            <details>
              <summary>What makes your AI Video Production service unique?</summary>
              <p>We combine hyper-realistic AI video generation with professional cinema-grade post-production, custom AI avatars, and multi-platform aspect ratios to produce high-converting commercial video content in a fraction of traditional production time.</p>
            </details>

            <details>
              <summary>How fast can we launch a high-performance Website Development project?</summary>
              <p>Using our modern Next.js and WebGL architecture, we design, engineer, test, and deploy ultra-fast, mobile-optimized websites within weeks, fully backed by 100/100 Core Web Vitals performance.</p>
            </details>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="dgs-v1215-final" id="dgs-v1215-final">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-final-card dgs-v1215-reveal">
            <div>
              <span>Ready for Exponential Growth?</span>
              <h2>Let's Build Your <span>AI-Powered Digital Engine</span></h2>
              <p>Partner with Mumbai's leading digital marketing, AI video, and search optimization agency to scale your brand's reach and revenue.</p>
              <a href="mailto:contact@dgeniussolutions.com" className="dgs-v1215-btn dgs-v1215-btn-primary">
                Schedule Strategy Consultation →
              </a>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>🚀</div>
              <strong style={{ display: 'block', fontSize: '1.4rem', color: '#fff' }}>D'Genius Solutions</strong>
              <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Mumbai • Global Operations</span>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
