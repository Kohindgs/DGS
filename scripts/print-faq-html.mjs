import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('data/wordpress/mirrors/pages/services__website-development-amc.json', 'utf8'));
const html = data.body;
const faqStart = html.indexOf('id="faq"');
console.log(html.slice(faqStart, faqStart + 1200));
