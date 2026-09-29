async function verify() {
  console.log("=== VERIFYING LIVE AI VIDEO PRODUCTION PAGE ===");
  const url = "https://www.dgeniussolutions.com/services/ai-video-production-agency/";
  const res = await fetch(url);
  console.log(`Status: ${res.status}`);
  const html = await res.text();

  // Canonical
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  console.log(`Canonical: ${canonicalMatch ? canonicalMatch[1] : "NOT FOUND"}`);

  // Robots
  const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)["']/i);
  console.log(`Robots: ${robotsMatch ? robotsMatch[1] : "NOT FOUND"}`);

  // H1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  console.log(`H1: ${h1Match ? h1Match[1].trim().replace(/\s+/g, " ") : "NOT FOUND"}`);

  // Editorial label checks
  const hasIndiaSeo = html.includes("India SEO");
  const hasNationalReach = html.includes("National Reach");
  console.log(`Contains 'India SEO' (forbidden label): ${hasIndiaSeo}`);
  console.log(`Contains 'National Reach' (clean replacement): ${hasNationalReach}`);

  // Content preservation checks
  const hasCaseStudies = html.toLowerCase().includes("case studies") || html.toLowerCase().includes("recent work") || html.toLowerCase().includes("featured work");
  const hasContactForm = html.includes("<form") || html.includes("form_submissions") || html.includes("submit");
  console.log(`Case Studies preserved: ${hasCaseStudies}`);
  console.log(`Contact Form preserved: ${hasContactForm}`);

  console.log("\n=== VERIFYING HOMEPAGE INTERNAL LINK & ANCHOR ===");
  const homeRes = await fetch("https://www.dgeniussolutions.com/");
  console.log(`Homepage Status: ${homeRes.status}`);
  const homeHtml = await homeRes.text();

  const linkRegex = /<a[^>]+href=["']\/services\/ai-video-production-agency\/?["'][^>]*>([\s\S]*?)<\/a>/i;
  const linkMatch = homeHtml.match(linkRegex);
  if (linkMatch) {
    console.log(`Found AI Video Link Anchor: "${linkMatch[1].trim()}"`);
    const isAnchorCorrect = linkMatch[1].trim() === "AI Video Production Services";
    console.log(`Anchor is exactly 'AI Video Production Services': ${isAnchorCorrect}`);
  } else {
    console.log("AI Video link match not found on homepage HTML.");
  }
}

verify().catch(console.error);
