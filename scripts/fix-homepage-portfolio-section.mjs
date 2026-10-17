import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const homepageJsonPath = path.join(ROOT, "data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json");

const CANONICAL_HOME_CARDS = [
  {
    title: "Hyundai Creta — Feature & Technology Explainer (Part 1)",
    cat: "AUTOMOTIVE AI",
    aspect: "16 / 9",
    wide: true,
    index: 0,
    avif: "/media/portfolio/posters/hyundai_creta_1_poster.avif",
    webp: "/media/portfolio/posters/hyundai_creta_1_poster.webp",
  },
  {
    title: "Sundaram E-Learning — Grade 3 Balbharati Interactive Lesson",
    cat: "EDTECH AI",
    aspect: "16 / 9",
    wide: true,
    index: 1,
    avif: "/media/portfolio/posters/sundaram_bal_3_1_poster.avif",
    webp: "/media/portfolio/posters/sundaram_bal_3_1_poster.webp",
  },
  {
    title: "Clarion Agro — Jasmine Atta Campaign (Hindi)",
    cat: "FMCG AI",
    aspect: "9 / 16",
    wide: false,
    index: 2,
    avif: "/media/portfolio/posters/clarion_jasmine_atta_hindi_poster.avif",
    webp: "/media/portfolio/posters/clarion_jasmine_atta_hindi_poster.webp",
  },
  {
    title: "Better Ceasons — 1000 Saal Ka Tenant Ad Campaign",
    cat: "CAMPAIGN AI",
    aspect: "9 / 16",
    wide: false,
    index: 3,
    avif: "/media/portfolio/posters/better_ceasons_tenant_poster.avif",
    webp: "/media/portfolio/posters/better_ceasons_tenant_poster.webp",
  },
  {
    title: "Hyundai Creta — Feature & Technology Explainer (Part 2)",
    cat: "AUTOMOTIVE AI",
    aspect: "16 / 9",
    wide: true,
    index: 4,
    avif: "/media/portfolio/posters/hyundai_creta_2_poster.avif",
    webp: "/media/portfolio/posters/hyundai_creta_2_poster.webp",
  },
  {
    title: "Sundaram E-Learning — Grade 3 Environmental Studies Chapter 7",
    cat: "EDTECH AI",
    aspect: "16 / 9",
    wide: true,
    index: 5,
    avif: "/media/portfolio/posters/sundaram_evs1_ch7_poster.avif",
    webp: "/media/portfolio/posters/sundaram_evs1_ch7_poster.webp",
  },
  {
    title: "Clarion Agro — Jasmine Atta Campaign (Telugu)",
    cat: "FMCG AI",
    aspect: "9 / 16",
    wide: false,
    index: 6,
    avif: "/media/portfolio/posters/clarion_jasmine_atta_telugu_poster.avif",
    webp: "/media/portfolio/posters/clarion_jasmine_atta_telugu_poster.webp",
  },
  {
    title: "Better Ceasons — Ganesh Visarjan Special Campaign",
    cat: "CAMPAIGN AI",
    aspect: "9 / 16",
    wide: false,
    index: 7,
    avif: "/media/portfolio/posters/better_ceasons_visarjan_poster.avif",
    webp: "/media/portfolio/posters/better_ceasons_visarjan_poster.webp",
  },
];

