import { chromium } from "playwright";

async function main() {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto("https://www.dgeniussolutions.com/aeo-services-mumbai-google-ads-landing-page/");
  const info = await p.evaluate(() => {
    const el = document.querySelector("input[name='contact_consent']");
    if (!el) return "Not found";
    return {
      outerHTML: el.outerHTML,
      checked: el.checked,
      disabled: el.disabled,
      parent: el.parentElement ? el.parentElement.outerHTML : null
    };
  });
  console.log("contact_consent info:", info);
  await b.close();
}

main().catch(console.error);
