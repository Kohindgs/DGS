import fs from 'fs';

const home = JSON.parse(fs.readFileSync('data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json', 'utf8'));
const body = home.body || '';

const start = body.indexOf('<section class="portfolio-section"');
const end = body.indexOf('</section>', start);

console.log('Portfolio section found at:', start, 'to', end);
if (start !== -1 && end !== -1) {
  const sectionHtml = body.slice(start, end + 10);
  fs.writeFileSync('scratch_homepage_portfolio_section.html', sectionHtml);
  console.log('Saved scratch_homepage_portfolio_section.html, length:', sectionHtml.length);
}
