import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const canonicalVideos = JSON.parse(fs.readFileSync(path.join(ROOT, "data/portfolio/canonical-ai-videos.json"), "utf8"));

const code = `(function(){'use strict';
if(window.__DGS_INNER_AI_PORTFOLIO_BOOTED__)return;
window.__DGS_INNER_AI_PORTFOLIO_BOOTED__ = true;

var allVideos = ${JSON.stringify(canonicalVideos)};

var currentIndex = 0;
var lightboxHasHistoryState = !1;
var scrollPositionBeforeLightbox = 0;
var PLAY_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>';

function getBatchSize(){
  var w = window.innerWidth || document.documentElement.clientWidth || 1200;
  if(w < 641) return 6;
  if(w < 1025) return 8;
  return 12;
}

var currentFilter = 'all';
var visibleCount = getBatchSize();

function escapeHTML(value){
  return String(value||'').replace(/[&<>"']/g, function(char){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char];
  });
}

function getThumb(video){
  if(video.thumb) return video.thumb.replace(/^https?:\\/\\/[^\\/]+/i, '');
  var path = (video.url || '').replace(/^https?:\\/\\/[^\\/]+/i, '');
  return path.replace(/\\.(mp4|webm)$/i, '-thumb.webp');
}

function imageHTML(video, isWide, index){
  var title = escapeHTML(video.title);
  var webpUrl = escapeHTML(getThumb(video));
  var loadingAttr = (index !== undefined && index < 6) ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return '<picture class="thumb-picture" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block;opacity:1;">' +
    '<source srcset="' + webpUrl + '" type="image/webp">' +
    '<img src="' + webpUrl + '" data-webp-fallback="' + webpUrl + '" alt="' + title + '" ' + loadingAttr + ' decoding="async" class="thumb-img" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block;opacity:1;" onerror="if(this.dataset.webpFallback&&this.src!==this.dataset.webpFallback){this.src=this.dataset.webpFallback;}">' +
  '</picture>';
}

function createCard(video, index){
  var isWide = !!video.wide;
  var w = video.width || (isWide ? 16 : 9);
  var h = video.height || (isWide ? 9 : 16);
  var ratio = w / h;
  var isLand = ratio >= 1.2;

  var div = document.createElement('div');
  div.className = 'gallery-item' +
    (isLand ? ' portfolio-item--landscape wide-item' : ' portfolio-item--portrait') +
    (isWide ? ' wide-item' : '');
  div.setAttribute('role', 'button');
  div.setAttribute('tabindex', '0');
  div.setAttribute('aria-label', 'Play ' + video.title);
  var cats = Array.isArray(video.categories) ? video.categories.join(' ') : (video.categories || video.category || 'all');
  div.setAttribute('data-categories', cats);
  div.setAttribute('data-ratio', ratio.toFixed(4));
  var videoId = (video.url || '').split('/').pop().replace(/\\.[^.]+$/, '');
  div.setAttribute('data-video-id', videoId);

  // ZERO-CROP RULE: Natural source aspect ratio is the authority from the start
  div.style.aspectRatio = w + ' / ' + h;
  div.style.background = '#050505';

  var title = escapeHTML(video.title);
  var label = escapeHTML(video.label || video.cat || '');
  var playOverlay = '<div class="play-btn-overlay"><div class="play-btn-circle">' + PLAY_SVG + '</div></div>';

  div.innerHTML = imageHTML(video, isWide, index) + playOverlay +
    '<div class="video-overlay">' +
      '<p style="font-size:clamp(0.55rem,1.2vw,0.6rem);font-weight:700;letter-spacing:clamp(1.5px,0.3vw,2px);color:rgba(255,255,255,0.6);margin-bottom:5px;text-transform:uppercase;font-family:\\'Manrope\\',sans-serif">' + label + '</p>' +
      '<h3 style="font-size:clamp(0.75rem,1.5vw,0.85rem);font-weight:700;color:#fff;margin:0;font-family:\\'Manrope\\',sans-serif">' + title + '</h3>' +
    '</div>';

  div.addEventListener('click', function(){ openLightbox(index); });
  div.addEventListener('keydown', function(e){
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(index);
    }
  });
  return div;
}

function updateVisibility(){
  var mainGallery = document.getElementById('portfolio-gallery');
  if(!mainGallery) return;
  var items = mainGallery.querySelectorAll('.gallery-item');
  var matching = [];

  items.forEach(function(item){
    var cats = (item.getAttribute('data-categories') || '').split(' ');
    if(currentFilter === 'all' || cats.indexOf(currentFilter) !== -1){
      matching.push(item);
    }
  });

  // HARD QA CHECK: When currentFilter === 'all', matching.length MUST equal allVideos.length (56)
  if(currentFilter === 'all' && matching.length !== allVideos.length){
    console.warn('Matching count mismatch for ALL:', matching.length, 'expected:', allVideos.length);
  }

  // Update visibility: reveal matching items up to visibleCount
  matching.forEach(function(item, idx){
    if(idx < visibleCount){
      item.classList.remove('is-hidden');
      item.style.removeProperty('display');
    } else {
      item.classList.add('is-hidden');
      item.style.setProperty('display', 'none', 'important');
    }
  });

  // Hide non-matching items
  items.forEach(function(item){
    var cats = (item.getAttribute('data-categories') || '').split(' ');
    if(currentFilter !== 'all' && cats.indexOf(currentFilter) === -1){
      item.classList.add('is-hidden');
      item.style.setProperty('display', 'none', 'important');
    }
  });

  // Update Load More button
  var loadMoreBtn = document.getElementById('load-more-btn');
  var loadMoreWrap = document.querySelector('.dgs-load-more-wrap');
  if(loadMoreBtn){
    var remaining = matching.length - visibleCount;
    if(remaining > 0){
      loadMoreBtn.style.display = 'inline-flex';
      if(loadMoreWrap) loadMoreWrap.style.display = 'flex';
      loadMoreBtn.textContent = 'LOAD MORE WORK (' + remaining + ' REMAINING)';
    } else {
      loadMoreBtn.style.display = 'none';
      if(loadMoreWrap) loadMoreWrap.style.display = 'none';
    }
  }
}

function selectFilter(filterKey, resetBatch){
  currentFilter = (filterKey || 'all').toLowerCase();
  if(resetBatch !== false){
    visibleCount = getBatchSize();
  }

  // Active Tab State: ONLY the active filter has .active class and #fff color
  var tabs = document.querySelectorAll('.portfolio-filter-tab');
  tabs.forEach(function(tab){
    var key = (tab.getAttribute('data-filter') || tab.getAttribute('href') || '').replace('#', '').toLowerCase();
    if(key === currentFilter){
      tab.classList.add('active');
      tab.style.color = '#ffffff';
      var span = tab.querySelector('span');
      if(span) span.style.opacity = '1';
    } else {
      tab.classList.remove('active');
      tab.style.color = 'rgba(255,255,255,0.5)';
      var span = tab.querySelector('span');
      if(span) span.style.opacity = '0';
    }
  });

  // URL hash handling: clean URL on 'all', update hash on specific filter
  if(window.history && window.history.replaceState){
    var cleanUrl = window.location.pathname + window.location.search + (currentFilter === 'all' ? '' : '#' + currentFilter);
    window.history.replaceState(null, '', cleanUrl);
  }

  var mainView = document.getElementById('portfolio-gallery-view');
  if(mainView){
    mainView.classList.add('active-view');
    mainView.style.display = '';
  }

  updateVisibility();
}

function calculateLightboxDimensions(item){
  var vw = window.innerWidth || document.documentElement.clientWidth || 1920;
  var vh = window.innerHeight || document.documentElement.clientHeight || 1080;

  var w = item.width || (item.wide ? 1920 : 1080);
  var h = item.height || (item.wide ? 1080 : 1920);
  var sourceRatio = w / h;
  var isLandscape = sourceRatio >= 1.2;

  var displayWidth, displayHeight;

  if (isLandscape) {
    var maxLandscapeWidth = Math.min(vw * 0.86, 1600);
    var maxLandscapeHeight = vh * 0.80;

    displayWidth = maxLandscapeWidth;
    displayHeight = displayWidth / sourceRatio;

    if (displayHeight > maxLandscapeHeight) {
      displayHeight = maxLandscapeHeight;
      displayWidth = displayHeight * sourceRatio;
    }

    if (vw >= 1800 && vw <= 2100) {
      if (displayWidth > 1450) {
        displayWidth = 1450;
        displayHeight = displayWidth / sourceRatio;
      }
      if (displayWidth < 1200 && maxLandscapeWidth >= 1200) {
        displayWidth = 1200;
        displayHeight = displayWidth / sourceRatio;
      }
    }
  } else {
    var maxPortraitHeight = Math.min(vh * 0.82, 920);
    var maxPortraitWidth = Math.min(vw * 0.46, 520);

    displayHeight = maxPortraitHeight;
    displayWidth = displayHeight * sourceRatio;

    if (displayWidth > maxPortraitWidth) {
      displayWidth = maxPortraitWidth;
      displayHeight = displayWidth / sourceRatio;
    }

    if (vw >= 1800 && vw <= 2100) {
      if (displayHeight > 920) {
        displayHeight = 920;
        displayWidth = displayHeight * sourceRatio;
      }
      if (displayWidth > 520) {
        displayWidth = 520;
        displayHeight = displayWidth / sourceRatio;
      }
    }
  }

  return {
    displayWidth: Math.round(displayWidth * 100) / 100,
    displayHeight: Math.round(displayHeight * 100) / 100,
    orientation: isLandscape ? 'landscape' : 'portrait',
    sourceRatio: sourceRatio
  };
}

function applyLightboxDimensions(item){
  var dims = calculateLightboxDimensions(item);
  var content = document.getElementById('lightbox-content') || document.querySelector('.portfolio-lightbox-content');
  var player = document.getElementById('lightbox-player');

  if(content){
    content.style.setProperty('--player-width', dims.displayWidth + 'px');
    content.style.setProperty('--player-height', dims.displayHeight + 'px');
    content.style.width = dims.displayWidth + 'px';
    content.style.height = dims.displayHeight + 'px';
    content.style.maxWidth = '100vw';
    content.style.maxHeight = '100vh';
    content.style.aspectRatio = dims.displayWidth + ' / ' + dims.displayHeight;
    content.classList.remove('is-landscape', 'is-portrait');
    content.classList.add(dims.orientation === 'landscape' ? 'is-landscape' : 'is-portrait');
  }

  if(player){
    player.style.setProperty('width', '100%', 'important');
    player.style.setProperty('height', '100%', 'important');
    player.style.setProperty('max-width', '100%', 'important');
    player.style.setProperty('max-height', '100%', 'important');
    player.style.aspectRatio = dims.displayWidth + ' / ' + dims.displayHeight;
    player.classList.remove('is-landscape', 'is-portrait');
    player.classList.add(dims.orientation === 'landscape' ? 'is-landscape' : 'is-portrait');
  }
  return dims;
}

function setLightboxVideo(index){
  currentIndex = (index + allVideos.length) % allVideos.length;
  var item = allVideos[currentIndex];
  var player = document.getElementById('lightbox-player');
  if(!player || !item) return;

  // SOURCE DIMENSIONS CONTROL THE OPENED PLAYER BEFORE LOADING VIDEO
  applyLightboxDimensions(item);

  player.pause();
  player.removeAttribute('src');
  while(player.firstChild){
    player.removeChild(player.firstChild);
  }
  player.preload = 'metadata';
  player.style.objectFit = 'contain';
  player.style.objectPosition = 'center';
  player.style.background = '#000';

  var webmUrl = item.url.replace(/\\.(mp4|webm)$/i, '.webm');
  var mp4Url = item.url.replace(/\\.(webm|mp4)$/i, '.mp4');

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
  var content = document.getElementById('lightbox-content') || document.querySelector('.portfolio-lightbox-content');
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
    if(content){
      content.style.removeProperty('--player-width');
      content.style.removeProperty('--player-height');
      content.style.removeProperty('width');
      content.style.removeProperty('height');
    }
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

  var filterNav = document.getElementById('portfolio-filters');
  var mainGallery = document.getElementById('portfolio-gallery');
  if(!filterNav || !mainGallery) return;

  visibleCount = getBatchSize();

  // Progressive enhancement: build replacement fragment atomically
  var fragment = document.createDocumentFragment();
  for(var i = 0; i < allVideos.length; i++){
    fragment.appendChild(createCard(allVideos[i], i));
  }
  if(fragment.children.length > 0){
    mainGallery.innerHTML = '';
    mainGallery.appendChild(fragment);
  }

  // Always initialize with 'all' filter and reset active tab state
  selectFilter('all', false);

  // Wire Load More click
  var loadMoreBtn = document.getElementById('load-more-btn');
  if(loadMoreBtn){
    loadMoreBtn.addEventListener('click', function(e){
      e.preventDefault();
      visibleCount += getBatchSize();
      updateVisibility();
    });
  }

  // Wire filter tab clicks
  document.querySelectorAll('.portfolio-filter-tab').forEach(function(tab){
    tab.addEventListener('click', function(e){
      e.preventDefault();
      var filterKey = (tab.getAttribute('data-filter') || tab.getAttribute('href') || '').replace('#', '').toLowerCase();
      selectFilter(filterKey, true);
    });
  });

  // Smooth scroll CTA to #ai-video-enquiry-form
  document.querySelectorAll('.dgs-ai-cta-btn, a[href="#ai-video-enquiry-form"]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      var target = document.getElementById('ai-video-enquiry-form');
      if(target){
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  window.addEventListener('resize', function(){
    var lb = document.getElementById('lightbox');
    if(lb && (lb.classList.contains('is-open') || lb.style.display === 'flex')){
      if(allVideos && allVideos[currentIndex]){
        applyLightboxDimensions(allVideos[currentIndex]);
      }
    }
  });

  function handleFullscreenExit(){
    var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if(!isFs){
      var lb = document.getElementById('lightbox');
      if(lb && (lb.classList.contains('is-open') || lb.style.display === 'flex')){
        if(allVideos && allVideos[currentIndex]){
          applyLightboxDimensions(allVideos[currentIndex]);
        }
      }
    }
  }
  document.addEventListener('fullscreenchange', handleFullscreenExit);
  document.addEventListener('webkitfullscreenchange', handleFullscreenExit);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
})();`;

fs.writeFileSync(path.join(ROOT, "lib/wp-exact/extracted/boot-portfolio-8.js"), code, "utf8");
console.log("✓ Successfully generated lib/wp-exact/extracted/boot-portfolio-8.js");
