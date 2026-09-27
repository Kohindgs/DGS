async function verifyLive() {
  const url = "https://www.dgeniussolutions.com/services/ai-video-production-agency/";
  console.log("Fetching live:", url);
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  console.log("HTTP Status:", res.status);
  const html = await res.text();

  const banned = [
    "Target Keyword",
    "AI Overview Answer",
    "Local SEO",
    "Internal Link",
    "Case Signal",
    "Mumbai Local",
    "Google, AI Overview and buyers need clear proof",
  ];

  console.log("\n=== LIVE PROD MACHINE LABELS CHECK ===");
  let failures = 0;
  for (const b of banned) {
    const count = (html.match(new RegExp(b, "gi")) || []).length;
    console.log(`${b} count: ${count}`);
    if (count > 0) failures++;
  }

  console.log("\n=== LIVE PROD HEADINGS & CANONICAL CHECK ===");
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  console.log("H1:", h1Match ? h1Match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "NONE");

  const canMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  console.log("Canonical:", canMatch ? canMatch[1] : "NONE");

  console.log("Has Specialized AI Video Formats:", html.includes("Specialized AI Video Formats"));
  console.log("Has AI Avatar Videos:", html.includes("AI Avatar Videos"));
  console.log("Has AI Festival Videos:", html.includes("AI Festival Videos"));
  console.log("Has Portfolio:", html.includes('id="portfolio"'));
  console.log("Has Eureka Forbes Logo:", html.includes("Eureka-forbes_White.png"));

  if (failures === 0 && res.status === 200) {
    console.log("\n>>> LIVE PRODUCTION VERIFICATION: ALL PASS <<<");
  } else {
    console.error("\n>>> LIVE PRODUCTION VERIFICATION FAILED <<<");
    process.exit(1);
  }
}

verifyLive().catch((e) => {
  console.error("Live verification error:", e);
  process.exit(1);
});
