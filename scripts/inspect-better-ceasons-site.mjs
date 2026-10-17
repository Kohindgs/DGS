import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("https://www.betterceasons.com/", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3000);

  const siteInfo = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll("section, header, footer")).map((el) => ({
      tag: el.tagName,
      id: el.id,
      className: el.className,
      top: Math.round(el.getBoundingClientRect().top + window.scrollY),
      height: Math.round(el.getBoundingClientRect().height),
      text: el.innerText.trim().replace(/\s+/g, " ").slice(0, 150),
      images: Array.from(el.querySelectorAll("img")).map((i) => ({
        src: i.src,
        complete: i.complete,
        naturalWidth: i.naturalWidth,
        naturalHeight: i.naturalHeight,
      })),
      videos: Array.from(el.querySelectorAll("video")).map((v) => ({
        src: v.src || v.querySelector("source")?.src,
        readyState: v.readyState,
      })),
    }));
    return sections;
  });

  console.log("Better Ceasons site sections:", JSON.stringify(siteInfo, null, 2));
  await browser.close();
}

main().catch(console.error);