function buildCardHtml(card) {
  const isLand = card.wide;
  const itemClasses = isLand
    ? "gallery-item wide-item portfolio-item--landscape"
    : "gallery-item portfolio-item--portrait";

  return `<div class="${itemClasses}" role="button" tabindex="0" aria-label="Play ${card.title}" data-video-index="${card.index}" style="aspect-ratio: ${card.aspect}; background: #050505;">
  <picture class="thumb-picture" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block;">
    <source srcset="${card.avif}" type="image/avif">
    <source srcset="${card.webp}" type="image/webp">
    <img src="${card.webp}" alt="${card.title}" loading="lazy" decoding="async" class="thumb-img" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block;">
  </picture>
  <div class="play-btn-overlay"><div class="play-btn-circle"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg></div></div>
  <div class="video-overlay">
    <p style="font-size:clamp(0.55rem,1.2vw,0.6rem);font-weight:700;letter-spacing:clamp(1.5px,0.3vw,2px);color:rgba(255,255,255,0.6);margin-bottom:5px;text-transform:uppercase;font-family:'Manrope',sans-serif">${card.cat}</p>
    <h3 style="font-size:clamp(0.75rem,1.5vw,0.85rem);font-weight:700;color:#fff;margin:0;font-family:'Manrope',sans-serif">${card.title}</h3>
  </div>
</div>`;
}

