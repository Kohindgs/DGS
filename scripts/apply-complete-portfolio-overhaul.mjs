import fs from "node:fs";
import path from "node:path";

console.log("================================================================================");
console.log("=== EXECUTING DGS AI VIDEO PORTFOLIO COMPLETE PRESENTATION & ORDERING OVERHAUL ===");
console.log("================================================================================\n");

// -----------------------------------------------------------------------------
// 1. DATA DEFINITIONS: CANONICAL PORTFOLIO ITEMS
// -----------------------------------------------------------------------------

// GROUP 1: The 17 New Uploaded AI Videos (Deterministic Client Order)
const NEW_AI_VIDEOS = [
  // 1. Hyundai (3)
  {
    title: "Hyundai Creta — Feature & Technology Explainer (Part 1)",
    url: "/media/portfolio/videos/hyundai_creta_1.mp4",
    thumb: "/media/portfolio/posters/hyundai_creta_1_poster.webp",
    cat: "AUTOMOTIVE AI",
    category: "product",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Hyundai Creta — Feature & Technology Explainer (Part 2)",
    url: "/media/portfolio/videos/hyundai_creta_2.mp4",
    thumb: "/media/portfolio/posters/hyundai_creta_2_poster.webp",
    cat: "AUTOMOTIVE AI",
    category: "product",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Hyundai Creta — Feature & Technology Explainer (Part 3)",
    url: "/media/portfolio/videos/hyundai_creta_3.mp4",
    thumb: "/media/portfolio/posters/hyundai_creta_3_poster.webp",
    cat: "AUTOMOTIVE AI",
    category: "product",
    width: 1920,
    height: 1080,
    wide: true
  },
  // 2. Sundaram E-Learning (8)
  {
    title: "Sundaram E-Learning — Grade 3 Balbharati Interactive Lesson",
    url: "/media/portfolio/videos/sundaram_bal_3_1.mp4",
    thumb: "/media/portfolio/posters/sundaram_bal_3_1_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 3 Environmental Studies Chapter 7",
    url: "/media/portfolio/videos/sundaram_evs1_ch7.mp4",
    thumb: "/media/portfolio/posters/sundaram_evs1_ch7_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 4 Environmental Studies Chapter 7",
    url: "/media/portfolio/videos/sundaram_evs2_ch7.mp4",
    thumb: "/media/portfolio/posters/sundaram_evs2_ch7_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — English Medium Marathi Lesson 13",
    url: "/media/portfolio/videos/sundaram_marathi_13.mp4",
    thumb: "/media/portfolio/posters/sundaram_marathi_13_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 4 Mathematics Chapter 9",
    url: "/media/portfolio/videos/sundaram_maths_ch9.mp4",
    thumb: "/media/portfolio/posters/sundaram_maths_ch9_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 3 English Subject Chapter 3.8",
    url: "/media/portfolio/videos/sundaram_marathi_eng_3_8.mp4",
    thumb: "/media/portfolio/posters/sundaram_marathi_eng_3_8_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 3 English Subject Chapter 3.5",
    url: "/media/portfolio/videos/sundaram_marathi_eng_3_5.mp4",
    thumb: "/media/portfolio/posters/sundaram_marathi_eng_3_5_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 4 Marathi Bhaag 3",
    url: "/media/portfolio/videos/sundaram_marathi_bhaag_3.mp4",
    thumb: "/media/portfolio/posters/sundaram_marathi_bhaag_3_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    width: 1920,
    height: 1080,
    wide: true
  },
  // 3. Clarion Agro (2) - 1080x1920 portrait
  {
    title: "Clarion Agro — Jasmine Atta Campaign (Hindi)",
    url: "/media/portfolio/videos/clarion_jasmine_atta_hindi.mp4",
    thumb: "/media/portfolio/posters/clarion_jasmine_atta_hindi_poster.webp",
    cat: "FMCG AI",
    category: "tvc",
    width: 1080,
    height: 1920,
    wide: false
  },
  {
    title: "Clarion Agro — Jasmine Atta Campaign (Telugu)",
    url: "/media/portfolio/videos/clarion_jasmine_atta_telugu.mp4",
    thumb: "/media/portfolio/posters/clarion_jasmine_atta_telugu_poster.webp",
    cat: "FMCG AI",
    category: "tvc",
    width: 1080,
    height: 1920,
    wide: false
  },
  // 4. Better Ceasons (4) - 1080x1920 portrait
  {
    title: "Better Ceasons — 1000 Saal Ka Tenant Ad Campaign",
    url: "/media/portfolio/videos/better_ceasons_tenant.mp4",
    thumb: "/media/portfolio/posters/better_ceasons_tenant_poster.webp",
    cat: "CAMPAIGN AI",
    category: "tvc",
    width: 1080,
    height: 1920,
    wide: false
  },
  {
    title: "Better Ceasons — Ganesh Visarjan Special Campaign",
    url: "/media/portfolio/videos/better_ceasons_visarjan.mp4",
    thumb: "/media/portfolio/posters/better_ceasons_visarjan_poster.webp",
    cat: "CAMPAIGN AI",
    category: "tvc",
    width: 1080,
    height: 1920,
    wide: false
  },
  {
    title: "Better Ceasons — Ganesh Chaturthi Festive Commercial",
    url: "/media/portfolio/videos/better_ceasons_chaturthi.mp4",
    thumb: "/media/portfolio/posters/better_ceasons_chaturthi_poster.webp",
    cat: "CAMPAIGN AI",
    category: "tvc",
    width: 1080,
    height: 1920,
    wide: false
  },
  {
    title: "Better Ceasons — Kachra Samjha Kya Brand Film",
    url: "/media/portfolio/videos/better_ceasons_kachra.mp4",
    thumb: "/media/portfolio/posters/better_ceasons_kachra_poster.webp",
    cat: "CAMPAIGN AI",
    category: "tvc",
    width: 1080,
    height: 1920,
    wide: false
  }
];

