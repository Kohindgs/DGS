import fs from 'fs';

const mediaData = JSON.parse(fs.readFileSync('data/design-preview/portfolio-media.json', 'utf8'));
const canonicalAi = JSON.parse(fs.readFileSync('data/portfolio/canonical-ai-videos.json', 'utf8'));

console.log('portfolio-media.json video items count:', mediaData.items.filter(m => m.type === 'video').length);
console.log('canonical-ai-videos.json items count:', canonicalAi.length);

const mediaVideoIds = mediaData.items.filter(m => m.type === 'video').map(m => m.id);
console.log('Sample media video IDs:', mediaVideoIds.slice(0, 10));
console.log('Sample canonical AI video titles:', canonicalAi.slice(0, 5).map(c => c.title));
