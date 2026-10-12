import https from "node:https";

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      })
      .on("error", reject);
  });
}

function head(url) {
  return new Promise((resolve, reject) => {
    https
      .request(url, { method: "HEAD" }, (res) => resolve({ status: res.statusCode, headers: res.headers }))
      .on("error", reject)
      .end();
  });
}

async function main() {
  const url = "https://www.dgeniussolutions.com/blogs/ai-video-production-agency-how-to-choose-the-right-partner-for-your-brand/";
  console.log("Auditing blog:", url);
  const res = await get(url);
  console.log("HTTP Status:", res.status);

  const titleMatch = res.body.match(/<title>([^<]*)<\/title>/i);
  console.log("Title:", titleMatch ? titleMatch[1] : "NONE");

  const h1Match = res.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  console.log("H1:", h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : "NONE");

  const canonicalMatch = res.body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  console.log("Canonical:", canonicalMatch ? canonicalMatch[1] : "NONE");

  const imgMatch =
    res.body.match(/src=["'](\/cms-media\/[^"']+)["']/i) ||
    res.body.match(/src=["']([^"']*ai-video-production-studio\.webp)["']/i);
  const imgSrc = imgMatch ? imgMatch[1] : "/cms-media/uploads/ai-video-production-studio.webp";
  console.log("Featured Image src in HTML:", imgSrc);

  const imgRes = await head("https://www.dgeniussolutions.com" + (imgSrc.startsWith("/") ? imgSrc : "/" + imgSrc));
  console.log("Featured Image HTTP:", imgRes.status);

  // Check LD+JSON
  const scripts = res.body.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  let blogPostingSchema = null;
  for (const s of scripts) {
    if (s.includes("BlogPosting")) {
      const jsonStr = s.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "");
      try {
        blogPostingSchema = JSON.parse(jsonStr);
      } catch (e) {
        console.log("Error parsing JSON-LD:", e.message);
      }
    }
  }
  console.log("BlogPosting Schema present:", !!blogPostingSchema);
  if (blogPostingSchema) {
    console.log("  @type:", blogPostingSchema["@type"]);
    console.log("  headline:", blogPostingSchema.headline);
    console.log("  datePublished:", blogPostingSchema.datePublished);
    console.log("  dateModified:", blogPostingSchema.dateModified);
  }

  console.log("HTML Body Length:", res.body.length);
  console.log("Article Body Present:", res.body.includes("AI Video Production Agency") || res.body.includes("video production"));
}

main().catch(console.error);
