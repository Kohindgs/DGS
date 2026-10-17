import fs from 'fs';

const mediaData = JSON.parse(fs.readFileSync('data/design-preview/portfolio-media.json', 'utf8')).items;
const legacyImages = mediaData.filter(m => m.type === 'image');

let missing = 0;
legacyImages.forEach(img => {
  const fallback = img.variants?.fallback?.replace(/^\//, 'public/');
  if (!fs.existsSync(fallback)) {
    console.log('Missing fallback:', fallback);
    missing++;
  }
});

console.log(`Legacy images check: total=${legacyImages.length}, missing=${missing}`);
