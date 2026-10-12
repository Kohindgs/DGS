import fs from "node:fs";

console.log("=== UPDATING HOMEPAGE PORTFOLIO PRIORITY (1=HYUNDAI, 2=SUNDARAM, 3=CLARION, 4=BETTER CEASONS) ===");

// 1. UPDATE boot-portfolio-home.js
const bootPath = "lib/wp-exact/extracted/boot-portfolio-home.js";
let bootCode = fs.readFileSync(bootPath, "utf8");

const homeFeaturedVideos = [
  // 1 = Hyundai
  {
    title: "Hyundai Creta — Feature & Technology Explainer",
    url: "/media/portfolio/videos/hyundai_creta_1.mp4",
    thumb: "/media/portfolio/posters/hyundai_creta_1_poster.webp",
    cat: "AUTOMOTIVE AI",
    category: "product",
    wide: true
  },
  // 2 = Sundaram E-Learning
  {
    title: "Sundaram E-Learning — Grade 3 Balbharati Interactive Lesson",
    url: "/media/portfolio/videos/sundaram_bal_3_1.mp4",
    thumb: "/media/portfolio/posters/sundaram_bal_3_1_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    wide: true
  },
  // 3 = Clarion Agro
  {
    title: "Clarion Agro — Jasmine Atta Campaign (Hindi)",
    url: "/media/portfolio/videos/clarion_jasmine_atta_hindi.mp4",
    thumb: "/media/portfolio/posters/clarion_jasmine_atta_hindi_poster.webp",
    cat: "FMCG AI",
    category: "tvc",
    wide: true
  },
  // 4 = Better Ceasons
  {
    title: "Better Ceasons — 1000 Saal Ka Tenant Ad Campaign",
    url: "/media/portfolio/videos/better_ceasons_tenant.mp4",
    thumb: "/media/portfolio/posters/better_ceasons_tenant_poster.webp",
    cat: "CAMPAIGN AI",
    category: "tvc",
    wide: true
  },
  // 5 = Hyundai 2
  {
    title: "Hyundai Creta — Feature & Technology Explainer (Part 2)",
    url: "/media/portfolio/videos/hyundai_creta_2.mp4",
    thumb: "/media/portfolio/posters/hyundai_creta_2_poster.webp",
    cat: "AUTOMOTIVE AI",
    category: "product",
    wide: true
  },
  // 6 = Sundaram 2
  {
    title: "Sundaram E-Learning — Grade 3 Environmental Studies Chapter 7",
    url: "/media/portfolio/videos/sundaram_evs1_ch7.mp4",
    thumb: "/media/portfolio/posters/sundaram_evs1_ch7_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    wide: true
  },
  // 7 = Clarion 2
  {
    title: "Clarion Agro — Jasmine Atta Campaign (Telugu)",
    url: "/media/portfolio/videos/clarion_jasmine_atta_telugu.mp4",
    thumb: "/media/portfolio/posters/clarion_jasmine_atta_telugu_poster.webp",
    cat: "FMCG AI",
    category: "tvc",
    wide: true
  },
  // 8 = Better Ceasons 2
  {
    title: "Better Ceasons — Ganesh Visarjan Special Campaign",
    url: "/media/portfolio/videos/better_ceasons_visarjan.mp4",
    thumb: "/media/portfolio/posters/better_ceasons_visarjan_poster.webp",
    cat: "CAMPAIGN AI",
    category: "tvc",
    wide: true
  },
  // Remaining new AI work
  {
    title: "Hyundai Creta — Feature & Technology Explainer (Part 3)",
    url: "/media/portfolio/videos/hyundai_creta_3.mp4",
    thumb: "/media/portfolio/posters/hyundai_creta_3_poster.webp",
    cat: "AUTOMOTIVE AI",
    category: "product",
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 4 Environmental Studies Chapter 7",
    url: "/media/portfolio/videos/sundaram_evs2_ch7.mp4",
    thumb: "/media/portfolio/posters/sundaram_evs2_ch7_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    wide: true
  },
  {
    title: "Sundaram E-Learning — English Medium Marathi Lesson 13",
    url: "/media/portfolio/videos/sundaram_marathi_13.mp4",
    thumb: "/media/portfolio/posters/sundaram_marathi_13_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 4 Mathematics Chapter 9",
    url: "/media/portfolio/videos/sundaram_maths_ch9.mp4",
    thumb: "/media/portfolio/posters/sundaram_maths_ch9_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 3 English Subject Chapter 3.8",
    url: "/media/portfolio/videos/sundaram_marathi_eng_3_8.mp4",
    thumb: "/media/portfolio/posters/sundaram_marathi_eng_3_8_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 3 English Subject Chapter 3.5",
    url: "/media/portfolio/videos/sundaram_marathi_eng_3_5.mp4",
    thumb: "/media/portfolio/posters/sundaram_marathi_eng_3_5_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    wide: true
  },
  {
    title: "Sundaram E-Learning — Grade 4 Marathi Bhaag 3",
    url: "/media/portfolio/videos/sundaram_marathi_bhaag_3.mp4",
    thumb: "/media/portfolio/posters/sundaram_marathi_bhaag_3_poster.webp",
    cat: "EDTECH AI",
    category: "concept",
    wide: true
  },
  {
    title: "Better Ceasons — Ganesh Chaturthi Festive Commercial",
    url: "/media/portfolio/videos/better_ceasons_chaturthi.mp4",
    thumb: "/media/portfolio/posters/better_ceasons_chaturthi_poster.webp",
    cat: "CAMPAIGN AI",
    category: "tvc",
    wide: true
  },
  {
    title: "Better Ceasons — Kachra Samjha Kya Brand Film",
    url: "/media/portfolio/videos/better_ceasons_kachra.mp4",
    thumb: "/media/portfolio/posters/better_ceasons_kachra_poster.webp",
    cat: "CAMPAIGN AI",
    category: "tvc",
    wide: true
  }
];

