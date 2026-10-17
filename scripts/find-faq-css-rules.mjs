import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('data/wordpress/mirrors/pages/services__website-development-amc.json', 'utf8'));
const styles = data.styles || "";
const matches = [...styles.matchAll(/[^{}]*faq[^{}]*\{[^}]*\}/gi)];
console.log(`Found ${matches.length} FAQ rules in json styles:`);
for (const m of matches) {
  console.log(m[0].trim());
}
