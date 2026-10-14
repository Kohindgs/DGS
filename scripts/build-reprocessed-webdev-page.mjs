import fs from "node:fs";

// Load original data to preserve outer wrappers and metadata
const originalRaw = fs.readFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8");
const originalData = JSON.parse(originalRaw);

// Read extracted assets
const exactForm6Html = fs.readFileSync("./scripts/exact_form6_glass.html", "utf8");
const faqs = JSON.parse(fs.readFileSync("./scripts/extracted_faqs.json", "utf8"));

// -------------------------------------------------------------
// SECTION 1: HERO
// -------------------------------------------------------------
const section1Hero = `
<section class="section hero" id="heroVisual">
  <div class="webdev-container">
    <div class="hero-split">
      <div class="hero-copy">
        <div class="section-label"><span class="dot"></span> Website Development Company in Mumbai</div>
        <h1 class="h1"><span class="outline">Website Development</span> Company in Mumbai <span class="grad">Built for Leads, SEO &amp; Growth</span></h1>
        <p class="hero-p">D'Genius Solutions is a premier website development company in Mumbai creating responsive, conversion-focused and SEO-ready websites with WordPress, Next.js, React, HTML5, PHP and SCSS. We unite sitemap planning, UX design, engineering, search readiness, analytics and ongoing website AMC into one seamless, accountable workflow.</p>
        <div class="hero-ctas">
          <a class="btn btn-primary" href="#website-project-form">START YOUR WEBSITE PROJECT</a>
          <a class="btn btn-ghost" href="#recent-work">View Website Projects →</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><div class="stat-num">200+ Brands</div><div class="stat-lab">Agency Experience</div></div>
          <div class="stat"><div class="stat-num">Web + Search</div><div class="stat-lab">One Connected Workflow</div></div>
          <div class="stat"><div class="stat-num">Mumbai Studio</div><div class="stat-lab">Khar West Development &amp; AMC</div></div>
        </div>
      </div>
      <div class="hero-visual-card">
        <div class="hero-card-header">
          <span class="pulse-dot"></span>
          <span class="hero-card-title">Engineering Standards</span>
        </div>
        <div class="hero-card-metrics">
          <div class="h-metric">
            <span class="h-val">100%</span>
            <span class="h-lbl">Core Web Vitals Pass</span>
          </div>
          <div class="h-metric">
            <span class="h-val">0 Downtime</span>
            <span class="h-lbl">SEO Migration Cutover</span>
          </div>
          <div class="h-metric">
            <span class="h-val">Schema.org</span>
            <span class="h-lbl">Entity Graph Included</span>
          </div>
          <div class="h-metric">
            <span class="h-val">24/7 SLA</span>
            <span class="h-lbl">Proactive AMC Monitoring</span>
          </div>
        </div>
        <div class="hero-badges-row">
          <span class="h-badge">WordPress &amp; WooCommerce</span>
          <span class="h-badge">Next.js &amp; React</span>
          <span class="h-badge">Custom PHP &amp; APIs</span>
          <span class="h-badge">Conversion UX</span>
        </div>
      </div>
    </div>
  </div>
</section>
`;

// -------------------------------------------------------------
// SECTION 2: VERIFIED CLIENTS AND TRUST INDICATORS
// -------------------------------------------------------------
const section2Trust = `
<section class="section" id="proof">
  <div class="webdev-container">
    <div class="section-head text-center">
      <div class="section-label"><span class="dot"></span> Verified Client Trust &amp; Delivery Proof</div>
      <h2 class="h2">Website Delivery Supported by Strategy, Search and Ongoing Care</h2>
      <p class="p-sub">D'Genius Solutions combines full-stack web engineering with technical SEO architecture, conversion science and ongoing AMC support. Our work powers market leaders across Mumbai, India and global hubs.</p>
    </div>
    <div class="trust-grid">
      <div class="trust-card">
        <div class="trust-badge">Clutch Rated 5.0 ★★★★★</div>
        <h3 class="trust-title">Verified Agency Reviews</h3>
        <p class="trust-desc">Ranked among Mumbai's top digital marketing and website development agencies with verified client satisfaction across corporate and enterprise builds.</p>
      </div>
      <div class="trust-card">
        <div class="trust-badge">Performance Benchmark</div>
        <h3 class="trust-title">High Speed &amp; Core Web Vitals</h3>
        <p class="trust-desc">Sub-second load times, optimized Largest Contentful Paint (LCP &lt; 2.5s) and Cumulative Layout Shift (CLS &lt; 0.1) across mobile, tablet and desktop.</p>
      </div>
      <div class="trust-card">
        <div class="trust-badge">Search Authority</div>
        <h3 class="trust-title">SEO-First Architecture</h3>
        <p class="trust-desc">Semantic HTML5, canonical structure, Schema.org entity graphs, XML sitemaps and crawl-budget protection engineered directly into every template.</p>
      </div>
      <div class="trust-card">
        <div class="trust-badge">SLA Support</div>
        <h3 class="trust-title">Proactive AMC Coverage</h3>
        <p class="trust-desc">Continuous uptime monitoring, daily off-site cloud backups, regular core and security patching with guaranteed developer response times.</p>
      </div>
    </div>
    <div class="client-logos-row">
      <span class="client-pill">HumanXT HR Tech</span>
      <span class="client-pill">Weavings Staffing</span>
      <span class="client-pill">Katherine's Gallery</span>
      <span class="client-pill">Better Ceasons</span>
      <span class="client-pill">Clarion Logistics</span>
      <span class="client-pill">Sundaram B2B</span>
    </div>
  </div>
</section>
`;

