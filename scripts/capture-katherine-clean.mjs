import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log("Navigating to archived Katherine's Gallery...");
  await page.goto("https://web.archive.org/web/20250108060411/https://www.katherinesgallery.in/", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(3000);
  
  await page.addStyleTag({
    content: `
      #wm-ipp-base, #wm-ipp-inside, .wb-autocomplete-suggestions { display: none !important; }
      body { padding-top: 0 !important; margin-top: 0 !important; }
      ::-webkit-scrollbar { display: none !important; }
      html, body { scrollbar-width: none !important; overflow-x: hidden !important; }
    `
  });
  
  // Smoothly scroll down to render all sections
  const totalH = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`Scrollable height: ${totalH}px`);
  for (let y = 0; y < totalH; y += 400) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);

  const rawPath = "scripts/_preview_scroll_diagnostics_20261015/katherine_raw_1440.png";
  await page.screenshot({ path: rawPath, fullPage: true });
  console.log("Captured raw screenshot:", rawPath);
  await browser.close();

  const meta = await sharp(rawPath).metadata();
  console.log(`Raw dimensions: ${meta.width} x ${meta.height}`);

  // Ensure width is exactly 1440px
  let finalPipeline = sharp(rawPath);
  if (meta.width !== 1440) {
    console.log(`Resizing from ${meta.width} to 1440...`);
    finalPipeline = finalPipeline.resize({ width: 1440 });
  }

  const destFull = "public/wp-content/uploads/case-studies/katherinesgallery-full.webp";
  await finalPipeline.webp({ quality: 85 }).toFile(destFull);
  console.log(`Saved authentic full webp: ${destFull}`);

  const finalMeta = await sharp(destFull).metadata();
  console.log(`Final webp dimensions: ${finalMeta.width} x ${finalMeta.height}`);

  // Create hero crop (first 900px)
  const destHero = "public/wp-content/uploads/case-studies/katherinesgallery-hero.webp";
  await sharp(destFull)
    .extract({ left: 0, top: 0, width: 1440, height: Math.min(900, finalMeta.height) })
    .webp({ quality: 85 })
    .toFile(destHero);
  console.log(`Saved hero webp: ${destHero}`);

  // Verify slices at top, 25%, 50%, 75%, bottom
  const slices = [
    { name: "katherine_slice_top.png", top: 0, h: 900 },
    { name: "katherine_slice_25.png", top: Math.round(finalMeta.height * 0.25), h: 900 },
    { name: "katherine_slice_50.png", top: Math.round(finalMeta.height * 0.5), h: 900 },
    { name: "katherine_slice_75.png", top: Math.round(finalMeta.height * 0.75), h: 900 },
    { name: "katherine_slice_bottom.png", top: finalMeta.height - 900, h: 900 },
  ];

  for (const s of slices) {
    const slicePath = `scripts/_preview_scroll_diagnostics_20261015/${s.name}`;
    await sharp(destFull)
      .extract({ left: 0, top: Math.max(0, s.top), width: 1440, height: Math.min(s.h, finalMeta.height - s.top) })
      .toFile(slicePath);
    console.log(`Generated slice: ${slicePath}`);
  }
}

main().catch(console.error);
