import https from "node:https";

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve(d));
    }).on("error", reject);
  });
}

async function run() {
  const html = await fetchRaw("https://www.dgeniussolutions.com/blogs/google-september-2026-spam-update-what-website-owners-should-know/");
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  console.log("================================================================================");
  console.log("LIVE SCRIPT #1 (DEDICATED BLOGPOSTING):");
  console.log("================================================================================");
  console.log(JSON.stringify(JSON.parse(scripts[0][1]), null, 2));

  console.log("\n================================================================================");
  console.log("LIVE SCRIPT #2 (COMPANION @GRAPH):");
  console.log("================================================================================");
  console.log(JSON.stringify(JSON.parse(scripts[1][1]), null, 2));
}

run();
