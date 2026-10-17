import fs from 'fs';

const home = JSON.parse(fs.readFileSync('data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json', 'utf8'));
const body = home.body || '';

const sec1Start = body.indexOf('class="dgs-v1215-ai-portfolio"');
if (sec1Start !== -1) {
  const startTag = body.lastIndexOf('<section', sec1Start);
  const endTag = body.indexOf('</section>', sec1Start);
  console.log('Section 1 (dgs-v1215-ai-portfolio): length =', endTag - startTag);
  fs.writeFileSync('scratch_sec1_ai_portfolio.html', body.slice(startTag, endTag + 10));
}

const sec2Start = body.indexOf('class="dgs-v1215-portfolio"');
if (sec2Start !== -1) {
  const startTag = body.lastIndexOf('<section', sec2Start);
  const endTag = body.indexOf('</section>', sec2Start);
  console.log('Section 2 (dgs-v1215-portfolio): length =', endTag - startTag);
  fs.writeFileSync('scratch_sec2_portfolio.html', body.slice(startTag, endTag + 10));
}
