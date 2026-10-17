import fs from 'fs';

const master = JSON.parse(fs.readFileSync('data/portfolio/master-portfolio.json', 'utf8'));
const homeVideos = master.filter(m => m.homepageFeatured);

console.log('Homepage curated videos count:', homeVideos.length);

const jsCode = `(function(){'use strict';
if(window.__DGS_HOME_PORTFOLIO_BOOTED__)return;
window.__DGS_HOME_PORTFOLIO_BOOTED__ = true;

var TARGET_URL = '/services/ai-video-production-agency/#portfolio';

var PLAY_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>';

function initHomePortfolio(){
  var mainGallery = document.getElementById('portfolio-gallery');
  if(!mainGallery) return;

  var cards = mainGallery.querySelectorAll('.gallery-item');
  cards.forEach(function(card){
    var videoId = card.getAttribute('data-video-id');
    var redirectUrl = TARGET_URL;
    if(videoId){
      redirectUrl = '/services/ai-video-production-agency/?video=' + encodeURIComponent(videoId) + '#portfolio';
    }

    function navigate(e){
      e.preventDefault();
      window.location.href = redirectUrl;
    }

    card.style.cursor = 'pointer';
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', navigate);
    card.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        navigate(e);
      }
    });
  });

  // Ensure any load-more-btn on homepage is cleanly removed or acts as section CTA
  var loadBtn = document.getElementById('load-more-btn');
  if(loadBtn){
    loadBtn.style.display = 'none';
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initHomePortfolio);
} else {
  initHomePortfolio();
}
})();
`;

fs.writeFileSync('lib/wp-exact/extracted/boot-portfolio-home.js', jsCode);
console.log('Successfully written lib/wp-exact/extracted/boot-portfolio-home.js');