// -------------------------------------------------------------
// SECTION 3: WEBSITE DEVELOPMENT SERVICES (Consolidated)
// -------------------------------------------------------------
const section3Services = `
<section class="section capability-section" id="website-development-services">
  <div class="webdev-container">
    <div class="section-head text-center">
      <div class="section-label"><span class="dot"></span> Website Development Services</div>
      <h2 class="h2">Complete Website Development Expertise on One Authoritative Page</h2>
      <p class="p-sub">Instead of sending visitors across multiple thin service pages, this unified service architecture explains the primary website solutions businesses compare before selecting a website development company in Mumbai.</p>
    </div>
    <div class="capabilities-grid">
      <div class="cap-card">
        <div class="cap-num">01</div>
        <h3 class="cap-title">Custom Website Development in Mumbai</h3>
        <p class="cap-desc">Bespoke websites engineered for unique business models, specialised enquiry funnels, customer portals, API integrations and headless content architectures. Built with clean code, modular components and zero technical debt.</p>
        <ul class="cap-list">
          <li>Custom UI/UX &amp; responsive layouts</li>
          <li>Component-based frontend architecture</li>
          <li>REST &amp; GraphQL API integrations</li>
          <li>High-speed database structures</li>
        </ul>
      </div>
      <div class="cap-card">
        <div class="cap-num">02</div>
        <h3 class="cap-title">WordPress &amp; WooCommerce CMS Development</h3>
        <p class="cap-desc">High-performance WordPress websites that empower marketing teams with controlled content editing, custom Gutenberg blocks, secure plugin environments and scalable WooCommerce online stores without sacrificing brand elegance.</p>
        <ul class="cap-list">
          <li>Custom themes &amp; Gutenberg block sections</li>
          <li>WooCommerce catalog &amp; checkout architecture</li>
          <li>Strict plugin hygiene &amp; security hardening</li>
          <li>Editorial workflow &amp; role permissions</li>
        </ul>
      </div>
      <div class="cap-card">
        <div class="cap-num">03</div>
        <h3 class="cap-title">Next.js &amp; Modern Frontend Engineering</h3>
        <p class="cap-desc">Cutting-edge web applications utilizing Next.js, React, TypeScript and Node.js for instant page loads, server-side rendering (SSR), static site generation (SSG) and edge computing. Ideal for high-traffic brands and modern digital products.</p>
        <ul class="cap-list">
          <li>Blazing edge performance &amp; instant hydration</li>
          <li>Static &amp; server-rendered page architecture</li>
          <li>Headless CMS decoupling (WordPress/Strapi)</li>
          <li>TypeScript type safety &amp; maintainability</li>
        </ul>
      </div>
      <div class="cap-card">
        <div class="cap-num">04</div>
        <h3 class="cap-title">E-Commerce Website Development</h3>
        <p class="cap-desc">Secure, conversion-driven e-commerce platforms engineered for seamless purchasing. Complete with frictionless checkout flows, multi-gateway payment integrations, automated inventory management and order fulfillment tracking.</p>
        <ul class="cap-list">
          <li>Custom cart &amp; 1-click checkout optimization</li>
          <li>Razorpay, Stripe, PayU &amp; UPI integrations</li>
          <li>ERP, CRM &amp; logistics courier API sync</li>
          <li>Mobile commerce &amp; cart abandonment recovery</li>
        </ul>
      </div>
      <div class="cap-card">
        <div class="cap-num">05</div>
        <h3 class="cap-title">Corporate &amp; B2B Service Websites</h3>
        <p class="cap-desc">Digital flagship websites planned around high-intent decision-maker journeys. Built to articulate nuanced positioning, present multi-tier service catalogs, validate market expertise through case studies and drive qualified corporate enquiries.</p>
        <ul class="cap-list">
          <li>CXO &amp; decision-maker conversion paths</li>
          <li>Interactive solution builders &amp; calculators</li>
          <li>Compliance, trust badges &amp; case studies</li>
          <li>Lead enrichment &amp; CRM pipeline forwarding</li>
        </ul>
      </div>
      <div class="cap-card">
        <div class="cap-num">06</div>
        <h3 class="cap-title">Core Web Vitals &amp; Performance Engineering</h3>
        <p class="cap-desc">Deep technical audit and remediation covering modern asset compression (WebP/AVIF), script deferral, CSS tree-shaking, database query optimization and CDN cache orchestration to achieve green Core Web Vitals scores.</p>
        <ul class="cap-list">
          <li>Sub-second Time to First Byte (TTFB)</li>
          <li>Zero layout shifts (CLS &lt; 0.05)</li>
          <li>Fast Interaction to Next Paint (INP &lt; 150ms)</li>
          <li>Hostinger CDN &amp; edge caching configuration</li>
        </ul>
      </div>
    </div>
  </div>
</section>
`;

