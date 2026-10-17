import fs from "node:fs";

const adsPage = JSON.parse(fs.readFileSync("data/wordpress/mirrors/pages/ai-production-videos-google-ads-landing-page.json", "utf8"));
const dubaiPage = JSON.parse(fs.readFileSync("data/wordpress/mirrors/pages/services__ai-production-dubai-page.json", "utf8"));

function checkMount(name, body) {
  const hasGallery = /id=["']portfolio-gallery["']/.test(body);
  const hasLoadMore = /id=["']load-more-btn["']/.test(body);
  console.log(`${name}: has portfolio-gallery = ${hasGallery}, has load-more-btn = ${hasLoadMore}`);
}

checkMount("Ads Landing Page", adsPage.body);
const match = dubaiPage.body.match(/<section[^>]*id="portfolio"[^>]*>([\s\S]*?)<\/section>/i);
if (match) console.log(match[1].slice(0, 800));
