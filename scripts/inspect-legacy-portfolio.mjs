import fs from 'fs';

const html = fs.readFileSync('scratch_portfolio_body.html', 'utf8');
const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
const h2 = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi);
const h3 = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/gi);
console.log('H1:', h1);
console.log('H2:', h2?.slice(0, 10));
console.log('H3:', h3?.slice(0, 10));

const sectionMatches = html.match(/<section[^>]*class=["']([^"']*)["']/gi);
console.log('Section classes:', sectionMatches?.slice(0, 10));

const figures = html.match(/<figure[\s\S]*?<\/figure>/gi);
console.log('Figures count:', figures?.length);

const mediaAudit = JSON.parse(fs.readFileSync('data/portfolio/media-inventory-audit.json', 'utf8'));
console.log('media-inventory-audit keys:', Object.keys(mediaAudit));

const portfolioReview = fs.readFileSync('data/portfolio/portfolio-review.csv', 'utf8');
console.log('portfolioReview first 5 lines:\n', portfolioReview.split('\n').slice(0, 6).join('\n'));