// -------------------------------------------------------------
// SECTION 4: SELECTED WEBSITE PROJECTS (Four authentic case studies)
// -------------------------------------------------------------
const section4RecentWork = `
<section class="section" id="recent-work">
  <div class="webdev-container">
    <div class="section-head text-center">
      <div class="section-label"><span class="dot"></span> Website Development Case Studies</div>
      <h2 class="h2">Selected Website Projects <span class="grad">Across Industries</span></h2>
      <p class="p-sub">Examples of how D'Genius Solutions has translated business positioning, content and user journeys into structured, responsive and search-ready website experiences.</p>
    </div>
    <div class="recent-work work-samples-list">
      <article class="work-project-row">
        <div class="w-img">
          <img loading="lazy" class="live-preview-image e-lazyloaded" src="https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Humanxt-scaled.webp" alt="Live preview of HumanXT website" width="1600" height="1000" decoding="async" referrerpolicy="no-referrer" />
          <a aria-label="Open HumanXT live website" class="live-preview-link" href="https://humanxt.com/" rel="noopener noreferrer" target="_blank">Open HumanXT live website</a>
          <div class="work-year">2025</div>
        </div>
        <div class="work-project-body">
          <div class="work-kicker">Website Revamp • HR &amp; Workforce</div>
          <div class="work-project-index">01 / 04</div>
          <h3 class="work-client-name">HumanXT</h3>
          <p>HumanXT needed clearer positioning for decision-makers in a competitive HR market. The website revamp reorganised its service catalogue into a credible, enquiry-focused experience for CXOs and HR leaders.</p>
          <div class="work-meta"><span>WordPress</span><span>6–8 weeks</span><span>Discovery, IA, UI/UX, SEO</span></div>
          <div class="work-action-wrap">
            <a class="btn-live-link" href="https://humanxt.com/" target="_blank" rel="noopener noreferrer">OPEN LIVE WEBSITE ↗</a>
          </div>
        </div>
      </article>

      <article class="work-project-row">
        <div class="w-img">
          <img loading="lazy" class="live-preview-image e-lazyloaded" src="https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.weavings.in%2F?w=1600" alt="Live preview of Weavings website" width="1600" height="1000" decoding="async" referrerpolicy="no-referrer" />
          <a aria-label="Open Weavings live website" class="live-preview-link" href="https://www.weavings.in/" rel="noopener noreferrer" target="_blank">Open Weavings live website</a>
          <div class="work-year">2025</div>
        </div>
        <div class="work-project-body">
          <div class="work-kicker">Website Revamp • Staffing &amp; Manpower</div>
          <div class="work-project-index">02 / 04</div>
          <h3 class="work-client-name">Weavings</h3>
          <p>A modern website structure for manpower services, employer requirements and candidate journeys, designed to support clearer navigation, stronger service discovery and qualified enquiries.</p>
          <div class="work-meta"><span>WordPress</span><span>Conversion UX</span><span>SEO-ready structure</span></div>
          <div class="work-action-wrap">
            <a class="btn-live-link" href="https://www.weavings.in/" target="_blank" rel="noopener noreferrer">OPEN LIVE WEBSITE ↗</a>
          </div>
        </div>
      </article>

      <article class="work-project-row">
        <div class="w-img">
          <img loading="lazy" class="live-preview-image e-lazyloaded" src="https://www.dgeniussolutions.com/wp-content/uploads/2025/12/katherinesgallery-scaled.webp" alt="Live preview of Katherine's Gallery website" width="1600" height="1000" decoding="async" referrerpolicy="no-referrer" />
          <a aria-label="Open Katherine's Gallery live website" class="live-preview-link" href="https://katherinesgallery.in/" rel="noopener noreferrer" target="_blank">Open Katherine's Gallery live website</a>
          <div class="work-year">2025</div>
        </div>
        <div class="work-project-body">
          <div class="work-kicker">Website Launch • Beauty &amp; Wellness</div>
          <div class="work-project-index">03 / 04</div>
          <h3 class="work-client-name">Katherine's Gallery</h3>
          <p>An elegant website experience that communicates the brand, presents beauty services clearly and gives visitors a direct route towards enquiries and bookings.</p>
          <div class="work-meta"><span>WordPress</span><span>Brand-led UI</span><span>Booking journey</span></div>
          <div class="work-action-wrap">
            <a class="btn-live-link" href="https://katherinesgallery.in/" target="_blank" rel="noopener noreferrer">OPEN LIVE WEBSITE ↗</a>
          </div>
        </div>
      </article>

      <article class="work-project-row">
        <div class="w-img">
          <img loading="lazy" class="live-preview-image e-lazyloaded" src="/wp-content/uploads/2026/08/better-ceasons-scaled.webp" alt="Live preview of Better Ceasons website" width="1600" height="1000" decoding="async" referrerpolicy="no-referrer" />
          <a aria-label="Open Better Ceasons live website" class="live-preview-link" href="https://betterceasons.com/" rel="noopener noreferrer" target="_blank">Open Better Ceasons live website</a>
          <div class="work-year">2026</div>
        </div>
        <div class="work-project-body">
          <div class="work-kicker">Website Development • Clean Technology</div>
          <div class="work-project-index">04 / 04</div>
          <h3 class="work-client-name">Better Ceasons</h3>
          <p>A modern digital platform designed to communicate Better Ceasons' clean-technology vision, explain its solutions clearly and guide visitors through the brand's technology, impact and partnership journey.</p>
          <div class="work-meta"><span>Next.js</span><span>Headless Development</span><span>Responsive Experience</span></div>
          <div class="work-action-wrap">
            <a class="btn-live-link" href="https://betterceasons.com/" target="_blank" rel="noopener noreferrer">OPEN LIVE WEBSITE ↗</a>
          </div>
        </div>
      </article>

      <div class="cta-panel work-samples-cta">
        <div>
          <div class="work-kicker">Start a Website Project</div>
          <h3>Planning a New Website or Revamp?</h3>
          <p>Start with the business objective, website scope, content requirements, technology and search visibility priorities.</p>
        </div>
        <a class="btn btn-primary" href="#website-project-form">START YOUR WEBSITE PROJECT</a>
      </div>
    </div>
  </div>
</section>
`;

