import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log("Navigating to archived Katherine's Gallery...");
  await page.goto("https://web.archive.org/web/20250108060411/https://www.katherinesgallery.in/", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(3000);

  // Remove Wayback UI only
  await page.evaluate(() => {
    const wm = document.getElementById("wm-ipp-base");
    if (wm) wm.remove();
    const wm2 = document.getElementById("wm-ipp-inside");
    if (wm2) wm2.remove();
    const bar = document.querySelector(".wb-autocomplete-suggestions");
    if (bar) bar.remove();
    document.body.style.paddingTop = "0px";
    document.body.style.marginTop = "0px";
  });

  const totalH = await page.evaluate(() => {
    return Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.getElementById("SITE_CONTAINER")?.scrollHeight || 0
    );
  });
  console.log(`Total height to capture: ${totalH}px`);

  const step = 800; // 800px step in 900px viewport
  const dir = "scripts/_preview_scroll_diagnostics_20261015/kath_strips";
  fs.mkdirSync(dir, { recursive: true });

  const composites = [];
  let currentY = 0;

  while (currentY < totalH) {
    const scrollTarget = Math.min(currentY, totalH - 900);
    await page.evaluate((pos) => window.scrollTo(0, pos), scrollTarget);
    await page.waitForTimeout(500);

    // Hide wayback banner again if injected
    await page.evaluate(() => {
      const wm = document.getElementById("wm-ipp-base");
      if (wm) wm.remove();
      document.body.style.paddingTop = "0px";
    });

    const stripFile = path.join(dir, `strip_${currentY}.png`);
    await page.screenshot({ path: stripFile });

    const takeH = Math.min(step, totalH - currentY);
    const topOffset = scrollTarget === totalH - 900 && currentY > scrollTarget ? currentY - scrollTarget : 0;

    const sliceBuf = await sharp(stripFile)
      .extract({ left: 0, top: topOffset, width: 1440, height: takeH })
      .toBuffer();

    composites.push({ input: sliceBuf, top: currentY, left: 0 });
    console.log(`Captured strip at Y=${currentY}, height=${takeH}`);

    currentY += takeH;
  }

  await browser.close();

  // Composite all strips into the full webp
  const fullWebp = "public/wp-content/uploads/case-studies/katherinesgallery-full.webp";
  await sharp({
    create: {
      width: 1440,
      height: totalH,
      channels: 3,
      background: "#ffffff",
    },
  })
    .composite(composites)
    .webp({ quality: 86 })
    .toFile(fullWebp);

  console.log(`✓ Stitched authentic full-page asset: ${fullWebp} (1440 x ${totalH})`);

  // Hero fallback
  const heroWebp = "public/wp-content/uploads/case-studies/katherinesgallery-hero.webp";
  await sharp(fullWebp)
    .extract({ left: 0, top: 0, width: 1440, height: Math.min(900, totalH) })
    .webp({ quality: 86 })
    .toFile(heroWebp);
  console.log(`✓ Saved hero asset: ${heroWebp}`);

  // Test non-white distribution
  console.log("\nVerifying non-white pixel distribution across full page:");
  for (let y = 0; y < totalH; y += 500) {
    const h = Math.min(500, totalH - y);
    const strip = await sharp(fullWebp)
      .extract({ left: 0, top: y, width: 1440, height: h })
      .raw()
      .toBuffer();
    let nw = 0;
    for (let i = 0; i < strip.length; i += 3) {
      if (strip[i] < 240 || strip[i + 1] < 240 || strip[i + 2] < 240) nw++;
    }
    const pct = ((nw / (strip.length / 3)) * 100).toFixed(1);
    console.log(`  y=${y.toString().padStart(4, " ")} to ${(y + h).toString().padStart(4, " ")}: non-white = ${nw.toString().padStart(6, " ")} (${pct}%)`);
  }
}

main().catch(console.error);
