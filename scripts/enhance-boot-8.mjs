import fs from 'fs';

let code = fs.readFileSync('lib/wp-exact/extracted/boot-portfolio-8.js', 'utf8');

const targetStr = `  // Always initialize with 'all' filter and reset active tab state
  selectFilter('all', false);`;

const replacement = `  // Auto-hide any filter tab where count === 0
  document.querySelectorAll('.portfolio-filter-tab').forEach(function(tab){
    var filterKey = (tab.getAttribute('data-filter') || tab.getAttribute('href') || '').replace('#', '').toLowerCase();
    var count = 0;
    if(filterKey === 'all'){
      count = allVideos.length;
    } else {
      allVideos.forEach(function(v){
        var cats = Array.isArray(v.categories) ? v.categories : (v.categories || v.category || '').split(' ');
        if(cats.indexOf(filterKey) !== -1){
          count++;
        }
      });
    }
    if(count === 0){
      tab.style.display = 'none';
    } else {
      tab.style.display = '';
    }
  });

  // Always initialize with 'all' filter and reset active tab state
  selectFilter('all', false);

  // Check for ?video= deep link from homepage or external link
  try {
    var searchParams = new URLSearchParams(window.location.search);
    var targetVideoId = searchParams.get('video');
    if(targetVideoId){
      var targetIdx = allVideos.findIndex(function(v){
        var id = (v.url || '').split('/').pop().replace(/\.[^.]+$/, '');
        return id === targetVideoId || v.title.toLowerCase().indexOf(targetVideoId.toLowerCase()) !== -1;
      });
      if(targetIdx !== -1){
        setTimeout(function(){
          openLightbox(targetIdx);
        }, 350);
      }
    }
  } catch(e){}`;

if (!code.includes(targetStr)) {
  throw new Error('Target string not found in boot-portfolio-8.js');
}

code = code.replace(targetStr, replacement);
fs.writeFileSync('lib/wp-exact/extracted/boot-portfolio-8.js', code);
console.log('Successfully updated boot-portfolio-8.js with auto-hide and deep linking');
