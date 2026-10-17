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
  const homeHtml = await get("https://www.dgeniussolutions.com/");
  const match = homeHtml.match(/<section[^>]*id="portfolio"[\s\S]*?<\/section>/i) ||
                homeHtml.match(/class="[^"]*HomePortfolioPreview[^"]*"[\s\S]*?<\/section>/i) ||
                homeHtml.match(/AI-Led Creative Portfolio[\s\S]*?<\/section>/i);
  
  if (match) {
    console.log("Found homepage portfolio section!");
    console.log(match[0].slice(0, 2000));
  } else {
    console.log("Could not find portfolio section by regex, searching for all images/videos around portfolio heading:");
    const idx = homeHtml.indexOf("AI-Led Creative Portfolio");
    if (idx !== -1) {
      console.log(homeHtml.slice(idx, idx + 3000));
    }
  }
}

main().catch(console.error);