// -------------------------------------------------------------
// SECTION 5: WHY D'GENIUS SOLUTIONS (Consolidated)
// -------------------------------------------------------------
const section5WhyDgs = `
<section class="section" id="why-dgs">
  <div class="webdev-container">
    <div class="section-head text-center">
      <div class="section-label"><span class="dot"></span> Why D'Genius Solutions</div>
      <h2 class="h2">A Website Partner Connecting Development with Digital Growth</h2>
      <p class="p-sub">Many website projects separate strategy, design, development, SEO and maintenance across conflicting agencies. D'Genius Solutions coordinates these disciplines under one accountable team so your website is built from day one as an organic growth engine.</p>
    </div>
    <div class="why-grid">
      <div class="why-card">
        <div class="why-icon">01</div>
        <h3 class="why-title">Strategy Before Visual Design</h3>
        <p class="why-desc">The sitemap, user intent, page hierarchy and conversion journeys are mapped and stress-tested before visual styling begins. Design supports business function rather than forcing function to fit layout templates.</p>
      </div>
      <div class="why-card">
        <div class="why-icon">02</div>
        <h3 class="why-title">Technology Selected by Need</h3>
        <p class="why-desc">We choose WordPress, Next.js, React, PHP or custom CMS strictly according to content velocity, integrations, security requirements and team workflows—never forcing your business into an ill-fitting proprietary stack.</p>
      </div>
      <div class="why-card">
        <div class="why-icon">03</div>
        <h3 class="why-title">Search &amp; Schema Built-In</h3>
        <p class="why-desc">Semantic HTML5, canonical tags, Open Graph meta, XML sitemap readiness and Schema.org entity graphs are engineered into every template from day one—not bolted on as an afterthought after launch.</p>
      </div>
      <div class="why-card">
        <div class="why-icon">04</div>
        <h3 class="why-title">Complete In-House Workflow</h3>
        <p class="why-desc">UI/UX design, frontend engineering, backend development, SEO foundations, conversion tracking and post-launch maintenance operate under one roof with direct developer communication and zero outsourced finger-pointing.</p>
      </div>
      <div class="why-card">
        <div class="why-icon">05</div>
        <h3 class="why-title">100% Client Code Ownership</h3>
        <p class="why-desc">No lock-ins, proprietary licenses or encrypted themes. Your business owns all code repositories, database assets, hosting environments and design files completely upon handover.</p>
      </div>
      <div class="why-card">
        <div class="why-icon">06</div>
        <h3 class="why-title">Dependable AMC Stewardship</h3>
        <p class="why-desc">Our relationship continues long after launch. Proactive monitoring, security hardening, automated off-site backups and monthly developer hours protect your investment as your company grows.</p>
      </div>
    </div>
  </div>
</section>
`;

