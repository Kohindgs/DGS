import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const targetUrl = process.argv[2] || "http://localhost:3012/services/website-development-amc/";
const outputDir = process.argv[3] || "scripts/_preview_scroll_diagnostics_20261015/qa_results";

fs.mkdirSync(outputDir, { recursive: true });

async function run() {
  console.log(`=============================================================`);
  console.log(`TESTING CLIENT WEBSITE PREVIEWS ON: ${targetUrl}`);
  console.log(`OUTPUT DIR: ${outputDir}`);
  console.log(`=============================================================`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3000);

  const results = {
    katherine: { stages: {}, alignment: null, visualTest: false },
    betterceasons: { stages: {}, alignment: null, visualTest: false },
  };

  // ------------------------------------------------------------------
  // 1. KATHERINE'S GALLERY (Row 3, index 2)
  // ------------------------------------------------------------------
  console.log("\n>>> Testing Katherine's Gallery Preview...");
  const kathRow = page.locator(".work-project-row").nth(2);
  const kathFrame = kathRow.locator(".w-img");
  const kathImg = kathFrame.locator("img.live-preview-image");
  await kathFrame.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const kathBox = await kathFrame.boundingBox();
  const kathMidX = kathBox.x + kathBox.width / 2;
  const kathMidY = kathBox.y + kathBox.height / 2;

  // Stage 1: Before hover
  const kathStage1 = path.join(outputDir, "kath_1_before_hover.png");
  await page.screenshot({ path: kathStage1, clip: kathBox });
  results.katherine.stages.beforeHover = kathStage1;
  console.log("Saved Stage 1 (Before Hover)");

  // Start hover via mouse move
  await page.mouse.move(kathMidX, kathMidY);

  // Stage 2: After 3 seconds
  await page.waitForTimeout(3000);
  const kathStage2 = path.join(outputDir, "kath_2_after_3s.png");
  await page.screenshot({ path: kathStage2, clip: kathBox });
  results.katherine.stages.after3s = kathStage2;
  console.log("Saved Stage 2 (After 3s)");

  // Stage 3: Approx 50% scroll (7s total duration -> ~3.5s, wait another 600ms)
  await page.waitForTimeout(600);
  const kathStage3 = path.join(outputDir, "kath_3_approx_50pct.png");
  await page.screenshot({ path: kathStage3, clip: kathBox });
  results.katherine.stages.approx50pct = kathStage3;
  console.log("Saved Stage 3 (Approx 50% scroll)");

  // Stage 4: End of animation (7s duration -> wait remaining 3.4s + 600ms buffer)
  await page.waitForTimeout(4000);
  const kathStage4 = path.join(outputDir, "kath_4_end_of_animation.png");
  await page.screenshot({ path: kathStage4, clip: kathBox });
  results.katherine.stages.endOfAnimation = kathStage4;
  console.log("Saved Stage 4 (End of Animation)");

  // Measure end alignment
  const kathAlign = await kathImg.evaluate((img) => {
    const f = img.closest(".w-img");
    const ir = img.getBoundingClientRect();
    const fr = f.getBoundingClientRect();
    return {
      imgTop: ir.top,
      imgBottom: ir.bottom,
      frameTop: fr.top,
      frameBottom: fr.bottom,
      diffBottom: ir.bottom - fr.bottom,
      transform: getComputedStyle(img).transform,
    };
  });
  results.katherine.alignment = kathAlign;
  console.log("Katherine end alignment:", kathAlign);

  // Stage 5: After mouse leave
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1000);
  const kathStage5 = path.join(outputDir, "kath_5_after_mouse_leave.png");
  await page.screenshot({ path: kathStage5, clip: kathBox });
  results.katherine.stages.afterMouseLeave = kathStage5;
  console.log("Saved Stage 5 (After Mouse Leave)");

  // ------------------------------------------------------------------
  // 2. BETTER CEASONS (Row 4, index 3)
  // ------------------------------------------------------------------
  console.log("\n>>> Testing Better Ceasons Preview...");
  const bcRow = page.locator(".work-project-row").nth(3);
  const bcFrame = bcRow.locator(".w-img");
  const bcImg = bcFrame.locator("img.live-preview-image");
  await bcFrame.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const bcBox = await bcFrame.boundingBox();
  const bcMidX = bcBox.x + bcBox.width / 2;
  const bcMidY = bcBox.y + bcBox.height / 2;

  // Stage 1: Before hover
  const bcStage1 = path.join(outputDir, "bc_1_before_hover.png");
  await page.screenshot({ path: bcStage1, clip: bcBox });
  results.betterceasons.stages.beforeHover = bcStage1;
  console.log("Saved Stage 1 (Before Hover)");

  // Start hover via mouse move
  await page.mouse.move(bcMidX, bcMidY);

  // Stage 2: After 3 seconds
  await page.waitForTimeout(3000);
  const bcStage2 = path.join(outputDir, "bc_2_after_3s.png");
  await page.screenshot({ path: bcStage2, clip: bcBox });
  results.betterceasons.stages.after3s = bcStage2;
  console.log("Saved Stage 2 (After 3s)");

  // Stage 3: Approx 50% scroll (15s total -> ~7.5s, wait another 4.5s)
  await page.waitForTimeout(4500);
  const bcStage3 = path.join(outputDir, "bc_3_approx_50pct.png");
  await page.screenshot({ path: bcStage3, clip: bcBox });
  results.betterceasons.stages.approx50pct = bcStage3;
  console.log("Saved Stage 3 (Approx 50% scroll)");

  // Stage 4: End of animation (15s total -> wait remaining 7.5s + 800ms buffer)
  await page.waitForTimeout(8300);
  const bcStage4 = path.join(outputDir, "bc_4_end_of_animation.png");
  await page.screenshot({ path: bcStage4, clip: bcBox });
  results.betterceasons.stages.endOfAnimation = bcStage4;
  console.log("Saved Stage 4 (End of Animation)");

  // Measure end alignment
  const bcAlign = await bcImg.evaluate((img) => {
    const f = img.closest(".w-img");
    const ir = img.getBoundingClientRect();
    const fr = f.getBoundingClientRect();
    return {
      imgTop: ir.top,
      imgBottom: ir.bottom,
      frameTop: fr.top,
      frameBottom: fr.bottom,
      diffBottom: ir.bottom - fr.bottom,
      transform: getComputedStyle(img).transform,
    };
  });
  results.betterceasons.alignment = bcAlign;
  console.log("Better Ceasons end alignment:", bcAlign);

  // Stage 5: After mouse leave
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1000);
  const bcStage5 = path.join(outputDir, "bc_5_after_mouse_leave.png");
  await page.screenshot({ path: bcStage5, clip: bcBox });
  results.betterceasons.stages.afterMouseLeave = bcStage5;
  console.log("Saved Stage 5 (After Mouse Leave)");

  // Close context to finish video
  await page.close();
  await context.close();
  await browser.close();

  // Find saved video file and rename
  const files = fs.readdirSync(outputDir);
  const videoFile = files.find((f) => f.endsWith(".webm") && !f.includes("previews_screen_recording"));
  if (videoFile) {
    const oldPath = path.join(outputDir, videoFile);
    const newPath = path.join(outputDir, "previews_screen_recording.webm");
    if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
    fs.renameSync(oldPath, newPath);
    console.log(`Saved screen recording: ${newPath}`);
  }

  // ------------------------------------------------------------------
  // VISUAL DIFFERENCE COMPARISONS (Mandatory Rule 4)
  // ------------------------------------------------------------------
  console.log("\n>>> Performing Visual Pixel Comparisons Across Stages...");
  for (const proj of ["katherine", "betterceasons"]) {
    const s = results[proj].stages;
    const buf1 = await sharp(s.beforeHover).resize(542, 340).raw().toBuffer();
    const buf2 = await sharp(s.after3s).resize(542, 340).raw().toBuffer();
    const buf3 = await sharp(s.approx50pct).resize(542, 340).raw().toBuffer();
    const buf4 = await sharp(s.endOfAnimation).resize(542, 340).raw().toBuffer();
    const buf5 = await sharp(s.afterMouseLeave).resize(542, 340).raw().toBuffer();

    const diff1_2 = pixelDiff(buf1, buf2);
    const diff2_3 = pixelDiff(buf2, buf3);
    const diff3_4 = pixelDiff(buf3, buf4);
    const diff1_5 = pixelDiff(buf1, buf5);

    console.log(`\nVisual comparison for ${proj}:`);
    console.log(`  Stage 1 vs Stage 2 (Hover Start): ${diff1_2.percent}% diff`);
    console.log(`  Stage 2 vs Stage 3 (Mid Scroll): ${diff2_3.percent}% diff`);
    console.log(`  Stage 3 vs Stage 4 (End Scroll): ${diff3_4.percent}% diff`);
    console.log(`  Stage 1 vs Stage 5 (Reset Check): ${diff1_5.percent}% diff (expected ~0%)`);

    // Must show distinct sections during scroll (each transition has diff > 1% and >1000 pixels) and reset accurately (<2% diff)
    const distinctSections =
      (diff1_2.percent > 1 && diff1_2.diff > 1000) &&
      (diff2_3.percent > 1 && diff2_3.diff > 1000) &&
      (diff3_4.percent > 1 && diff3_4.diff > 1000);
    const resetsCleanly = diff1_5.percent < 2.5;
    const endAligned = Math.abs(results[proj].alignment.diffBottom) <= 2;

    results[proj].visualTest = distinctSections && resetsCleanly && endAligned;
    results[proj].metrics = { diff1_2, diff2_3, diff3_4, diff1_5, distinctSections, resetsCleanly, endAligned };
  }

  fs.writeFileSync(path.join(outputDir, "qa_results.json"), JSON.stringify(results, null, 2), "utf8");
  console.log("\n=============================================================");
  console.log(`FINAL RESULT:`);
  console.log(`Katherine's Gallery Visual Test : ${results.katherine.visualTest ? "✓ PASS" : "✗ FAIL"}`);
  console.log(`Better Ceasons Visual Test      : ${results.betterceasons.visualTest ? "✓ PASS" : "✗ FAIL"}`);
  console.log("=============================================================");
  return results;
}

function pixelDiff(b1, b2) {
  let diff = 0;
  const len = Math.min(b1.length, b2.length);
  for (let i = 0; i < len; i += 3) {
    const dR = Math.abs(b1[i] - b2[i]);
    const dG = Math.abs(b1[i + 1] - b2[i + 1]);
    const dB = Math.abs(b1[i + 2] - b2[i + 2]);
    if (dR > 15 || dG > 15 || dB > 15) diff++;
  }
  const totalPixels = Math.floor(len / 3);
  const percent = ((diff / totalPixels) * 100).toFixed(2);
  return { diff, total: totalPixels, percent: parseFloat(percent) };
}

run().catch(console.error);
