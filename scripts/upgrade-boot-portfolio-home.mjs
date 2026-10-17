import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const targetPath = path.join(ROOT, "lib/wp-exact/extracted/boot-portfolio-home.js");

// We read existing data structures (portfolioData, categoryLabels, allVideos) from the original file
const originalCode = fs.readFileSync(targetPath, "utf8");

const pDataMatch = originalCode.match(/var portfolioData = (\{[\s\S]*?\});\n/);
const catLabelsMatch = originalCode.match(/var categoryLabels = (\{[\s\S]*?\});\n/);
const allVideosMatch = originalCode.match(/var allVideos = (\[[\s\S]*?\]);\n/);

if (!pDataMatch || !catLabelsMatch || !allVideosMatch) {
  console.error("Failed to parse data objects from boot-portfolio-home.js");
  process.exit(1);
}

const portfolioDataStr = pDataMatch[1];
const categoryLabelsStr = catLabelsMatch[1];
const allVideosStr = allVideosMatch[1];

const newCode = `(function(){'use strict';
if(window.__DGS_HOME_PORTFOLIO_BOOTED__)return;
window.__DGS_HOME_PORTFOLIO_BOOTED__ = true;

var portfolioData = ${portfolioDataStr};

var categoryLabels = ${categoryLabelsStr};

var allVideos = ${allVideosStr};

var currentlyDisplayed = 0;
var itemsPerLoad = window.matchMedia && window.matchMedia('(max-width: 767px)').matches ? 4 : 8;
var currentIndex = 0;
var lightboxHasHistoryState = !1;
var scrollPositionBeforeLightbox = 0;
var PLAY_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>';

function escapeHTML(value){
  return String(value||'').replace(/[&<>"']/g, function(char){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char];
  });
}

function getMimeType(url){
  return /\\.webm$/i.test(url) ? 'video/webm' : 'video/mp4';
}

function getThumb(video){
  if(video.thumb) return video.thumb;
  var path = (video.url || '').replace(/^https?:\\/\\/[^\\/]+/i, '');
  return path.replace(/\\.(mp4|webm)$/i, '-thumb.webp');
}

function getPosterSources(video){
  var thumb = getThumb(video);
  var avif = thumb ? thumb.replace(/\\.(webp|png|jpg|jpeg)$/i, '.avif') : '';
  return { avif: avif, webp: thumb, fallback: thumb || '/media/portfolio/posters/hyundai_creta_1_poster.webp' };
}

function imageHTML(video, isWide){
  var title = escapeHTML(video.title);
  var posters = getPosterSources(video);
  return '<picture class="thumb-picture" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block;">' +
    (posters.avif ? '<source srcset="' + escapeHTML(posters.avif) + '" type="image/avif">' : '') +
    (posters.webp ? '<source srcset="' + escapeHTML(posters.webp) + '" type="image/webp">' : '') +
    '<img src="' + escapeHTML(posters.fallback) + '" alt="' + title + '" loading="lazy" decoding="async" class="thumb-img" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block;">' +
  '</picture>';
}

function createCard(video, index, isCaseStudy){
  var isWide = !!video.wide;
  var w = video.width || (isWide ? 16 : 9);
  var h = video.height || (isWide ? 9 : 16);
  var ratio = w / h;
  var isLand = ratio >= 1.2;

  var div = document.createElement('div');
  div.className = (isCaseStudy ? 'case-study-item' : 'gallery-item') +
    (isLand ? ' portfolio-item--landscape wide-item' : ' portfolio-item--portrait') +
    (isWide ? ' wide-item' : '');
  div.setAttribute('role', 'button');
  div.setAttribute('tabindex', '0');
  div.setAttribute('aria-label', 'Play ' + video.title);
  div.setAttribute('data-video-index', index);

  // ZERO-CROP & PRESERVED DIMENSIONS RULE: Set source ratio from start, never mutate in loadedmetadata
  div.style.aspectRatio = w + ' / ' + h;
  div.style.background = '#050505';

  var title = escapeHTML(video.title);
  var label = escapeHTML(video.label || video.cat || '');
  var playOverlay = '<div class="play-btn-overlay"><div class="play-btn-circle">' + PLAY_SVG + '</div></div>';

  if (isCaseStudy) {
    div.innerHTML = '<div class="video-wrapper" style="width:100%;height:100%;position:relative;background:#050505">' +
      imageHTML(video, isWide) + playOverlay +
    '</div>' +
    '<div style="padding:clamp(12px,2vw,15px);background:rgba(0,0,0,0.8)">' +
      '<p style="font-size:clamp(0.6rem,1.2vw,0.65rem);color:rgba(255,255,255,0.6);margin-bottom:5px;text-transform:uppercase;letter-spacing:clamp(1.5px,0.3vw,2px);font-family:\\'Manrope\\',sans-serif">' + label + '</p>' +
      '<p style="font-size:clamp(0.85rem,1.8vw,0.95rem);color:#fff;font-weight:700;font-family:\\'Manrope\\',sans-serif;margin:0">' + title + '</p>' +
    '</div>';
  } else {
    div.innerHTML = imageHTML(video, isWide) + playOverlay +
    '<div class="video-overlay">' +
      '<p style="font-size:clamp(0.55rem,1.2vw,0.6rem);font-weight:700;letter-spacing:clamp(1.5px,0.3vw,2px);color:rgba(255,255,255,0.6);margin-bottom:5px;text-transform:uppercase;font-family:\\'Manrope\\',sans-serif">' + label + '</p>' +
      '<h3 style="font-size:clamp(0.75rem,1.5vw,0.85rem);font-weight:700;color:#fff;margin:0;font-family:\\'Manrope\\',sans-serif">' + title + '</h3>' +
    '</div>';
  }

  div.addEventListener('click', function(){ openLightbox(index); });
  div.addEventListener('keydown', function(e){
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(index);
    }
  });
  return div;
}

function loadMoreItems(){
  var mainGallery = document.getElementById('portfolio-gallery');
  var loadBtn = document.getElementById('load-more-btn');
  if(!mainGallery) return;

  var fragment = document.createDocumentFragment();
  var start = currentlyDisplayed;
  var end = Math.min(start + itemsPerLoad, allVideos.length);
  for(var i = start; i < end; i++){
    fragment.appendChild(createCard(allVideos[i], i, !1));
  }
  mainGallery.appendChild(fragment);
  currentlyDisplayed = end;

  if(loadBtn){
    if(currentlyDisplayed >= allVideos.length){
      loadBtn.textContent = 'ALL LOADED';
      setTimeout(function(){ loadBtn.style.display = 'none'; }, 1200);
    } else if(currentlyDisplayed >= 8){
      loadBtn.setAttribute('href', '/portfolio/');
      loadBtn.textContent = 'VIEW PORTFOLIO';
    } else {
      loadBtn.textContent = 'LOAD MORE (' + (allVideos.length - currentlyDisplayed) + ' remaining)';
    }
  }
}

function renderCategory(categoryKey){
  if(categoryKey === 'all') return;
  var container = document.getElementById(categoryKey + '-gallery');
  if(!container || container.children.length > 0 || !portfolioData[categoryKey]) return;
  var fragment = document.createDocumentFragment();
  portfolioData[categoryKey].forEach(function(video){
    var index = allVideos.findIndex(function(v){ return v.url === video.url; });
    var enriched = Object.assign({}, video, { label: categoryLabels[categoryKey], category: categoryKey });
    fragment.appendChild(createCard(enriched, index >= 0 ? index : 0, !0));
  });
  container.appendChild(fragment);
}

function setLightboxVideo(index){
  currentIndex = (index + allVideos.length) % allVideos.length;
  var item = allVideos[currentIndex];
  var player = document.getElementById('lightbox-player');
  if(!player || !item) return;

  player.pause();
  player.removeAttribute('src');
  while(player.firstChild){
    player.removeChild(player.firstChild);
  }
  player.preload = 'metadata';
  player.style.objectFit = 'contain';
  player.style.objectPosition = 'center';
  player.style.background = '#000';

  var webmUrl = item.url.replace(/\\.mp4$/i, '.webm');
  var mp4Url = item.url.replace(/\\.webm$/i, '.mp4');

  var sWebm = document.createElement('source');
  sWebm.src = webmUrl;
  sWebm.type = 'video/webm';
  player.appendChild(sWebm);

  var sMp4 = document.createElement('source');
  sMp4.src = mp4Url;
  sMp4.type = 'video/mp4';
  player.appendChild(sMp4);

  player.load();
  function playNow(){
    player.removeEventListener('canplay', playNow);
    player.removeEventListener('loadeddata', playNow);
    player.muted = !1;
    player.volume = 1;
    player.play().catch(function(){});
  }
  player.addEventListener('canplay', playNow);
  player.addEventListener('loadeddata', playNow);
}

function goLightbox(direction){
  setLightboxVideo(currentIndex + direction);
}

function internalCloseLightbox(){
  var lightbox = document.getElementById('lightbox');
  var player = document.getElementById('lightbox-player');
  if(!lightbox || !player) return;
  player.pause();
  player.removeAttribute('src');
  while(player.firstChild){
    player.removeChild(player.firstChild);
  }
  try { player.load(); } catch(e){}
  lightbox.classList.remove('is-open');
  setTimeout(function(){
    lightbox.style.display = 'none';
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.classList.remove('lightbox-open');
    window.scrollTo(0, scrollPositionBeforeLightbox);
  }, 240);
}

function openLightbox(index){
  scrollPositionBeforeLightbox = window.pageYOffset || document.documentElement.scrollTop;
  var lightbox = document.getElementById('lightbox');
  if(!lightbox || !allVideos.length) return;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.classList.add('lightbox-open');
  if('scrollRestoration' in history){
    history.scrollRestoration = 'manual';
  }
  if(!lightboxHasHistoryState){
    history.pushState({ lightbox: !0 }, '', window.location.href);
    lightboxHasHistoryState = !0;
  }
  lightbox.style.display = 'flex';
  requestAnimationFrame(function(){
    lightbox.classList.add('is-open');
  });
  setLightboxVideo(index);
}

function closeLightbox(){
  if(lightboxHasHistoryState){
    history.back();
  } else {
    internalCloseLightbox();
  }
}

window.openLightbox = openLightbox;

var portfolioInitialized = !1;
function initPortfolio(){
  if(portfolioInitialized) return;
  portfolioInitialized = !0;

  var mainGallery = document.getElementById('portfolio-gallery');
  if(mainGallery){
    var existingCards = mainGallery.querySelectorAll('.gallery-item');
    if(existingCards.length > 0){
      // Progressive enhancement: preserve server-rendered cards without blanking out!
      existingCards.forEach(function(card, idx){
        card.addEventListener('click', function(){ openLightbox(idx); });
        card.addEventListener('keydown', function(e){
          if(e.key === 'Enter' || e.key === ' '){
            e.preventDefault();
            openLightbox(idx);
          }
        });
      });
      currentlyDisplayed = existingCards.length;
    } else {
      loadMoreItems();
    }
  }

  var loadBtn = document.getElementById('load-more-btn');
  if(loadBtn){
    loadBtn.addEventListener('click', function(e){
      var href = loadBtn.getAttribute('href');
      if(href && href.startsWith('/')){
        return; // Allow navigation to /portfolio/
      }
      e.preventDefault();
      loadMoreItems();
    });
  }

  document.querySelectorAll('.portfolio-filter-tab').forEach(function(tab){
    tab.addEventListener('click', function(e){
      e.preventDefault();
      var categoryKey = (tab.getAttribute('href') || '').replace('#', '');
      var targetId = tab.getAttribute('data-target');
      document.querySelectorAll('.portfolio-filter-tab').forEach(function(t){
        t.classList.remove('active');
        t.style.color = 'rgba(255,255,255,0.5)';
        var span = t.querySelector('span');
        if(span) span.style.opacity = '0';
      });
      tab.classList.add('active');
      tab.style.color = '#ffffff';
      var activeSpan = tab.querySelector('span');
      if(activeSpan) activeSpan.style.opacity = '1';

      document.querySelectorAll('.content-view').forEach(function(view){
        view.classList.remove('active-view');
      });
      var target = document.getElementById(targetId);
      if(target){
        target.classList.add('active-view');
        renderCategory(categoryKey);
      }
    });
  });

  var closeBtn = document.getElementById('lightbox-close');
  var prevBtn = document.getElementById('lightbox-prev');
  var nextBtn = document.getElementById('lightbox-next');
  var lightbox = document.getElementById('lightbox');

  if(closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if(prevBtn) prevBtn.addEventListener('click', function(e){ e.stopPropagation(); goLightbox(-1); });
  if(nextBtn) nextBtn.addEventListener('click', function(e){ e.stopPropagation(); goLightbox(1); });
  if(lightbox) lightbox.addEventListener('click', function(e){ if(e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', function(e){
    var lb = document.getElementById('lightbox');
    if(lb && lb.style.display === 'flex'){
      if(e.key === 'Escape') closeLightbox();
      if(e.key === 'ArrowLeft') goLightbox(-1);
      if(e.key === 'ArrowRight') goLightbox(1);
    }
  });

  window.addEventListener('popstate', function(){
    var lb = document.getElementById('lightbox');
    if(lb && lb.style.display === 'flex'){
      internalCloseLightbox();
      lightboxHasHistoryState = !1;
    }
  });
}

function schedulePortfolioInit(){
  var galleryEl = document.getElementById('portfolio-gallery') || document.getElementById('portfolio');
  if(galleryEl && typeof IntersectionObserver !== 'undefined'){
    var obs = new IntersectionObserver(function(entries){
      for(var i = 0; i < entries.length; i++){
        if(entries[i].isIntersecting){
          obs.disconnect();
          initPortfolio();
          break;
        }
      }
    }, { rootMargin: '400px' });
    obs.observe(galleryEl);
    if(typeof requestIdleCallback === 'function'){
      requestIdleCallback(function(){
        if(!portfolioInitialized){
          obs.disconnect();
          initPortfolio();
        }
      }, { timeout: 3500 });
    } else {
      setTimeout(function(){
        if(!portfolioInitialized){
          obs.disconnect();
          initPortfolio();
        }
      }, 2500);
    }
  } else {
    if(typeof requestIdleCallback === 'function'){
      requestIdleCallback(initPortfolio, { timeout: 2000 });
    } else {
      setTimeout(initPortfolio, 1000);
    }
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', schedulePortfolioInit);
} else {
  schedulePortfolioInit();
}
})();
`;

fs.writeFileSync(targetPath, newCode, "utf8");
console.log("✓ Successfully upgraded lib/wp-exact/extracted/boot-portfolio-home.js with separate guard, poster-first cards, and progressive enhancement!");