// -------------------------------------------------------------
// SECTION 6: DEVELOPMENT PROCESS
// -------------------------------------------------------------
const section6Process = `
<section class="section compact-section" id="development-process">
  <div class="webdev-container">
    <div class="section-head text-center">
      <div class="section-label"><span class="dot"></span> Development Process</div>
      <h2 class="h2">A Clear Process from Discovery to Launch and AMC</h2>
      <p class="p-sub">A structured, six-stage engineering methodology eliminates guesswork, prevents scope drift and guarantees alignment between design, code and search performance.</p>
    </div>
    <div class="process-steps-grid">
      <div class="step-card">
        <div class="step-badge">Phase 01</div>
        <h3 class="step-title">Discovery &amp; Objectives</h3>
        <p class="step-desc">Stakeholder workshops, target audience persona mapping, competitor benchmarking, technical requirement scoping, integration audits and measurable conversion goal setting.</p>
      </div>
      <div class="step-card">
        <div class="step-badge">Phase 02</div>
        <h3 class="step-title">Sitemap &amp; Search Planning</h3>
        <p class="step-desc">Information architecture (IA) structuring, keyword intent clustering, page hierarchy mapping, URL slug definition and internal linking strategy to establish strong organic search foundations.</p>
      </div>
      <div class="step-card">
        <div class="step-badge">Phase 03</div>
        <h3 class="step-title">UI/UX &amp; Content Flow</h3>
        <p class="step-desc">Wireframing, user journey design, responsive Figma prototypes, accessible typography systems, high-converting form layouts and collaborative client design reviews.</p>
      </div>
      <div class="step-card">
        <div class="step-badge">Phase 04</div>
        <h3 class="step-title">Development &amp; Integrations</h3>
        <p class="step-desc">Clean semantic coding in WordPress, Next.js or custom PHP, modular component building, database structuring, CRM/ERP webhook connections and payment gateway setups.</p>
      </div>
      <div class="step-card">
        <div class="step-badge">Phase 05</div>
        <h3 class="step-title">QA, Performance &amp; SEO Migration</h3>
        <p class="step-desc">Cross-browser matrix testing, mobile responsive QA, Core Web Vitals optimization, 1-to-1 301 redirect map execution, SSL verification and security vulnerability screening.</p>
      </div>
      <div class="step-card">
        <div class="step-badge">Phase 06</div>
        <h3 class="step-title">Launch, Measurement &amp; AMC</h3>
        <p class="step-desc">Zero-downtime production deployment, Google Search Console &amp; GA4 tracking configuration, team administrative training and seamless transition into proactive AMC care.</p>
      </div>
    </div>
  </div>
</section>
`;

// -------------------------------------------------------------
// SECTION 7: TECHNOLOGY AND PLATFORM CAPABILITIES
// -------------------------------------------------------------
const section7Tech = `
<section class="section" id="tech">
  <div class="webdev-container">
    <div class="section-head text-center">
      <div class="section-label"><span class="dot"></span> Technology &amp; Platform Capabilities</div>
      <h2 class="h2">Technology and Development Tools Selected for Performance, Editing and Scale</h2>
      <p class="p-sub">We select platforms, frontend frameworks, backend engines and deployment toolchains according to performance goals, security mandates, editorial workflows and client technical capabilities.</p>
    </div>
    <div class="tech-categories-grid">
      <div class="tech-cat-card">
        <h3 class="tech-cat-title">Frontend Engineering</h3>
        <p class="tech-cat-desc">Semantic, accessible and high-speed client interfaces built for instant rendering and smooth interaction.</p>
        <div class="tech-pills-wrap">
          <span class="t-pill">Next.js</span>
          <span class="t-pill">React</span>
          <span class="t-pill">HTML5</span>
          <span class="t-pill">CSS3</span>
          <span class="t-pill">SCSS / Sass</span>
          <span class="t-pill">JavaScript (ES6+)</span>
          <span class="t-pill">TypeScript</span>
          <span class="t-pill">Tailwind CSS</span>
        </div>
      </div>
      <div class="tech-cat-card">
        <h3 class="tech-cat-title">CMS &amp; Backend Systems</h3>
        <p class="tech-cat-desc">Robust content management platforms and scalable backends designed for enterprise reliability.</p>
        <div class="tech-pills-wrap">
          <span class="t-pill">WordPress</span>
          <span class="t-pill">WooCommerce</span>
          <span class="t-pill">PHP 8+</span>
          <span class="t-pill">Node.js</span>
          <span class="t-pill">MySQL / MariaDB</span>
          <span class="t-pill">REST APIs</span>
          <span class="t-pill">Headless CMS</span>
          <span class="t-pill">GraphQL</span>
        </div>
      </div>
      <div class="tech-cat-card">
        <h3 class="tech-cat-title">Infrastructure &amp; Tooling</h3>
        <p class="tech-cat-desc">Modern version control, cloud deployment pipelines and performance monitoring tools.</p>
        <div class="tech-pills-wrap">
          <span class="t-pill">Git</span>
          <span class="t-pill">GitHub</span>
          <span class="t-pill">Linux / Nginx</span>
          <span class="t-pill">Hostinger VPS / CDN</span>
          <span class="t-pill">Phusion Passenger</span>
          <span class="t-pill">Cloudflare</span>
          <span class="t-pill">Lighthouse</span>
          <span class="t-pill">Google Search Console</span>
        </div>
      </div>
    </div>
  </div>
</section>
`;