// GROUP 2: The 7 Shirdi Se Sai Videos
const SHIRDI_SE_SAI_VIDEOS = [
  {
    title: "Vachaan 5 Teaser",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser-thumb.webp",
    cat: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    category: "mythological",
    width: 480,
    height: 853,
    wide: false
  },
  {
    title: "Sai Ki Vaani - Derr",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1-thumb.webp",
    cat: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    category: "mythological",
    width: 480,
    height: 853,
    wide: false
  },
  {
    title: "Sai Ki Vaani - Choothne Ka Darr",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1-thumb.webp",
    cat: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    category: "mythological",
    width: 480,
    height: 853,
    wide: false
  },
  {
    title: "Suno Sai Ko - Vishwas",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2-thumb.webp",
    cat: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    category: "mythological",
    width: 480,
    height: 853,
    wide: false
  },
  {
    title: "Suno Sai Ko - Prarthana",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1-thumb.webp",
    cat: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    category: "mythological",
    width: 480,
    height: 853,
    wide: false
  },
  {
    title: "Suno Sai Ko",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1-thumb.webp",
    cat: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    category: "mythological",
    width: 480,
    height: 853,
    wide: false
  },
  {
    title: "Sai Dham Introduction",
    url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New.mp4",
    thumb: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New-thumb.webp",
    cat: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    category: "mythological",
    width: 720,
    height: 406,
    wide: true
  }
];

