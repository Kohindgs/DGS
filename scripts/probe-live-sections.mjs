import https from "node:https";

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

async function main() {
  const html = await get("https://www.dgeniussolutions.com/services/ai-video-production-agency/");
  console.log("Agency HTML length:", html.length);
  console.log("Contains 'Western Mumbai':", html.includes("Western Mumbai"));
  console.log("Contains 'Bandra, Khar & Western Suburbs':", html.includes("Bandra, Khar & Western Suburbs"));
  console.log("Contains 'Bandra, Khar &amp; Western Suburbs':", html.includes("Bandra, Khar &amp; Western Suburbs"));
  
  const locMatch = html.match(/id="mumbai-service-areas"[\s\S]*?<\/section>/i);
  console.log("Location snippet:", locMatch ? locMatch[0].slice(0, 300) : "NOT FOUND");

  console.log("\nChecking National FAQ:");
  console.log("Contains 'Can D’Genius Solutions create AI videos for brands across India?':", html.includes("Can D’Genius Solutions create AI videos for brands across India?"));
  console.log("Contains 'Can D&#8217;Genius Solutions create AI videos':", html.includes("Can D&#8217;Genius Solutions create AI videos"));
  console.log("Contains 'Can D'Genius Solutions create AI videos':", html.includes("Can D'Genius Solutions create AI videos"));
  
  // Also check homepage
  const homeHtml = await get("https://www.dgeniussolutions.com/");
  console.log("\nHomepage HTML length:", homeHtml.length);
  console.log("Contains 'hyundai':", homeHtml.includes("hyundai"));
  console.log("Contains 'hyundai-creta-1':", homeHtml.includes("hyundai-creta-1"));
  console.log("Contains 'sundaram':", homeHtml.includes("sundaram"));
  console.log("Contains 'clarion':", homeHtml.includes("clarion"));
  console.log("Contains 'better-ceasons':", homeHtml.includes("better-ceasons"));

  // Check Dubai page
  const dubaiHtml = await get("https://www.dgeniussolutions.com/services/ai-production-dubai-page/");
  console.log("\nDubai HTML length:", dubaiHtml.length);
  console.log("Contains 'Proof-Led AI Video Production':", dubaiHtml.includes("Proof-Led AI Video Production"));
  console.log("Contains 'AI-Generated Video Work':", dubaiHtml.includes("AI-Generated Video Work"));
  console.log("Dubai headings snippet:", (dubaiHtml.match(/<h[23][^>]*>[\s\S]*?<\/h[23]>/gi) || []).slice(0, 10).map(h => h.replace(/<[^>]+>/g, '').trim()));
}

main().catch(console.error);