// -------------------------------------------------------------
// SECTION 8: WEBSITE REDESIGN AND MIGRATION
// -------------------------------------------------------------
const section8Migration = `
<section class="section capability-section" id="website-redesign-migration">
  <div class="webdev-container">
    <div class="section-head text-center">
      <div class="section-label"><span class="dot"></span> Website Redesign &amp; Migration</div>
      <h2 class="h2">Website Redesign and Zero-Downtime SEO Migration</h2>
      <p class="p-sub">A website revamp should elevate your brand and multiply conversions—never wipe out your hard-earned organic search rankings. We specialise in complex platform migrations with complete SEO equity preservation.</p>
    </div>
    <div class="migration-grid">
      <div class="mig-card">
        <div class="mig-icon">01</div>
        <h3 class="mig-title">Comprehensive URL &amp; Equity Audit</h3>
        <p class="mig-desc">Before altering a single line of code, we crawl every indexed URL, map organic keyword rankings, assess historical backlink profiles and catalogue high-performing landing pages to protect existing equity.</p>
      </div>
      <div class="mig-card">
        <div class="mig-icon">02</div>
        <h3 class="mig-title">Server-Level 301 Redirect Architecture</h3>
        <p class="mig-desc">We engineer rigorous 1-to-1 301 permanent redirect maps directly at the server/Nginx level. This ensures search engine crawlers and users land on the exact corresponding page without redirect chains or 404 errors.</p>
      </div>
      <div class="mig-card">
        <div class="mig-icon">03</div>
        <h3 class="mig-title">Database &amp; Media Library Migration</h3>
        <p class="mig-desc">Safe migration of WordPress posts, custom post types, historical lead submissions, user accounts and media libraries with automated path rewriting and WebP image optimization.</p>
      </div>
      <div class="mig-card">
        <div class="mig-icon">04</div>
        <h3 class="mig-title">Staging Environment QA &amp; Verification</h3>
        <p class="mig-desc">Full testing in password-protected staging with noindex headers. We test form handlers, API hooks, responsiveness, third-party analytics and SSL certificate configurations before deployment.</p>
      </div>
      <div class="mig-card">
        <div class="mig-icon">05</div>
        <h3 class="mig-title">Zero-Downtime Production Cutover</h3>
        <p class="mig-desc">Atomic release switching ensures immediate site availability. Post-launch, we immediately submit fresh XML sitemaps to Google Search Console and monitor crawl frequency to guarantee index continuity.</p>
      </div>
    </div>
  </div>
</section>
`;

// -------------------------------------------------------------
// SECTION 9: SEO, AEO, GEO AND LLM-READY DEVELOPMENT
// -------------------------------------------------------------
const section9SeoAeoGeo = `
<section class="section" id="seo-aeo-geo">
  <div class="webdev-container">
    <div class="section-head text-center">
      <div class="section-label"><span class="dot"></span> Search &amp; AI Readiness</div>
      <h2 class="h2">SEO, AEO, GEO and LLM-Ready Website Development</h2>
      <p class="p-sub">Modern websites must perform across traditional search engines and next-generation generative AI answer engines. Every website we build is engineered for high visibility across Google, Bing, ChatGPT, Gemini, Perplexity and Google AI Overviews.</p>
    </div>
    <div class="search-ai-grid">
      <div class="ai-card">
        <div class="ai-badge">Semantic Foundation</div>
        <h3 class="ai-title">Semantic HTML5 &amp; Crawl Architecture</h3>
        <p class="ai-desc">Clean, accessible DOM structures with logical heading hierarchies (H1–H6), descriptive landmark elements, clean canonical paths and streamlined CSS/JS payloads that enable search engine bots and AI scrapers to parse content without friction.</p>
      </div>
      <div class="ai-card">
        <div class="ai-badge">Structured Data</div>
        <h3 class="ai-title">Schema.org Entity Graph Coordination</h3>
        <p class="ai-desc">Deep JSON-LD schema networks interconnected across Organization, WebSite, Service, LocalBusiness, FAQPage, BreadcrumbList and Article entities. This establishes verified topical authority and earns rich snippets in search results.</p>
      </div>
      <div class="ai-card">
        <div class="ai-badge">Answer Engines (AEO)</div>
        <h3 class="ai-title">Answer Engine Optimization (AEO) Readiness</h3>
        <p class="ai-desc">Content sections formatted specifically for Google AI Overviews and featured snippet extraction. Structured definitions, direct answer blocks, bulleted methodologies and transparent data tables optimized for quick retrieval.</p>
      </div>
      <div class="ai-card">
        <div class="ai-badge">Generative AI (GEO &amp; LLMs)</div>
        <h3 class="ai-title">LLM Brand Context &amp; Knowledge Indexing</h3>
        <p class="ai-desc">Authoritative brand positioning designed to inform large language model training sets and real-time retrieval-augmented generation (RAG) queries across Perplexity, ChatGPT Search, Microsoft Copilot and Claude.</p>
      </div>
    </div>
  </div>
</section>
`;

