import fs from "node:fs";

async function fetchStatus(url, options = {}) {
  try {
    const res = await fetch(url, options);
    return {
      status: res.status,
      contentType: res.headers.get("content-type") || "none",
      contentLength: res.headers.get("content-length") || "none",
      contentRange: res.headers.get("content-range") || "none",
    };
  } catch (err) {
    return { status: 500, contentType: "none", error: err.message };
  }
}

async function main() {
  console.log("================================================================================");
  console.log("=== PART B: LIVE VERIFICATION OF ALL 17 AI VIDEO PORTFOLIO ASSETS ===");
  console.log("================================================================================\n");

  const manifest = JSON.parse(fs.readFileSync("data/portfolio/optimized-videos-manifest.json", "utf8"));
  // First 17 items are the new AI videos
  const newVideos = manifest.items.slice(0, 17);

  console.log(`Auditing ${newVideos.length} new AI videos on live production...\n`);

  const results = [];
  const clientCounts = { "Hyundai Motors": 0, "Sundaram E-Learning": 0, "Clarion Agro": 0, "Better Ceasons": 0 };

  for (const item of newVideos) {
    if (clientCounts[item.client] !== undefined) {
      clientCounts[item.client]++;
    }

    const mp4Url = `https://www.dgeniussolutions.com${item.sources.mp4}`;
    const webmUrl = `https://www.dgeniussolutions.com${item.sources.webm}`;
    const webpUrl = `https://www.dgeniussolutions.com${item.poster.webp}`;
    const avifUrl = `https://www.dgeniussolutions.com${item.poster.avif}`;

    const [mp4Res, webmRes, webpRes, avifRes, rangeRes] = await Promise.all([
      fetchStatus(mp4Url, { method: "HEAD" }),
      fetchStatus(webmUrl, { method: "HEAD" }),
      fetchStatus(webpUrl, { method: "HEAD" }),
      fetchStatus(avifUrl, { method: "HEAD" }),
      fetchStatus(mp4Url, { method: "GET", headers: { Range: "bytes=0-1023" } }),
    ]);

    const entry = {
      client: item.client,
      title: item.title,
      filename: item.filename,
      mp4_http: mp4Res.status,
      mp4_mime: mp4Res.contentType.split(";")[0],
      webm_http: webmRes.status,
      webm_mime: webmRes.contentType.split(";")[0],
      webp_http: webpRes.status,
      avif_http: avifRes.status,
      byte_range_http: rangeRes.status,
      duration: `${item.duration}s`,
      width: item.width,
      height: item.height,
    };
    results.push(entry);
  }

  console.table(
    results.map((r) => ({
      Client: r.client.slice(0, 15),
      Title: r.title.slice(0, 30),
      MP4: `${r.mp4_http} (${r.mp4_mime})`,
      WebM: `${r.webm_http} (${r.webm_mime})`,
      WebP: r.webp_http,
      AVIF: r.avif_http,
      Range: r.byte_range_http,
      Dims: `${r.width}x${r.height}`,
      Dur: r.duration,
    }))
  );

  console.log("\n--- CLIENT TOTALS VERIFICATION ---");
  console.log(`Hyundai Motors: ${clientCounts["Hyundai Motors"]} / 3`);
  console.log(`Sundaram E-Learning: ${clientCounts["Sundaram E-Learning"]} / 8`);
  console.log(`Clarion Agro: ${clientCounts["Clarion Agro"]} / 2`);
  console.log(`Better Ceasons: ${clientCounts["Better Ceasons"]} / 4`);
  console.log(`Total New AI Videos: ${results.length} / 17`);

  const allMp4Ok = results.every((r) => r.mp4_http === 200);
  const allWebmOk = results.every((r) => r.webm_http === 200);
  const allWebpOk = results.every((r) => r.webp_http === 200);
  const allAvifOk = results.every((r) => r.avif_http === 200);
  const allRangeOk = results.every((r) => r.byte_range_http === 206);

  console.log("\n--- ASSET STATUS PASS / FAIL SUMMARY ---");
  console.log(`ALL MP4 HTTP 200: ${allMp4Ok ? "✓ PASS" : "❌ FAIL"}`);
  console.log(`ALL WEBM HTTP 200: ${allWebmOk ? "✓ PASS" : "❌ FAIL"}`);
  console.log(`ALL WEBP POSTER HTTP 200: ${allWebpOk ? "✓ PASS" : "❌ FAIL"}`);
  console.log(`ALL AVIF POSTER HTTP 200: ${allAvifOk ? "✓ PASS" : "❌ FAIL"}`);
  console.log(`ALL BYTE RANGE HTTP 206: ${allRangeOk ? "✓ PASS" : "❌ FAIL"}`);

  if (!allMp4Ok || !allWebmOk || !allWebpOk || !allAvifOk || !allRangeOk) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
