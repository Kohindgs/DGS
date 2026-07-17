import ThreeCanvas from './components/ThreeCanvas';
import GsapClient from './components/GsapClient';
import PortfolioGallery from './components/PortfolioGallery';

export const metadata = {
  title: "D'Genius Solutions - Full Service Digital Marketing Agency In Mumbai",
  description: "Mumbai based full service digital marketing agency offering expert SEO, AEO, GEO, LLM SEO, website development, social media, performance marketing and AI production services.",
  keywords: "digital marketing agency Mumbai, SEO agency Mumbai, AEO services, GEO services, LLM SEO, voice search optimization, website development Mumbai, performance marketing, social media marketing, AI production agency",
  openGraph: {
    title: "D'Genius Solutions - Digital Marketing Agency in Mumbai",
    description: "Expert SEO, AEO, GEO, web development and AI production.",
    url: "https://www.dgeniussolutions.com/",
    siteName: "D'Genius Solutions",
    locale: "en_US",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="dgs-v1215" id="dgs-v1215">
      {/* Three.js Canvas Background (Client Component) */}
      <div className="dgs-v1215-bg" aria-hidden="true">
        <ThreeCanvas />
        <div className="dgs-v1215-fallback"></div>
        <div className="dgs-v1215-grid"></div>
        <div className="dgs-v1215-vignette"></div>
      </div>

      {/* GSAP Scroll Animation Controller (Client Component) */}
      <GsapClient />

      {/* HERO SECTION */}
      <section className="dgs-v1215-hero" id="dgs-home-start">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-hero-layout">
            <div className="dgs-v1215-copy dgs-v1215-reveal">
              <div className="dgs-v1215-kicker">
                <span></span>Mumbai Based Full Service Digital Marketing Agency
              </div>

              <h1>
                Full Service
                <span>Digital Marketing</span>
                Agency In Mumbai
              </h1>

              <p>
                We help brands grow as a full service digital marketing agency in Mumbai, combining SEO, AEO, GEO, LLM SEO, voice search optimization, website development, social media, performance marketing and AI production into one measurable growth system.
              </p>

              <div className="dgs-v1215-actions">
                <a href="#contact-form" className="dgs-v1215-btn dgs-v1215-btn-primary">
                  Get A Growth Audit <span>→</span>
                </a>
                <a href="#dgs-v1215-services" class="dgs-v1215-btn dgs-v1215-btn-secondary">
                  View Services
                </a>
              </div>
            </div>

            <div className="dgs-v1215-visual dgs-v1215-reveal">
              <div className="dgs-v1215-robot-wrap" id="dgs-v1215-robot-wrap">
                <div className="dgs-v1215-robot-aura"></div>
                <img
                  id="dgs-v1215-robot"
                  src="https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp"
                  alt="Digital marketing, SEO, AEO, GEO, LLM SEO and AI production agency visual for D'Genius Solutions"
                  loading="eager"
                />
                <div className="dgs-v1215-floating-chip dgs-v1215-chip-one">
                  <span>Search Visibility</span>
                  <strong>SEO AEO GEO</strong>
                </div>
                <div className="dgs-v1215-floating-chip dgs-v1215-chip-two">
                  <span>Digital Growth</span>
                  <strong>Social Ads Web</strong>
                </div>
                <div className="dgs-v1215-floating-chip dgs-v1215-chip-three">
                  <span>AI Production</span>
                  <strong>Video Creative Content</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="dgs-v1215-statline dgs-v1215-reveal">
            <div><strong>200+</strong><span>Brands Worked With</span></div>
            <div><strong>20K+</strong><span>Customers Reached</span></div>
            <div><strong>4.5</strong><span>Average User Rating</span></div>
            <div><strong>Mumbai</strong><span>Based Full Service Team</span></div>
          </div>
        </div>
      </section>

      {/* CAPABILITY RAIL */}
      <section className="dgs-v1215-rail" aria-label="D'Genius Solutions capabilities">
        <div className="dgs-v1215-rail-line">
          <div className="dgs-v1215-rail-track">
            <span>Digital Marketing Agency In Mumbai</span>
            <span>SEO Agency In Mumbai</span>
            <span>AEO Agency In Mumbai</span>
            <span>GEO Services</span>
            <span>LLM SEO</span>
            <span>Voice Search Optimization</span>
            <span>Website Development</span>
            <span>Performance Marketing</span>
            <span>Social Media Marketing</span>
            <span>AI Production Agency</span>
          </div>
          <div className="dgs-v1215-rail-track" aria-hidden="true">
            <span>Digital Marketing Agency In Mumbai</span>
            <span>SEO Agency In Mumbai</span>
            <span>AEO Agency In Mumbai</span>
            <span>GEO Services</span>
            <span>LLM SEO</span>
            <span>Voice Search Optimization</span>
            <span>Website Development</span>
            <span>Performance Marketing</span>
            <span>Social Media Marketing</span>
            <span>AI Production Agency</span>
          </div>
        </div>
      </section>

      {/* CLIENT LOGOS + AWARDS */}
      <section className="dgs-v1215-proof-stack" id="dgs-proof">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-section-head dgs-v1215-reveal">
            <div className="dgs-v1215-section-kicker">Trusted By 200+ Brands</div>
            <h2>Trusted by brands across finance, retail, education, healthcare, consumer and technology categories.</h2>
            <p>Real brand work across digital marketing, websites, SEO, creative design, social media, performance marketing and AI production.</p>
          </div>

          <div className="dgs-v1215-logo-marquee dgs-v1215-reveal" aria-label="Client logo wall">
            <div className="dgs-v1215-logo-track">
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Eureka-forbes_White.png" alt="Eureka Forbes client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/ABEA-1.png" alt="Aditya Birla Education Academy client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Saint-gobian.png" alt="Saint Gobain client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Pantaloons.png" alt="Pantaloons client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/output-onlinepngtools-300x95.png" alt="Jaipur Kurti client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Nutriuits.png" alt="Nutriuits client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Raymond.png" alt="Raymond client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Plush-puppy.png" alt="Plush Puppy client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Candour-london.png" alt="Candour London client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Styleup.png" alt="Styleup client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Onida.png" alt="Onida client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Aram.png" alt="Aaram client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Traznact.png" alt="Trazact client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/M-power.png" alt="M Power Aditya Birla Education Trust client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Compuage.png" alt="Compuage client logo" loading="lazy" /></div>
              <div className="dgs-v1215-logo-tile"><img src="https://www.dgeniussolutions.com/wp-content/uploads/2026/06/blanco-1.webp" alt="Blanco client logo" loading="lazy" /></div>
            </div>
          </div>

          <div className="dgs-v1215-awards-block" id="awards">
            <div className="dgs-v1215-section-head dgs-v1215-reveal">
              <div className="dgs-v1215-section-kicker">Awards & Recognition</div>
              <h2>Recognized for <span>SEO, Content & Performance Marketing</span></h2>
              <p>Recognition across workplace excellence, SEO execution, content quality and performance-led digital marketing.</p>
            </div>

            <div className="dgs-v1215-awards-grid dgs-v1215-reveal">
              <article className="dgs-v1215-award-card">
                <div className="dgs-v1215-award-image">
                  <img src="https://www.dgeniussolutions.com/wp-content/uploads/2026/06/Prime-Insights1.png" alt="Prime Insights Best Place to Work award for D'Genius Solutions" loading="lazy" />
                </div>
                <div className="dgs-v1215-award-body">
                  <span>Prime Insights · 2024</span>
                  <h3>Best Place to Work</h3>
                  <p>Recognition for D'Genius Solutions as a growth-focused and people-first digital marketing company.</p>
                </div>
              </article>

              <article className="dgs-v1215-award-card">
                <div className="dgs-v1215-award-image">
                  <img src="https://www.dgeniussolutions.com/wp-content/uploads/2026/06/Corporate-Connect1.png" alt="Corporate Connect digital marketing agency award" loading="lazy" />
                </div>
                <div className="dgs-v1215-award-body">
                  <span>Corporate Connect · 2024-25</span>
                  <h3>Highly Regarded Agency</h3>
                  <p>Recognition for digital marketing impact, client-focused execution and scalable organic growth strategies.</p>
                </div>
              </article>

              <article className="dgs-v1215-award-card">
                <div className="dgs-v1215-award-image">
                  <img src="https://www.dgeniussolutions.com/wp-content/uploads/2026/06/GLA1.png" alt="GLA award for excellence in SEO" loading="lazy" />
                </div>
                <div className="dgs-v1215-award-body">
                  <span>GLA · 2025</span>
                  <h3>Excellence in SEO & Content</h3>
                  <p>Awarded for consistent work across SEO execution, content strategy and performance-driven digital growth.</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES CLARITY */}
      <section className="dgs-v1215-service-clarity" id="dgs-v1215-services">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-section-head dgs-v1215-reveal">
            <div className="dgs-v1215-section-kicker">What You Can Hire Us For</div>
            <h2>One team for search, web, creative, performance and AI production.</h2>
            <p>We are not only a content or design team. D’Genius Solutions works across the complete digital growth stack so your website, search, ads, social and creative output move in one direction.</p>
          </div>

          <div className="dgs-v1215-service-menu dgs-v1215-reveal">
            <article>
              <span>01</span>
              <h3>SEO, AEO, GEO & LLM SEO</h3>
              <p>Technical SEO, content structure, answer engine optimization, generative search visibility, voice search and AI-search readiness.</p>
              <div>
                <a href="https://www.dgeniussolutions.com/services/seo-services-mumbai/">SEO Services</a>
                <a href="https://www.dgeniussolutions.com/services/aeo/">AEO Services</a>
                <a href="https://www.dgeniussolutions.com/services/geo">GEO Services</a>
                <a href="https://www.dgeniussolutions.com/services/llm-seo-service/">LLM SEO</a>
              </div>
            </article>

            <article>
              <span>02</span>
              <h3>Website Development & AMC</h3>
              <p>Website design, development, maintenance, landing pages, UX improvements, conversion journeys and SEO-friendly page structures.</p>
              <div>
                <a href="https://www.dgeniussolutions.com/services/website-development-amc/">Website Development</a>
              </div>
            </article>

            <article>
              <span>03</span>
              <h3>Social Media & Performance Marketing</h3>
              <p>Social strategy, content calendars, creative design, Google Ads, Meta Ads, lead generation and campaign optimization.</p>
              <div>
                <a href="https://www.dgeniussolutions.com/services/social-media-marketing/">Social Media</a>
                <a href="https://www.dgeniussolutions.com/services/performance-marketing/">Performance Marketing</a>
              </div>
            </article>

            <article>
              <span>04</span>
              <h3>Branding, Content & AI Production</h3>
              <p>Brand identity, campaign content, AI videos, product visuals, mascots, festival posts, TVC concepts and scalable creative output.</p>
              <div>
                <a href="https://www.dgeniussolutions.com/services/branding/">Branding</a>
                <a href="https://www.dgeniussolutions.com/services/content-creation/">Content Creation</a>
                <a href="https://www.dgeniussolutions.com/services/generative-ai/">AI Production</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* AI PORTFOLIO SECTION */}
      <section id="portfolio" className="dgs-v1215-ai-portfolio">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-section-head dgs-v1215-reveal">
            <div className="dgs-v1215-section-kicker">Portfolio</div>
            <h2>AI Production <span>Portfolio</span></h2>
            <p>Videos, product visuals, mascots, festival campaigns and AI creative assets.</p>
          </div>

          <div className="dgs-ai-service-clarity dgs-v1215-reveal">
            <div className="dgs-ai-service-grid">
              <div className="dgs-ai-service-copy">
                <p className="dgs-ai-service-kicker">AI Production Agency In Mumbai</p>
                <h3>AI videos, product visuals, campaign creatives produced faster with strategy.</h3>
                <p>We help brands create AI-led videos, product showcases, mascot content, festival posts, campaign visuals and concept films without depending on long production cycles.</p>
              </div>

              <div className="dgs-ai-service-points">
                <article>
                  <span>01</span>
                  <h4>AI Video Production</h4>
                  <p>Short-form videos, reels, campaign films, product stories and TVC-style concepts for faster content output.</p>
                </article>
                <article>
                  <span>02</span>
                  <h4>AI Product Visuals</h4>
                  <p>Product-led imagery and motion for jewellery, FMCG, lifestyle, retail, ecommerce and campaign launches.</p>
                </article>
                <article>
                  <span>03</span>
                  <h4>Mascot & Character AI</h4>
                  <p>AI-generated mascots and character systems that help brands build recall, storytelling and social media consistency.</p>
                </article>
                <article>
                  <span>04</span>
                  <h4>Festival & Topical Content</h4>
                  <p>High-speed creative production for festive campaigns, topical posts, social calendars and moment-led brand communication.</p>
                </article>
              </div>
            </div>

            <div className="dgs-ai-process-strip">
              <div><strong>Brief</strong><span>Brand, product, audience and campaign goal.</span></div>
              <div><strong>Concept</strong><span>Script, visual direction and production style.</span></div>
              <div><strong>Generate</strong><span>AI visuals, videos, characters and creative assets.</span></div>
              <div><strong>Refine</strong><span>Editing, motion, sound, copy and brand control.</span></div>
              <div><strong>Deliver</strong><span>Campaign-ready assets for social, ads and web.</span></div>
            </div>
          </div>

          {/* Interactive React Portfolio Gallery */}
          <PortfolioGallery />
        </div>
      </section>

      {/* SEO CASE STUDIES */}
      <section className="dgs-v1215-case-block" id="case-studies">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-section-head dgs-v1215-reveal">
            <div className="dgs-v1215-section-kicker">Proven Results</div>
            <h2>SEO, Website And Digital Growth Case Studies</h2>
            <p>Real results from brands where search visibility, content experience, and digital execution worked together.</p>
          </div>

          <div className="dgs-v1215-case-visual-grid dgs-v1215-reveal">
            <article class="dgs-v1215-case-visual-card">
              <div className="dgs-v1215-case-media">
                <img src="https://www.dgeniussolutions.com/wp-content/uploads/2025/12/Theworldgrad-website-scaled.png.webp" alt="TheWorldGrad website SEO case study" loading="lazy" />
              </div>
              <div className="dgs-v1215-case-content">
                <span>SEO Case Study · Education</span>
                <h3>TheWorldGrad</h3>
                <p>Overseas education platform helping Indian students study in Australia, UK and USA.</p>
                <div className="dgs-v1215-case-metrics">
                  <div><strong>95%</strong><small>Keyword Growth</small></div>
                  <div><strong>2.5x</strong><small>Backlinks</small></div>
                  <div><strong>6x</strong><small>Traffic</small></div>
                </div>
              </div>
            </article>

            <article className="dgs-v1215-case-visual-card">
              <div className="dgs-v1215-case-media">
                <img src="https://www.dgeniussolutions.com/wp-content/uploads/2026/07/Weavings-Home-page-.png" alt="Weavings website case study" loading="lazy" />
              </div>
              <div className="dgs-v1215-case-content">
                <span>SEO + Web + Performance</span>
                <h3>Weavings Manpower</h3>
                <p>Staffing company offering contract staffing and payroll outsourcing across India.</p>
                <div className="dgs-v1215-case-metrics">
                  <div><strong>17.4K</strong><small>Clicks</small></div>
                  <div><strong>1.82M</strong><small>Impressions</small></div>
                  <div><strong>#1</strong><small>AI Ranking</small></div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="dgs-v1215-testimonials" id="testimonials">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-section-head dgs-v1215-reveal">
            <div className="dgs-v1215-section-kicker">Testimonials</div>
            <h2>Trusted By Brands Worldwide</h2>
            <p>Client feedback across creative design, website development, social media, SEO and full-stack digital marketing.</p>
          </div>

          <div className="dgs-v1215-testimonial-grid dgs-v1215-reveal">
            <article className="dgs-v1215-testimonial-card">
              <div className="dgs-v1215-stars">★★★★★</div>
              <p>D'Genius Solutions has been a game-changer for our retail marketing efforts. Their team understood our brand aesthetics instantly and delivered high-impact creatives that significantly improved engagement.</p>
              <h3>Aparna Singh</h3>
              <span>Marketing Manager · Eureka Forbes</span>
            </article>
            <article className="dgs-v1215-testimonial-card">
              <div className="dgs-v1215-stars">★★★★★</div>
              <p>Working with D'Genius Solutions on our website has been an exceptional experience. From UI/UX structuring to backend functionality, the team ensured seamless execution.</p>
              <h3>Dujon Fernandes</h3>
              <span>Digital Marketing Manager · Onida</span>
            </article>
          </div>
        </div>
      </section>

      {/* SEARCH AUTHORITY */}
      <section className="dgs-v1215-search-authority" id="dgs-v1215-search-authority">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-section-head dgs-v1215-reveal">
            <div className="dgs-v1215-section-kicker">Search Authority</div>
            <h2>Built For Google Search, AI Answers And Voice Discovery</h2>
            <p>As a digital marketing agency in Mumbai, we structure websites and content for how people search today across Google, AI answer engines, and voice-led discovery.</p>
          </div>

          <div className="dgs-v1215-authority-grid dgs-v1215-reveal">
            <article className="dgs-v1215-authority-card">
              <span>SEO Agency In Mumbai</span>
              <h3>Rank-ready content foundations.</h3>
              <p>Technical SEO, content structure, internal links and search intent mapping for stronger organic visibility.</p>
            </article>
            <article className="dgs-v1215-authority-card">
              <span>AEO Agency In Mumbai</span>
              <h3>Built for answer-first discovery.</h3>
              <p>Content designed to answer real customer questions clearly across featured snippets and AI answers.</p>
            </article>
            <article className="dgs-v1215-authority-card">
              <span>GEO Services</span>
              <h3>Visibility for generative search.</h3>
              <p>Brand, service and topical signals structured for AI-led search environments and generative discovery.</p>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="dgs-v1215-faq" id="dgs-v1215-faq">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-section-head dgs-v1215-reveal">
            <div className="dgs-v1215-section-kicker">Search Ready Answers</div>
            <h2>Questions Brands Ask Before Choosing A Digital Marketing Agency</h2>
          </div>

          <div className="dgs-v1215-faq-grid dgs-v1215-reveal">
            <details open>
              <summary>What does D’Genius Solutions do?</summary>
              <p>D’Genius Solutions is a full service digital marketing agency in Mumbai offering SEO, AEO, GEO, LLM SEO, website development, social media marketing, performance marketing, branding, content creation and AI production.</p>
            </details>
            <details>
              <summary>Is D’Genius Solutions an SEO agency in Mumbai?</summary>
              <p>Yes. We support brands with technical SEO, content strategy, on-page optimization, internal linking, local search improvements and organic growth planning.</p>
            </details>
            <details>
              <summary>Do you offer AEO, GEO and LLM SEO services?</summary>
              <p>Yes. We help structure website content for answer engines, generative search experiences and large language model discovery through clear entities, service pages, FAQs and schema-ready content.</p>
            </details>
          </div>
        </div>
      </section>

      {/* CONTACT FORM CTA */}
      <section className="dgs-v1215-final" id="contact-form">
        <div className="dgs-v1215-shell">
          <div className="dgs-v1215-final-card dgs-v1215-reveal">
            <div>
              <span>Ready To Fix The Gaps?</span>
              <h2>Let us audit your brand, website, search visibility and campaign flow.</h2>
              <p>Start with a focused growth audit from a Mumbai based digital marketing team across SEO, AEO, GEO, LLM SEO, website performance, content, social media, ads and creative output.</p>
            </div>
            <a href="#contact-form" className="dgs-v1215-btn dgs-v1215-btn-primary">
              Start With A Growth Audit <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* SEO / AEO / GEO / LLM SCHEMA STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://www.dgeniussolutions.com/#organization",
                "name": "D’Genius Solutions",
                "url": "https://www.dgeniussolutions.com/",
                "description": "D’Genius Solutions is a full service digital marketing agency in Mumbai offering SEO, AEO, GEO, LLM SEO, website development, social media marketing, performance marketing and AI production."
              },
              {
                "@type": "ProfessionalService",
                "@id": "https://www.dgeniussolutions.com/#professionalservice",
                "name": "D’Genius Solutions",
                "url": "https://www.dgeniussolutions.com/",
                "areaServed": { "@type": "City", "name": "Mumbai" },
                "serviceType": [
                  "Digital Marketing",
                  "SEO",
                  "AEO",
                  "GEO",
                  "LLM SEO",
                  "Voice Search Optimization",
                  "Website Development",
                  "Social Media Marketing",
                  "Performance Marketing",
                  "AI Production"
                ],
                "provider": { "@id": "https://www.dgeniussolutions.com/#organization" }
              },
              {
                "@type": "WebSite",
                "@id": "https://www.dgeniussolutions.com/#website",
                "url": "https://www.dgeniussolutions.com/",
                "name": "D’Genius Solutions",
                "publisher": { "@id": "https://www.dgeniussolutions.com/#organization" }
              }
            ]
          }),
        }}
      />
    </main>
  );
}
