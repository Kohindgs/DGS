import fs from "node:fs";
import path from "node:path";

console.log("================================================================================");
console.log("=== APPLYING V8128: FULL-WIDTH MASONRY, 12-FILTER TAXONOMY & ZERO-CROP SYSTEM ===");
console.log("================================================================================\n");

const ROOT = process.cwd();

// -----------------------------------------------------------------------------
// 1. CANONICAL VIDEO DATASETS
// -----------------------------------------------------------------------------

const HYUNDAI_VIDEOS = [
  {
    title: "Hyundai Creta — Feature & Technology Explainer (Part 1)",
    url: "/media/portfolio/videos/hyundai_creta_1.mp4",
    thumb: "/media/portfolio/posters/hyundai_creta_1_poster.webp",
    cat: "AUTOMOBILE AI",
    category: "automobile",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Hyundai Creta — Feature & Technology Explainer (Part 2)",
    url: "/media/portfolio/videos/hyundai_creta_2.mp4",
    thumb: "/media/portfolio/posters/hyundai_creta_2_poster.webp",
    cat: "AUTOMOBILE AI",
    category: "automobile",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Hyundai Creta — Feature & Technology Explainer (Part 3)",
    url: "/media/portfolio/videos/hyundai_creta_3.mp4",
    thumb: "/media/portfolio/posters/hyundai_creta_3_poster.webp",
    cat: "AUTOMOBILE AI",
    category: "automobile",
    width: 1920,
    height: 1080,
    wide: true
  }
];

const SUNDARAM_VIDEOS = [
  {
    title: "Sundaram E-Learning — Grade 3 Balbharati Interactive Lesson",
    url: "/media/portfolio/videos/sundaram_bal_3_1.mp4",
    thumb: "/media/portfolio/posters/sundaram_bal_3_1_poster.webp",
    cat: "EDTECH AI",
    category: "edtech",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 3 Environmental Studies Chapter 7",
    url: "/media/portfolio/videos/sundaram_evs1_ch7.mp4",
    thumb: "/media/portfolio/posters/sundaram_evs1_ch7_poster.webp",
    cat: "EDTECH AI",
    category: "edtech",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 4 Environmental Studies Chapter 7",
    url: "/media/portfolio/videos/sundaram_evs2_ch7.mp4",
    thumb: "/media/portfolio/posters/sundaram_evs2_ch7_poster.webp",
    cat: "EDTECH AI",
    category: "edtech",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — English Medium Marathi Lesson 13",
    url: "/media/portfolio/videos/sundaram_marathi_13.mp4",
    thumb: "/media/portfolio/posters/sundaram_marathi_13_poster.webp",
    cat: "EDTECH AI",
    category: "edtech",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 4 Mathematics Chapter 9",
    url: "/media/portfolio/videos/sundaram_maths_ch9.mp4",
    thumb: "/media/portfolio/posters/sundaram_maths_ch9_poster.webp",
    cat: "EDTECH AI",
    category: "edtech",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 3 English Subject Chapter 3.8",
    url: "/media/portfolio/videos/sundaram_marathi_eng_3_8.mp4",
    thumb: "/media/portfolio/posters/sundaram_marathi_eng_3_8_poster.webp",
    cat: "EDTECH AI",
    category: "edtech",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 3 English Subject Chapter 3.5",
    url: "/media/portfolio/videos/sundaram_marathi_eng_3_5.mp4",
    thumb: "/media/portfolio/posters/sundaram_marathi_eng_3_5_poster.webp",
    cat: "EDTECH AI",
    category: "edtech",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 4 Marathi Bhaag 3",
    url: "/media/portfolio/videos/sundaram_marathi_bhaag_3.mp4",
    thumb: "/media/portfolio/posters/sundaram_marathi_bhaag_3_poster.webp",
    cat: "EDTECH AI",
    category: "edtech",
    width: 1920,
    height: 1080,
    wide: true
  }
];

const CLARION_VIDEOS = [
  {
    title: "Clarion Agro — Jasmine Atta Campaign (Hindi)",
    url: "/media/portfolio/videos/clarion_jasmine_atta_hindi.mp4",
    thumb: "/media/portfolio/posters/clarion_jasmine_atta_hindi_poster.webp",
    cat: "FMCG AI",
    category: "fmcg",
    width: 1080,
    height: 1920,
    wide: false
  },
  {
    title: "Clarion Agro — Jasmine Atta Campaign (Telugu)",
    url: "/media/portfolio/videos/clarion_jasmine_atta_telugu.mp4",
    thumb: "/media/portfolio/posters/clarion_jasmine_atta_telugu_poster.webp",
    cat: "FMCG AI",
    category: "fmcg",
    width: 1080,
    height: 1920,
    wide: false
  }
];

