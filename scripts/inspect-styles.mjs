import fs from "node:fs";

const raw = fs.readFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8");
const data = JSON.parse(raw);
console.log("Styles length:", data.styles.length);

// Let's inspect the main selectors in data.styles
const selectors = [...data.styles.matchAll(/(?:^|\})\s*([^{}]+)\{/g)].map(m => m[1].trim());
console.log(`Found ${selectors.length} CSS rules.`);
console.log("Sample selectors:");
selectors.slice(0, 30).forEach(s => console.log(" - " + s));
