import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const TARGETS = [
  {
    name: "humanxt",
    url: "https://humanxt.com/",
    outputWebp: "public/wp-content/uploads/case-studies/humanxt-full.webp",
    fallbackWebp: "public/wp-content/uploads/case-studies/humanxt-hero.webp",
  },
  {
    name: "weavings",
    url: "https://www.weavings.in/",
    outputWebp: "public/wp-content/uploads/case-studies/weavings-full.webp",
    fallbackWebp: "public/wp-content/uploads/case-studies/weavings-hero.webp",
  },
  {
    name: "katherinesgallery",
    url: "https://katherinesgallery.in/",
    outputWebp: "public/wp-content/uploads/case-studies/katherinesgallery-full.webp",
    fallbackWebp: "public/wp-content/uploads/case-studies/katherinesgallery-hero.webp",
  },
  {
    name: "betterceasons",
    url: "https://betterceasons.com/",
    outputWebp: "public/wp-content/uploads/case-studies/betterceasons-full.webp",
    fallbackWebp: "public/wp-content/uploads/case-studies/betterceasons-hero.webp",
  },
];

async function capture() {
  const outDir = path.resolve("public/wp-content/uploads/case-studies");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
  });

  const results = [];

  for (const t of TARGETS) {
    console.log(`\nCapturing full page for ${t.name} (${t.url})...`);
    const page = await context.newPage();
    try {
      await page.goto(t.url, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(3000);

      // Scroll through page to trigger lazy loading of images
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 400;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              window.scrollTo(0, 0);
              resolve();
            }
          }, 150);
        });
      });

      await page.waitForTimeout(2000);

      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      }));
      console.log(`Rendered dimensions for ${t.name}: ${dimensions.width} x ${dimensions.height}`);

      const rawPng = path.join(outDir, `${t.name}-raw.png`);
      await page.screenshot({ path: rawPng, fullPage: true });

      // Convert to webp with sharp
      const meta = await sharp(rawPng).metadata();
      console.log(`Screenshot file dimensions: ${meta.width} x ${meta.height}`);

      await sharp(rawPng)
        .webp({ quality: 84 })
        .toFile(path.resolve(t.outputWebp));

      // Also create a hero fallback screenshot (top 900px)
      await sharp(rawPng)
        .extract({ left: 0, top: 0, width: meta.width, height: Math.min(meta.height, 900) })
        .webp({ quality: 85 })
        .toFile(path.resolve(t.fallbackWebp));

      fs.unlinkSync(rawPng);

      const statFull = fs.statSync(path.resolve(t.outputWebp));
      console.log(`✓ Saved ${t.outputWebp}: ${(statFull.size / 1024).toFixed(1)} KB`);

      results.push({
        name: t.name,
        width: meta.width,
        height: meta.height,
        fullWebp: t.outputWebp,
        fullSizeKb: (statFull.size / 1024).toFixed(1),
        success: true,
      });
    } catch (err) {
      console.error(`Failed to capture ${t.name}:`, err.message);
      results.push({
        name: t.name,
        success: false,
        error: err.message,
      });
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log("\nCapture summary:", JSON.stringify(results, null, 2));
}

capture().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