const HOME_CREDIT_VIDEO = {
  title: "Home Credit Diwali Campaign",
  url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Diwali-Campaign-Home-Credit11.mp4",
  cat: "COMMERCIAL AI FILM",
  category: "commercial-film",
  width: 1920,
  height: 1080,
  wide: true
};

const BETTER_CEASONS_VIDEOS = [
  {
    title: "Better Ceasons — 1000 Saal Ka Tenant Ad Campaign",
    url: "/media/portfolio/videos/better_ceasons_tenant.mp4",
    thumb: "/media/portfolio/posters/better_ceasons_tenant_poster.webp",
    cat: "CAMPAIGN AI",
    category: "campaign",
    width: 1080,
    height: 1920,
    wide: false
  },
  {
    title: "Better Ceasons — Ganesh Visarjan Special Campaign",
    url: "/media/portfolio/videos/better_ceasons_visarjan.mp4",
    thumb: "/media/portfolio/posters/better_ceasons_visarjan_poster.webp",
    cat: "CAMPAIGN AI",
    category: "campaign",
    width: 1080,
    height: 1920,
    wide: false
  },
  {
    title: "Better Ceasons — Ganesh Chaturthi Festive Commercial",
    url: "/media/portfolio/videos/better_ceasons_chaturthi.mp4",
    thumb: "/media/portfolio/posters/better_ceasons_chaturthi_poster.webp",
    cat: "CAMPAIGN AI",
    category: "campaign",
    width: 1080,
    height: 1920,
    wide: false
  },
  {
    title: "Better Ceasons — Kachra Samjha Kya Brand Film",
    url: "/media/portfolio/videos/better_ceasons_kachra.mp4",
    thumb: "/media/portfolio/posters/better_ceasons_kachra_poster.webp",
    cat: "CAMPAIGN AI",
    category: "campaign",
    width: 1080,
    height: 1920,
    wide: false
  }
];

const SHIRDI_SE_SAI_VIDEOS = [
  {
    title: "Vachaan 5 Teaser",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser-thumb.webp",
    cat: "MYTHOLOGICAL AI",
    category: "mythological",
    width: 480,
    height: 853,
    wide: false
  },
  {
    title: "Sai Ki Vaani - Derr",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1-thumb.webp",
    cat: "MYTHOLOGICAL AI",
    category: "mythological",
    width: 480,
    height: 853,
    wide: false
  },
  {
    title: "Sai Ki Vaani - Choothne Ka Darr",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1-thumb.webp",
    cat: "MYTHOLOGICAL AI",
    category: "mythological",
    width: 480,
    height: 853,
    wide: false
  },
  {
    title: "Suno Sai Ko - Vishwas",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2-thumb.webp",
    cat: "MYTHOLOGICAL AI",
    category: "mythological",
    width: 480,
    height: 853,
    wide: false
  },
  {
    title: "Suno Sai Ko - Prarthana",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1-thumb.webp",
    cat: "MYTHOLOGICAL AI",
    category: "mythological",
    width: 480,
    height: 853,
    wide: false
  },
  {
    title: "Suno Sai Ko",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1-thumb.webp",
    cat: "MYTHOLOGICAL AI",
    category: "mythological",
    width: 480,
    height: 853,
    wide: false
  },
  {
    title: "Sai Dham Introduction",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New-thumb.webp",
    cat: "MYTHOLOGICAL AI",
    category: "mythological",
    width: 720,
    height: 406,
    wide: true
  }
];

