import fs from 'fs';

const master = JSON.parse(fs.readFileSync('data/portfolio/master-portfolio.json', 'utf8'));
const homeVideos = master.filter(m => m.homepageFeatured);

console.log('Homepage curated count:', homeVideos.length);

const homeFile = 'data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json';
const homeJson = JSON.parse(fs.readFileSync(homeFile, 'utf8'));
let body = homeJson.body || '';

const secStart = body.indexOf('class="dgs-v1215-ai-portfolio"');
if (secStart === -1) {
  throw new Error('dgs-v1215-ai-portfolio not found in homepage body');
}
const startTag = body.lastIndexOf('<section', secStart);
const endTag = body.indexOf('</section>', secStart) + 10;

console.log('Original section range:', startTag, 'to', endTag);

function escapeHTML(str) {
  return String(str || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
}

const PLAY_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>';

let cardsHtml = '';
homeVideos.forEach((v, idx) => {
  const isLand = v.orientation === 'landscape';
  const w = v.width;
  const h = v.height;
  const title = escapeHTML(v.title);
  const tag = escapeHTML((v.industryTags && v.industryTags[0]) || 'AI VIDEO');
  const thumb = v.poster?.webp || '';
  const loading = idx < 4 ? 'eager' : 'lazy';

  cardsHtml += `
<div class="gallery-item ${isLand ? 'portfolio-item--landscape wide-item' : 'portfolio-item--portrait'}" role="link" tabindex="0" aria-label="View ${title} on AI Video Production" data-video-id="${v.id}" style="aspect-ratio: ${w} / ${h}; background: #050505; cursor: pointer;">
  <picture class="thumb-picture" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block;opacity:1;">
    <source srcset="${thumb}" type="image/webp">
    <img src="${thumb}" data-webp-fallback="${thumb}" alt="${title} - D'Genius Solutions AI Video Production" loading="${loading}" decoding="async" class="thumb-img" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block;opacity:1;" onerror="if(this.dataset.webpFallback&amp;&amp;this.src!==this.dataset.webpFallback){this.src=this.dataset.webpFallback;}">
  </picture>
  <div class="play-btn-overlay"><div class="play-btn-circle">${PLAY_SVG}</div></div>
  <div class="video-overlay">
    <p style="font-size:clamp(0.55rem,1.2vw,0.6rem);font-weight:700;letter-spacing:clamp(1.5px,0.3vw,2px);color:rgba(255,255,255,0.6);margin-bottom:5px;text-transform:uppercase;font-family:'Manrope',sans-serif">${tag}</p>
    <h3 style="font-size:clamp(0.75rem,1.5vw,0.85rem);font-weight:700;color:#fff;margin:0;font-family:'Manrope',sans-serif">${title}</h3>
  </div>
</div>`;
});

const newSectionHtml = `<section id="portfolio"
    class="dgs-v1215-ai-portfolio"
    itemscope itemtype="https://schema.org/CollectionPage">

    <div class="dgs-v1215-shell dgs-ai-shell">

      <div class="dgs-v1215-section-head dgs-v1215-reveal">
        <div class="dgs-v1215-section-kicker">Portfolio</div>
        <h2 itemprop="name">AI Video <span>Production</span></h2>
        <p>Featured AI films, product commercials, edtech lessons, and campaign videos created with high-velocity AI pipelines.</p>
      </div>

      <div class="portfolio-content-area">
        <div id="portfolio-gallery-view" class="content-view active-view">
          <div id="portfolio-gallery" class="portfolio-grid">
${cardsHtml}
          </div>

          <div class="dgs-homepage-portfolio-cta" style="margin-top:clamp(36px,5vw,56px);text-align:center;">
            <a href="/services/ai-video-production-agency/#portfolio" class="dgs-portfolio-cta-btn" style="display:inline-flex;align-items:center;justify-content:center;gap:12px;padding:16px 36px;background:linear-gradient(135deg,#ff3366,#ff6b3d);color:#fff;font-family:'Manrope',sans-serif;font-size:clamp(0.85rem,1.2vw,0.95rem);font-weight:700;letter-spacing:1px;text-transform:uppercase;border-radius:999px;text-decoration:none;box-shadow:0 8px 24px rgba(255,51,102,0.3);transition:all 0.25s ease;">
              <span>VIEW ALL AI VIDEO WORK</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>

    </div>
  </section>`;

homeJson.body = body.slice(0, startTag) + newSectionHtml + body.slice(endTag);
fs.writeFileSync(homeFile, JSON.stringify(homeJson, null, 2));

console.log('Successfully updated homepage body in', homeFile);
