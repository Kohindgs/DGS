import { chromium } from "playwright";

async function main() {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto("https://www.dgeniussolutions.com/seo-services-mumbai-google-ads-landing-page/");
  const opts = await p.evaluate(() => Array.from(document.querySelectorAll("select[name='budget'] option")).map(o => ({ text: o.innerText, val: o.value })));
  console.log("Budget options in live HTML:", opts);
  await b.close();
}

main().catch(console.error);
