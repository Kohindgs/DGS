import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto("https://www.dgeniussolutions.com/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Capture full page screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live_homepage_audit.png"), fullPage: true });

  // Inspect all sections on the page
  const sections = await page.evaluate(() => {
    const list = [];
    const elements = document.querySelectorAll("section, header, footer, div[id], div[class*='portfolio'], div[class*='creative']");
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      // Only include elements that have significant height or are notable sections
      if (rect.height > 50 || el.id || (el.className && typeof el.className === "string" && el.className.includes("section"))) {
        list.push({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          rect: { top: rect.top + window.scrollY, height: rect.height, width: rect.width },
          display: style.display,
          background: style.backgroundColor,
          color: style.color,
          childrenCount: el.children.length,
          innerHTMLSnippet: el.innerHTML.slice(0, 100).replace(/\s+/g, " ")
        });
      }
    }
    return list;
  });

  // Specifically check for black sections or empty containers
  const blackBoxes = await page.evaluate(() => {
    const results = [];
    const all = document.querySelectorAll("div, section");
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      const s = window.getComputedStyle(el);
      if (rect.height >= 200 && rect.width >= 500) {
        // Check if background is black or very dark
        const bg = s.backgroundColor;
        const isBlack = bg === "rgb(0, 0, 0)" || bg === "rgb(5, 5, 5)" || bg === "rgba(0, 0, 0, 1)" || bg === "#000" || bg === "#000000";
        const hasText = el.innerText.trim().length;
        results.push({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          rect: { top: rect.top + window.scrollY, height: rect.height, width: rect.width },
          bg,
          isBlack,
          hasText,
          childCount: el.children.length
        });
      }
    }
    return results;
  });

  // Inspect document.elementFromPoint around where the black gap was reported
  console.log("=== SECTIONS DETECTED ===", sections.length);
  sections.slice(0, 25).forEach(s => console.log(`[${s.tag}] id='${s.id}' class='${s.className}' top=${s.rect.top} height=${s.rect.height} children=${s.childrenCount}`));

  console.log("\n=== LARGE CONTAINERS (Possible Black Boxes) ===");
  blackBoxes.filter(b => b.hasText < 50 || b.isBlack).forEach(b => {
    console.log(`id='${b.id}' class='${b.className}' top=${b.rect.top} height=${b.rect.height} bg='${b.bg}' textLen=${b.hasText} children=${b.childCount}`);
  });

  await browser.close();
}

main().catch(console.error);