// -------------------------------------------------------------
// SECTION 10: WEBSITE MAINTENANCE AND AMC
// -------------------------------------------------------------
const section10Amc = `
<section class="section" id="amc">
  <div class="webdev-container">
    <div class="section-head text-center">
      <div class="section-label"><span class="dot"></span> Website Maintenance &amp; AMC</div>
      <h2 class="h2">Annual Maintenance Contracts for Long-Term Website Stability</h2>
      <p class="p-sub">Website AMC keeps your production website monitored, secure, backed up and constantly evolving with your business. Plans are tailored to your CMS, platform, traffic volume and update cadence.</p>
    </div>
    <div class="amc-grid">
      <div class="amc-card">
        <div class="amc-num">01</div>
        <h3 class="amc-title">Proactive Monitoring</h3>
        <p class="amc-desc">Automated 24/7 uptime pings, SSL validity checks, broken link discovery and instant developer notifications to resolve technical hiccups before customers notice.</p>
      </div>
      <div class="amc-card">
        <div class="amc-num">02</div>
        <h3 class="amc-title">Security &amp; Malware Defense</h3>
        <p class="amc-desc">Regular vulnerability screening, web application firewall (WAF) rule tuning, brute-force protection and rapid remediation protocols in the event of an exploit.</p>
      </div>
      <div class="amc-card">
        <div class="amc-num">03</div>
        <h3 class="amc-title">Regular Core &amp; Plugin Updates</h3>
        <p class="amc-desc">Scheduled staging-tested updates for WordPress core, plugins, PHP runtime and npm dependencies to prevent version conflicts, layout breaks or security exposures.</p>
      </div>
      <div class="amc-card">
        <div class="amc-num">04</div>
        <h3 class="amc-title">Automated Cloud Backups</h3>
        <p class="amc-desc">Daily or weekly automated encrypted off-site backups with comprehensive database dumps and file snapshots, ensuring 1-click disaster recovery readiness.</p>
      </div>
      <div class="amc-card">
        <div class="amc-num">05</div>
        <h3 class="amc-title">Performance Tuning</h3>
        <p class="amc-desc">Ongoing database index optimization, cache policy recalibration, image compression sweeps and Core Web Vitals maintenance to keep page loading instantaneous.</p>
      </div>
      <div class="amc-card">
        <div class="amc-num">06</div>
        <h3 class="amc-title">Dedicated Technical Support</h3>
        <p class="amc-desc">Direct monthly developer hours for new landing page creation, content revisions, banner updates, form modifications and third-party integration troubleshooting.</p>
      </div>
    </div>
  </div>
</section>
`;

// -------------------------------------------------------------
// SECTION 11: MUMBAI AND INDIA COVERAGE
// -------------------------------------------------------------
const section11Coverage = `
<section class="section" id="mumbai-coverage">
  <div class="webdev-container">
    <div class="local-panel">
      <div class="local-head">
        <div class="section-label"><span class="dot"></span> Local Mumbai Presence &amp; Pan-India Coverage</div>
        <h2 class="h2">Website Development Services Across Mumbai and Nearby Business Hubs</h2>
        <p class="p-sub">With our physical creative studio and engineering hub in Khar West, Mumbai, D'Genius Solutions serves enterprises, growing companies and funded startups across Mumbai Metropolitan Region (MMR), India and global markets.</p>
      </div>
      <div class="coverage-hubs-grid">
        <div class="hub-item"><strong>Khar &amp; Bandra</strong><span>Creative Studio &amp; Engineering HQ</span></div>
        <div class="hub-item"><strong>BKC &amp; Lower Parel</strong><span>BFSI, Legal &amp; Corporate Flagships</span></div>
        <div class="hub-item"><strong>Andheri East &amp; West</strong><span>Media, Commercial &amp; Tech Hubs</span></div>
        <div class="hub-item"><strong>Powai &amp; Kanjurmarg</strong><span>SaaS, Startups &amp; Enterprise Campuses</span></div>
        <div class="hub-item"><strong>Santacruz &amp; Juhu</strong><span>Retail, Hospitality &amp; Premium Brands</span></div>
        <div class="hub-item"><strong>Borivali &amp; Malad</strong><span>Manufacturing, Trade &amp; Service Sectors</span></div>
        <div class="hub-item"><strong>Thane &amp; Navi Mumbai</strong><span>IT Parks, Logistics &amp; Industrial Giants</span></div>
        <div class="hub-item"><strong>South Mumbai</strong><span>Colaba, Fort &amp; Nariman Point Finance</span></div>
      </div>
      <div class="industries-badges-wrap">
        <span class="ind-badge">B2B &amp; Professional Services</span>
        <span class="ind-badge">Banking &amp; Regulated Finance</span>
        <span class="ind-badge">Staffing &amp; Workforce Solutions</span>
        <span class="ind-badge">Higher Education &amp; EdTech</span>
        <span class="ind-badge">Healthcare &amp; Wellness</span>
        <span class="ind-badge">Clean Technology &amp; Sustainability</span>
        <span class="ind-badge">Consumer &amp; E-Commerce Brands</span>
      </div>
    </div>
  </div>
</section>
`;