// GROUP 3: Legacy AI Videos (Wonder Introduction EXCLUDED!)
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
  { title: "Baisakhi Celebration", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/BaisakhiV1.mp4", cat: "FESTIVAL POSTS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Happy Holi", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/Happy-Holi_New.mp4", cat: "FESTIVAL POSTS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Festival Campaign", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/Non-Intro-1.mp4", cat: "FESTIVAL POSTS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Festive Story", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/07/freepik__continue-this-video-showing-the-other-lady-taking-__50626.mp4", cat: "FESTIVAL POSTS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Happy Easter", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Happy-Easter.mp4", cat: "FESTIVAL POSTS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Hanuman Jayanti", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Hanuman-Jayanti-Final.mp4", cat: "FESTIVAL POSTS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Navratri", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Navratri11.mp4", cat: "FESTIVAL POSTS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Lohri", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Lohri11.mp4", cat: "FESTIVAL POSTS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Independence Day", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Independence-Day-Dgs11.mp4", cat: "FESTIVAL POSTS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Friendship Day", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Happy-Friendship-Day11.mp4", cat: "FESTIVAL POSTS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Diwali", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Dgs-Diwali11.mp4", cat: "FESTIVAL POSTS", category: "festival", width: 1080, height: 1920, wide: false },
  { title: "Children's Day", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Children-S-Day11.mp4", cat: "FESTIVAL POSTS", category: "festival", width: 1080, height: 1920, wide: false }
];

// Wonder Introduction is EXCLUDED! Only Makar Sankranti & Pongal remains
const LEGACY_MASCOT_VIDEOS = [
  { title: "Makar Sankranti & Pongal", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Makar-Sankranti-And-Pongal-Final-1.mp4", cat: "MASCOT AI", category: "mascot", width: 1080, height: 1920, wide: false }
];

const LEGACY_CONCEPT_VIDEOS = [
  { title: "Savage Horse", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Savage-Horse11.mp4", cat: "CONCEPT AI", category: "concept", width: 1080, height: 1920, wide: false },
  { title: "Card Magic Man", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Card-Magic-Man11.mp4", cat: "CONCEPT AI", category: "concept", width: 1080, height: 1920, wide: false }
];

const LEGACY_TVC_VIDEOS = [
  { title: "Home Credit Diwali Campaign", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Diwali-Campaign-Home-Credit11.mp4", cat: "TVC AI", category: "tvc", width: 1920, height: 1080, wide: true }
];

// Combined canonical list: New 17 -> Shirdi Se Sai 7 -> Legacy
const ALL_CANONICAL_VIDEOS = [
  ...NEW_AI_VIDEOS,
  ...SHIRDI_SE_SAI_VIDEOS,
  ...LEGACY_PRODUCT_VIDEOS,
  ...LEGACY_JEWELLERY_VIDEOS,
  ...LEGACY_FESTIVAL_VIDEOS,
  ...LEGACY_MASCOT_VIDEOS,
  ...LEGACY_CONCEPT_VIDEOS,
  ...LEGACY_TVC_VIDEOS
];

// Category mapping for tabs
const PORTFOLIO_DATA_CATEGORIES = {
  mascot: [
    ...LEGACY_MASCOT_VIDEOS
  ],
  festival: [
    ...LEGACY_FESTIVAL_VIDEOS
  ],
  mythological: [
    ...SHIRDI_SE_SAI_VIDEOS
  ],
  product: [
    ...NEW_AI_VIDEOS.filter(v => v.category === "product"),
    ...LEGACY_PRODUCT_VIDEOS
  ],
  jewellery: [
    ...LEGACY_JEWELLERY_VIDEOS
  ],
  concept: [
    ...NEW_AI_VIDEOS.filter(v => v.category === "concept"),
    ...LEGACY_CONCEPT_VIDEOS
  ],
  tvc: [
    ...NEW_AI_VIDEOS.filter(v => v.category === "tvc"),
    ...LEGACY_TVC_VIDEOS
  ]
};

// -----------------------------------------------------------------------------
// 2. GENERATE UNIFIED BOOT-PORTFOLIO-8.JS (INNER PAGES)
// -----------------------------------------------------------------------------
function generateBootPortfolio8() {
  return `(function(){'use strict';
if(window.__DGS_PORTFOLIO_THUMB_LAZY_FIXED__)return;
window.__DGS_PORTFOLIO_THUMB_LAZY_FIXED__=!0;

var AUTO_THUMBS=!0;
function makeThumbUrl(videoUrl){
  var path=videoUrl.replace(/^https?:\\/\\/[^\\/]+/i,'');
  return path.replace(/\\.mp4$/i,'-thumb.webp');
}

var portfolioData = ${JSON.stringify(PORTFOLIO_DATA_CATEGORIES)};

var categoryLabels = {
  "mascot": "MASCOT AI",
  "festival": "FESTIVAL POSTS",
  "mythological": "SHIRDI SE SAI / MYTHOLOGICAL AI",
  "product": "PRODUCT AI",
  "jewellery": "JEWELLERY AI",
  "concept": "CONCEPT AI",
  "tvc": "TVC AI"
};

// Single canonical ordered list: 17 New Uploads -> 7 Shirdi Se Sai -> Legacy Work
var allVideos = ${JSON.stringify(ALL_CANONICAL_VIDEOS)};

var currentlyDisplayed = 0;
var itemsPerLoad = window.matchMedia && window.matchMedia('(max-width: 767px)').matches ? 6 : 10;
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

function createCard(video, index, isCaseStudy){
  var isWide = !!video.wide;
  var div = document.createElement('div');
  div.className = (isCaseStudy ? 'case-study-item' : 'gallery-item') + (isWide ? ' wide-item' : '');
  div.setAttribute('role', 'button');
  div.setAttribute('tabindex', '0');
  div.setAttribute('aria-label', 'Play ' + video.title);

  // ZERO-CROP RULE: Natural source aspect ratio is the authority
  var w = video.width || (isWide ? 16 : 9);
  var h = video.height || (isWide ? 9 : 16);
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

  // Dynamic aspect ratio verification from loaded source metadata
  preview.onloadedmetadata = function(){
    if(preview.videoWidth && preview.videoHeight){
      card.style.aspectRatio = preview.videoWidth + ' / ' + preview.videoHeight;
      card.classList.toggle('wide-item', preview.videoWidth >= preview.videoHeight);
    }
  };

  var job = { card: card, preview: preview };
  if(priority) thumbnailQueue.unshift(job);
  else thumbnailQueue.push(job);
  runThumbnailQueue();
}

function preloadAllPortfolioVideos(){
  var activeView = document.querySelector('.content-view.active-view');
  if(!activeView) return;
  activeView.querySelectorAll('.gallery-item, .case-study-item').forEach(function(card, index){
    prepareCardVideo(card, index < 8);
  });
}

function loadMoreItems(){
  var mainGallery = document.getElementById('portfolio-gallery');
  var loadBtn = document.getElementById('load-more-btn');
  if(!mainGallery || !loadBtn) return;
  var fragment = document.createDocumentFragment();
  var start = currentlyDisplayed;
  var end = Math.min(start + itemsPerLoad, allVideos.length);
  for(var i = start; i < end; i++){
    fragment.appendChild(createCard(allVideos[i], i, !1));
  }
  mainGallery.appendChild(fragment);
  mainGallery.querySelectorAll('.gallery-item').forEach(prepareCardVideo);
  currentlyDisplayed = end;
  if(currentlyDisplayed >= allVideos.length){
    loadBtn.textContent = 'ALL LOADED';
    setTimeout(function(){ loadBtn.style.display = 'none'; }, 1200);
  } else {
    loadBtn.textContent = 'LOAD MORE (' + (allVideos.length - currentlyDisplayed) + ' remaining)';
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
    fragment.appendChild(createCard(enriched, index, !0));
  });
  container.appendChild(fragment);
  container.querySelectorAll('.case-study-item').forEach(prepareCardVideo);
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

  // Zero-crop rules on lightbox player
  var w = item.width || (item.wide ? 16 : 9);
  var h = item.height || (item.wide ? 9 : 16);
  var ratio = w / h;
  player.style.aspectRatio = w + ' / ' + h;
  player.style.objectFit = 'contain';
  player.style.objectPosition = 'center';
  player.style.background = '#000';
  player.classList.toggle('is-landscape', ratio >= 1.1);
  player.classList.toggle('is-portrait', ratio < 1.1);

  var source = document.createElement('source');
  source.src = item.url;
  source.type = getMimeType(item.url);
  player.appendChild(source);

  player.onloadedmetadata = function(){
    if(player.videoWidth && player.videoHeight){
      var realRatio = player.videoWidth / player.videoHeight;
      player.style.aspectRatio = player.videoWidth + ' / ' + player.videoHeight;
      player.classList.toggle('is-landscape', realRatio >= 1.1);
      player.classList.toggle('is-portrait', realRatio < 1.1);
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
  loadMoreItems();
  preloadAllPortfolioVideos();

  var loadBtn = document.getElementById('load-more-btn');
  if(loadBtn){
    loadBtn.addEventListener('click', function(e){
      e.preventDefault();
      loadMoreItems();
    });
  }

  document.querySelectorAll('.portfolio-filter-tab').forEach(function(tab){
    tab.addEventListener('click', function(e){
      e.preventDefault();
      var categoryKey = tab.getAttribute('href').replace('#', '');
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

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
})();`;
}

// -----------------------------------------------------------------------------
// 3. GENERATE UNIFIED BOOT-PORTFOLIO-HOME.JS (HOMEPAGE)
// -----------------------------------------------------------------------------
function generateBootPortfolioHome() {
  // Homepage top positions:
  // 1 = Hyundai, 2 = Sundaram, 3 = Clarion Agro, 4 = Better Ceasons
  // 5 = Hyundai 2, 6 = Sundaram 2, 7 = Clarion 2, 8 = Better Ceasons 2
  // Then remaining new work, then Shirdi Se Sai, then legacy work
  const homeTop8 = [
    NEW_AI_VIDEOS[0],  // Hyundai 1
    NEW_AI_VIDEOS[3],  // Sundaram 1
    NEW_AI_VIDEOS[11], // Clarion 1
    NEW_AI_VIDEOS[13], // Better Ceasons 1
    NEW_AI_VIDEOS[1],  // Hyundai 2
    NEW_AI_VIDEOS[4],  // Sundaram 2
    NEW_AI_VIDEOS[12], // Clarion 2
    NEW_AI_VIDEOS[14], // Better Ceasons 2
  ];

  const remainingNew = NEW_AI_VIDEOS.filter(v => !homeTop8.some(t => t.url === v.url));

  const homeCanonicalVideos = [
    ...homeTop8,
    ...remainingNew,
    ...SHIRDI_SE_SAI_VIDEOS,
    ...LEGACY_PRODUCT_VIDEOS,
    ...LEGACY_JEWELLERY_VIDEOS,
    ...LEGACY_FESTIVAL_VIDEOS,
    ...LEGACY_MASCOT_VIDEOS,
    ...LEGACY_CONCEPT_VIDEOS,
    ...LEGACY_TVC_VIDEOS
  ];

  return `(function(){'use strict';
if(window.__DGS_PORTFOLIO_THUMB_LAZY_FIXED__)return;
window.__DGS_PORTFOLIO_THUMB_LAZY_FIXED__=!0;

var AUTO_THUMBS=!0;
function makeThumbUrl(videoUrl){
  var path=videoUrl.replace(/^https?:\\/\\/[^\\/]+/i,'');
  return path.replace(/\\.mp4$/i,'-thumb.webp');
}

var portfolioData = ${JSON.stringify(PORTFOLIO_DATA_CATEGORIES)};

var categoryLabels = {
  "mascot": "MASCOT AI",
  "festival": "FESTIVAL POSTS",
  "mythological": "SHIRDI SE SAI / MYTHOLOGICAL AI",
  "product": "PRODUCT AI",
  "jewellery": "JEWELLERY AI",
  "concept": "CONCEPT AI",
  "tvc": "TVC AI"
};

// Canonical ordered list for homepage: 1=Hyundai, 2=Sundaram, 3=Clarion, 4=Better Ceasons
var allVideos = ${JSON.stringify(homeCanonicalVideos)};

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

function createCard(video, index, isCaseStudy){
  var isWide = !!video.wide;
  var div = document.createElement('div');
  div.className = (isCaseStudy ? 'case-study-item' : 'gallery-item') + (isWide ? ' wide-item' : '');
  div.setAttribute('role', 'button');
  div.setAttribute('tabindex', '0');
  div.setAttribute('aria-label', 'Play ' + video.title);

  // ZERO-CROP RULE: Natural source aspect ratio is the authority
  var w = video.width || (isWide ? 16 : 9);
  var h = video.height || (isWide ? 9 : 16);
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
      card.classList.toggle('wide-item', preview.videoWidth >= preview.videoHeight);
    }
  };

  var job = { card: card, preview: preview };
  if(priority) thumbnailQueue.unshift(job);
  else thumbnailQueue.push(job);
  runThumbnailQueue();
}

function preloadAllPortfolioVideos(){
  var activeView = document.querySelector('.content-view.active-view');
  if(!activeView) return;
  activeView.querySelectorAll('.gallery-item, .case-study-item').forEach(function(card, index){
    prepareCardVideo(card, index < 8);
  });
}

function loadMoreItems(){
  var mainGallery = document.getElementById('portfolio-gallery');
  var loadBtn = document.getElementById('load-more-btn');
  if(!mainGallery || !loadBtn) return;
  var fragment = document.createDocumentFragment();
  var start = currentlyDisplayed;
  var end = Math.min(start + itemsPerLoad, allVideos.length);
  for(var i = start; i < end; i++){
    fragment.appendChild(createCard(allVideos[i], i, !1));
  }
  mainGallery.appendChild(fragment);
  mainGallery.querySelectorAll('.gallery-item').forEach(prepareCardVideo);
  currentlyDisplayed = end;
  if(currentlyDisplayed >= allVideos.length){
    loadBtn.textContent = 'ALL LOADED';
    setTimeout(function(){ loadBtn.style.display = 'none'; }, 1200);
  } else if(currentlyDisplayed >= 8){
    loadBtn.setAttribute('href', '/portfolio/');
    loadBtn.textContent = 'View Portfolio';
    var nb = loadBtn.cloneNode(true);
    loadBtn.parentNode.replaceChild(nb, loadBtn);
  } else {
    loadBtn.textContent = 'LOAD MORE (' + (allVideos.length - currentlyDisplayed) + ' remaining)';
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
    fragment.appendChild(createCard(enriched, index, !0));
  });
  container.appendChild(fragment);
  container.querySelectorAll('.case-study-item').forEach(prepareCardVideo);
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

  var w = item.width || (item.wide ? 16 : 9);
  var h = item.height || (item.wide ? 9 : 16);
  var ratio = w / h;
  player.style.aspectRatio = w + ' / ' + h;
  player.style.objectFit = 'contain';
  player.style.objectPosition = 'center';
  player.style.background = '#000';
  player.classList.toggle('is-landscape', ratio >= 1.1);
  player.classList.toggle('is-portrait', ratio < 1.1);

  var source = document.createElement('source');
  source.src = item.url;
  source.type = getMimeType(item.url);
  player.appendChild(source);

  player.onloadedmetadata = function(){
    if(player.videoWidth && player.videoHeight){
      var realRatio = player.videoWidth / player.videoHeight;
      player.style.aspectRatio = player.videoWidth + ' / ' + player.videoHeight;
      player.classList.toggle('is-landscape', realRatio >= 1.1);
      player.classList.toggle('is-portrait', realRatio < 1.1);
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
  if(mainGallery && mainGallery.children.length > 0 && currentlyDisplayed === 0) {
    mainGallery.innerHTML = '';
  }

  loadMoreItems();
  preloadAllPortfolioVideos();

  var loadBtn = document.getElementById('load-more-btn');
  if(loadBtn){
    loadBtn.addEventListener('click', function(e){
      e.preventDefault();
      loadMoreItems();
    });
  }

  document.querySelectorAll('.portfolio-filter-tab').forEach(function(tab){
    tab.addEventListener('click', function(e){
      e.preventDefault();
      var categoryKey = tab.getAttribute('href').replace('#', '');
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
  var galleryEl = document.getElementById('portfolio-gallery') || document.querySelector('.portfolio-section') || document.getElementById('portfolio');
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
})();`;
}

// -----------------------------------------------------------------------------
// 4. WRITE BOOT SCRIPTS
// -----------------------------------------------------------------------------
const boot8Path = "lib/wp-exact/extracted/boot-portfolio-8.js";
fs.writeFileSync(boot8Path, generateBootPortfolio8(), "utf8");
console.log("✓ lib/wp-exact/extracted/boot-portfolio-8.js: Written canonical single source of truth");

const bootHomePath = "lib/wp-exact/extracted/boot-portfolio-home.js";
fs.writeFileSync(bootHomePath, generateBootPortfolioHome(), "utf8");
console.log("✓ lib/wp-exact/extracted/boot-portfolio-home.js: Written homepage priority 1=Hyundai, 2=Sundaram, 3=Clarion, 4=Better Ceasons");

// Also update boot-1.js if present as fallback
const boot1Path = "lib/wp-exact/extracted/boot-1.js";
if (fs.existsSync(boot1Path)) {
  fs.writeFileSync(boot1Path, generateBootPortfolio8(), "utf8");
  console.log("✓ lib/wp-exact/extracted/boot-1.js: Updated fallback boot script");
}

// -----------------------------------------------------------------------------
// 5. UPDATE HOMEPAGE MIRROR PRE-RENDERED CARDS IN data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json
// -----------------------------------------------------------------------------
const homeContentPath = "data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json";
if (fs.existsSync(homeContentPath)) {
  const homeContent = JSON.parse(fs.readFileSync(homeContentPath, "utf8"));

  const homeTop8 = [
    NEW_AI_VIDEOS[0],  // 1 = Hyundai
    NEW_AI_VIDEOS[3],  // 2 = Sundaram
    NEW_AI_VIDEOS[11], // 3 = Clarion Agro (9:16 portrait)
    NEW_AI_VIDEOS[13], // 4 = Better Ceasons (9:16 portrait)
    NEW_AI_VIDEOS[1],  // 5 = Hyundai 2
    NEW_AI_VIDEOS[4],  // 6 = Sundaram 2
    NEW_AI_VIDEOS[12], // 7 = Clarion 2 (9:16 portrait)
    NEW_AI_VIDEOS[14], // 8 = Better Ceasons 2 (9:16 portrait)
  ];

  function buildPrerenderedCardsHtml(videos) {
    return videos.map((v) => {
      const isWide = !!v.wide;
      const wideClass = isWide ? " wide-item" : "";
      const aspectStyle = isWide ? "aspect-ratio: 16/9;" : "aspect-ratio: 9/16;";
      return `<div class="gallery-item${wideClass} video-ready" role="button" tabindex="0" aria-label="Play ${v.title}" style="${aspectStyle} background: #050505;">
  <div class="thumb-fallback" style="background: #050505;"></div>
  <video class="thumb-video is-ready" muted playsinline webkit-playsinline preload="none" poster="${v.thumb}" aria-label="${v.title} ${v.cat} preview" tabindex="-1" disablepictureinpicture controlslist="nodownload" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block;">
    <source src="${v.url}#t=0.08" type="video/mp4">
  </video>
  <div class="play-btn-overlay"><div class="play-btn-circle"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg></div></div>
  <div class="video-overlay">
    <p style="font-size:clamp(0.55rem,1.2vw,0.6rem);font-weight:700;letter-spacing:clamp(1.5px,0.3vw,2px);color:rgba(255,255,255,0.6);margin-bottom:5px;text-transform:uppercase;font-family:'Manrope',sans-serif">${v.cat}</p>
    <h3 style="font-size:clamp(0.75rem,1.5vw,0.85rem);font-weight:700;color:#fff;margin:0;font-family:'Manrope',sans-serif">${v.title}</h3>
  </div>
</div>`;
    }).join("\n");
  }

  const emptyGalleryRegex = /<div id="portfolio-gallery">[\s\S]*?<\/div>/i;
  const newGalleryHtml = `<div id="portfolio-gallery">\n${buildPrerenderedCardsHtml(homeTop8)}\n</div>`;

  if (emptyGalleryRegex.test(homeContent.body)) {
    homeContent.body = homeContent.body.replace(emptyGalleryRegex, newGalleryHtml);
    fs.writeFileSync(homeContentPath, JSON.stringify(homeContent, null, 2), "utf8");
    console.log("✓ page-best-digital-marketing-agency-in-mumbai.json: Updated #portfolio-gallery prerendered cards with zero-crop");
  }
}

// -----------------------------------------------------------------------------
// 6. UPDATE data/portfolio/homepage-gallery.json
// Correct dimensions for Clarion and Better Ceasons, verify positions 1-4
// -----------------------------------------------------------------------------
const hpGalleryPath = "data/portfolio/homepage-gallery.json";
if (fs.existsSync(hpGalleryPath)) {
  const hpGallery = JSON.parse(fs.readFileSync(hpGalleryPath, "utf8"));
  
  // Update Clarion and Better Ceasons items to portrait dimensions (1080x1920)
  for (const item of hpGallery.items) {
    if (item.id === "clarion-jasmine-atta-hindi" || item.id === "clarion-jasmine-atta-telugu") {
      item.width = 1080;
      item.height = 1920;
    }
    if (typeof item.id === "string" && item.id.startsWith("better-ceasons-")) {
      item.width = 1080;
      item.height = 1920;
    }
  }

  // Ensure first 4 items are Hyundai, Sundaram, Clarion, Better Ceasons
  const targetIds = ["hyundai-creta-1", "sundaram-elearning-bal-3-1", "clarion-jasmine-atta-hindi", "better-ceasons-tenant"];
  const top4Items = [];
  for (const tid of targetIds) {
    const found = hpGallery.items.find(i => i.id === tid);
    if (found) top4Items.push(found);
  }
  const otherItems = hpGallery.items.filter(i => !targetIds.includes(i.id));
  hpGallery.items = [...top4Items, ...otherItems];

  fs.writeFileSync(hpGalleryPath, JSON.stringify(hpGallery, null, 2), "utf8");
  console.log("✓ data/portfolio/homepage-gallery.json: Corrected 9:16 dimensions and 1=Hyundai, 2=Sundaram, 3=Clarion, 4=Better Ceasons");
}

// -----------------------------------------------------------------------------
// 7. UPDATE /portfolio/ DESIGN PREVIEW MEDIA & SOURCE
// In portfolio-media.json and portfolio-source.ts: add Shirdi Se Sai 7 items
// -----------------------------------------------------------------------------
const pMediaPath = "data/design-preview/portfolio-media.json";
const pMedia = JSON.parse(fs.readFileSync(pMediaPath, "utf8"));

const SAI_PORTFOLIO_ITEMS = [
  {
    id: "shirdi-sai-vachaan-5",
    type: "video",
    title: "Vachaan 5 Teaser",
    alt: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    sourceWidth: 480,
    sourceHeight: 853,
    width: 480,
    height: 853,
    ratio: 0.5627,
    orientation: "portrait",
    duration: 15,
    poster: {
      width: 480,
      height: 853,
      avif: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser-thumb.webp",
      webp: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser-thumb.webp",
      fallback: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser-thumb.webp"
    },
    sources: {
      webm: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser.mp4",
      mp4: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser.mp4"
    }
  },
  {
    id: "shirdi-sai-vaani-derr",
    type: "video",
    title: "Sai Ki Vaani - Derr",
    alt: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    sourceWidth: 480,
    sourceHeight: 853,
    width: 480,
    height: 853,
    ratio: 0.5627,
    orientation: "portrait",
    duration: 25,
    poster: {
      width: 480,
      height: 853,
      avif: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1-thumb.webp",
      webp: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1-thumb.webp",
      fallback: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1-thumb.webp"
    },
    sources: {
      webm: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1.mp4",
      mp4: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1.mp4"
    }
  },
  {
    id: "shirdi-sai-vaani-choothne-ka-darr",
    type: "video",
    title: "Sai Ki Vaani - Choothne Ka Darr",
    alt: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    sourceWidth: 480,
    sourceHeight: 853,
    width: 480,
    height: 853,
    ratio: 0.5627,
    orientation: "portrait",
    duration: 25,
    poster: {
      width: 480,
      height: 853,
      avif: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1-thumb.webp",
      webp: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1-thumb.webp",
      fallback: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1-thumb.webp"
    },
    sources: {
      webm: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1.mp4",
      mp4: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1.mp4"
    }
  },
  {
    id: "shirdi-sai-vishwas",
    type: "video",
    title: "Suno Sai Ko - Vishwas",
    alt: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    sourceWidth: 480,
    sourceHeight: 853,
    width: 480,
    height: 853,
    ratio: 0.5627,
    orientation: "portrait",
    duration: 30,
    poster: {
      width: 480,
      height: 853,
      avif: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2-thumb.webp",
      webp: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2-thumb.webp",
      fallback: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2-thumb.webp"
    },
    sources: {
      webm: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2.mp4",
      mp4: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2.mp4"
    }
  },
  {
    id: "shirdi-sai-prarthana",
    type: "video",
    title: "Suno Sai Ko - Prarthana",
    alt: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    sourceWidth: 480,
    sourceHeight: 853,
    width: 480,
    height: 853,
    ratio: 0.5627,
    orientation: "portrait",
    duration: 30,
    poster: {
      width: 480,
      height: 853,
      avif: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1-thumb.webp",
      webp: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1-thumb.webp",
      fallback: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1-thumb.webp"
    },
    sources: {
      webm: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1.mp4",
      mp4: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1.mp4"
    }
  },
  {
    id: "shirdi-sai-suno-sai-ko",
    type: "video",
    title: "Suno Sai Ko",
    alt: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    sourceWidth: 480,
    sourceHeight: 853,
    width: 480,
    height: 853,
    ratio: 0.5627,
    orientation: "portrait",
    duration: 30,
    poster: {
      width: 480,
      height: 853,
      avif: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1-thumb.webp",
      webp: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1-thumb.webp",
      fallback: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1-thumb.webp"
    },
    sources: {
      webm: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1.mp4",
      mp4: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1.mp4"
    }
  },
  {
    id: "shirdi-sai-dham-intro",
    type: "video",
    title: "Sai Dham Introduction",
    alt: "SHIRDI SE SAI / MYTHOLOGICAL AI",
    sourceWidth: 720,
    sourceHeight: 406,
    width: 720,
    height: 406,
    ratio: 1.7734,
    orientation: "landscape",
    duration: 45,
    poster: {
      width: 720,
      height: 406,
      avif: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New-thumb.webp",
      webp: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New-thumb.webp",
      fallback: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New-thumb.webp"
    },
    sources: {
      webm: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New.mp4",
      mp4: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New.mp4"
    }
  }
];

// Remove existing Sai items if any, then append
const existingNonSai = pMedia.items.filter(i => !i.id.startsWith("shirdi-sai-"));
pMedia.items = [...existingNonSai, ...SAI_PORTFOLIO_ITEMS];
fs.writeFileSync(pMediaPath, JSON.stringify(pMedia, null, 2), "utf8");
console.log("✓ data/design-preview/portfolio-media.json: Added 7 Shirdi Se Sai videos");

// Update portfolio-source.ts ordering logic
const pSourcePath = "lib/design-preview/portfolio-source.ts";
let pSourceCode = fs.readFileSync(pSourcePath, "utf8");

const SAI_VIDEO_IDS = [
  "shirdi-sai-vachaan-5",
  "shirdi-sai-vaani-derr",
  "shirdi-sai-vaani-choothne-ka-darr",
  "shirdi-sai-vishwas",
  "shirdi-sai-prarthana",
  "shirdi-sai-suno-sai-ko",
  "shirdi-sai-dham-intro"
];

// Check if SAI_VIDEO_IDS already present
if (!pSourceCode.includes("SAI_VIDEO_IDS")) {
  const insertTarget = "const NEW_AI_VIDEO_IDS = [";
  const saiDeclaration = `const SAI_VIDEO_IDS = ${JSON.stringify(SAI_VIDEO_IDS, null, 2)};\n\n`;
  pSourceCode = pSourceCode.replace(insertTarget, saiDeclaration + insertTarget);

  // Update orderPortfolioMedia
  const orderTarget = "  // 5: Existing video work (media1..media6)\n  const existingVideos = items.filter((item) => /^media\\d+$/i.test(item.id));";
  const orderReplacement = `  // 2: Shirdi Se Sai mythological AI work (7)
  const orderedSaiVideos: PortfolioItem[] = [];
  for (const id of SAI_VIDEO_IDS) {
    const v = itemMap.get(id);
    if (v) orderedSaiVideos.push(v);
  }

  // 3: Existing video work (media1..media6)
  const existingVideos = items.filter((item) => /^media\\d+$/i.test(item.id));`;

  pSourceCode = pSourceCode.replace(orderTarget, orderReplacement);

  const processedIdsTarget = "    ...NEW_AI_VIDEO_IDS,\n    ...existingVideos.map((i) => i.id),";
  const processedIdsReplacement = "    ...NEW_AI_VIDEO_IDS,\n    ...SAI_VIDEO_IDS,\n    ...existingVideos.map((i) => i.id),";
  pSourceCode = pSourceCode.replace(processedIdsTarget, processedIdsReplacement);

  const returnTarget = "return [...orderedAiVideos, ...existingVideos, ...newPictures, ...remaining];";
  const returnReplacement = "return [...orderedAiVideos, ...orderedSaiVideos, ...existingVideos, ...newPictures, ...remaining];";
  pSourceCode = pSourceCode.replace(returnTarget, returnReplacement);

  fs.writeFileSync(pSourcePath, pSourceCode, "utf8");
  console.log("✓ lib/design-preview/portfolio-source.ts: Enforced New 17 -> Shirdi Se Sai (7) -> Legacy sequence");
}

// -----------------------------------------------------------------------------
// 8. UPDATE GOOGLE ADS LANDING PAGE (ai-production-videos-google-ads-landing-page.json)
// Ensure cards are ordered: 1=Hyundai, 2=Sundaram, 3=Clarion, 4=Better Ceasons, followed by Shirdi Se Sai
// -----------------------------------------------------------------------------
const adsPath = "data/wordpress/mirrors/pages/ai-production-videos-google-ads-landing-page.json";
const adsData = JSON.parse(fs.readFileSync(adsPath, "utf8"));

const updatedAdsPortfolioGrid = `<div class="dgs-ai-portfolio-grid" id="dgs-ai-portfolio-grid">
<!-- 1. HYUNDAI CRETA -->
<article class="dgs-ai-portfolio-item" style="break-inside:avoid;margin-bottom:16px;border-radius:18px;overflow:hidden;background:#050505;box-shadow:0 10px 30px rgba(0,0,0,0.12);border:1px solid rgba(255,255,255,0.08)">
  <div style="position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#050505">
    <picture>
      <source srcset="/media/portfolio/posters/hyundai_creta_1_poster.avif" type="image/avif">
      <source srcset="/media/portfolio/posters/hyundai_creta_1_poster.webp" type="image/webp">
      <img src="/media/portfolio/posters/hyundai_creta_1_poster.webp" alt="Hyundai Creta AI Feature & Technology Explainer" width="1920" height="1080" loading="lazy" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block">
    </picture>
    <a href="/media/portfolio/videos/hyundai_creta_1.mp4" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none" aria-label="Play Hyundai Creta AI Video">
      <span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(196,63,122,0.9);color:#fff;font-size:16px">▶</span>
    </a>
  </div>
  <div style="padding:14px 16px;background:#111">
    <span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;color:#c43f7a;letter-spacing:0.08em;margin-bottom:4px">Automotive AI Commercial</span>
    <h3 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#fff;line-height:1.3">Hyundai Creta — Feature & Technology Explainer</h3>
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5">Commercial AI production breaking down key styling, ADAS tech and driver features.</p>
  </div>
</article>

<!-- 2. SUNDARAM E-LEARNING -->
<article class="dgs-ai-portfolio-item" style="break-inside:avoid;margin-bottom:16px;border-radius:18px;overflow:hidden;background:#050505;box-shadow:0 10px 30px rgba(0,0,0,0.12);border:1px solid rgba(255,255,255,0.08)">
  <div style="position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#050505">
    <picture>
      <source srcset="/media/portfolio/posters/sundaram_bal_3_1_poster.avif" type="image/avif">
      <source srcset="/media/portfolio/posters/sundaram_bal_3_1_poster.webp" type="image/webp">
      <img src="/media/portfolio/posters/sundaram_bal_3_1_poster.webp" alt="Sundaram E-Learning Grade 3 Interactive Lesson" width="1920" height="1080" loading="lazy" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block">
    </picture>
    <a href="/media/portfolio/videos/sundaram_bal_3_1.mp4" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none" aria-label="Play Sundaram E-Learning AI Video">
      <span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(196,63,122,0.9);color:#fff;font-size:16px">▶</span>
    </a>
  </div>
  <div style="padding:14px 16px;background:#111">
    <span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;color:#c43f7a;letter-spacing:0.08em;margin-bottom:4px">EdTech Animation</span>
    <h3 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#fff;line-height:1.3">Sundaram E-Learning — Interactive Curriculum</h3>
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5">Interactive animated curriculum video for primary education and digital textbooks.</p>
  </div>
</article>

<!-- 3. CLARION AGRO -->
<article class="dgs-ai-portfolio-item" style="break-inside:avoid;margin-bottom:16px;border-radius:18px;overflow:hidden;background:#050505;box-shadow:0 10px 30px rgba(0,0,0,0.12);border:1px solid rgba(255,255,255,0.08)">
  <div style="position:relative;width:100%;aspect-ratio:9/16;overflow:hidden;background:#050505">
    <picture>
      <source srcset="/media/portfolio/posters/clarion_jasmine_atta_hindi_poster.avif" type="image/avif">
      <source srcset="/media/portfolio/posters/clarion_jasmine_atta_hindi_poster.webp" type="image/webp">
      <img src="/media/portfolio/posters/clarion_jasmine_atta_hindi_poster.webp" alt="Clarion Agro Jasmine Atta Campaign Hindi" width="1080" height="1920" loading="lazy" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block">
    </picture>
    <a href="/media/portfolio/videos/clarion_jasmine_atta_hindi.mp4" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none" aria-label="Play Clarion Agro AI Video">
      <span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(196,63,122,0.9);color:#fff;font-size:16px">▶</span>
    </a>
  </div>
  <div style="padding:14px 16px;background:#111">
    <span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;color:#c43f7a;letter-spacing:0.08em;margin-bottom:4px">FMCG Product Campaign</span>
    <h3 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#fff;line-height:1.3">Clarion Agro — Jasmine Atta Campaign (Hindi)</h3>
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5">Appetite-appeal commercial ad film demonstrating softness, purity, and family nutrition.</p>
  </div>
</article>

<!-- 4. BETTER CEASONS -->
<article class="dgs-ai-portfolio-item" style="break-inside:avoid;margin-bottom:16px;border-radius:18px;overflow:hidden;background:#050505;box-shadow:0 10px 30px rgba(0,0,0,0.12);border:1px solid rgba(255,255,255,0.08)">
  <div style="position:relative;width:100%;aspect-ratio:9/16;overflow:hidden;background:#050505">
    <picture>
      <source srcset="/media/portfolio/posters/better_ceasons_tenant_poster.avif" type="image/avif">
      <source srcset="/media/portfolio/posters/better_ceasons_tenant_poster.webp" type="image/webp">
      <img src="/media/portfolio/posters/better_ceasons_tenant_poster.webp" alt="Better Ceasons 1000 Saal Ka Tenant" width="1080" height="1920" loading="lazy" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block">
    </picture>
    <a href="/media/portfolio/videos/better_ceasons_tenant.mp4" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none" aria-label="Play Better Ceasons AI Video">
      <span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(196,63,122,0.9);color:#fff;font-size:16px">▶</span>
    </a>
  </div>
  <div style="padding:14px 16px;background:#111">
    <span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;color:#c43f7a;letter-spacing:0.08em;margin-bottom:4px">Commercial Campaign Film</span>
    <h3 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#fff;line-height:1.3">Better Ceasons — 1000 Saal Ka Tenant</h3>
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5">Creative narrative AI commercial series crafted for high-retention brand advertising.</p>
  </div>
</article>

<!-- 5. SHIRDI SE SAI - VACHAAN 5 TEASER -->
<article class="dgs-ai-portfolio-item" style="break-inside:avoid;margin-bottom:16px;border-radius:18px;overflow:hidden;background:#050505;box-shadow:0 10px 30px rgba(0,0,0,0.12);border:1px solid rgba(255,255,255,0.08)">
  <div style="position:relative;width:100%;aspect-ratio:9/16;overflow:hidden;background:#050505">
    <img src="https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser-thumb.webp" alt="Vachaan 5 Teaser Shirdi Se Sai" width="480" height="853" loading="lazy" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block">
    <a href="https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser.mp4" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none" aria-label="Play Vachaan 5 Teaser Video">
      <span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(196,63,122,0.9);color:#fff;font-size:16px">▶</span>
    </a>
  </div>
  <div style="padding:14px 16px;background:#111">
    <span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;color:#c43f7a;letter-spacing:0.08em;margin-bottom:4px">Shirdi Se Sai / Mythological AI</span>
    <h3 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#fff;line-height:1.3">Vachaan 5 Teaser</h3>
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5">Mythological devotional series trailer produced with generative AI character animation.</p>
  </div>
</article>

<!-- 6. SHIRDI SE SAI - SAI DHAM INTRO -->
<article class="dgs-ai-portfolio-item" style="break-inside:avoid;margin-bottom:16px;border-radius:18px;overflow:hidden;background:#050505;box-shadow:0 10px 30px rgba(0,0,0,0.12);border:1px solid rgba(255,255,255,0.08)">
  <div style="position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#050505">
    <img src="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New-thumb.webp" alt="Sai Dham Introduction Shirdi Se Sai" width="720" height="406" loading="lazy" style="width:100%;height:100%;object-fit:contain;object-position:center;background:#050505;display:block">
    <a href="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New.mp4" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none" aria-label="Play Sai Dham Intro Video">
      <span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(196,63,122,0.9);color:#fff;font-size:16px">▶</span>
    </a>
  </div>
  <div style="padding:14px 16px;background:#111">
    <span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;color:#c43f7a;letter-spacing:0.08em;margin-bottom:4px">Shirdi Se Sai / Mythological AI</span>
    <h3 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#fff;line-height:1.3">Sai Dham Introduction</h3>
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5">Cinematic overview of Sai Dham temple experience crafted with high-fidelity visual generation.</p>
  </div>
</article>

</div>`;

const adsGridReplaceRegex = /<div class="dgs-ai-portfolio-grid" id="dgs-ai-portfolio-grid">[\s\S]*?<\/div>/i;
if (adsGridReplaceRegex.test(adsData.body)) {
  adsData.body = adsData.body.replace(adsGridReplaceRegex, updatedAdsPortfolioGrid);
  fs.writeFileSync(adsPath, JSON.stringify(adsData, null, 2), "utf8");
  console.log("✓ ai-production-videos-google-ads-landing-page.json: Updated portfolio grid with priority order & Sai work");
}

console.log("\n=== COMPLETED DGS AI PORTFOLIO OVERHAUL ===");
