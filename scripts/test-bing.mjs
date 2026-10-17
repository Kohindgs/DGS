import { execSync } from "node:child_process";

const REMOTE_SCRIPT = `
import * as cheerio from "cheerio";

function decodeBingUrl(href) {
  if (!href) return null;
  if (!href.includes("/ck/a?")) return href;
  try {
    const u = new URL(href);
    let rawU = u.searchParams.get("u") || "";
    if (rawU.startsWith("a1")) rawU = rawU.slice(2);
    // Base64 decode
    const decoded = Buffer.from(rawU, "base64").toString("utf8");
    if (decoded.startsWith("http")) return decoded;
  } catch {}
  return href;
}

async function testBing(query) {
  const url = "https://www.bing.com/search?q=" + encodeURIComponent(query);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const results = [];
  $("li.b_algo").each((_, el) => {
    const title = $(el).find("h2 a").text().trim();
    let href = $(el).find("h2 a").attr("href");
    href = decodeBingUrl(href);
    const snippet = $(el).find(".b_caption p").text().trim();
    if (title && href && href.startsWith("http")) {
      results.push({ title, href, snippet });
    }
  });
  console.log("Query:", query, "-> count:", results.length);
  results.slice(0, 5).forEach((r, i) => console.log(i + 1, r.title, "->", r.href));
}

await testBing("SEO write for us");
await testBing("digital marketing agency directory India");
`;

const raw = execSync(
  `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/tbing2.mjs && cd /home/u188101251/production-app/current && node tmp/tbing2.mjs; rm -f tmp/tbing2.mjs"`,
  { input: REMOTE_SCRIPT, encoding: "utf8" }
);
console.log(raw);
