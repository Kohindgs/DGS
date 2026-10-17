import fs from 'fs';

const mediaData = JSON.parse(fs.readFileSync('data/design-preview/portfolio-media.json', 'utf8')).items;
const legacyItems = mediaData.filter(m => {
  // Exclude the 25 new AI videos that were in portfolio-media.json because canonical-ai-videos.json has all 56
  const isNewAi = m.id.includes('hyundai') || m.id.includes('sundaram') || m.id.includes('clarion') || m.id.includes('better-ceasons') || m.id.includes('shirdi-sai') || m.id === 'home-credit-diwali';
  return !isNewAi;
});

console.log('Legacy non-AI items count:', legacyItems.length);
legacyItems.forEach((item, i) => {
  console.log(`${i+1}. [${item.id}] type=${item.type} title="${item.title}"`);
});
