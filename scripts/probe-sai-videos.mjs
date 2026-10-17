import https from "node:https";

const saiVideos = [
  { title: "Vachaan 5 Teaser", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser.mp4" },
  { title: "Sai Ki Vaani - Derr", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1.mp4" },
  { title: "Sai Ki Vaani - Choothne Ka Darr", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1.mp4" },
  { title: "Suno Sai Ko - Vishwas", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2.mp4" },
  { title: "Suno Sai Ko - Prarthana", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1.mp4" },
  { title: "Suno Sai Ko", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1.mp4" },
  { title: "Sai Dham Introduction", url: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sai-Dham-Introductionfinal-New.mp4", wide: true }
];

function head(url) {
  return new Promise((resolve) => {
    https.request(url, { method: "HEAD" }, (res) => {
      resolve({ status: res.statusCode, headers: res.headers });
    }).on("error", (e) => resolve({ status: 500, error: e.message })).end();
  });
}

async function main() {
  console.log("=== CHECKING SHIRDI SE SAI VIDEOS ===");
  for (const v of saiVideos) {
    const res = await head(v.url);
    const thumbUrl = v.url.replace(/\.mp4$/i, "-thumb.webp");
    const thumbRes = await head(thumbUrl);
    console.log(`${v.title}:`);
    console.log(`  Video: ${res.status} (${res.headers["content-type"]}, ${res.headers["content-length"]} bytes)`);
    console.log(`  Thumb: ${thumbUrl} -> ${thumbRes.status}`);
  }
}

main().catch(console.error);