const LEGACY_PRODUCT_VIDEOS = [
  { title: "Mango Farm Preview", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Mango-Farm-Preview11.mp4", cat: "PRODUCT AI", category: "product", width: 1080, height: 1920, wide: false },
  { title: "Lava Women", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Lava-Women11.mp4", cat: "PRODUCT AI", category: "product", width: 1080, height: 1920, wide: false },
  { title: "Ice Cream Cone", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Ice-Cream-Cone11.mp4", cat: "PRODUCT AI", category: "product", width: 1080, height: 1920, wide: false },
  { title: "WINN Green Chilli Sauce", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Green-Chilli11.mp4", cat: "PRODUCT AI", category: "product", width: 1080, height: 1920, wide: false },
  { title: "WINN Dark Soya Sauce", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Dark-Soya11.mp4", cat: "PRODUCT AI", category: "product", width: 1080, height: 1920, wide: false }
];

const LEGACY_JEWELLERY_VIDEOS = [
  { title: "Jewellery Polishing", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/Video_Polishing_Request_Fulfilled.mp4", cat: "JEWELLERY AI", category: "jewellery", width: 1080, height: 1920, wide: false },
  { title: "Luxury Jewellery Visual 3", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/V-3.mp4", cat: "JEWELLERY AI", category: "jewellery", width: 1080, height: 1920, wide: false },
  { title: "Luxury Jewellery Visual 2", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/V-2.mp4", cat: "JEWELLERY AI", category: "jewellery", width: 1080, height: 1920, wide: false },
  { title: "Luxury Jewellery Advertisement", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/freepik_cinematic-luxury-jewelry-advertisement-scene-an-el_kling_720p_3-2_24fps_64453.mp4", cat: "JEWELLERY AI", category: "jewellery", width: 1080, height: 1920, wide: false },
  { title: "Luxury Jewellery Event", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/freepik_cinematic-luxury-event-scene-elegant-indian-woman-_kling_720p_16-9_24fps_64450.mp4", cat: "JEWELLERY AI", category: "jewellery", width: 1920, height: 1080, wide: true },
  { title: "Traditional Gold Necklace", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/freepik__a-closeup-of-a-traditional-gold-necklace-with-jhum__50633.mp4", cat: "JEWELLERY AI", category: "jewellery", width: 1080, height: 1920, wide: false },
  { title: "Cushion Cut Jewellery", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/Cushion-Cut.mp4", cat: "JEWELLERY AI", category: "jewellery", width: 1080, height: 1920, wide: false },
  { title: "Premium Jewellery", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Jewelry11.mp4", cat: "JEWELLERY AI", category: "jewellery", width: 1080, height: 1920, wide: false },
  { title: "Baanganga Launch", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Baanganga-Test211.mp4", cat: "JEWELLERY AI", category: "jewellery", width: 1920, height: 1080, wide: true },
  { title: "Baanganga Creative", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Baanganga-Test111.mp4", cat: "JEWELLERY AI", category: "jewellery", width: 1080, height: 1920, wide: false },
  { title: "Baanganga Gold", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Baanganga-Gold-Example11.mp4", cat: "JEWELLERY AI", category: "jewellery", width: 1080, height: 1920, wide: false }
];

const LEGACY_FESTIVAL_VIDEOS = [
  { title: "Makar Sankranti & Pongal", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Makar-Sankranti-And-Pongal-Final-1.mp4", cat: "FESTIVAL VIDEOS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Baisakhi Celebration", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/BaisakhiV1.mp4", cat: "FESTIVAL VIDEOS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Happy Holi", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/Happy-Holi_New.mp4", cat: "FESTIVAL VIDEOS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Festival Campaign", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/Non-Intro-1.mp4", cat: "FESTIVAL VIDEOS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Festive Story", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/freepik__continue-this-video-showing-the-other-lady-taking-__50626.mp4", cat: "FESTIVAL VIDEOS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Happy Easter", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Happy-Easter.mp4", cat: "FESTIVAL VIDEOS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Hanuman Jayanti", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Hanuman-Jayanti-Final.mp4", cat: "FESTIVAL VIDEOS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Navratri", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Navratri11.mp4", cat: "FESTIVAL VIDEOS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Lohri", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Lohri11.mp4", cat: "FESTIVAL VIDEOS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Independence Day", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Independence-Day-Dgs11.mp4", cat: "FESTIVAL VIDEOS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Friendship Day", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Happy-Friendship-Day11.mp4", cat: "FESTIVAL VIDEOS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Diwali", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Dgs-Diwali11.mp4", cat: "FESTIVAL VIDEOS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Children's Day", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Children-S-Day11.mp4", cat: "FESTIVAL VIDEOS", category: "festival", width: 1080, height: 1920, wide: false }
];

const LEGACY_CONCEPT_VIDEOS = [
  { title: "Savage Horse", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Savage-Horse11.mp4", cat: "CONCEPT AI", category: "concept", width: 1080, height: 1920, wide: false },
  { title: "Card Magic Man", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Card-Magic-Man11.mp4", cat: "CONCEPT AI", category: "concept", width: 1080, height: 1920, wide: false }
];

const PORTFOLIO_DATA_CATEGORIES = {
  automobile: HYUNDAI_VIDEOS,
  edtech: SUNDARAM_VIDEOS,
  fmcg: CLARION_VIDEOS,
  "commercial-film": [
    ...HYUNDAI_VIDEOS.map(v => Object.assign({}, v, { cat: "COMMERCIAL AI FILM", category: "commercial-film" })),
    HOME_CREDIT_VIDEO
  ],
  campaign: BETTER_CEASONS_VIDEOS,
  mythological: SHIRDI_SE_SAI_VIDEOS,
  festival: LEGACY_FESTIVAL_VIDEOS,
  product: LEGACY_PRODUCT_VIDEOS,
  jewellery: LEGACY_JEWELLERY_VIDEOS,
  concept: LEGACY_CONCEPT_VIDEOS,
  tvc: [
    Object.assign({}, HOME_CREDIT_VIDEO, { cat: "TVC AI", category: "tvc" })
  ],
  mascot: [LEGACY_FESTIVAL_VIDEOS[0]]
};

const CATEGORY_LABELS = {
  automobile: "AUTOMOBILE AI",
  edtech: "EDTECH AI",
  fmcg: "FMCG AI",
  "commercial-film": "COMMERCIAL AI FILM",
  campaign: "CAMPAIGN AI",
  mythological: "MYTHOLOGICAL AI",
  festival: "FESTIVAL VIDEOS",
  product: "PRODUCT AI",
  jewellery: "JEWELLERY AI",
  concept: "CONCEPT AI",
  tvc: "TVC AI",
  mascot: "MASCOT AI"
};

// Canonical ordering: 3 Hyundai -> 8 Sundaram -> 2 Clarion -> 4 Better Ceasons -> 7 Shirdi Se Sai -> Home Credit -> Legacy
const ALL_CANONICAL_VIDEOS = [
  ...HYUNDAI_VIDEOS.map(v => Object.assign({}, v, { categories: ["all", "automobile", "commercial-film"] })),
  ...SUNDARAM_VIDEOS.map(v => Object.assign({}, v, { categories: ["all", "edtech"] })),
  ...CLARION_VIDEOS.map(v => Object.assign({}, v, { categories: ["all", "fmcg"] })),
  ...BETTER_CEASONS_VIDEOS.map(v => Object.assign({}, v, { categories: ["all", "campaign"] })),
  ...SHIRDI_SE_SAI_VIDEOS.map(v => Object.assign({}, v, { categories: ["all", "mythological"] })),
  Object.assign({}, HOME_CREDIT_VIDEO, { cat: "COMMERCIAL AI FILM", category: "commercial-film", categories: ["all", "commercial-film", "tvc"] }),
  ...LEGACY_PRODUCT_VIDEOS.map(v => Object.assign({}, v, { categories: ["all", "product"] })),
  ...LEGACY_JEWELLERY_VIDEOS.map(v => Object.assign({}, v, { categories: ["all", "jewellery"] })),
  ...LEGACY_FESTIVAL_VIDEOS.map(v => Object.assign({}, v, { categories: ["all", "festival", "mascot"] })),
  ...LEGACY_CONCEPT_VIDEOS.map(v => Object.assign({}, v, { categories: ["all", "concept"] }))
];

console.log("Total Canonical Videos in Feed:", ALL_CANONICAL_VIDEOS.length);

// -----------------------------------------------------------------------------
// 2. WRITE EXTRACTED/BOOT-PORTFOLIO-8.JS (UNIFIED VISIBILITY-BASED MASONRY)
// -----------------------------------------------------------------------------
function buildBootPortfolio8Js() {
  return `(function(){'use strict';
if(window.__DGS_PORTFOLIO_THUMB_LAZY_FIXED__)return;
window.__DGS_PORTFOLIO_THUMB_LAZY_FIXED__=!0;

var AUTO_THUMBS=!0;
function makeThumbUrl(videoUrl){
  var path=videoUrl.replace(/^https?:\\/\\/[^\\/]+/i,'');
  return path.replace(/\\.mp4$/i,'-thumb.webp');
}

var allVideos = ${JSON.stringify(ALL_CANONICAL_VIDEOS)};

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
  if(AUTO_THUMBS) return makeThumbUrl(video.url);
  return '';
}

function imageHTML(video, isWide){
  var title = escapeHTML(video.title);
  var label = escapeHTML(video.label || video.cat || '');
  var thumb = getThumb(video);
  var posterAttribute = thumb ? ' poster="' + escapeHTML(thumb) + '"' : '';
  return '<div class="thumb-fallback" style="background:#050505"></div>' +
    '<video class="thumb-video is-ready" muted playsinline webkit-playsinline preload="none"' + posterAttribute +
    ' aria-label="' + title + ' ' + label + ' preview" tabindex="-1" disablepictureinpicture controlslist="nodownload"' +
    ' style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block;">' +
      '<source src="' + escapeHTML(video.url) + '#t=0.08" type="' + getMimeType(video.url) + '">' +
    '</video>';
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

  // ZERO-CROP RULE: Natural source aspect ratio is the authority
  div.style.aspectRatio = w + ' / ' + h;
  div.style.background = '#050505';

  var title = escapeHTML(video.title);
  var label = escapeHTML(video.label || video.cat || '');
  var playOverlay = '<div class="play-btn-overlay"><div class="play-btn-circle">' + PLAY_SVG + '</div></div>';

  div.innerHTML = imageHTML(video, isWide) + playOverlay +
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

var thumbnailQueue = [];
function runThumbnailQueue(){
  while(thumbnailQueue.length){
    var job = thumbnailQueue.shift();
    var card = job.card;
    var preview = job.preview;
    if(!card || !preview || card.dataset.thumbReady === '1') continue;
    card.dataset.thumbReady = '1';
    card.classList.add('video-ready');
    try { preview.classList.add('is-ready'); } catch(e){}
  }
}

function prepareCardVideo(card, priority){
  var preview = card.querySelector('.thumb-video');
  if(!preview || card.dataset.thumbQueued === '1' || card.dataset.thumbReady === '1') return;
  card.dataset.thumbQueued = '1';

  preview.onloadedmetadata = function(){
    if(preview.videoWidth && preview.videoHeight){
      card.style.aspectRatio = preview.videoWidth + ' / ' + preview.videoHeight;
      var isLand = (preview.videoWidth / preview.videoHeight) >= 1.2;
      card.classList.toggle('wide-item', isLand);
      card.classList.toggle('portfolio-item--landscape', isLand);
      card.classList.toggle('portfolio-item--portrait', !isLand);
    }
  };

  var job = { card: card, preview: preview };
  if(priority) thumbnailQueue.unshift(job);
  else thumbnailQueue.push(job);
  runThumbnailQueue();
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
  player.classList.remove('is-landscape', 'is-portrait');
  player.preload = 'auto';

  // Zero-crop rules on lightbox player: source frame is authority, NO forced aspect-ratio on player
  var w = item.width || (item.wide ? 16 : 9);
  var h = item.height || (item.wide ? 9 : 16);
  var ratio = w / h;
  try { player.style.removeProperty('aspect-ratio'); } catch(e){}
  player.style.objectFit = 'contain';
  player.style.objectPosition = 'center';
  player.style.background = '#000';
  player.classList.toggle('is-landscape', ratio >= 1.2);
  player.classList.toggle('is-portrait', ratio < 1.2);

  var source = document.createElement('source');
  source.src = item.url;
  source.type = getMimeType(item.url);
  player.appendChild(source);

  player.onloadedmetadata = function(){
    if(player.videoWidth && player.videoHeight){
      var realRatio = player.videoWidth / player.videoHeight;
      try { player.style.removeProperty('aspect-ratio'); } catch(e){}
      player.classList.toggle('is-landscape', realRatio >= 1.2);
      player.classList.toggle('is-portrait', realRatio < 1.2);
    }
  };

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
    lightbox.style.display = '';
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
  var loadBtn = document.getElementById('load-more-btn');
  if(loadBtn) loadBtn.style.display = 'none';

  if(mainGallery){
    mainGallery.innerHTML = '';
    var fragment = document.createDocumentFragment();
    for(var i = 0; i < allVideos.length; i++){
      fragment.appendChild(createCard(allVideos[i], i));
    }
    mainGallery.appendChild(fragment);
    mainGallery.querySelectorAll('.gallery-item').forEach(function(card, idx){
      prepareCardVideo(card, idx < 8);
    });
  }

  document.querySelectorAll('.portfolio-filter-tab').forEach(function(tab){
    tab.addEventListener('click', function(e){
      e.preventDefault();
      var categoryKey = (tab.getAttribute('data-filter') || tab.getAttribute('href') || '').replace('#', '').toLowerCase();

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

      var mainView = document.getElementById('portfolio-gallery-view');
      if(mainView){
        mainView.classList.add('active-view');
        mainView.style.display = '';
      }

      if(mainGallery){
        var items = mainGallery.querySelectorAll('.gallery-item');
        items.forEach(function(item){
          var cats = (item.getAttribute('data-categories') || '').split(' ');
          var matches = (categoryKey === 'all') || (cats.indexOf(categoryKey) !== -1);
          item.style.display = matches ? '' : 'none';
        });
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

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
})();`;
}

fs.writeFileSync(path.join(ROOT, "lib/wp-exact/extracted/boot-portfolio-8.js"), buildBootPortfolio8Js(), "utf8");
console.log("✓ Successfully updated lib/wp-exact/extracted/boot-portfolio-8.js");

// -----------------------------------------------------------------------------
// 3. UPDATE PAGE MIRRORS: AGENCY & DUBAI WITH 12 TABS & SINGLE UNIVERSAL CONTAINER
// -----------------------------------------------------------------------------
const NAV_TABS_HTML = `<nav class="portfolio-filters" id="portfolio-filters" role="navigation" aria-label="AI video portfolio navigation">
<a href="#all" class="portfolio-filter-tab active" data-filter="all" data-target="portfolio-gallery-view">ALL PORTFOLIO<span></span></a>
<a href="#automobile" class="portfolio-filter-tab" data-filter="automobile" data-target="automobile-view">AUTOMOBILE AI<span></span></a>
<a href="#edtech" class="portfolio-filter-tab" data-filter="edtech" data-target="edtech-view">EDTECH AI<span></span></a>
<a href="#fmcg" class="portfolio-filter-tab" data-filter="fmcg" data-target="fmcg-view">FMCG AI<span></span></a>
<a href="#commercial-film" class="portfolio-filter-tab" data-filter="commercial-film" data-target="commercial-film-view">COMMERCIAL AI FILM<span></span></a>
<a href="#campaign" class="portfolio-filter-tab" data-filter="campaign" data-target="campaign-view">CAMPAIGN AI<span></span></a>
<a href="#mythological" class="portfolio-filter-tab" data-filter="mythological" data-target="mythological-view">MYTHOLOGICAL AI<span></span></a>
<a href="#festival" class="portfolio-filter-tab" data-filter="festival" data-target="festival-view">FESTIVAL VIDEOS<span></span></a>
<a href="#product" class="portfolio-filter-tab" data-filter="product" data-target="product-view">PRODUCT AI<span></span></a>
<a href="#jewellery" class="portfolio-filter-tab" data-filter="jewellery" data-target="jewellery-view">JEWELLERY AI<span></span></a>
<a href="#concept" class="portfolio-filter-tab" data-filter="concept" data-target="concept-view">CONCEPT AI<span></span></a>
<a href="#tvc" class="portfolio-filter-tab" data-filter="tvc" data-target="tvc-view">TVC AI<span></span></a>
</nav>
<div id="content-container">
<div id="portfolio-gallery-view" class="content-view active-view"><div id="portfolio-gallery"></div></div>
</div>`;

function updatePageMirrorTabs(pagePath) {
  const fullPath = path.join(ROOT, pagePath);
  const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  let html = data.body;

  const startNav = html.indexOf('<nav class="portfolio-filters"');
  const endContent = html.indexOf('<div id="lightbox"', startNav);

  if (startNav === -1 || endContent === -1) {
    console.error(`Could not locate portfolio-filters in ${pagePath}`);
    return false;
  }

  data.body = html.slice(0, startNav) + NAV_TABS_HTML + html.slice(endContent);
  data.bodyBytes = Buffer.byteLength(data.body, "utf8");
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
  console.log(`✓ Updated 12-filter tabs & views in ${pagePath}`);
  return true;
}

updatePageMirrorTabs("data/wordpress/mirrors/pages/services__ai-video-production-agency.json");
updatePageMirrorTabs("data/wordpress/mirrors/pages/services__ai-production-dubai-page.json");

// -----------------------------------------------------------------------------
// 4. UPDATE GOOGLE ADS LANDING PAGE WITH 12 TABS & PRERENDERED VIDEO CARDS
// -----------------------------------------------------------------------------
function buildAdsGridArticle(item, extraCats = "") {
  const isLand = item.wide || (item.width / item.height) >= 1.2;
  const aspect = isLand ? "16/9" : "9/16";
  const catClasses = isLand
    ? "dgs-ai-portfolio-item is-landscape portfolio-item--landscape wide-item"
    : "dgs-ai-portfolio-item is-portrait portfolio-item--portrait";

  const allCats = `all ${item.category} ${extraCats}`.trim();
  const label = CATEGORY_LABELS[item.category] || item.cat;

  return `<article class="${catClasses}" data-categories="${allCats}" style="break-inside:avoid;margin-bottom:16px;border-radius:18px;overflow:hidden;background:#050505;box-shadow:0 10px 30px rgba(0,0,0,0.12);border:1px solid rgba(255,255,255,0.08)">
  <div style="position:relative;width:100%;aspect-ratio:${aspect};overflow:hidden;background:#050505">
    <picture>
      ${item.thumb ? `<source srcset="${item.thumb.replace(/\.webp$/i, '.avif')}" type="image/avif">` : ""}
      ${item.thumb ? `<source srcset="${item.thumb}" type="image/webp">` : ""}
      <img src="${item.thumb || '/media/portfolio/posters/hyundai_creta_1_poster.webp'}" alt="${item.title}" width="${item.width}" height="${item.height}" loading="lazy" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block">
    </picture>
    <a href="${item.url}" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none" aria-label="Play ${item.title}">
      <span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(196,63,122,0.9);color:#fff;font-size:16px">▶</span>
    </a>
  </div>
  <div style="padding:14px 16px;background:#111">
    <span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;color:#c43f7a;letter-spacing:0.08em;margin-bottom:4px">${label}</span>
    <h3 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#fff;line-height:1.3">${item.title}</h3>
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5">Cinematic AI video production crafted with high-fidelity visual generation and creative direction.</p>
  </div>
</article>`;
}

function updateAdsLandingPage() {
  const fullPath = path.join(ROOT, "data/wordpress/mirrors/pages/ai-production-videos-google-ads-landing-page.json");
  const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  let html = data.body;

  const startTabs = html.indexOf('<div class="dgs-ai-portfolio-tabs"');
  const startGrid = html.indexOf('id="dgs-ai-portfolio-grid"', startTabs);
  const endGrid = html.indexOf('</div>\n<div style="text-align:center;margin-top:32px">', startGrid);

  if (startTabs === -1 || startGrid === -1 || endGrid === -1) {
    console.error("Could not find portfolio tabs or grid in Google Ads landing page!");
    return false;
  }

  const ADS_TABS = `<div class="dgs-ai-portfolio-tabs" role="navigation" aria-label="AI production portfolio filters">
<button type="button" class="dgs-ai-tab active" data-filter="all">All Portfolio</button>
<button type="button" class="dgs-ai-tab" data-filter="automobile">Automobile AI</button>
<button type="button" class="dgs-ai-tab" data-filter="edtech">EdTech AI</button>
<button type="button" class="dgs-ai-tab" data-filter="fmcg">FMCG AI</button>
<button type="button" class="dgs-ai-tab" data-filter="commercial-film">Commercial AI Film</button>
<button type="button" class="dgs-ai-tab" data-filter="campaign">Campaign AI</button>
<button type="button" class="dgs-ai-tab" data-filter="mythological">Mythological AI</button>
<button type="button" class="dgs-ai-tab" data-filter="festival">Festival Videos</button>
<button type="button" class="dgs-ai-tab" data-filter="product">Product AI</button>
<button type="button" class="dgs-ai-tab" data-filter="jewellery">Jewellery AI</button>
<button type="button" class="dgs-ai-tab" data-filter="concept">Concept AI</button>
<button type="button" class="dgs-ai-tab" data-filter="tvc">TVC AI</button>
</div>`;

  // Build grid cards with multi-category mapping (all 56 canonical videos)
  const gridCards = [
    // 1. Hyundai Creta (3) -> automobile, commercial-film
    ...HYUNDAI_VIDEOS.map(v => buildAdsGridArticle(v, "commercial-film")),
    // 2. Sundaram (8) -> edtech
    ...SUNDARAM_VIDEOS.map(v => buildAdsGridArticle(v, "")),
    // 3. Clarion (2) -> fmcg
    ...CLARION_VIDEOS.map(v => buildAdsGridArticle(v, "")),
    // 4. Better Ceasons (4) -> campaign (Home Credit strictly excluded!)
    ...BETTER_CEASONS_VIDEOS.map(v => buildAdsGridArticle(v, "")),
    // 5. Shirdi Se Sai (7) -> mythological
    ...SHIRDI_SE_SAI_VIDEOS.map(v => buildAdsGridArticle(v, "")),
    // 6. Home Credit -> commercial-film, tvc (STRICTLY NO CAMPAIGN!)
    buildAdsGridArticle(HOME_CREDIT_VIDEO, "tvc"),
    // 7. Product (5)
    ...LEGACY_PRODUCT_VIDEOS.map(v => buildAdsGridArticle(v, "")),
    // 8. Jewellery (11)
    ...LEGACY_JEWELLERY_VIDEOS.map(v => buildAdsGridArticle(v, "")),
    // 9. Festival (13)
    ...LEGACY_FESTIVAL_VIDEOS.map(v => buildAdsGridArticle(v, "mascot")),
    // 10. Concept (2)
    ...LEGACY_CONCEPT_VIDEOS.map(v => buildAdsGridArticle(v, ""))
  ].join("\n");

  const FILTER_SCRIPT = `<script>
(function(){
  var tabs = document.querySelectorAll('.dgs-ai-tab');
  var items = document.querySelectorAll('#dgs-ai-portfolio-grid .dgs-ai-portfolio-item');
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      var filter = tab.getAttribute('data-filter');
      items.forEach(function(item){
        var cats = (item.getAttribute('data-categories') || '').split(' ');
        if(filter === 'all' || cats.indexOf(filter) !== -1){
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
})();
</script>`;

  const newSection = ADS_TABS + `\n<div class="dgs-ai-portfolio-grid" id="dgs-ai-portfolio-grid">\n` + gridCards + `\n` + FILTER_SCRIPT;
  data.body = html.slice(0, startTabs) + newSection + html.slice(endGrid);
  data.bodyBytes = Buffer.byteLength(data.body, "utf8");
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
  console.log("✓ Updated Google Ads landing page with 12 tabs, prerendered cards, and filtering script");
  return true;
}

updateAdsLandingPage();

// -----------------------------------------------------------------------------
// 5. UPDATE DATA/DESIGN-PREVIEW/PORTFOLIO-MEDIA.JSON (HOME CREDIT CANONICAL INCLUSION)
// -----------------------------------------------------------------------------
function updatePortfolioMediaJson() {
  const pPath = path.join(ROOT, "data/design-preview/portfolio-media.json");
  const media = JSON.parse(fs.readFileSync(pPath, "utf8"));

  const hasHomeCredit = media.items.some(i => i.id === "home-credit-diwali");
  if (!hasHomeCredit) {
    media.items.push({
      id: "home-credit-diwali",
      type: "video",
      title: "Home Credit Diwali Campaign",
      alt: "Home Credit Diwali Campaign Commercial AI Film",
      sourceWidth: 1920,
      sourceHeight: 1080,
      width: 1920,
      height: 1080,
      ratio: 1.7778,
      orientation: "landscape",
      duration: 45,
      poster: {
        width: 1920,
        height: 1080,
        avif: "/media/portfolio/posters/hyundai_creta_1_poster.avif",
        webp: "/media/portfolio/posters/hyundai_creta_1_poster.webp",
        fallback: "/media/portfolio/posters/hyundai_creta_1_poster.webp"
      },
      sources: {
        webm: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Diwali-Campaign-Home-Credit11.mp4",
        mp4: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Diwali-Campaign-Home-Credit11.mp4"
      }
    });
    fs.writeFileSync(pPath, JSON.stringify(media, null, 2), "utf8");
    console.log("✓ Added canonical home-credit-diwali to portfolio-media.json");
  } else {
    console.log("✓ home-credit-diwali already present in portfolio-media.json");
  }
}

updatePortfolioMediaJson();

console.log("\nAll portfolio datasets, scripts, and page mirrors successfully updated!");
