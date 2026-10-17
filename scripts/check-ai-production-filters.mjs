import fs from 'fs';

const files = [
  'data/wordpress/mirrors/pages/services__ai-video-production-agency.json',
  'data/wordpress/mirrors/pages/ai-production-videos-google-ads-landing-page.json',
  'data/wordpress/mirrors/pages/services__ai-production-dubai-page.json'
];

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  const content = data.body || '';
  const idx = content.indexOf('id="portfolio-filters"');
  console.log(`\n=== ${f} (filters idx: ${idx}) ===`);
  if (idx !== -1) {
    const slice = content.slice(idx, idx + 2000);
    const navEnd = slice.indexOf('</nav>');
    console.log(slice.slice(0, navEnd + 6));
  }
}
