import fs from 'fs';

const mediaData = JSON.parse(fs.readFileSync('data/design-preview/portfolio-media.json', 'utf8'));
const items = mediaData.items;
const images = items.filter(m => m.type === 'image');
console.log('Total images:', images.length);

images.forEach((img, idx) => {
  console.log(`${idx + 1}. [${img.id}] "${img.title}" (${img.orientation}, ${img.ratio}) - ${img.variants?.fallback}`);
});