function buildCleanHomepagePortfolioSection() {
  const cardsHtml = CANONICAL_HOME_CARDS.map(buildCardHtml).join("\n");

  return `<section id="portfolio"
    class="dgs-v1215-ai-portfolio"
    itemscope itemtype="https://schema.org/CollectionPage">

    <div class="dgs-v1215-shell dgs-ai-shell">

      <div class="dgs-v1215-section-head dgs-v1215-reveal">
        <div class="dgs-v1215-section-kicker">Portfolio</div>
        <h2 itemprop="name">AI-Led Creative <span>Portfolio</span></h2>
        <p>Videos, product visuals, mascots, festival campaigns, TVC concepts and AI-led creative assets for brands that need faster content production.</p>
      </div>

      <!-- AI PRODUCTION SERVICE CLARITY BLOCK -->
      <div class="dgs-ai-service-clarity dgs-v1215-reveal" itemscope itemtype="https://schema.org/Service">
        <meta itemprop="serviceType" content="AI Production, AI Video Production, Generative AI Creative Production">
        <meta itemprop="areaServed" content="Mumbai">

        <div class="dgs-ai-service-grid">

          <div class="dgs-ai-service-copy">
            <p class="dgs-ai-service-kicker">AI-Led Creative Production</p>

            <h3 itemprop="name">
              Creative production for campaigns, product stories and social content.
            </h3>

            <p itemprop="description">
              This portfolio shows how strategy, AI-led workflows, editing and brand control can support faster creative output across campaigns, products and social content.
            </p>
          </div>

          <div class="dgs-ai-service-points" aria-label="AI production services offered by D'Genius Solutions">

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

        <div class="dgs-ai-process-strip" aria-label="AI production process">
          <div><strong>Brief</strong><span>Brand, product, audience and campaign goal.</span></div>
          <div><strong>Concept</strong><span>Script, visual direction and production style.</span></div>
          <div><strong>Generate</strong><span>AI visuals, videos, characters and creative assets.</span></div>
          <div><strong>Refine</strong><span>Editing, motion, sound, copy and brand control.</span></div>
          <div><strong>Deliver</strong><span>Campaign-ready assets for social, ads and web.</span></div>
        </div>
      </div>

      <nav class="portfolio-filters"
        role="navigation"
        aria-label="Portfolio navigation">

        <a href="#all" class="portfolio-filter-tab active" data-target="portfolio-gallery-view">
          ALL PORTFOLIO
          <span aria-hidden="true"></span>
        </a>

        <a href="#mascot" class="portfolio-filter-tab" data-target="mascot-view">
          MASCOT AI
          <span aria-hidden="true"></span>
        </a>

        <a href="#festival" class="portfolio-filter-tab" data-target="festival-view">
          FESTIVAL POSTS
          <span aria-hidden="true"></span>
        </a>

        <a href="#mythological" class="portfolio-filter-tab" data-target="mythological-view">
          MYTHOLOGICAL AI
          <span aria-hidden="true"></span>
        </a>

        <a href="#product" class="portfolio-filter-tab" data-target="product-view">
          PRODUCT AI
          <span aria-hidden="true"></span>
        </a>

        <a href="#jewellery" class="portfolio-filter-tab" data-target="jewellery-view">
          JEWELLERY AI
          <span aria-hidden="true"></span>
        </a>

        <a href="#concept" class="portfolio-filter-tab" data-target="concept-view">
          CONCEPT AI
          <span aria-hidden="true"></span>
        </a>

        <a href="#tvc" class="portfolio-filter-tab" data-target="tvc-view">
          TVC AI
          <span aria-hidden="true"></span>
        </a>
      </nav>

      <div id="content-container" class="dgs-ai-content-container">

        <div id="portfolio-gallery-view" class="content-view active-view">
          <div id="portfolio-gallery">
${cardsHtml}
          </div>

          <div class="dgs-load-wrap">
            <a href="/portfolio/" id="load-more-btn" class="dgs-load-more-btn">
              VIEW PORTFOLIO
            </a>
          </div>
        </div>

        <div id="mascot-view" class="content-view"><div id="mascot-gallery"></div></div>
        <div id="festival-view" class="content-view"><div id="festival-gallery"></div></div>
        <div id="mythological-view" class="content-view"><div id="mythological-gallery"></div></div>
        <div id="product-view" class="content-view"><div id="product-gallery"></div></div>
        <div id="jewellery-view" class="content-view"><div id="jewellery-gallery"></div></div>
        <div id="concept-view" class="content-view"><div id="concept-gallery"></div></div>
        <div id="tvc-view" class="content-view"><div id="tvc-gallery"></div></div>

      </div>

      <div id="lightbox" class="portfolio-lightbox" role="dialog" aria-modal="true" aria-label="Portfolio video preview" style="display:none">

        <button id="lightbox-close" class="portfolio-lightbox-btn portfolio-lightbox-close dgs-plain-control" type="button" aria-label="Close video">
          ×
        </button>

        <button id="lightbox-prev" class="portfolio-lightbox-btn portfolio-lightbox-arrow portfolio-lightbox-prev dgs-plain-control" type="button" aria-label="Previous video">
          ‹
        </button>

        <div id="lightbox-content" class="portfolio-lightbox-content">
          <video id="lightbox-player"
                 controls
                 playsinline
                 preload="metadata"
                 controlslist="nodownload"
                 disablepictureinpicture
                 oncontextmenu="return false;"
                 style="max-width:100%;max-height:100%;object-fit:contain;object-position:center;background:#000;">
          </video>
        </div>

        <button id="lightbox-next" class="portfolio-lightbox-btn portfolio-lightbox-arrow portfolio-lightbox-next dgs-plain-control" type="button" aria-label="Next video">
          ›
        </button>

      </div>

    </div>
  </section>`;
}

function run() {
  const data = JSON.parse(fs.readFileSync(homepageJsonPath, "utf8"));
  let html = data.content || data.body || "";

  const startSection = html.indexOf('<section id="portfolio"');
  if (startSection === -1) {
    console.error("Could not find <section id=\"portfolio\" in homepage JSON");
    process.exit(1);
  }

  const endSection = html.indexOf('</section>', startSection);
  if (endSection === -1) {
    console.error("Could not find closing </section> for portfolio in homepage JSON");
    process.exit(1);
  }

  const before = html.slice(0, startSection);
  const after = html.slice(endSection + '</section>'.length);

  const cleanSection = buildCleanHomepagePortfolioSection();
  const updatedHtml = before + cleanSection + after;

  if (data.content !== undefined) data.content = updatedHtml;
  if (data.body !== undefined) data.body = updatedHtml;
  if (data.bodyBytes !== undefined) data.bodyBytes = Buffer.byteLength(updatedHtml, "utf8");

  fs.writeFileSync(homepageJsonPath, JSON.stringify(data, null, 2), "utf8");
  console.log("✓ Successfully updated homepage JSON with clean, perfectly nested, poster-first portfolio section!");
}

run();
