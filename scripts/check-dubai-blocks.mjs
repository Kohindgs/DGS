import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('data/wordpress/blocks/content-blocks.generated.json', 'utf8'));
const dubaiBlocks = raw.blocks['/services/ai-production-dubai-page/']?.blocks || [];
console.log('Total blocks for Dubai:', dubaiBlocks.length);
dubaiBlocks.forEach((b, i) => {
  if (b.type === 'heading') {
    console.log(`Block ${i} [heading h${b.level}]: "${b.text}"`);
  }
});