// -------------------------------------------------------------
// SECTION 12: ONE FAQ SECTION
// -------------------------------------------------------------
const faqsHtml = faqs.map((f, i) => `
  <div class="faq-item">
    <button class="faq-q" type="button" aria-expanded="${i === 0 ? 'true' : 'false'}">
      <span>${f.q}</span>
      <span class="faq-icon">+</span>
    </button>
    <div class="faq-a" style="${i === 0 ? 'max-height: 400px;' : 'max-height: 0px;'}">
      ${f.a}
    </div>
  </div>
`).join("\n");

const section12Faq = `
<section class="section" id="faq">
  <div class="webdev-container">
    <div class="section-head text-center">
      <div class="section-label"><span class="dot"></span> Frequently Asked Questions</div>
      <h2 class="h2">Website Development &amp; AMC Straight Answers</h2>
      <p class="p-sub">Comprehensive answers about technology stacks, project scopes, development timelines, SEO foundations, migrations and post-launch maintenance contracts.</p>
    </div>
    <div class="faq-container-single">
      ${faqsHtml}
    </div>
  </div>
</section>
`;

// -------------------------------------------------------------
// SECTION 13: FINAL CONVERSION CTA
// -------------------------------------------------------------
const section13FinalCta = `
<section class="section final-cta-section" id="final-cta">
  <div class="webdev-container">
    <div class="final-cta-box text-center">
      <div class="section-label"><span class="dot"></span> Start Your Project</div>
      <h2 class="h2">Ready to Build a High-Performing Website for Your Business?</h2>
      <p class="p-sub">Whether you require a brand-new custom build, an enterprise WordPress overhaul, a high-converting e-commerce store, or dependable AMC care, our Mumbai engineering team is ready to deliver.</p>
      <div class="final-cta-btn-wrap">
        <a class="btn btn-primary btn-large" href="#website-project-form">START YOUR WEBSITE PROJECT</a>
      </div>
      <div class="final-cta-trust-note">
        <span>Direct consultation with senior web strategists • Transparent scopes • No obligation</span>
      </div>
    </div>
  </div>
</section>
`;

// -------------------------------------------------------------
// SECTION 14: EXISTING WEBSITE DEVELOPMENT ENQUIRY FORM
// -------------------------------------------------------------
const section14Form = `
<section class="section form-section" id="form-section">
  <div class="webdev-container">
    <div class="form-wrapper-center">
      ${exactForm6Html}
    </div>
  </div>
</section>
`;

// Combine all 14 sections
const fullNewSectionsHtml = [
  section1Hero,
  section2Trust,
  section3Services,
  section4RecentWork,
  section5WhyDgs,
  section6Process,
  section7Tech,
  section8Migration,
  section9SeoAeoGeo,
  section10Amc,
  section11Coverage,
  section12Faq,
  section13FinalCta,
  section14Form
].join("\n");

// Reassemble complete data.body
// Extract everything before the first section
const firstSecIdx = originalData.body.indexOf("<section");
const leadingHtml = originalData.body.substring(0, firstSecIdx);

// Extract modal and scripts after the last section
const lastSecEndIdx = originalData.body.lastIndexOf("</section>") + 10;
const trailingHtml = originalData.body.substring(lastSecEndIdx);

const assembledBody = `${leadingHtml}${fullNewSectionsHtml}${trailingHtml}`;

// Write assembled body to json
originalData.body = assembledBody;
originalData.bodyBytes = Buffer.byteLength(assembledBody, "utf8");

fs.writeFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", JSON.stringify(originalData, null, 2));
console.log(`Successfully updated services__website-development-amc.json! Total body length: ${assembledBody.length} chars.`);