// Inject featuredAiVideos in boot-portfolio-home.js
const targetPrefix = 'var allVideos=[];Object.keys(portfolioData).forEach(function(key){portfolioData[key].forEach(function(video){allVideos.push(Object.assign({},video,{category:key,label:categoryLabels[key]}))})});';
const replacementInjection = targetPrefix + `var featuredAiVideos=${JSON.stringify(homeFeaturedVideos)};featuredAiVideos.forEach(function(v){if(portfolioData[v.category])portfolioData[v.category].unshift(v)});allVideos=featuredAiVideos.concat(allVideos);`;

if (bootCode.includes("var featuredAiVideos=")) {
  console.log("- boot-portfolio-home.js already has featuredAiVideos, updating...");
  bootCode = bootCode.replace(/var featuredAiVideos=[\s\S]*?;featuredAiVideos\.forEach[\s\S]*?allVideos=featuredAiVideos\.concat\(allVideos\);/, `var featuredAiVideos=${JSON.stringify(homeFeaturedVideos)};featuredAiVideos.forEach(function(v){if(portfolioData[v.category])portfolioData[v.category].unshift(v)});allVideos=featuredAiVideos.concat(allVideos);`);
} else if (bootCode.includes(targetPrefix)) {
  bootCode = bootCode.replace(targetPrefix, replacementInjection);
} else {
  console.error("❌ Could not match targetPrefix in boot-portfolio-home.js!");
}

// Ensure initPortfolio clears static prerendered cards before loadMoreItems to avoid duplicates
if (!bootCode.includes("if(mainGallery&&mainGallery.children.length>0&&currentlyDisplayed===0)mainGallery.innerHTML='';")) {
  bootCode = bootCode.replace(
    "function initPortfolio(){if(portfolioInitialized)return;portfolioInitialized=!0;loadMoreItems();",
    "function initPortfolio(){if(portfolioInitialized)return;portfolioInitialized=!0;var mainGallery=document.getElementById('portfolio-gallery');if(mainGallery&&mainGallery.children.length>0&&currentlyDisplayed===0)mainGallery.innerHTML='';loadMoreItems();"
  );
}

fs.writeFileSync(bootPath, bootCode, "utf8");
console.log("✓ Updated boot-portfolio-home.js with 1=Hyundai, 2=Sundaram, 3=Clarion, 4=Better Ceasons priority");

// 2. UPDATE STATIC HTML in data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json
const homeContentPath = "data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json";
const homeContent = JSON.parse(fs.readFileSync(homeContentPath, "utf8"));

function buildPrerenderedCardsHtml(videos) {
  return videos.slice(0, 8).map((v) => {
    return `<div class="gallery-item wide-item video-ready" role="button" tabindex="0" aria-label="Play ${v.title}">
  <div class="thumb-fallback"></div>
  <video class="thumb-video is-ready" muted playsinline webkit-playsinline preload="none" poster="${v.thumb}" aria-label="${v.title} ${v.cat} preview" tabindex="-1" disablepictureinpicture controlslist="nodownload">
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
const newGalleryHtml = `<div id="portfolio-gallery">\n${buildPrerenderedCardsHtml(homeFeaturedVideos)}\n</div>`;

if (emptyGalleryRegex.test(homeContent.body)) {
  homeContent.body = homeContent.body.replace(emptyGalleryRegex, newGalleryHtml);
  fs.writeFileSync(homeContentPath, JSON.stringify(homeContent, null, 2), "utf8");
  console.log("✓ Pre-rendered crawlable priority cards directly inside #portfolio-gallery in homepage mirror JSON");
} else {
  console.error("❌ Could not match #portfolio-gallery in homepage mirror JSON!");
}

console.log("=== HOMEPAGE PORTFOLIO PRIORITY UPDATE COMPLETE ===");
