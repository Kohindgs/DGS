/**
 * Flagship dark-mode Services Hub for /services/ and /our-services/.
 * Replaces the legacy WordPress CPT archive loop (which had 9 broken placeholder icons,
 * unformatted text dumps, and a dead /services/page/2/ pagination link) with a complete,
 * conversion-engineered hub linking all Core Services, India Regional Hubs, Global Markets,
 * and Verified Case Studies.
 */

export function buildServicesHubHtml(): string {
  return `
<style>
  .dgs-services-hub {
    background:
      radial-gradient(circle at 18% 8%, rgba(253, 92, 98, 0.14), transparent 36%),
      radial-gradient(circle at 84% 16%, rgba(56, 189, 248, 0.12), transparent 38%),
      radial-gradient(circle at 50% 62%, rgba(99, 102, 241, 0.08), transparent 45%),
      #050507;
    color: #f8fafc;
    font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: clamp(124px, 12vw, 156px) clamp(18px, 4vw, 48px) clamp(72px, 8vw, 112px);
    position: relative;
    overflow: hidden;
  }

  .dgs-services-hub * {
    box-sizing: border-box;
  }

  .dgs-sh-container {
    max-width: 1280px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  .dgs-sh-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 16px;
    border-radius: 999px;
    background: rgba(253, 92, 98, 0.12);
    border: 1px solid rgba(253, 92, 98, 0.32);
    color: #ff7a6b;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  .dgs-sh-hero {
    text-align: left;
    max-width: 960px;
    margin-bottom: clamp(40px, 5vw, 60px);
  }

  .dgs-sh-title {
    font-family: 'Space Grotesk', 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(2.2rem, 4.4vw, 3.75rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.025em;
    color: #ffffff;
    margin: 0 0 20px;
  }

  .dgs-sh-title-accent {
    background: linear-gradient(95deg, #ff7a59 0%, #fd5c62 48%, #38bdf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .dgs-sh-lead {
    font-size: clamp(1.02rem, 1.35vw, 1.18rem);
    line-height: 1.72;
    color: rgba(241, 245, 249, 0.82);
    margin: 0 0 28px;
    max-width: 840px;
  }

  .dgs-sh-cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
  }

  .dgs-sh-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 15px 28px;
    border-radius: 999px;
    background: linear-gradient(135deg, #fd5c62 0%, #ff8038 100%);
    color: #ffffff !important;
    font-weight: 700;
    font-size: 0.96rem;
    text-decoration: none !important;
    box-shadow: 0 12px 30px rgba(253, 92, 98, 0.32);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }

  .dgs-sh-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 36px rgba(253, 92, 98, 0.46);
  }

  .dgs-sh-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 15px 26px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: #f8fafc !important;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none !important;
    transition: background 0.22s ease, border-color 0.22s ease, transform 0.22s ease;
  }

  .dgs-sh-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(56, 189, 248, 0.45);
    transform: translateY(-2px);
  }

  .dgs-sh-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
    margin-bottom: clamp(56px, 7vw, 84px);
  }

  .dgs-sh-stat-card {
    background: rgba(15, 20, 32, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 20px;
    padding: 22px 24px;
    backdrop-filter: blur(12px);
  }

  .dgs-sh-stat-num {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.8rem, 2.8vw, 2.4rem);
    font-weight: 800;
    color: #ffffff;
    line-height: 1.1;
    margin-bottom: 6px;
  }

  .dgs-sh-stat-label {
    font-size: 0.88rem;
    color: rgba(226, 232, 240, 0.76);
    line-height: 1.45;
  }

  .dgs-sh-section {
    margin-bottom: clamp(56px, 7vw, 88px);
  }

  .dgs-sh-section-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    margin-bottom: 28px;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  }

  .dgs-sh-section-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.55rem, 2.6vw, 2.25rem);
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }

  .dgs-sh-section-sub {
    font-size: 0.98rem;
    color: rgba(226, 232, 240, 0.74);
    margin: 0;
    max-width: 720px;
    line-height: 1.6;
  }

  .dgs-sh-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 22px;
  }

  .dgs-sh-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px;
  }

  .dgs-sh-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: linear-gradient(155deg, rgba(19, 24, 38, 0.86) 0%, rgba(10, 12, 20, 0.94) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 22px;
    padding: 28px 26px;
    text-decoration: none !important;
    color: #f8fafc !important;
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    position: relative;
    overflow: hidden;
  }

  .dgs-sh-card:hover {
    transform: translateY(-5px);
    border-color: rgba(253, 92, 98, 0.45);
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.55), 0 0 28px rgba(253, 92, 98, 0.12);
  }

  .dgs-sh-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .dgs-sh-badge {
    display: inline-block;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: rgba(56, 189, 248, 0.12);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.28);
  }

  .dgs-sh-badge.is-coral {
    background: rgba(253, 92, 98, 0.13);
    color: #ff7a6b;
    border-color: rgba(253, 92, 98, 0.3);
  }

  .dgs-sh-badge.is-emerald {
    background: rgba(16, 185, 129, 0.13);
    color: #34d399;
    border-color: rgba(16, 185, 129, 0.3);
  }

  .dgs-sh-num {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.35);
  }

  .dgs-sh-card-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.32rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 12px;
    line-height: 1.28;
  }

  .dgs-sh-card-desc {
    font-size: 0.94rem;
    line-height: 1.65;
    color: rgba(226, 232, 240, 0.78);
    margin: 0 0 18px;
  }

  .dgs-sh-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 20px;
  }

  .dgs-sh-tag {
    font-size: 0.74rem;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(241, 245, 249, 0.85);
  }

  .dgs-sh-card-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 700;
    color: #ff7a6b;
    margin-top: auto;
  }

  .dgs-sh-card:hover .dgs-sh-card-link {
    color: #38bdf8;
  }

  .dgs-sh-cta-banner {
    background: linear-gradient(135deg, rgba(25, 18, 36, 0.95) 0%, rgba(12, 18, 34, 0.96) 100%);
    border: 1px solid rgba(253, 92, 98, 0.32);
    border-radius: 28px;
    padding: clamp(32px, 4.5vw, 52px);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  }

  @media (max-width: 1024px) {
    .dgs-sh-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .dgs-sh-grid-3 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 680px) {
    .dgs-sh-stats,
    .dgs-sh-grid-3,
    .dgs-sh-grid-2 {
      grid-template-columns: 1fr;
    }
  }
</style>

<div class="dgs-services-hub">
  <div class="dgs-sh-container">
    <header class="dgs-sh-hero">
      <div class="dgs-sh-eyebrow">Mumbai HQ • Pan-India • Dubai UAE • USA • Australia</div>
      <h1 class="dgs-sh-title">
        Digital Marketing, SEO &amp; AI Services Built for <span class="dgs-sh-title-accent">Rankings, Citations &amp; Revenue</span>
      </h1>
      <p class="dgs-sh-lead">
        D'Genius Solutions is a full-stack digital growth, search engineering, and AI creative studio headquartered in Khar West, Mumbai. Led by Founder &amp; CEO <strong>Kohin Bellara</strong>, our in-house teams unite classical Search Engine Optimization (SEO), Answer &amp; Generative Engine Optimization (AEO / GEO / LLM SEO), custom web engineering, AI commercial film production, and ROI-accountable paid media under one roof.
      </p>
      <div class="dgs-sh-cta-row">
        <a href="/contact-us/" class="dgs-sh-btn-primary dgs-talk-trigger">
          Request A Free Growth &amp; SEO Audit <span>→</span>
        </a>
        <a href="/case_studies/" class="dgs-sh-btn-secondary">
          Explore Verified Client Results <span>↗</span>
        </a>
        <a href="/seo-pricing/" class="dgs-sh-btn-secondary">
          View SEO Packages &amp; Pricing <span>↗</span>
        </a>
      </div>
    </header>

    <section class="dgs-sh-stats" aria-label="D'Genius Solutions key performance metrics">
      <div class="dgs-sh-stat-card">
        <div class="dgs-sh-stat-num">75+</div>
        <div class="dgs-sh-stat-label">Enterprise &amp; challenger brands scaled across India, UAE, USA &amp; Australia</div>
      </div>
      <div class="dgs-sh-stat-card">
        <div class="dgs-sh-stat-num">6x</div>
        <div class="dgs-sh-stat-label">Organic search traffic growth delivered for <strong>TheWorldGrad</strong> (EdTech)</div>
      </div>
      <div class="dgs-sh-stat-card">
        <div class="dgs-sh-stat-num">17.4K+</div>
        <div class="dgs-sh-stat-label">High-intent commercial search clicks for <strong>Weavings Manpower</strong> (1.19M+ impressions)</div>
      </div>
      <div class="dgs-sh-stat-card">
        <div class="dgs-sh-stat-num">10</div>
        <div class="dgs-sh-stat-label">Integrated execution pods spanning Search, AI Visibility, Web Dev, Video &amp; Ads</div>
      </div>
    </section>

    <!-- SECTION 1: 10 CORE SERVICES -->
    <section class="dgs-sh-section" aria-labelledby="core-services-heading">
      <div class="dgs-sh-section-header">
        <div>
          <h2 id="core-services-heading" class="dgs-sh-section-title">Core Search, AI Visibility, Web &amp; Creative Services</h2>
          <p class="dgs-sh-section-sub">
            Select any specialized service pillar below to explore our methodology, deliverables, pricing models, and verified client case studies.
          </p>
        </div>
      </div>

      <div class="dgs-sh-grid-3">
        <a href="/services/seo-services-in-mumbai/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-coral">Flagship Search</span>
              <span class="dgs-sh-num">01</span>
            </div>
            <h3 class="dgs-sh-card-title">SEO Services in Mumbai</h3>
            <p class="dgs-sh-card-desc">
              Full-funnel technical SEO, commercial keyword clustering, Google Business Profile Map Pack dominance, and authority link building engineered for qualified leads and revenue.
            </p>
            <div class="dgs-sh-tags">
              <span class="dgs-sh-tag">Technical SEO Audits</span>
              <span class="dgs-sh-tag">Local Map Pack</span>
              <span class="dgs-sh-tag">Topic Clusters</span>
              <span class="dgs-sh-tag">Digital PR &amp; Links</span>
            </div>
          </div>
          <span class="dgs-sh-card-link">Explore SEO Services in Mumbai →</span>
        </a>

        <a href="/services/aeo-services-in-mumbai/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge">AI Search &amp; Answers</span>
              <span class="dgs-sh-num">02</span>
            </div>
            <h3 class="dgs-sh-card-title">Answer Engine Optimization (AEO)</h3>
            <p class="dgs-sh-card-desc">
              Capture zero-click searches, Google AI Overviews, Featured Snippets, People Also Ask boxes, and voice search answers with structured answer capsules and schema graphs.
            </p>
            <div class="dgs-sh-tags">
              <span class="dgs-sh-tag">Google AI Overviews</span>
              <span class="dgs-sh-tag">Featured Snippets</span>
              <span class="dgs-sh-tag">FAQ &amp; Speakable Schema</span>
              <span class="dgs-sh-tag">Voice Search</span>
            </div>
          </div>
          <span class="dgs-sh-card-link">Explore AEO Services →</span>
        </a>

        <a href="/services/geo/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge">Generative AI</span>
              <span class="dgs-sh-num">03</span>
            </div>
            <h3 class="dgs-sh-card-title">Generative Engine Optimization (GEO)</h3>
            <p class="dgs-sh-card-desc">
              Position your brand as the primary cited recommendation inside ChatGPT, Perplexity, Google Gemini, and Claude through entity clarity, passage citability, and third-party corroboration.
            </p>
            <div class="dgs-sh-tags">
              <span class="dgs-sh-tag">ChatGPT &amp; Perplexity</span>
              <span class="dgs-sh-tag">Entity Knowledge Graph</span>
              <span class="dgs-sh-tag">Passage Citability</span>
              <span class="dgs-sh-tag">Citation Tracking</span>
            </div>
          </div>
          <span class="dgs-sh-card-link">Explore GEO Services →</span>
        </a>

        <a href="/services/llm-seo-service/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge">LLM Retrieval</span>
              <span class="dgs-sh-num">04</span>
            </div>
            <h3 class="dgs-sh-card-title">LLM SEO Services</h3>
            <p class="dgs-sh-card-desc">
              Optimize your site architecture for Large Language Model crawlers (GPTBot, ClaudeBot, PerplexityBot) with llms.txt, semantic HTML tables, and high-information-gain content.
            </p>
            <div class="dgs-sh-tags">
              <span class="dgs-sh-tag">llms.txt Architecture</span>
              <span class="dgs-sh-tag">RAG Readiness</span>
              <span class="dgs-sh-tag">Semantic Entity Graphs</span>
              <span class="dgs-sh-tag">AI Share of Voice</span>
            </div>
          </div>
          <span class="dgs-sh-card-link">Explore LLM SEO Services →</span>
        </a>

        <a href="/services/ai-video-production-agency/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-coral">AI Studio</span>
              <span class="dgs-sh-num">05</span>
            </div>
            <h3 class="dgs-sh-card-title">AI Video Production Agency in Mumbai</h3>
            <p class="dgs-sh-card-desc">
              Cinema-grade AI commercial films, TVCs, product launch videos, mythological &amp; brand storytelling, and high-ROAS performance video ads delivered at 5x traditional studio speed.
            </p>
            <div class="dgs-sh-tags">
              <span class="dgs-sh-tag">AI Commercials &amp; TVCs</span>
              <span class="dgs-sh-tag">Product Launch Films</span>
              <span class="dgs-sh-tag">Performance Video Ads</span>
              <span class="dgs-sh-tag">AI Avatars &amp; Mascots</span>
            </div>
          </div>
          <span class="dgs-sh-card-link">Explore AI Video Production Agency in Mumbai →</span>
        </a>

        <a href="/services/website-development-amc/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-emerald">Web Engineering</span>
              <span class="dgs-sh-num">06</span>
            </div>
            <h3 class="dgs-sh-card-title">Website Development &amp; Annual Maintenance (AMC)</h3>
            <p class="dgs-sh-card-desc">
              Conversion-engineered custom websites, Next.js/React web apps, WordPress &amp; Shopify stores, Core Web Vitals optimization, and proactive 24/7 security &amp; AMC support.
            </p>
            <div class="dgs-sh-tags">
              <span class="dgs-sh-tag">Next.js &amp; Custom Web</span>
              <span class="dgs-sh-tag">WordPress &amp; Shopify</span>
              <span class="dgs-sh-tag">Core Web Vitals</span>
              <span class="dgs-sh-tag">Website AMC</span>
            </div>
          </div>
          <span class="dgs-sh-card-link">Explore Website Development &amp; AMC →</span>
        </a>

        <a href="/services/performance-marketing/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-coral">Paid Media &amp; ROAS</span>
              <span class="dgs-sh-num">07</span>
            </div>
            <h3 class="dgs-sh-card-title">Performance Marketing Agency</h3>
            <p class="dgs-sh-card-desc">
              Full-funnel paid acquisition across Google Search, Performance Max, Meta (Instagram &amp; Facebook), YouTube, and LinkedIn B2B ads paired with custom landing page CRO and attribution.
            </p>
            <div class="dgs-sh-tags">
              <span class="dgs-sh-tag">Google Search &amp; PMax</span>
              <span class="dgs-sh-tag">Meta &amp; Instagram Ads</span>
              <span class="dgs-sh-tag">LinkedIn B2B Leads</span>
              <span class="dgs-sh-tag">Conversion Tracking</span>
            </div>
          </div>
          <span class="dgs-sh-card-link">Explore Performance Marketing →</span>
        </a>

        <a href="/services/social-media-marketing/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge">Brand &amp; Community</span>
              <span class="dgs-sh-num">08</span>
            </div>
            <h3 class="dgs-sh-card-title">Social Media Marketing</h3>
            <p class="dgs-sh-card-desc">
              Scroll-stopping Instagram Reels, YouTube Shorts, executive LinkedIn thought leadership, interactive carousels, and creator-led social engines that turn followers into pipeline.
            </p>
            <div class="dgs-sh-tags">
              <span class="dgs-sh-tag">Instagram &amp; Reels</span>
              <span class="dgs-sh-tag">LinkedIn B2B Branding</span>
              <span class="dgs-sh-tag">Content Calendars</span>
              <span class="dgs-sh-tag">Creator Campaigns</span>
            </div>
          </div>
          <span class="dgs-sh-card-link">Explore Social Media Marketing →</span>
        </a>

        <a href="/services/branding/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge">Identity &amp; Design</span>
              <span class="dgs-sh-num">09</span>
            </div>
            <h3 class="dgs-sh-card-title">Branding &amp; Visual Identity</h3>
            <p class="dgs-sh-card-desc">
              Strategic brand positioning, naming, logo systems, packaging design, brand guidelines, and investor/sales collateral built to command category authority and premium pricing.
            </p>
            <div class="dgs-sh-tags">
              <span class="dgs-sh-tag">Brand Strategy</span>
              <span class="dgs-sh-tag">Logo &amp; Visual Systems</span>
              <span class="dgs-sh-tag">Packaging Design</span>
              <span class="dgs-sh-tag">Brand Guidelines</span>
            </div>
          </div>
          <span class="dgs-sh-card-link">Explore Branding Services →</span>
        </a>

        <a href="/services/content-creation/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-emerald">Editorial &amp; Copy</span>
              <span class="dgs-sh-num">10</span>
            </div>
            <h3 class="dgs-sh-card-title">Content Creation &amp; SEO Copywriting</h3>
            <p class="dgs-sh-card-desc">
              E-E-A-T editorial articles, hub-and-spoke topic clusters, high-converting service landing pages, B2B whitepapers, and ad scripts engineered for both human buyers and AI engines.
            </p>
            <div class="dgs-sh-tags">
              <span class="dgs-sh-tag">SEO Topic Clusters</span>
              <span class="dgs-sh-tag">Conversion Copywriting</span>
              <span class="dgs-sh-tag">B2B Thought Leadership</span>
              <span class="dgs-sh-tag">Ad &amp; Video Scripts</span>
            </div>
          </div>
          <span class="dgs-sh-card-link">Explore Content Creation →</span>
        </a>

        <a href="/portfolio/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-emerald">Creative Showcase</span>
              <span class="dgs-sh-num">11</span>
            </div>
            <h3 class="dgs-sh-card-title">Creative &amp; Video Portfolio Showcase</h3>
            <p class="dgs-sh-card-desc">
              Explore 200+ brand campaigns, AI commercial films, social media reels, 3D/CGI product showcases, and high-converting digital experiences built in-house.
            </p>
            <div class="dgs-sh-tags">
              <span class="dgs-sh-tag">AI Commercials</span>
              <span class="dgs-sh-tag">Brand Campaigns</span>
              <span class="dgs-sh-tag">Reels &amp; Motion</span>
              <span class="dgs-sh-tag">Web Experiences</span>
            </div>
          </div>
          <span class="dgs-sh-card-link">Explore Full Portfolio →</span>
        </a>

        <a href="/seo-pricing/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-coral">Transparent Plans</span>
              <span class="dgs-sh-num">12</span>
            </div>
            <h3 class="dgs-sh-card-title">SEO Packages, Deliverables &amp; Pricing</h3>
            <p class="dgs-sh-card-desc">
              Compare our Local Growth, National Scale, and Enterprise SEO + AI Visibility retainers with clear monthly deliverables, KPIs, and custom multi-service bundles.
            </p>
            <div class="dgs-sh-tags">
              <span class="dgs-sh-tag">Local &amp; National Tiers</span>
              <span class="dgs-sh-tag">SEO + AEO + GEO</span>
              <span class="dgs-sh-tag">Clear Monthly Deliverables</span>
              <span class="dgs-sh-tag">Custom Audits</span>
            </div>
          </div>
          <span class="dgs-sh-card-link">Compare SEO Pricing &amp; Plans →</span>
        </a>
      </div>
    </section>

    <!-- SECTION 2: INDIA REGIONAL HUBS -->
    <section class="dgs-sh-section" aria-labelledby="india-hubs-heading">
      <div class="dgs-sh-section-header">
        <div>
          <h2 id="india-hubs-heading" class="dgs-sh-section-title">Regional India SEO &amp; Web Engineering Hubs</h2>
          <p class="dgs-sh-section-sub">
            City-specific search strategies tailored to India's highest-velocity commercial and technology corridors.
          </p>
        </div>
      </div>

      <div class="dgs-sh-grid-3">
        <a href="/services/seo-service-pune/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge">Maharashtra</span>
              <span class="dgs-sh-num">PUNE</span>
            </div>
            <h3 class="dgs-sh-card-title">SEO Services in Pune</h3>
            <p class="dgs-sh-card-desc">
              B2B SaaS, automotive, manufacturing, education, and real estate SEO across Hinjewadi IT Park, Baner, Kharadi, Magarpatta, Viman Nagar, and Pimpri-Chinchwad (PCMC).
            </p>
          </div>
          <span class="dgs-sh-card-link">Explore Pune SEO Services →</span>
        </a>

        <a href="/services/website-development-pune-page/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-emerald">Web Engineering</span>
              <span class="dgs-sh-num">PUNE</span>
            </div>
            <h3 class="dgs-sh-card-title">Website Development Company in Pune</h3>
            <p class="dgs-sh-card-desc">
              Responsive, conversion-focused, and SEO-architected websites, WordPress/Shopify builds, and custom web applications for Pune startups, SMEs, and enterprises.
            </p>
          </div>
          <span class="dgs-sh-card-link">Explore Pune Web Development →</span>
        </a>

        <a href="/services/seo-service-in-banglore/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge">Karnataka</span>
              <span class="dgs-sh-num">BLR</span>
            </div>
            <h3 class="dgs-sh-card-title">SEO Services in Bangalore (Bengaluru)</h3>
            <p class="dgs-sh-card-desc">
              Product-led SEO, programmatic content, and AI search visibility for technology, FinTech, and enterprise brands across Whitefield, Electronic City, HSR Layout, Koramangala &amp; Indiranagar.
            </p>
          </div>
          <span class="dgs-sh-card-link">Explore Bangalore SEO Services →</span>
        </a>

        <a href="/services/seo-service-in-gurugram/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge">Delhi NCR</span>
              <span class="dgs-sh-num">GGN</span>
            </div>
            <h3 class="dgs-sh-card-title">SEO Services in Gurugram (Gurgaon)</h3>
            <p class="dgs-sh-card-desc">
              Enterprise B2B, FinTech, healthcare, and luxury real estate search growth across DLF Cyber City, Golf Course Road, Udyog Vihar, Sohna Road, and the wider Delhi NCR corridor.
            </p>
          </div>
          <span class="dgs-sh-card-link">Explore Gurugram SEO Services →</span>
        </a>

        <a href="/services/seo-services-in-hyderabad/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge">Telangana</span>
              <span class="dgs-sh-num">HYD</span>
            </div>
            <h3 class="dgs-sh-card-title">SEO Services in Hyderabad</h3>
            <p class="dgs-sh-card-desc">
              High-intent organic acquisition for IT, SaaS, pharma, hospitals, and real estate developers across HITEC City, Madhapur, Gachibowli, Financial District, Kondapur &amp; Banjara Hills.
            </p>
          </div>
          <span class="dgs-sh-card-link">Explore Hyderabad SEO Services →</span>
        </a>

        <a href="/services/seo-services-in-mumbai/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-coral">Headquarters</span>
              <span class="dgs-sh-num">BOM</span>
            </div>
            <h3 class="dgs-sh-card-title">Mumbai Headquarters (Khar West)</h3>
            <p class="dgs-sh-card-desc">
              Direct in-person strategy and execution from Swami Vivekanand Rd, Khar West across BKC, Lower Parel, Andheri, Powai, Goregaon, Malad, Navi Mumbai, and Thane.
            </p>
          </div>
          <span class="dgs-sh-card-link">Explore Mumbai HQ Services →</span>
        </a>
      </div>
    </section>

    <!-- SECTION 3: INTERNATIONAL MARKETS -->
    <section class="dgs-sh-section" aria-labelledby="global-markets-heading">
      <div class="dgs-sh-section-header">
        <div>
          <h2 id="global-markets-heading" class="dgs-sh-section-title">International Growth Markets — Dubai UAE, USA &amp; Australia</h2>
          <p class="dgs-sh-section-sub">
            Cross-border search, AI visibility, and creative production pods engineered for high-CPC international markets.
          </p>
        </div>
      </div>

      <div class="dgs-sh-grid-3">
        <a href="/services/dubai-seo/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-coral">UAE &amp; MENA</span>
              <span class="dgs-sh-num">DXB</span>
            </div>
            <h3 class="dgs-sh-card-title">SEO Agency in Dubai, UAE</h3>
            <p class="dgs-sh-card-desc">
              Bilingual-ready technical SEO, Google Maps visibility, and commercial lead generation for Dubai enterprises across DIFC, Business Bay, Dubai Marina, JLT, and Downtown Dubai.
            </p>
          </div>
          <span class="dgs-sh-card-link">Explore Dubai SEO Services →</span>
        </a>

        <a href="/aeo-dubai/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge">UAE AI Search</span>
              <span class="dgs-sh-num">DXB</span>
            </div>
            <h3 class="dgs-sh-card-title">AEO Services in Dubai, UAE</h3>
            <p class="dgs-sh-card-desc">
              Answer Engine Optimization and AI Overview citation strategies for luxury hospitality, real estate, FinTech, and B2B brands competing in the UAE.
            </p>
          </div>
          <span class="dgs-sh-card-link">Explore AEO Dubai →</span>
        </a>

        <a href="/services/ai-production-dubai-page/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-coral">UAE Creative</span>
              <span class="dgs-sh-num">DXB</span>
            </div>
            <h3 class="dgs-sh-card-title">AI Video Production Agency in Dubai</h3>
            <p class="dgs-sh-card-desc">
              Campaign-ready AI commercials, Ramadan &amp; Eid brand films, luxury product reels, and multilingual video ads for Dubai and GCC brands without physical shoot delays.
            </p>
          </div>
          <span class="dgs-sh-card-link">Explore Dubai AI Video Studio →</span>
        </a>

        <a href="/us-landing-page/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-emerald">North America</span>
              <span class="dgs-sh-num">USA</span>
            </div>
            <h3 class="dgs-sh-card-title">Digital Marketing &amp; SEO for US Brands</h3>
            <p class="dgs-sh-card-desc">
              US-aligned SEO, AEO, custom Next.js/WordPress engineering, and paid media execution with EST/PST overlap for American SaaS, healthcare, e-commerce, and B2B companies.
            </p>
          </div>
          <span class="dgs-sh-card-link">Explore US Growth Pod →</span>
        </a>

        <a href="/australia-page/" class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-emerald">APAC</span>
              <span class="dgs-sh-num">AUS</span>
            </div>
            <h3 class="dgs-sh-card-title">Digital Marketing &amp; SEO in Australia</h3>
            <p class="dgs-sh-card-desc">
              Full-funnel organic search, AI citation engineering, and conversion web development for Australian businesses across Sydney, Melbourne, Brisbane, and Perth.
            </p>
          </div>
          <span class="dgs-sh-card-link">Explore Australia Growth Pod →</span>
        </a>

        <div class="dgs-sh-card">
          <div>
            <div class="dgs-sh-card-top">
              <span class="dgs-sh-badge is-coral">Proof of Work</span>
              <span class="dgs-sh-num">ROI</span>
            </div>
            <h3 class="dgs-sh-card-title">Verified Case Studies &amp; Client Proof</h3>
            <p class="dgs-sh-card-desc">
              Inspect real Google Search Console graphs (<a href="/case_studies/" style="color:#38bdf8;text-decoration:underline;">All Case Studies</a>), AI production breakdowns (<a href="/services/shirdi-se-sai-tak-case-study/" style="color:#38bdf8;text-decoration:underline;">Shirdi Se Sai Tak</a>), and brand transformations (<a href="/better-ceasons-case-study/" style="color:#38bdf8;text-decoration:underline;">Better Ceasons</a>).
            </p>
          </div>
          <a href="/case_studies/" class="dgs-sh-card-link" style="text-decoration:none;">View All Case Studies →</a>
        </div>
      </div>
    </section>

    <!-- SECTION 4: CONVERSION CTA BANNER -->
    <section class="dgs-sh-cta-banner" aria-label="Book a strategy consultation">
      <div style="max-width: 700px;">
        <div class="dgs-sh-eyebrow" style="margin-bottom: 12px;">Ready to Scale?</div>
        <h2 class="dgs-sh-section-title" style="margin-bottom: 10px;">
          Get a Custom Search, AI Visibility &amp; Growth Roadmap
        </h2>
        <p class="dgs-sh-section-sub">
          Speak directly with our Mumbai strategists for a technical SEO, AEO/GEO citation, or creative production audit tailored to your target keywords and revenue goals.
        </p>
      </div>
      <div class="dgs-sh-cta-row">
        <a href="/contact-us/" class="dgs-sh-btn-primary dgs-talk-trigger">
          Start With A Growth Audit <span>→</span>
        </a>
        <a href="tel:+919987922901" class="dgs-sh-btn-secondary">
          Call +91 99879 22901
        </a>
      </div>
    </section>
  </div>
</div>
`;
}
